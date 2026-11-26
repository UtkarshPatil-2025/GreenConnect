import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { VerificationStatus, RecyclerTier } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Only ADMINs can verify recyclers
    const authResult = await requireRole("ADMIN")(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const body = await request.json();
    const { status, notes, tier } = body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return apiError("Status must be APPROVED or REJECTED", 400);
    }

    // Find the recycler
    const recycler = await prisma.recycler.findUnique({
      where: { id },
      include: { verification: true },
    });

    if (!recycler) {
      return apiError("Recycler not found", 404);
    }

    if (!recycler.verification) {
      return apiError("No verification record found", 404);
    }

    // Update verification and recycler in a transaction
    const updatedRecycler = await prisma.$transaction(async (tx) => {
      // Update verification record
      await tx.verification.update({
        where: { id: recycler.verification!.id },
        data: {
          status: status as VerificationStatus,
          reviewedAt: new Date(),
          reviewedBy: user.userId,
          reviewerNotes: notes,
          rejectionReason: status === "REJECTED" ? notes : undefined,
          expiresAt:
            status === "APPROVED"
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
              : undefined,
        },
      });

      // If approved, update recycler verification status and tier
      if (status === "APPROVED") {
        await tx.recycler.update({
          where: { id },
          data: {
            isVerified: true,
            tier: (tier as RecyclerTier) || "VERIFIED",
          },
        });
      } else {
        await tx.recycler.update({
          where: { id },
          data: {
            isVerified: false,
            isActive: false,
          },
        });
      }

      // Create notification for the recycler
      await tx.notification.create({
        data: {
          userId: recycler.userId,
          title:
            status === "APPROVED"
              ? "Verification Approved!"
              : "Verification Rejected",
          message:
            status === "APPROVED"
              ? "Your recycler profile has been verified. You can now receive pickup requests."
              : `Your verification was rejected. Reason: ${notes || "Not specified"}`,
          type: "VERIFICATION",
        },
      });

      return tx.recycler.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          verification: true,
        },
      });
    });

    return apiResponse(
      updatedRecycler,
      `Recycler ${status === "APPROVED" ? "approved" : "rejected"} successfully`,
    );
  } catch (error) {
    console.error("Verify recycler error:", error);
    return apiError("Internal server error", 500);
  }
}
