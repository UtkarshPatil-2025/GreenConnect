import { NextRequest } from "next/server";
import { verifyAccessToken, extractTokenFromHeader, TokenPayload } from "./auth";
import { apiError } from "./utils";

/**
 * Middleware to authenticate API routes.
 * Extracts and verifies the JWT from the Authorization header.
 * Returns the decoded token payload or an error response.
 */
export async function authenticate(
  request: NextRequest,
): Promise<{ user: TokenPayload } | Response> {
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return apiError("Authentication required", 401);
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return apiError("Invalid or expired token", 401);
  }

  return { user: payload };
}

/**
 * Middleware to check if the authenticated user has the required role.
 */
export function requireRole(...roles: string[]) {
  return async (
    request: NextRequest,
  ): Promise<{ user: TokenPayload } | Response> => {
    const result = await authenticate(request);

    if (result instanceof Response) return result;

    if (!roles.includes(result.user.role)) {
      return apiError("Insufficient permissions", 403);
    }

    return result;
  };
}
