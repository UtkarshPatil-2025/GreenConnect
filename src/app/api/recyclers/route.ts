import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const capability = searchParams.get("capability");
    const city = searchParams.get("city");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isVerified: true,
      isActive: true,
    };

    if (capability) {
      where.capabilities = { has: capability };
    }

    if (city) {
      where.user = {
        city: {
          contains: city,
          mode: "insensitive",
        },
      };
    }

    // Fetch recyclers with pagination
    const [recyclers, total] = await Promise.all([
      prisma.recycler.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              city: true,
              state: true,
              avatar: true,
            },
          },
          verification: {
            select: {
              status: true,
              submittedAt: true,
            },
          },
        },
        orderBy: { rating: "desc" },
        skip,
        take: limit,
      }),
      prisma.recycler.count({ where }),
    ]);

    return apiResponse(
      {
        recyclers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Recyclers retrieved successfully",
    );
  } catch (error) {
    console.error("Get recyclers error:", error);
    return apiError("Internal server error", 500);
  }
}
