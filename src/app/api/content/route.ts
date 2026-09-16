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
      const plans = await prisma.dailyContentPlan.findMany({
        where: { date },
        include: { persona: true },
      });
      return NextResponse.json(plans);
    }

    const plan = await prisma.dailyContentPlan.findUnique({
      where: {
        date_personaId: {
          date,
          personaId,
        },
      },
      include: { persona: true },
    });

    return NextResponse.json(plan || null);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch content plan", details: errorMsg },
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
      trendingTopic,
      trendingAudio,
      hook,
      reelScript,
      imagePostType,
      imagePrompt,
      carouselSlides,
      storiesPlan,
      ytTitle,
      ytDescription,
      ytTags,
      tiktokCaption,
      tiktokHashtags,
      instaCaption,
      instaHashtags,
      facebookCaption,
      facebookHashtags,
    } = body;

    if (!personaId) {
      return NextResponse.json(
        { error: "personaId is required" },
        { status: 400 }
      );
    }

    const plan = await prisma.dailyContentPlan.upsert({
      where: {
        date_personaId: {
          date,
          personaId,
        },
      },
      create: {
        date,
        personaId,
        trendingTopic: trendingTopic || null,
        trendingAudio: trendingAudio || null,
        hook: hook || null,
        reelScript: reelScript || null,
        imagePostType: imagePostType || null,
        imagePrompt: imagePrompt || null,
        carouselSlides: typeof carouselSlides === "object" ? JSON.stringify(carouselSlides) : carouselSlides || null,
        storiesPlan: typeof storiesPlan === "object" ? JSON.stringify(storiesPlan) : storiesPlan || null,
        ytTitle: ytTitle || null,
        ytDescription: ytDescription || null,
        ytTags: ytTags || null,
        tiktokCaption: tiktokCaption || null,
        tiktokHashtags: tiktokHashtags || null,
        instaCaption: instaCaption || null,
        instaHashtags: instaHashtags || null,
        facebookCaption: facebookCaption || null,
        facebookHashtags: facebookHashtags || null,
      },
      update: {
        trendingTopic: trendingTopic !== undefined ? trendingTopic : undefined,
        trendingAudio: trendingAudio !== undefined ? trendingAudio : undefined,
        hook: hook !== undefined ? hook : undefined,
        reelScript: reelScript !== undefined ? reelScript : undefined,
        imagePostType: imagePostType !== undefined ? imagePostType : undefined,
        imagePrompt: imagePrompt !== undefined ? imagePrompt : undefined,
        carouselSlides: typeof carouselSlides === "object" ? JSON.stringify(carouselSlides) : carouselSlides !== undefined ? carouselSlides : undefined,
        storiesPlan: typeof storiesPlan === "object" ? JSON.stringify(storiesPlan) : storiesPlan !== undefined ? storiesPlan : undefined,
        ytTitle: ytTitle !== undefined ? ytTitle : undefined,
        ytDescription: ytDescription !== undefined ? ytDescription : undefined,
        ytTags: ytTags !== undefined ? ytTags : undefined,
        tiktokCaption: tiktokCaption !== undefined ? tiktokCaption : undefined,
        tiktokHashtags: tiktokHashtags !== undefined ? tiktokHashtags : undefined,
        instaCaption: instaCaption !== undefined ? instaCaption : undefined,
        instaHashtags: instaHashtags !== undefined ? instaHashtags : undefined,
        facebookCaption: facebookCaption !== undefined ? facebookCaption : undefined,
        facebookHashtags: facebookHashtags !== undefined ? facebookHashtags : undefined,
      },
      include: { persona: true },
    });

    return NextResponse.json(plan);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to save content plan", details: errorMsg },
      { status: 500 }
    );
  }
}
