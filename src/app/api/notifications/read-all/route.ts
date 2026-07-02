import { NextRequest, NextResponse } from "next/server";
import { markAllRead } from "@/lib/actions/notifications";

export async function POST(request: NextRequest) {
  try {
    let role: string | undefined;

    try {
      const body = await request.json();
      role = body?.role;
    } catch {
      // body may be empty — fall back to query param
      const { searchParams } = new URL(request.url);
      role = searchParams.get("role") ?? undefined;
    }

    if (!role) {
      return NextResponse.json(
        { error: "Missing role" },
        { status: 400 }
      );
    }

    await markAllRead(role);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
