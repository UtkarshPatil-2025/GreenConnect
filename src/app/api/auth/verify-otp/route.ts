import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { verifyOtpSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((e) => e.message),
      });
    }

    const { userId, code, type } = parsed.data;

    // Find the OTP record
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        type,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return apiError("Invalid or expired OTP", 400);
    }

    // Mark OTP as used and update user verification in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark OTP as used
      await tx.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });

      // Update user verification status based on type
      if (type === "EMAIL_VERIFY") {
        await tx.user.update({
          where: { id: userId },
          data: { emailVerified: true },
        });
      } else if (type === "PHONE_VERIFY") {
        await tx.user.update({
          where: { id: userId },
          data: { phoneVerified: true },
        });
      }
    });

    return apiResponse(null, "OTP verified successfully");
  } catch (error) {
    console.error("OTP verification error:", error);
    return apiError("Internal server error", 500);
  }
}
