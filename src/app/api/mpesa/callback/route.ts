import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 M-Pesa Callback Received:", body);

    // TODO: yahan tum DB me order update kar sakte ho (payment success/failed)
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("❌ Callback error:", err);
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Failed" },
      { status: 500 },
    );
  }
}
