import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;

  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    return NextResponse.json(
      { error: "Missing M-Pesa credentials" },
      { status: 500 },
    );
  }

  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  try {
    const res = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch M-Pesa token", details: text },
        { status: res.status },
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "Empty response from M-Pesa token endpoint" },
        { status: 502 },
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "M-Pesa token request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
