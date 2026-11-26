import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiError, apiResponse } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: authResult.user.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId: authResult.user.userId, isRead: false },
      }),
    ]);

    return apiResponse({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof Response) return authResult;

    await prisma.notification.updateMany({
      where: { userId: authResult.user.userId, isRead: false },
      data: { isRead: true },
    });

    return apiResponse({ updated: true }, "Notifications marked as read");
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return apiError("Internal server error", 500);
  }
}
