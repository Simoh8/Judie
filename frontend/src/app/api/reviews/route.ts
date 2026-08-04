import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session');
    const userId = searchParams.get('user');

    let url = `${BACKEND_URL}/api/reviews/`;
    const params = new URLSearchParams();
    if (sessionId) params.append('session', sessionId);
    if (userId) params.append('user', userId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session, user, rating, comment } = body;

    if (!session || !user || !rating) {
      return NextResponse.json(
        { success: false, error: "Session, user, and rating required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/reviews/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session, user, rating, comment }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
