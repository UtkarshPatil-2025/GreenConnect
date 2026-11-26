import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiError, apiResponse } from "@/lib/utils";

const REQUIRED_STARS = 5;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;
    if (authResult.user.role !== "GENERATOR") {
      return apiError("Certificates are available to generator accounts only", 403);
    }

    const [communityStars, profile] = await Promise.all([
      prisma.pickupRequest.count({
        where: {
          generatorId: authResult.user.userId,
          status: { not: "CANCELLED" },
        },
      }),
      prisma.user.findUnique({
        where: { id: authResult.user.userId },
        select: { name: true },
      }),
    ]);

    if (!profile) {
      return apiError("User profile not found", 404);
    }

    const eligible = communityStars >= REQUIRED_STARS;
    return apiResponse({
      eligible,
      communityStars,
      requiredStars: REQUIRED_STARS,
      recipientName: eligible ? profile.name : null,
    });
  } catch (error) {
    console.error("Get certificate eligibility error:", error);
    return apiError("Internal server error", 500);
  }
}
