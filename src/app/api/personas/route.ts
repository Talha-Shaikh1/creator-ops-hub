import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const personas = await prisma.persona.findMany({
      include: {
        gmailAccount: true,
      },
      orderBy: [
        { assignedDay: "asc" },
        { name: "asc" },
      ],
    });
    return NextResponse.json(personas);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch personas", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      assignedDay,
      gmailAccountId,
      youtubeHandle,
      youtubeUrl,
      instaHandle,
      instaUrl,
      tiktokHandle,
      tiktokUrl,
      facebookHandle,
      facebookUrl,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Persona name is required" },
        { status: 400 }
      );
    }

    const persona = await prisma.persona.create({
      data: {
        name: name.trim().toLowerCase(),
        assignedDay: assignedDay !== undefined && assignedDay !== "" ? parseInt(assignedDay, 10) : null,
        gmailAccountId: gmailAccountId || null,
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

    return NextResponse.json(persona, { status: 201 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create persona", details: errorMsg },
      { status: 500 }
    );
  }
}
