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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/settings/${params.id}/`, {
      headers: getAuthHeaders(request),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get setting error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { value, description, is_public } = body;

    const response = await fetch(`${BACKEND_URL}/api/settings/${params.id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(request),
      body: JSON.stringify({
        value,
        description,
        is_public
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update setting error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/settings/${params.id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete setting error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}