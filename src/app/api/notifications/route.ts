import { NextRequest, NextResponse } from "next/server";
import { getNotifications, getUnreadCount } from "@/lib/actions/notifications";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role) {
      return NextResponse.json(
        { error: "Missing role parameter" },
        { status: 400 }
      );
    }

    const [items, unread] = await Promise.all([
      getNotifications(role),
      getUnreadCount(role),
    ]);

    // Map DB shape to the shape NotificationBell expects
    const mapped = items.map((n) => ({
      id: n.id,
      message: n.message,
      read: n.isRead === 1,
      createdAt: n.createdAt ?? new Date().toISOString(),
      orderId: n.orderId,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
