import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((e) => e.message),
      });
    }

    const { userId, code, newPassword } = parsed.data;

    // Find and verify the OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        type: "PASSWORD_RESET",
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return apiError("Invalid or expired OTP", 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password, mark OTP as used, and invalidate all refresh tokens
    await prisma.$transaction(async (tx) => {
      // Mark OTP as used
      await tx.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });

      // Update user password
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      // Invalidate all refresh tokens for user
      await tx.refreshToken.deleteMany({
        where: { userId },
      });
    });

    return apiResponse(null, "Password reset successful");
  } catch (error) {
    console.error("Reset password error:", error);
    return apiError("Internal server error", 500);
  }
}
