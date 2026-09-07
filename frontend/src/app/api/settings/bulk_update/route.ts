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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: "Settings array is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/settings/bulk_update/`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify({ settings }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Bulk update settings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}