import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const upcoming = searchParams.get("upcoming");

    let sessions;

    if (upcoming === "true") {
      sessions = db.getUpcomingSessions();
    } else if (type) {
      sessions = db.getAllSessions().filter((s) => s.type === type);
    } else {
      sessions = db.getAllSessions();
    }

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, duration, scheduledFor, facilitator, maxParticipants, description } = body;

    if (!title || !type || !duration || !scheduledFor || !facilitator) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = db.createSession({
      title,
      type,
      duration,
      scheduledFor: new Date(scheduledFor),
      facilitator,
      maxParticipants: maxParticipants || 10,
      currentParticipants: 0,
      participants: [],
      status: "scheduled",
      description: description || "",
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
