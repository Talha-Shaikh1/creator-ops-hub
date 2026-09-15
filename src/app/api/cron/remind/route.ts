import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPKTDateString,
  getPKTHour,
  getPKTDayOfWeek,
  getPKTTimeString,
} from "@/lib/time";
import { formatWhatsAppMessage, sendWhatsAppNotification } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  return handleRemind(req);
}

export async function POST(req: NextRequest) {
  return handleRemind(req);
}

async function handleRemind(req: NextRequest) {
  try {
    // 1. Fetch system settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    const cronSecret =
      settings?.cronSecret ||
      process.env.CRON_SECRET ||
      "creatorops_super_secret_cron_token_2025";

    // 2. Bearer token or query param authentication
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;
    const queryToken =
      req.nextUrl.searchParams.get("token") ||
      req.nextUrl.searchParams.get("secret");

    const providedToken = bearerToken || queryToken;

    if (!providedToken || providedToken !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing cron secret token" },
        { status: 401 }
      );
    }

    // 3. Time validation in PKT
    const now = new Date();
    const currentHour = getPKTHour(now);
    const todayStr = getPKTDateString(now);
    const dayOfWeek = getPKTDayOfWeek(now);
    const timeFormatted = getPKTTimeString(now);

    const startHour = settings?.startHourPKT ?? 14; // 2:00 PM
    const endHour = settings?.endHourPKT ?? 23; // 11:00 PM

    // If query param force=true is present (e.g. from UI "Run Cron Now"), ignore window check
    const forceRun = req.nextUrl.searchParams.get("force") === "true";

    if (!forceRun && (currentHour < startHour || currentHour > endHour)) {
      return NextResponse.json({
        status: "skipped",
        message: `Current PKT hour (${currentHour}:00) is outside the reminder window (${startHour}:00 - ${endHour}:00 PKT)`,
        currentTime: timeFormatted,
      });
    }

    // 4. Find today's assigned persona
    const activePersona = await prisma.persona.findFirst({
      where: { assignedDay: dayOfWeek },
      include: { gmailAccount: true },
    });

    if (!activePersona) {
      return NextResponse.json({
        status: "skipped",
        message: `No active persona assigned for day ${dayOfWeek}`,
        currentTime: timeFormatted,
      });
    }

    // 5. Query today's upload record
    let dailyUpload = await prisma.dailyUpload.findUnique({
      where: {
        date_personaId: {
          date: todayStr,
          personaId: activePersona.id,
        },
      },
    });

    if (!dailyUpload) {
      // Create initial record if it doesn't exist yet
      dailyUpload = await prisma.dailyUpload.create({
        data: {
          date: todayStr,
          personaId: activePersona.id,
          youtubeDone: false,
          instaDone: false,
          tiktokDone: false,
          facebookDone: false,
          allCompleted: false,
        },
      });
    }

    const allCompleted =
      dailyUpload.allCompleted ||
      (dailyUpload.youtubeDone &&
        dailyUpload.instaDone &&
        dailyUpload.tiktokDone &&
        dailyUpload.facebookDone);

    // 6. Check if already done
    if (allCompleted) {
      return NextResponse.json({
        status: "completed",
        message: `All uploads for ${activePersona.name} are already finished today!`,
        brand: activePersona.name,
        date: todayStr,
      });
    }

    // 7. If pending, send WhatsApp reminder
    const phone =
      settings?.whatsappPhone || process.env.WHATSAPP_PHONE || "";
    const provider = settings?.provider || "greenapi";
    const appUrl =
      settings?.appUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      "http://localhost:3000";

    if (!phone) {
      return NextResponse.json({
        status: "error",
        message: "WhatsApp phone not configured in SystemSettings.",
        brand: activePersona.name,
      });
    }

    const message = formatWhatsAppMessage({
      brandName: activePersona.name,
      youtubeDone: dailyUpload.youtubeDone,
      instaDone: dailyUpload.instaDone,
      tiktokDone: dailyUpload.tiktokDone,
      facebookDone: dailyUpload.facebookDone,
      appUrl,
      currentTimeStr: timeFormatted,
    });

    const result = await sendWhatsAppNotification({
      provider,
      phone,
      callmebotApiKey: settings?.callmebotApiKey || process.env.CALLMEBOT_API_KEY,
      greenApiIdInstance:
        settings?.greenApiIdInstance || process.env.GREEN_API_ID_INSTANCE,
      greenApiApiToken:
        settings?.greenApiApiToken || process.env.GREEN_API_API_TOKEN,
      message,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          status: "failed",
          error: result.error,
          brand: activePersona.name,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "sent",
      sent_to: phone,
      brand: activePersona.name,
      provider,
      time: timeFormatted,
      dailyUploadStatus: {
        youtube: dailyUpload.youtubeDone,
        instagram: dailyUpload.instaDone,
        tiktok: dailyUpload.tiktokDone,
        facebook: dailyUpload.facebookDone,
      },
      response: result.data,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMsg },
      { status: 500 }
    );
  }
}
