import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((e) => e.message),
      });
    }

    const { email } = parsed.data;

    // Find user by email (don't reveal if email exists)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate OTP for password reset
      const otpCode = generateOTP(6);
      await prisma.otpCode.create({
        data: {
          userId: user.id,
          code: otpCode,
          type: "PASSWORD_RESET",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      // TODO: Send OTP via email service
    }

    // Always return success to not reveal if email exists
    return apiResponse(
      null,
      "If an account with that email exists, a password reset OTP has been sent.",
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return apiError("Internal server error", 500);
  }
}
