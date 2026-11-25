import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

function getJwtSecret(name: string, developmentFallback: string): string {
  const secret = process.env[name];
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be set in production`);
  }
  return developmentFallback;
}

const JWT_SECRET = getJwtSecret("JWT_SECRET", "dev-secret-change-me");
const JWT_REFRESH_SECRET = getJwtSecret(
  "JWT_REFRESH_SECRET",
  "dev-refresh-secret-change-me",
);
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "15m") as SignOptions["expiresIn"];
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

// ============================================================
// Token Types
// ============================================================

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============================================================
// Password Hashing
// ============================================================

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================
// JWT Token Generation & Verification
// ============================================================

export function generateAccessToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

export function generateTokens(payload: {
  userId: string;
  email: string;
  role: UserRole;
}): AuthTokens {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ============================================================
// OTP Generation
// ============================================================

export function generateOTP(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// ============================================================
// Auth Header Helpers
// ============================================================

export function extractTokenFromHeader(
  authHeader: string | null,
): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}
