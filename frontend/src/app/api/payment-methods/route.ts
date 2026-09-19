import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT__BACKEND_URL || 'http://localhost:8000';

const getAuthHeaders = (request: NextRequest): Record<string, string> => {
  const authHeader = request.headers.get('authorization');
  return authHeader ? { Authorization: authHeader } : {};
};

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payment-methods/user_payment_methods/`, {
      headers: getAuthHeaders(request),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get payment methods error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_type, card_last4, card_expiry_month, card_expiry_year, card_brand, paystack_auth_code, paystack_token, is_default } = body;

    const response = await fetch(`${BACKEND_URL}/api/payment-methods/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(request) },
      body: JSON.stringify({
        payment_type,
        card_last4,
        card_expiry_month,
        card_expiry_year,
        card_brand,
        paystack_auth_code,
        paystack_token,
        is_default
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create payment method error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}