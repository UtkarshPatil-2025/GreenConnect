import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const { user: tokenUser } = authResult;

    // Fetch user profile with recycler profile if applicable
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      include: {
        recyclerProfile: {
          include: {
            verification: true,
          },
        },
        wallet: true,
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // Remove passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return apiResponse(userWithoutPassword, "User profile retrieved");
  } catch (error) {
    console.error("Get profile error:", error);
    return apiError("Internal server error", 500);
  }
}
