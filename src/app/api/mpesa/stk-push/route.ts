import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { phone, amount } = await req.json();

  // 🔒 Validate input
  if (!phone || !amount) {
    return NextResponse.json(
      { error: "Phone and amount are required" },
      { status: 400 },
    );
  }

  // 🔒 Validate env vars
  const {
    MPESA_SHORTCODE,
    MPESA_PASSKEY,
    MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET,
    MPESA_CALLBACK_BASE,
  } = process.env;

  if (
    !MPESA_SHORTCODE ||
    !MPESA_PASSKEY ||
    !MPESA_CONSUMER_KEY ||
    !MPESA_CONSUMER_SECRET ||
    !MPESA_CALLBACK_BASE
  ) {
    return NextResponse.json(
      { error: "❌ Missing required M-Pesa environment variables" },
      { status: 500 },
    );
  }

  // 🕒 Generate timestamp
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  // 🔑 Generate password
  const password = Buffer.from(
    MPESA_SHORTCODE + MPESA_PASSKEY + timestamp,
  ).toString("base64");

  try {
    // 🎫 Get Access Token
    const auth = Buffer.from(
      `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
    ).toString("base64");

    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token fetch failed: ${err}`);
    }

    const { access_token } = await tokenRes.json();

    // 🚀 STK Push Request
    const res = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          BusinessShortCode: MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Number(amount),
          PartyA: phone,
          PartyB: MPESA_SHORTCODE,
          PhoneNumber: phone,
          CallBackURL: MPESA_CALLBACK_BASE,
          AccountReference: "MyShop",
          TransactionDesc: "Order Payment",
        }),
      },
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ STK Push Error:", err);
    return NextResponse.json(
      { error: err.message || "M-Pesa request failed" },
      { status: 500 },
    );
  }
}
