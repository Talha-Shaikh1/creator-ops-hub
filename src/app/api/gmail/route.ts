import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search")?.toLowerCase().trim();

    const gmailAccounts = await prisma.gmailAccount.findMany({
      include: {
        personas: true,
      },
      orderBy: { email: "asc" },
    });

    if (!search) {
      return NextResponse.json(gmailAccounts);
    }

    const filtered = gmailAccounts.filter((acc) => {
      const matchEmail = acc.email.toLowerCase().includes(search);
      const matchSub = acc.subscription.toLowerCase().includes(search);
      const matchProfile = acc.browserProfile?.toLowerCase().includes(search);
      const matchNotes = acc.notes?.toLowerCase().includes(search);
      const matchPersonas = acc.personas.some((p) =>
        p.name.toLowerCase().includes(search)
      );
      return (
        matchEmail || matchSub || matchProfile || matchNotes || matchPersonas
      );
    });

    return NextResponse.json(filtered);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch Gmail accounts", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, subscription, renewalDate, browserProfile, notes } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Gmail address is required" },
        { status: 400 }
      );
    }

    const account = await prisma.gmailAccount.create({
      data: {
        email: email.trim().toLowerCase(),
        subscription: subscription || "Free",
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        browserProfile: browserProfile || null,
        notes: notes || null,
      },
      include: { personas: true },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create Gmail account", details: errorMsg },
      { status: 500 }
    );
  }
}
