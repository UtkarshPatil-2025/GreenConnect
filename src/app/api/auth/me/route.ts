import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { updateUserProfileSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

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

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const body = await request.json();
    const parsed = updateUserProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((error) => error.message),
      });
    }

    if (parsed.data.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: parsed.data.phone,
          id: { not: authResult.user.userId },
        },
        select: { id: true },
      });
      if (existingPhone) {
        return apiError("This phone number is already in use", 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: authResult.user.userId },
      data: parsed.data,
      include: {
        recyclerProfile: { include: { verification: true } },
        wallet: true,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return apiResponse(userWithoutPassword, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return apiError("Internal server error", 500);
  }
}
