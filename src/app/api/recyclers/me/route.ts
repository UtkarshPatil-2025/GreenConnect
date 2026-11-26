import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { recyclerProfileSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireRole("RECYCLER")(request);
    if (authResult instanceof Response) return authResult;

    const body = await request.json();
    const parsed = recyclerProfileSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((error) => error.message),
      });
    }

    if (Object.keys(parsed.data).length === 0) {
      return apiError("At least one recycler profile field is required", 400);
    }

    const recycler = await prisma.recycler.findUnique({
      where: { userId: authResult.user.userId },
      select: { id: true },
    });
    if (!recycler) {
      return apiError("Recycler profile not found", 404);
    }

    const updatedRecycler = await prisma.recycler.update({
      where: { id: recycler.id },
      data: parsed.data,
    });

    return apiResponse(updatedRecycler, "Recycler profile updated successfully");
  } catch (error) {
    console.error("Update recycler profile error:", error);
    return apiError("Internal server error", 500);
  }
}
