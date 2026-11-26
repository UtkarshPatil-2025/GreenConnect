import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    switch (user.role) {
      case "GENERATOR": {
        const [
          totalListings,
          activePickups,
          completedPickups,
          communityStars,
          userData,
          wallet,
          recentPickups,
        ] = await Promise.all([
          prisma.wasteListing.count({
            where: { userId: user.userId },
          }),
          prisma.pickupRequest.count({
            where: {
              generatorId: user.userId,
              status: {
                notIn: ["COMPLETED", "CANCELLED"],
              },
            },
          }),
          prisma.pickupRequest.count({
            where: { generatorId: user.userId, status: "COMPLETED" },
          }),
          prisma.pickupRequest.count({
            where: { generatorId: user.userId, status: { not: "CANCELLED" } },
          }),
          prisma.user.findUnique({
            where: { id: user.userId },
            select: {
              totalWeightKg: true,
              co2SavedKg: true,
              impactScore: true,
            },
          }),
          prisma.wallet.findUnique({
            where: { userId: user.userId },
            select: { rewardPoints: true },
          }),
          prisma.pickupRequest.findMany({
            where: { generatorId: user.userId },
            orderBy: { scheduledAt: "desc" },
            take: 5,
            include: {
              wasteItems: { select: { id: true } },
              recycler: { select: { businessName: true } },
            },
          }),
        ]);

        return apiResponse(
          {
            totalListings,
            activePickups,
            completedPickups,
            communityStars,
            weightRecycled: userData?.totalWeightKg || 0,
            co2Saved: userData?.co2SavedKg || 0,
            rewardPoints: wallet?.rewardPoints || 0,
            recentPickups: recentPickups.map((pickup) => ({
              id: pickup.id,
              scheduledDate: pickup.scheduledAt.toISOString(),
              status: pickup.status,
              itemCount: pickup.wasteItems.length,
              estimatedWeight: pickup.estimatedWeight ?? 0,
              recyclerName: pickup.recycler?.businessName,
            })),
          },
          "Generator dashboard stats retrieved",
        );
      }

      case "RECYCLER": {
        // Get recycler profile
        const recycler = await prisma.recycler.findUnique({
          where: { userId: user.userId },
          include: { verification: true },
        });

        if (!recycler) {
          return apiError("Recycler profile not found", 404);
        }

        const [pendingPickups, inProgressPickups, completedPickups] =
          await Promise.all([
            prisma.pickupRequest.count({
              where: {
                recyclerId: recycler.id,
                status: "REQUESTED",
              },
            }),
            prisma.pickupRequest.count({
              where: {
                recyclerId: recycler.id,
                status: {
                  notIn: ["REQUESTED", "COMPLETED", "CANCELLED"],
                },
              },
            }),
            prisma.pickupRequest.count({
              where: {
                recyclerId: recycler.id,
                status: "COMPLETED",
              },
            }),
          ]);

        // Calculate total weight processed
        const completedPickupRecords = await prisma.pickupRequest.findMany({
          where: {
            recyclerId: recycler.id,
            status: "COMPLETED",
          },
          select: { actualWeight: true, estimatedWeight: true },
        });

        const totalWeightProcessed = completedPickupRecords.reduce(
          (sum, p) => sum + (p.actualWeight || p.estimatedWeight || 0),
          0,
        );

        return apiResponse(
          {
            pendingPickups,
            inProgressPickups,
            completedPickups,
            totalWeightProcessed,
            rating: recycler.rating,
            totalReviews: recycler.totalReviews,
            verificationStatus: recycler.verification?.status || "PENDING",
            isVerified: recycler.isVerified,
            tier: recycler.tier,
          },
          "Recycler dashboard stats retrieved",
        );
      }

      case "ADMIN": {
        const [
          totalUsers,
          totalRecyclers,
          totalPickups,
          pendingVerifications,
          completedPickups,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.recycler.count(),
          prisma.pickupRequest.count(),
          prisma.verification.count({
            where: { status: "PENDING" },
          }),
          prisma.pickupRequest.findMany({
            where: { status: "COMPLETED" },
            select: { actualWeight: true, estimatedWeight: true },
          }),
        ]);

        const totalWeightRecycled = completedPickups.reduce(
          (sum, p) => sum + (p.actualWeight || p.estimatedWeight || 0),
          0,
        );

        return apiResponse(
          {
            totalUsers,
            totalRecyclers,
            totalPickups,
            pendingVerifications,
            totalWeightRecycled,
          },
          "Admin dashboard stats retrieved",
        );
      }

      default:
        return apiError("Dashboard not available for this role", 403);
    }
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return apiError("Internal server error", 500);
  }
}
