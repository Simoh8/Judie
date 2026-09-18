import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT__BACKEND_URL || 'http://localhost:8000';

function getAuthHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  // Get token from request headers (sent from client)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  return headers;
}

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

    const response = await fetch(`${BACKEND_URL}/api/lead-requests/?${queryParams.toString()}`, {
      headers: getAuthHeaders(request),
    });
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
      headers: getAuthHeaders(request),
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
