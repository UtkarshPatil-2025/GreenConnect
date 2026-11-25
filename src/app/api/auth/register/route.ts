import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTokens, generateOTP } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { signupSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((e) => e.message),
      });
    }

    const { name, email, phone, password, role } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return apiError("User with this email or phone already exists", 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role,
        },
      });

      // If role is RECYCLER, create recycler profile and verification record
      if (role === "RECYCLER") {
        await tx.recycler.create({
          data: {
            userId: user.id,
            businessName: name,
            verification: {
              create: {
                status: "PENDING",
              },
            },
          },
        });
      }

      // Create wallet for the user
      await tx.wallet.create({
        data: {
          userId: user.id,
        },
      });

      // Generate 6-digit OTP for email verification
      const otpCode = generateOTP(6);
      await tx.otpCode.create({
        data: {
          userId: user.id,
          code: otpCode,
          type: "EMAIL_VERIFY",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      return { user, otpCode };
    });

    // Generate JWT tokens
    const tokens = generateTokens({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    // Save refresh token to DB
    await prisma.refreshToken.create({
      data: {
        userId: result.user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = result.user;

    return apiResponse(
      {
        user: userWithoutPassword,
        tokens,
      },
      "User registered successfully",
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return apiError("Internal server error", 500);
  }
}
