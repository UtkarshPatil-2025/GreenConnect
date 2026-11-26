import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    // Fetch full pickup details
    const pickup = await prisma.pickupRequest.findUnique({
      where: { id },
      include: {
        generator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true,
            addressLine1: true,
            avatar: true,
          },
        },
        recycler: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        tracking: true,
        wasteItems: {
          include: {
            listing: true,
            chainOfCustody: {
              orderBy: { timestamp: "desc" },
            },
          },
        },
        payments: true,
      },
    });

    if (!pickup) {
      return apiError("Pickup not found", 404);
    }

    if (user.role === "GENERATOR" && pickup.generatorId !== user.userId) {
      return apiError("You can only view your own pickups", 403);
    }

    if (user.role === "RECYCLER") {
      const recycler = await prisma.recycler.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (!recycler || pickup.recyclerId !== recycler.id) {
        return apiError("You can only view pickups assigned to your facility", 403);
      }
    } else if (
      user.role === "PICKUP_AGENT" &&
      pickup.agentId !== user.userId
    ) {
      return apiError("You can only view pickups assigned to you", 403);
    } else if (!["GENERATOR", "RECYCLER", "PICKUP_AGENT", "ADMIN"].includes(user.role)) {
      return apiError("Insufficient permissions", 403);
    }

    const visiblePickup =
      user.role === "GENERATOR" ? pickup : { ...pickup, otpCode: null };
    return apiResponse(visiblePickup, "Pickup details retrieved successfully");
  } catch (error) {
    console.error("Get pickup error:", error);
    return apiError("Internal server error", 500);
  }
}
