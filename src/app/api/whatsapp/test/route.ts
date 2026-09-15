import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { getPKTTimeString } from "@/lib/time";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    const phone =
      body.phone || settings?.whatsappPhone || process.env.WHATSAPP_PHONE || "";
    const apiKey =
      body.apiKey ||
      settings?.callmebotApiKey ||
      process.env.CALLMEBOT_API_KEY ||
      "";

    if (!phone || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number and CallMeBot API Key are required.",
        },
        { status: 400 }
      );
    }

    const timeStr = getPKTTimeString();
    const testMessage = `🚀 *CreatorOps Hub: WhatsApp Integration Test*
━━━━━━━━━━━━━━━━━━
Salam Bhai! CallMeBot WhatsApp connection test was successful!

⏰ *PKT Time:* ${timeStr}
⚡ *Status:* Operational & Ready for Hourly Reminders

Let's crush the upload targets today! 💪
━━━━━━━━━━━━━━━━━━`;

    const result = await sendWhatsAppAlert({
      phone,
      apiKey,
      message: testMessage,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp test alert dispatched successfully!",
      phone,
      callmebotResponse: result.data,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
