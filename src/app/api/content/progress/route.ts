import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPKTDateString } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const personaId = searchParams.get("personaId");
    const date = searchParams.get("date") || getPKTDateString();

    if (!personaId) {
      return NextResponse.json(
        { error: "personaId is required" },
        { status: 400 }
      );
    }

    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Get current week dates (Monday to Sunday)
    const today = new Date(date);
    const day = today.getDay(); // 0 is Sunday, 1 is Mon
    const diffToMon = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMon));

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }

    // Get all daily uploads for this persona in this week
    const weeklyUploads = await prisma.dailyUpload.findMany({
      where: {
        personaId,
        date: { in: weekDates },
      },
    });

    const todayUpload = weeklyUploads.find((u) => u.date === date) || null;

    // Calculate completions
    const completedReelsThisWeek = weeklyUploads.filter(
      (u) => u.youtubeDone || u.instaDone || u.tiktokDone || u.facebookDone || u.allCompleted
    ).length;

    const totalFeedPostsThisWeek = weeklyUploads.reduce(
      (acc, curr) => acc + (curr.feedPostsCount || 0),
      0
    );

    const todayStories = todayUpload?.storiesCount || 0;
    const todayFeedPosts = todayUpload?.feedPostsCount || 0;

    return NextResponse.json({
      personaId,
      date,
      targets: {
        weeklyReelsTarget: persona.weeklyReelsTarget || 3,
        weeklyFeedTarget: persona.weeklyFeedTarget || 4,
        dailyStoriesTarget: persona.dailyStoriesTarget || 5,
      },
      actuals: {
        completedReelsThisWeek,
        totalFeedPostsThisWeek,
        todayStories,
        todayFeedPosts,
      },
      todayUpload,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch progress", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      personaId,
      date = getPKTDateString(),
      feedPostsCountDelta = 0,
      storiesCountDelta = 0,
      setFeedPostsCount,
      setStoriesCount,
    } = body;

    if (!personaId) {
      return NextResponse.json(
        { error: "personaId is required" },
        { status: 400 }
      );
    }

    // Find existing daily upload or create one
    const existing = await prisma.dailyUpload.findUnique({
      where: {
        date_personaId: {
          date,
          personaId,
        },
      },
    });

    let newFeed = existing?.feedPostsCount || 0;
    let newStories = existing?.storiesCount || 0;

    if (setFeedPostsCount !== undefined) {
      newFeed = Math.max(0, setFeedPostsCount);
    } else if (feedPostsCountDelta !== 0) {
      newFeed = Math.max(0, newFeed + feedPostsCountDelta);
    }

    if (setStoriesCount !== undefined) {
      newStories = Math.max(0, setStoriesCount);
    } else if (storiesCountDelta !== 0) {
      newStories = Math.max(0, newStories + storiesCountDelta);
    }

    const updated = await prisma.dailyUpload.upsert({
      where: {
        date_personaId: {
          date,
          personaId,
        },
      },
      create: {
        date,
        personaId,
        feedPostsCount: newFeed,
        storiesCount: newStories,
      },
      update: {
        feedPostsCount: newFeed,
        storiesCount: newStories,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update progress", details: errorMsg },
      { status: 500 }
    );
  }
}
