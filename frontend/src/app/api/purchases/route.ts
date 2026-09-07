import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT__BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get("user");
    const status = searchParams.get("status");
    const paystack_reference = searchParams.get("paystack_reference");

    const queryParams = new URLSearchParams();
    if (user) queryParams.append('user', user);
    if (status) queryParams.append('status', status);
    if (paystack_reference) queryParams.append('paystack_reference', paystack_reference);

    const response = await fetch(`${BACKEND_URL}/api/purchases/?${queryParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get purchases error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, package: packageId, amount, currency, valid_from, valid_until } = body;

    if (!user || !packageId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: user and package" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/purchases/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user,
        package: packageId,
        amount,
        currency,
        valid_from,
        valid_until
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create purchase error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
