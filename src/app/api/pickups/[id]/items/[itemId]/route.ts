import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware";
import { apiError, apiResponse } from "@/lib/utils";
import { processingUpdateSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string; itemId: string }>;
}

const NEXT_PROCESSING_STATUSES: Record<string, string[]> = {
  RECEIVED: ["SORTED"],
  SORTED: ["DISMANTLED"],
  DISMANTLED: ["MATERIAL_RECOVERY"],
  MATERIAL_RECOVERY: ["DISPOSED", "COMPLETED"],
  DISPOSED: ["COMPLETED"],
  COMPLETED: [],
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireRole("RECYCLER")(request);
    if (authResult instanceof Response) return authResult;

    const { id, itemId } = await params;
    const body = await request.json();
    const parsed = processingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((error) => error.message),
      });
    }

    const recycler = await prisma.recycler.findUnique({
      where: { userId: authResult.user.userId },
      select: { id: true, businessName: true },
    });
    if (!recycler) {
      return apiError("Recycler profile not found", 404);
    }

    const item = await prisma.wasteItem.findUnique({
      where: { id: itemId },
      include: {
        pickup: {
          select: { id: true, recyclerId: true, generatorId: true, status: true },
        },
      },
    });
    if (!item || item.pickupId !== id) {
      return apiError("Waste item not found for this pickup", 404);
    }
    if (item.pickup.recyclerId !== recycler.id) {
      return apiError("You can only update items assigned to your facility", 403);
    }
    if (!["AT_FACILITY", "PROCESSING"].includes(item.pickup.status)) {
      return apiError("Recycling updates are available once the pickup reaches your facility", 409);
    }

    const nextStatuses = NEXT_PROCESSING_STATUSES[item.processingStatus] || [];
    if (!nextStatuses.includes(parsed.data.status)) {
      return apiError(
        `Invalid processing update from ${item.processingStatus} to ${parsed.data.status}`,
        400,
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.wasteItem.updateMany({
        where: { id: item.id, processingStatus: item.processingStatus },
        data: {
          processingStatus: parsed.data.status,
          processedAt: parsed.data.status === "COMPLETED" ? new Date() : undefined,
        },
      });
      if (changed.count === 0) return false;

      await tx.chainOfCustody.create({
        data: {
          itemId: item.id,
          handlerId: authResult.user.userId,
          eventType: parsed.data.status,
          locationName: recycler.businessName,
          notes: parsed.data.notes,
        },
      });

      if (parsed.data.status === "COMPLETED") {
        const itemName = item.description || item.category.replace(/_/g, " ").toLowerCase();
        await tx.notification.create({
          data: {
            userId: item.pickup.generatorId,
            title: "Item recycling completed",
            message: `${itemName} has been completely recycled. Processing for this item is now complete.`,
            type: "PICKUP_UPDATE",
            data: JSON.stringify({
              pickupId: item.pickup.id,
              itemId: item.id,
              status: "COMPLETED",
            }),
          },
        });
      }

      return true;
    });
    if (!updated) {
      return apiError("This item was updated by another request. Reload and try again.", 409);
    }

    const updatedItem = await prisma.wasteItem.findUnique({
      where: { id: item.id },
      include: {
        chainOfCustody: { orderBy: { timestamp: "desc" } },
      },
    });

    return apiResponse(
      updatedItem,
      parsed.data.status === "COMPLETED"
        ? "Item processing completed and customer notified"
        : "Recycling update posted successfully",
    );
  } catch (error) {
    console.error("Update waste processing error:", error);
    return apiError("Internal server error", 500);
  }
}
