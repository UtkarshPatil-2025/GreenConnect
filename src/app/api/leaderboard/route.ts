import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiResponse } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const generatorFilter = {
      generator: { is: { role: "GENERATOR" as const, isActive: true } },
    };
    const [activePickups, completedPickups] = await Promise.all([
      prisma.pickupRequest.groupBy({
        by: ["generatorId"],
        where: { ...generatorFilter, status: { not: "CANCELLED" } },
        _count: { id: true },
      }),
      prisma.pickupRequest.groupBy({
        by: ["generatorId"],
        where: { ...generatorFilter, status: "COMPLETED" },
        _count: { id: true },
      }),
    ]);

    const users = await prisma.user.findMany({
      where: {
        id: { in: activePickups.map((entry) => entry.generatorId) },
      },
      select: { id: true, name: true },
    });
    const usersById = new Map(users.map((user) => [user.id, user]));
    const completedByUserId = new Map(
      completedPickups.map((entry) => [entry.generatorId, entry._count.id]),
    );

    const entries = activePickups.flatMap((entry) => {
      const user = usersById.get(entry.generatorId);
      if (!user) return [];
      const stars = entry._count.id;
      return [{
        name: user.name,
        stars,
        completedPickups: completedByUserId.get(entry.generatorId) || 0,
      }];
    });
    entries.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));

    return apiResponse(
      entries.slice(0, 50).map((entry, index) => ({ ...entry, rank: index + 1 })),
      "Community leaderboard retrieved successfully",
    );
  } catch (error) {
    console.error("Get community leaderboard error:", error);
    return apiError("Internal server error", 500);
  }
}
