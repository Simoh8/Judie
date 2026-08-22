import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get("user");
    const session = searchParams.get("session");
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams();
    if (user) queryParams.append('user', user);
    if (session) queryParams.append('session', session);
    if (status) queryParams.append('status', status);

    const response = await fetch(`${BACKEND_URL}/api/lead-requests/?${queryParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get lead requests error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session, user } = body;

    if (!session || !user) {
      return NextResponse.json(
        { success: false, error: "Session and user required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/lead-requests/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, user }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create lead request error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
