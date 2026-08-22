import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const upcoming = searchParams.get("upcoming");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (upcoming === 'true') queryParams.append('upcoming', 'true');
    if (status) queryParams.append('status', status);
    if (search) queryParams.append('search', search);

    const response = await fetch(`${BACKEND_URL}/api/sessions/?${queryParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
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

    const response = await fetch(`${BACKEND_URL}/api/sessions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        type,
        duration,
        scheduled_for: scheduledFor,
        facilitator,
        max_participants: maxParticipants || 10,
        description: description || "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
