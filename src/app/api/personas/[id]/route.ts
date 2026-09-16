import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      assignedDay,
      gmailAccountId,
      niche,
      language,
      targetAudience,
      visualStyle,
      framePrompt,
      masterVideoPrompt,
      weeklyReelsTarget,
      weeklyFeedTarget,
      dailyStoriesTarget,
      youtubeHandle,
      youtubeUrl,
      instaHandle,
      instaUrl,
      tiktokHandle,
      tiktokUrl,
      facebookHandle,
      facebookUrl,
    } = body;

    const persona = await prisma.persona.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim().toLowerCase() } : {}),
        assignedDay:
          assignedDay !== undefined && assignedDay !== ""
            ? parseInt(assignedDay, 10)
            : null,
        gmailAccountId: gmailAccountId || null,
        niche: niche !== undefined ? niche : undefined,
        language: language !== undefined ? language : undefined,
        targetAudience: targetAudience !== undefined ? targetAudience : undefined,
        visualStyle: visualStyle !== undefined ? visualStyle : undefined,
        framePrompt: framePrompt !== undefined ? framePrompt : undefined,
        masterVideoPrompt: masterVideoPrompt !== undefined ? masterVideoPrompt : undefined,
        weeklyReelsTarget: weeklyReelsTarget !== undefined ? parseInt(weeklyReelsTarget, 10) : undefined,
        weeklyFeedTarget: weeklyFeedTarget !== undefined ? parseInt(weeklyFeedTarget, 10) : undefined,
        dailyStoriesTarget: dailyStoriesTarget !== undefined ? parseInt(dailyStoriesTarget, 10) : undefined,
        youtubeHandle: youtubeHandle || null,
        youtubeUrl: youtubeUrl || null,
        instaHandle: instaHandle || null,
        instaUrl: instaUrl || null,
        tiktokHandle: tiktokHandle || null,
        tiktokUrl: tiktokUrl || null,
        facebookHandle: facebookHandle || null,
        facebookUrl: facebookUrl || null,
      },
      include: { gmailAccount: true },
    });

    return NextResponse.json(persona);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update persona", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.persona.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Persona deleted" });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete persona", details: errorMsg },
      { status: 500 }
    );
  }
}
