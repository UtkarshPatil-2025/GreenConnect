import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { reviewSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Only GENERATORs can leave reviews
    const authResult = await requireRole("GENERATOR")(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const body = await request.json();

    // Validate input
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 400, {
        validation: parsed.error.errors.map((e) => e.message),
      });
    }

    const { rating, comment } = parsed.data;

    // Check if recycler exists
    const recycler = await prisma.recycler.findUnique({
      where: { id },
    });

    if (!recycler) {
      return apiError("Recycler not found", 404);
    }

    // Check if user already reviewed this recycler
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_recyclerId: {
          userId: user.userId,
          recyclerId: id,
        },
      },
    });

    if (existingReview) {
      return apiError("You have already reviewed this recycler", 409);
    }

    // Create review and update recycler rating in a transaction
    const review = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          userId: user.userId,
          recyclerId: id,
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Calculate new average rating
      const aggregation = await tx.review.aggregate({
        where: { recyclerId: id },
        _avg: { rating: true },
        _count: { rating: true },
      });

      // Update recycler average rating
      await tx.recycler.update({
        where: { id },
        data: {
          rating: aggregation._avg.rating || 0,
          totalReviews: aggregation._count.rating,
        },
      });

      return newReview;
    });

    return apiResponse(review, "Review submitted successfully", 201);
  } catch (error) {
    console.error("Create review error:", error);
    return apiError("Internal server error", 500);
  }
}
