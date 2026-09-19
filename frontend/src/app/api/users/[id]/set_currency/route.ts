import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT__BACKEND_URL || 'http://localhost:8000';

const getAuthHeaders = (request: NextRequest): Record<string, string> => {
  const authHeader = request.headers.get('authorization');
  return authHeader ? { Authorization: authHeader } : {};
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { currency } = body;

    if (!currency) {
      return NextResponse.json(
        { success: false, error: "Currency is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/users/${params.id}/set_currency/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(request),
      },
      body: JSON.stringify({ currency }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Set currency error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
