import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPKTPastDays, getPKTDateString } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pastDays = getPKTPastDays(28); // 4 weeks
    const todayStr = getPKTDateString();

    const uploads = await prisma.dailyUpload.findMany({
      where: {
        date: { in: pastDays },
      },
      include: {
        persona: true,
      },
      orderBy: { date: "asc" },
    });

    const uploadByDate = new Map<string, typeof uploads>();
    for (const u of uploads) {
      const list = uploadByDate.get(u.date) || [];
      list.push(u);
      uploadByDate.set(u.date, list);
    }

    const history = pastDays.map((date) => {
      const records = uploadByDate.get(date) || [];
      if (records.length === 0) {
        return {
          date,
          status: date === todayStr ? "pending" : "missed",
          completedPlatforms: 0,
          totalPlatforms: 4,
          personaName: null,
          details: null,
        };
      }

      const rec = records[0];
      const count =
        (rec.youtubeDone ? 1 : 0) +
        (rec.instaDone ? 1 : 0) +
        (rec.tiktokDone ? 1 : 0) +
        (rec.facebookDone ? 1 : 0);

      let status: "completed" | "partial" | "missed" | "pending";
      if (rec.allCompleted || count === 4) {
        status = "completed";
      } else if (count > 0) {
        status = "partial";
      } else {
        status = date === todayStr ? "pending" : "missed";
      }

      return {
        date,
        status,
        completedPlatforms: count,
        totalPlatforms: 4,
        personaName: rec.persona.name,
        details: rec,
      };
    });

    // Calculate current streak (consecutive completed days ending today or yesterday)
    let currentStreak = 0;
    const reversed = [...history].reverse();

    for (let i = 0; i < reversed.length; i++) {
      const item = reversed[i];
      if (item.date === todayStr && item.status !== "completed") {
        // Today is not finished yet, don't break streak if yesterday was completed
        continue;
      }
      if (item.status === "completed") {
        currentStreak++;
      } else {
        break;
      }
    }

    const completedCount = history.filter((h) => h.status === "completed").length;
    const partialCount = history.filter((h) => h.status === "partial").length;
    const missedCount = history.filter((h) => h.status === "missed").length;

    return NextResponse.json({
      currentStreak,
      totalTrackedDays: pastDays.length,
      completedDays: completedCount,
      partialDays: partialCount,
      missedDays: missedCount,
      completionRate: Math.round((completedCount / pastDays.length) * 100),
      history,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: errorMsg },
      { status: 500 }
    );
  }
}
