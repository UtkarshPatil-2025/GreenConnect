import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    // Find listing by ID
    const listing = await prisma.wasteListing.findUnique({
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
      },
    });

    if (!listing) {
      return apiError("Listing not found", 404);
    }

    return apiResponse(listing, "Listing retrieved successfully");
  } catch (error) {
    console.error("Get listing error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Find the listing
    const listing = await prisma.wasteListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return apiError("Listing not found", 404);
    }

    // Check ownership
    if (listing.userId !== user.userId) {
      return apiError("Not authorized to update this listing", 403);
    }

    const body = await request.json();

    // Only allow updating certain fields
    const allowedFields = [
      "title",
      "description",
      "quantity",
      "estimatedWeight",
      "condition",
      "images",
      "isHazardous",
      "hazardDetails",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "status",
      "subcategory",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedListing = await prisma.wasteListing.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return apiResponse(updatedListing, "Listing updated successfully");
  } catch (error) {
    console.error("Update listing error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Find the listing
    const listing = await prisma.wasteListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return apiError("Listing not found", 404);
    }

    // Check ownership
    if (listing.userId !== user.userId) {
      return apiError("Not authorized to delete this listing", 403);
    }

    // Soft delete by setting status to CANCELLED
    await prisma.wasteListing.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return apiResponse(null, "Listing cancelled successfully");
  } catch (error) {
    console.error("Delete listing error:", error);
    return apiError("Internal server error", 500);
  }
}
