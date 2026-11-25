import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, generateTokens } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return apiError("Refresh token is required", 400);
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return apiError("Invalid or expired refresh token", 401);
    }

    // Check if refresh token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      return apiError("Refresh token not found", 401);
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new token pair
    const tokens = generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    // Save new refresh token to DB
    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return apiResponse({ tokens }, "Tokens refreshed successfully");
  } catch (error) {
    console.error("Token refresh error:", error);
    return apiError("Internal server error", 500);
  }
}
