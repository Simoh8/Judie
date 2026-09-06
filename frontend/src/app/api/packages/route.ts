import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT__BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const featured = searchParams.get("featured");

    const queryParams = new URLSearchParams();
    if (active === 'true') queryParams.append('active', 'true');
    if (featured === 'true') queryParams.append('featured', 'true');

    const response = await fetch(`${BACKEND_URL}/api/packages/?${queryParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get packages error:", error);
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
      name, 
      description, 
      price, 
      duration, 
      max_lead_requests, 
      max_sessions, 
      allowed_session_types, 
      max_session_duration, 
      supported_regions, 
      is_active, 
      is_featured, 
      sort_order 
    } = body;

    if (!name || !description || !price || !duration) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/packages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        price,
        duration,
        max_lead_requests: max_lead_requests || 0,
        max_sessions: max_sessions || 0,
        allowed_session_types: allowed_session_types || [],
        max_session_duration: max_session_duration || 120,
        supported_regions: supported_regions || [],
        is_active: is_active !== undefined ? is_active : true,
        is_featured: is_featured || false,
        sort_order: sort_order || 0
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create package error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
