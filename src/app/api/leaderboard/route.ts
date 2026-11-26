import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiResponse } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const completedPickups = await prisma.pickupRequest.groupBy({
      by: ["generatorId"],
      where: {
        status: "COMPLETED",
        generator: {
          is: { role: "GENERATOR", isActive: true },
        },
      },
      _count: { id: true },
      orderBy: [{ _count: { id: "desc" } }, { generatorId: "asc" }],
      take: 50,
    });

    const users = await prisma.user.findMany({
      where: {
        id: { in: completedPickups.map((entry) => entry.generatorId) },
      },
      select: { id: true, name: true },
    });
    const usersById = new Map(users.map((user) => [user.id, user]));

    const entries = completedPickups.flatMap((entry, index) => {
      const user = usersById.get(entry.generatorId);
      if (!user) return [];
      const stars = entry._count.id;
      return [{
        rank: index + 1,
        name: user.name,
        stars,
        completedPickups: stars,
      }];
    });

    return apiResponse(entries, "Community leaderboard retrieved successfully");
  } catch (error) {
    console.error("Get community leaderboard error:", error);
    return apiError("Internal server error", 500);
  }
}
