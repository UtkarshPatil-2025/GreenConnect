import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { createListingSchema } from "@/lib/validations";
import { WasteCategory, HazardLevel } from "@prisma/client";

// Hazard level mapping by category
const CATEGORY_HAZARD_MAP: Record<string, HazardLevel> = {
  BATTERIES: "HIGH",
  PCBS: "MEDIUM",
  MEDICAL_DEVICES: "HIGH",
  COMPUTERS: "LOW",
  MOBILES: "LOW",
  TELEVISIONS: "MEDIUM",
  CABLES: "NONE",
  APPLIANCES: "LOW",
  PERIPHERALS: "NONE",
  PRINTERS: "LOW",
  NETWORKING: "NONE",
  OTHER: "NONE",
};

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const body = await request.json();

    // Validate input
    const parsed = createListingSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((e) => e.message),
      });
    }

    const data = parsed.data;

    // Auto-detect hazard level based on category
    const hazardLevel = data.isHazardous
      ? CATEGORY_HAZARD_MAP[data.category] || "MEDIUM"
      : CATEGORY_HAZARD_MAP[data.category] || "NONE";

    const isHazardous =
      data.isHazardous || ["HIGH", "CRITICAL"].includes(hazardLevel);

    // Create waste listing
    const listing = await prisma.wasteListing.create({
      data: {
        userId: user.userId,
        category: data.category as WasteCategory,
        subcategory: data.subcategory,
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        estimatedWeight: data.estimatedWeight,
        condition: data.condition,
        images: data.images || [],
        isHazardous,
        hazardLevel,
        hazardDetails: data.hazardDetails,
        status: "ACTIVE",
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return apiResponse(listing, "Listing created successfully", 201);
  } catch (error) {
    console.error("Create listing error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    // If GENERATOR, only return their listings
    if (user.role === "GENERATOR") {
      where.userId = user.userId;
    } else {
      // RECYCLER/ADMIN see all active listings by default
      if (!status) {
        where.status = "ACTIVE";
      }
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Fetch listings with pagination
    const [listings, total] = await Promise.all([
      prisma.wasteListing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.wasteListing.count({ where }),
    ]);

    return apiResponse(
      {
        listings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Listings retrieved successfully",
    );
  } catch (error) {
    console.error("Get listings error:", error);
    return apiError("Internal server error", 500);
  }
}
