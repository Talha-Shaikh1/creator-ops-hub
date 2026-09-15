import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { getPKTTimeString } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    const provider = body.provider || settings?.provider || "greenapi";
    const phone =
      body.phone || settings?.whatsappPhone || process.env.WHATSAPP_PHONE || "";
    const callmebotApiKey =
      body.callmebotApiKey ||
      settings?.callmebotApiKey ||
      process.env.CALLMEBOT_API_KEY ||
      "";
    const greenApiIdInstance =
      body.greenApiIdInstance ||
      settings?.greenApiIdInstance ||
      process.env.GREEN_API_ID_INSTANCE ||
      "";
    const greenApiApiToken =
      body.greenApiApiToken ||
      settings?.greenApiApiToken ||
      process.env.GREEN_API_API_TOKEN ||
      "";

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipient WhatsApp phone number is required.",
        },
        { status: 400 }
      );
    }

    const timeStr = getPKTTimeString();
    const testMessage = `🚀 *CreatorOps Hub: WhatsApp Integration Test*
━━━━━━━━━━━━━━━━━━
Salam Bhai! WhatsApp connection test was 100% successful!

⏰ *PKT Time:* ${timeStr}
⚡ *Engine:* ${provider === "greenapi" ? "Green-API (Instant Cloud)" : "CallMeBot"}
✅ *Status:* Operational & Ready for Hourly Reminders

Let's crush the upload targets today! 💪
━━━━━━━━━━━━━━━━━━`;

    const result = await sendWhatsAppNotification({
      provider,
      phone,
      callmebotApiKey,
      greenApiIdInstance,
      greenApiApiToken,
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
      message: `WhatsApp test alert dispatched successfully via ${
        provider === "greenapi" ? "Green-API" : "CallMeBot"
      }!`,
      phone,
      provider,
      response: result.data,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
