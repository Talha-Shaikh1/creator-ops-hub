import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPKTDateString, getPKTDayOfWeek } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date") || getPKTDateString();

    // Get the active persona for this day if specified, or by date
    const dayOfWeek = getPKTDayOfWeek(new Date());
    
    // Find all uploads for this date or today
    const uploads = await prisma.dailyUpload.findMany({
      where: { date },
      include: {
        persona: {
          include: {
            gmailAccount: true,
          },
        },
      },
    });

    // Also get today's scheduled persona
    const scheduledPersona = await prisma.persona.findFirst({
      where: { assignedDay: dayOfWeek },
      include: { gmailAccount: true },
    });

    // If no upload record exists for the scheduled persona today, ensure one is ready
    let todayUpload = uploads.find(
      (u) => scheduledPersona && u.personaId === scheduledPersona.id
    );

    if (!todayUpload && scheduledPersona && date === getPKTDateString()) {
      todayUpload = await prisma.dailyUpload.create({
        data: {
          date,
          personaId: scheduledPersona.id,
          youtubeDone: false,
          instaDone: false,
          tiktokDone: false,
          facebookDone: false,
          allCompleted: false,
        },
        include: {
          persona: {
            include: {
              gmailAccount: true,
            },
          },
        },
      });
      uploads.push(todayUpload);
    }

    return NextResponse.json({
      date,
      scheduledPersona,
      todayUpload,
      uploads,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch daily uploads", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      personaId,
      date = getPKTDateString(),
      platform,
      value,
      markAll,
      videoTitle,
      notes,
      youtubeUrl,
      instaUrl,
      tiktokUrl,
      facebookUrl,
    } = body;

    let targetUploadId = id;

    // If ID not provided, find or create by date & personaId
    if (!targetUploadId) {
      if (!personaId) {
        return NextResponse.json(
          { error: "Either upload id or personaId is required" },
          { status: 400 }
        );
      }

      let existing = await prisma.dailyUpload.findUnique({
        where: {
          date_personaId: {
            date,
            personaId,
          },
        },
      });

      if (!existing) {
        existing = await prisma.dailyUpload.create({
          data: {
            date,
            personaId,
          },
        });
      }
      targetUploadId = existing.id;
    }

    // Fetch current record
    const current = await prisma.dailyUpload.findUnique({
      where: { id: targetUploadId },
    });

    if (!current) {
      return NextResponse.json(
        { error: "DailyUpload record not found" },
        { status: 404 }
      );
    }

    // Prepare updates
    let updatedData: Record<string, unknown> = {};

    if (markAll !== undefined) {
      const boolVal = Boolean(markAll);
      updatedData = {
        youtubeDone: boolVal,
        instaDone: boolVal,
        tiktokDone: boolVal,
        facebookDone: boolVal,
        allCompleted: boolVal,
      };
    } else if (platform) {
      const boolVal = Boolean(value);
      const isYt = platform === "youtube" ? boolVal : current.youtubeDone;
      const isInsta = platform === "insta" ? boolVal : current.instaDone;
      const isTiktok = platform === "tiktok" ? boolVal : current.tiktokDone;
      const isFb = platform === "facebook" ? boolVal : current.facebookDone;

      updatedData = {
        ...(platform === "youtube" ? { youtubeDone: boolVal } : {}),
        ...(platform === "insta" ? { instaDone: boolVal } : {}),
        ...(platform === "tiktok" ? { tiktokDone: boolVal } : {}),
        ...(platform === "facebook" ? { facebookDone: boolVal } : {}),
        allCompleted: isYt && isInsta && isTiktok && isFb,
      };
    }

    if (videoTitle !== undefined) updatedData.videoTitle = videoTitle;
    if (notes !== undefined) updatedData.notes = notes;
    if (youtubeUrl !== undefined) updatedData.youtubeUrl = youtubeUrl;
    if (instaUrl !== undefined) updatedData.instaUrl = instaUrl;
    if (tiktokUrl !== undefined) updatedData.tiktokUrl = tiktokUrl;
    if (facebookUrl !== undefined) updatedData.facebookUrl = facebookUrl;

    const updated = await prisma.dailyUpload.update({
      where: { id: targetUploadId },
      data: updatedData,
      include: {
        persona: {
          include: {
            gmailAccount: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update daily upload", details: errorMsg },
      { status: 500 }
    );
  }
}
