import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT__BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-paystack-signature') || '';

    const response = await fetch(`${BACKEND_URL}/api/payments/webhook/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-paystack-signature': signature
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
