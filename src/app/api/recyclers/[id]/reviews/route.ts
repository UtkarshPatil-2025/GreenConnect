import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { reviewSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const recycler = await prisma.recycler.findUnique({
      where: { id },
      select: { rating: true, totalReviews: true },
    });
    if (!recycler) {
      return apiError("Recycler not found", 404);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { recyclerId: id },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { recyclerId: id } }),
    ]);

    return apiResponse(
      { reviews, rating: recycler.rating, totalReviews: recycler.totalReviews, pagination: { page, limit, total } },
      "Recycler reviews retrieved successfully",
    );
  } catch (error) {
    console.error("Get recycler reviews error:", error);
    return apiError("Internal server error", 500);
  }
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
