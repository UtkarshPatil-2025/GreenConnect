import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateTokens } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((e) => e.message),
      });
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return apiError("Invalid email or password", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return apiError("Account is deactivated. Please contact support.", 403);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token to DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return apiResponse(
      {
        user: userWithoutPassword,
        tokens,
      },
      "Login successful",
    );
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Internal server error", 500);
  }
}
