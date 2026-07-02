import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
