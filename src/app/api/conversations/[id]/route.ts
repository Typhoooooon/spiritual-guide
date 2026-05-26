import { NextRequest, NextResponse } from "next/server";
import { getGuestId } from "@/lib/guest";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const userId = await getGuestId();

  const conversation = await db.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (conversation.userId !== userId && !conversation.shareId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(conversation);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const userId = await getGuestId();

  const body = await request.json();
  const conversation = await db.conversation.findUnique({
    where: { id },
  });

  if (!conversation || conversation.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.conversation.update({
    where: { id },
    data: {
      thinkerName: body.thinkerName || conversation.thinkerName,
      thinkerTradition: body.thinkerTradition || conversation.thinkerTradition,
    },
  });

  return NextResponse.json(updated);
}
