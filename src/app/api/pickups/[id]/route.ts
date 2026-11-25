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

    return apiResponse(pickup, "Pickup details retrieved successfully");
  } catch (error) {
    console.error("Get pickup error:", error);
    return apiError("Internal server error", 500);
  }
}
