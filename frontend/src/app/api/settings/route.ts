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
    const category = searchParams.get("category");
    const isPublic = searchParams.get("public");

    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (isPublic === 'true') queryParams.append('public', 'true');

    const response = await fetch(`${BACKEND_URL}/api/settings/?${queryParams.toString()}`, {
      headers: getAuthHeaders(request),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      key, 
      value, 
      category, 
      setting_type, 
      description, 
      is_encrypted, 
      is_public 
    } = body;

    if (!key || !value || !category || !setting_type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/settings/`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify({
        key,
        value,
        category,
        setting_type,
        description: description || '',
        is_encrypted: is_encrypted || false,
        is_public: is_public || false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create setting error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}