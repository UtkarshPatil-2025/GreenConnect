import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
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

    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, isActive: true },
    });
    if (!currentUser || !currentUser.isActive) {
      return apiError("Authentication required", 401);
    }
    if (!["RECYCLER", "PICKUP_AGENT", "ADMIN"].includes(currentUser.role)) {
      return apiError("Insufficient permissions", 403);
    }

    const body = await request.json();
    const { status, agentLat, agentLng, notes, actualWeight, otpCode } = body;

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

    if (currentUser.role === "RECYCLER") {
      const recycler = await prisma.recycler.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (!recycler || pickup.recyclerId !== recycler.id) {
        return apiError("You can only update pickups assigned to your facility", 403);
      }
    }

    if (
      currentUser.role === "PICKUP_AGENT" &&
      pickup.agentId &&
      pickup.agentId !== user.userId
    ) {
      return apiError("This pickup is assigned to another agent", 403);
    }

    // Validate status transition
    const allowedTransitions = VALID_TRANSITIONS[pickup.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return apiError(
        `Invalid status transition from ${pickup.status} to ${status}`,
        400,
      );
    }

    if (status === "PICKED_UP") {
      if (typeof otpCode !== "string" || !/^\d{4}$/.test(otpCode)) {
        return apiError("Enter the four-digit handover OTP", 400);
      }
      if (otpCode !== pickup.otpCode) {
        return apiError("The handover OTP is incorrect", 400);
      }
    }

    if (
      status === "COMPLETED" &&
      pickup.wasteItems.some((item) => item.processingStatus !== "COMPLETED")
    ) {
      return apiError("Complete the recycling updates for every item before closing this pickup", 409);
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
      if (status === "AGENT_ASSIGNED" && currentUser.role === "PICKUP_AGENT") {
        pickupUpdateData.agentId = user.userId;
      }

      // Only one concurrent request may advance a pickup from this state.
      const transitioned = await tx.pickupRequest.updateMany({
        where: { id, status: pickup.status },
        data: pickupUpdateData,
      });
      if (transitioned.count === 0) return false;

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

        await tx.notification.create({
          data: {
            userId: pickup.generatorId,
            title: "Recycling process completed",
            message: `Your pickup #${pickup.id.slice(0, 8)} has been fully recycled and completed.`,
            type: "PICKUP_UPDATE",
            data: JSON.stringify({ pickupId: pickup.id, status }),
          },
        });
      }

      return true;
    });

    if (!updatedPickup) {
      return apiError("Pickup status changed in another request. Reload and try again.", 409);
    }

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

    if (!fullPickup) {
      return apiError("Pickup not found after update", 404);
    }

    const { otpCode: _, ...visiblePickup } = fullPickup;
    return apiResponse(visiblePickup, `Pickup status updated to ${status}`);
  } catch (error) {
    console.error("Update pickup status error:", error);
    return apiError("Internal server error", 500);
  }
}
