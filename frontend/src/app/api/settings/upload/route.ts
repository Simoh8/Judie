import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT__BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const headers: HeadersInit = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/settings/upload_attachment/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload setting attachment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file attachment" },
      { status: 500 }
    );
  }
}
