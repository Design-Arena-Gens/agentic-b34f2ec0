import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const configured = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER &&
    process.env.OPENAI_API_KEY
  );

  return NextResponse.json({
    configured,
    webhookUrl: `${process.env.VERCEL_URL || 'https://agentic-b34f2ec0.vercel.app'}/api/whatsapp/webhook`,
    message: configured
      ? "WhatsApp integration is configured and ready"
      : "WhatsApp integration requires environment variables to be set",
  });
}
