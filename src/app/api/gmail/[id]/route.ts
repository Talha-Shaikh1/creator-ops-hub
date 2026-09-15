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
    const { email, subscription, renewalDate, browserProfile, notes } = body;

    const account = await prisma.gmailAccount.update({
      where: { id },
      data: {
        ...(email ? { email: email.trim().toLowerCase() } : {}),
        ...(subscription !== undefined ? { subscription } : {}),
        renewalDate:
          renewalDate !== undefined
            ? renewalDate
              ? new Date(renewalDate)
              : null
            : undefined,
        browserProfile:
          browserProfile !== undefined ? browserProfile || null : undefined,
        notes: notes !== undefined ? notes || null : undefined,
      },
      include: { personas: true },
    });

    return NextResponse.json(account);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update Gmail account", details: errorMsg },
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
    await prisma.gmailAccount.delete({
      where: { id },
    });
    return NextResponse.json({
      success: true,
      message: "Gmail account deleted",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete Gmail account", details: errorMsg },
      { status: 500 }
    );
  }
}
