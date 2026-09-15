import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: "default",
          whatsappPhone: process.env.WHATSAPP_PHONE || "923001234567",
          callmebotApiKey: process.env.CALLMEBOT_API_KEY || "123456",
          cronSecret:
            process.env.CRON_SECRET || "creatorops_super_secret_cron_token_2025",
          startHourPKT: 14,
          endHourPKT: 23,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch settings", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      whatsappPhone,
      callmebotApiKey,
      cronSecret,
      startHourPKT,
      endHourPKT,
      appUrl,
    } = body;

    const updated = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: {
        ...(whatsappPhone !== undefined ? { whatsappPhone } : {}),
        ...(callmebotApiKey !== undefined ? { callmebotApiKey } : {}),
        ...(cronSecret !== undefined ? { cronSecret } : {}),
        ...(startHourPKT !== undefined
          ? { startHourPKT: parseInt(startHourPKT, 10) }
          : {}),
        ...(endHourPKT !== undefined
          ? { endHourPKT: parseInt(endHourPKT, 10) }
          : {}),
        ...(appUrl !== undefined ? { appUrl } : {}),
      },
      create: {
        id: "default",
        whatsappPhone: whatsappPhone || null,
        callmebotApiKey: callmebotApiKey || null,
        cronSecret: cronSecret || "creatorops_super_secret_cron_token_2025",
        startHourPKT: startHourPKT ? parseInt(startHourPKT, 10) : 14,
        endHourPKT: endHourPKT ? parseInt(endHourPKT, 10) : 23,
        appUrl: appUrl || "http://localhost:3000",
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update settings", details: errorMsg },
      { status: 500 }
    );
  }
}
