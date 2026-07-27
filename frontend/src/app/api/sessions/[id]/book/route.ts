import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const booking = db.bookSession(params.id, userId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Could not book session" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Book session error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
