import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware";
import { apiResponse, apiError, estimateCO2Savings } from "@/lib/utils";
import { PickupStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["AGENT_ASSIGNED", "CANCELLED"],
  AGENT_ASSIGNED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: ["ARRIVED"],
  ARRIVED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["AT_FACILITY"],
  AT_FACILITY: ["PROCESSING"],
  PROCESSING: ["COMPLETED"],
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate user (RECYCLER, PICKUP_AGENT, or ADMIN)
    const authResult = await requireRole(
      "RECYCLER",
      "PICKUP_AGENT",
      "ADMIN",
    )(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const body = await request.json();
    const { status, agentLat, agentLng, notes, actualWeight } = body;

    if (!status) {
      return apiError("Status is required", 400);
    }

    // Find the pickup
    const pickup = await prisma.pickupRequest.findUnique({
      where: { id },
      include: {
        wasteItems: true,
        tracking: true,
      },
    });

    if (!pickup) {
      return apiError("Pickup not found", 404);
    }

    // Validate status transition
    const allowedTransitions = VALID_TRANSITIONS[pickup.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return apiError(
        `Invalid status transition from ${pickup.status} to ${status}`,
        400,
      );
    }

    // Update pickup and tracking in a transaction
    const updatedPickup = await prisma.$transaction(async (tx) => {
      // Build pickup update data
      const pickupUpdateData: Record<string, unknown> = {
        status: status as PickupStatus,
      };

      if (status === "COMPLETED") {
        pickupUpdateData.completedAt = new Date();
        if (actualWeight) {
          pickupUpdateData.actualWeight = actualWeight;
        }
      }

      // If assigning an agent
      if (status === "AGENT_ASSIGNED" && user.role === "PICKUP_AGENT") {
        pickupUpdateData.agentId = user.userId;
      }

      // Update pickup
      const updated = await tx.pickupRequest.update({
        where: { id },
        data: pickupUpdateData,
      });

      // Update tracking record
      if (pickup.tracking) {
        const trackingUpdate: Record<string, unknown> = {
          status,
        };
        if (agentLat !== undefined) trackingUpdate.agentLat = agentLat;
        if (agentLng !== undefined) trackingUpdate.agentLng = agentLng;

        await tx.tracking.update({
          where: { id: pickup.tracking.id },
          data: trackingUpdate,
        });
      }

      // If COMPLETED, update user impact stats
      if (status === "COMPLETED") {
        const weight = actualWeight || pickup.estimatedWeight || 0;
        const co2Saved = estimateCO2Savings(weight);
        const impactScore = weight * 10; // 10 points per kg

        await tx.user.update({
          where: { id: pickup.generatorId },
          data: {
            totalWeightKg: { increment: weight },
            co2SavedKg: { increment: co2Saved },
            impactScore: { increment: impactScore },
          },
        });

        // Add reward points to wallet
        await tx.wallet.updateMany({
          where: { userId: pickup.generatorId },
          data: {
            rewardPoints: { increment: Math.floor(impactScore) },
          },
        });

        // Update listing statuses to COMPLETED
        const listingIds = pickup.wasteItems
          .map((item) => item.listingId)
          .filter((id): id is string => id !== null);

        if (listingIds.length > 0) {
          await tx.wasteListing.updateMany({
            where: { id: { in: listingIds } },
            data: { status: "COMPLETED" },
          });
        }
      }

      return updated;
    });

    // Fetch complete updated pickup
    const fullPickup = await prisma.pickupRequest.findUnique({
      where: { id },
      include: {
        generator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tracking: true,
        wasteItems: true,
      },
    });

    return apiResponse(fullPickup, `Pickup status updated to ${status}`);
  } catch (error) {
    console.error("Update pickup status error:", error);
    return apiError("Internal server error", 500);
  }
}
