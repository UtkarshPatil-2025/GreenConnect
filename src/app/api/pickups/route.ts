import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, requireRole } from "@/lib/middleware";
import { generateOTP } from "@/lib/auth";
import { apiResponse, apiError, generateQRCode } from "@/lib/utils";
import { createPickupSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    // Only GENERATORs can create pickups
    const authResult = await requireRole("GENERATOR")(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const body = await request.json();

    // Validate input
    const parsed = createPickupSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((e) => e.message),
      });
    }

    const data = parsed.data;

    // Verify all listings exist and belong to the user
    const listings = await prisma.wasteListing.findMany({
      where: {
        id: { in: data.listingIds },
        userId: user.userId,
        status: "ACTIVE",
      },
    });

    if (listings.length !== data.listingIds.length) {
      return apiError(
        "One or more listings not found, not owned by you, or not active",
        400,
      );
    }

    // Calculate estimated weight from listings
    const estimatedWeight = listings.reduce(
      (sum, l) => sum + (l.estimatedWeight || 0),
      0,
    );

    // Generate pickup OTP code (4 digits)
    const pickupOtp = generateOTP(4);

    // Create pickup request with related records in a transaction
    const pickup = await prisma.$transaction(async (tx) => {
      // Create pickup request
      const pickupRequest = await tx.pickupRequest.create({
        data: {
          generatorId: user.userId,
          recyclerId: data.recyclerId || undefined,
          status: "REQUESTED",
          scheduledAt: new Date(data.scheduledAt),
          isInstant: data.isInstant,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude,
          instructions: data.instructions,
          otpCode: pickupOtp,
          estimatedWeight,
        },
      });

      // Create waste items from listings
      for (const listing of listings) {
        await tx.wasteItem.create({
          data: {
            pickupId: pickupRequest.id,
            listingId: listing.id,
            qrCode: generateQRCode(),
            category: listing.category,
            description: listing.title,
          },
        });
      }

      // Create tracking record
      await tx.tracking.create({
        data: {
          pickupId: pickupRequest.id,
          status: "REQUESTED",
        },
      });

      // Update listing statuses to MATCHED
      await tx.wasteListing.updateMany({
        where: { id: { in: data.listingIds } },
        data: { status: "MATCHED" },
      });

      return pickupRequest;
    });

    // Fetch complete pickup with relations
    const fullPickup = await prisma.pickupRequest.findUnique({
      where: { id: pickup.id },
      include: {
        generator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        wasteItems: true,
        tracking: true,
      },
    });

    return apiResponse(fullPickup, "Pickup request created successfully", 201);
  } catch (error) {
    console.error("Create pickup error:", error);
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where: Record<string, unknown> = {};

    switch (user.role) {
      case "GENERATOR":
        where.generatorId = user.userId;
        break;
      case "RECYCLER": {
        const recycler = await prisma.recycler.findUnique({
          where: { userId: user.userId },
        });
        if (recycler) {
          where.recyclerId = recycler.id;
        }
        break;
      }
      case "PICKUP_AGENT":
        where.agentId = user.userId;
        break;
      // ADMIN sees all pickups
    }

    if (status) {
      where.status = status;
    }

    // Fetch pickups with pagination
    const [pickups, total] = await Promise.all([
      prisma.pickupRequest.findMany({
        where,
        include: {
          generator: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              city: true,
            },
          },
          tracking: true,
          wasteItems: {
            include: {
              listing: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  estimatedWeight: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.pickupRequest.count({ where }),
    ]);

    return apiResponse(
      {
        pickups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Pickups retrieved successfully",
    );
  } catch (error) {
    console.error("Get pickups error:", error);
    return apiError("Internal server error", 500);
  }
}
