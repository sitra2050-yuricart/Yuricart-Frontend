// app/api/whatsapp/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export const dynamic = "force-dynamic";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerName, total } = await request.json();

    const message = `🛍️ New Order Received!\n\nOrder ID: ${orderId}\nCustomer: ${customerName}\nTotal: ${total}\n\nPlease check admin panel for details.`;

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      to: process.env.MY_WHATSAPP_NUMBER!, // Admin ka number
      body: message,
    });

    return NextResponse.json(
      { success: true, message: "WhatsApp notification sent!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Twilio Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
