import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch recycler profile with reviews
    const recycler = await prisma.recycler.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true,
            avatar: true,
          },
        },
        verification: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            isVerified: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!recycler) {
      return apiError("Recycler not found", 404);
    }

    return apiResponse(recycler, "Recycler profile retrieved successfully");
  } catch (error) {
    console.error("Get recycler error:", error);
    return apiError("Internal server error", 500);
  }
}
