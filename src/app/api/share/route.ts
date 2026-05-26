import { NextRequest, NextResponse } from "next/server";
import { getGuestId } from "@/lib/guest";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const userId = await getGuestId();

  const { conversationId } = await request.json();
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (conversation.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shareId = conversation.shareId || nanoid(12);

  await db.conversation.update({
    where: { id: conversationId },
    data: { shareId },
  });

  return NextResponse.json({ shareId, url: `/share/${shareId}` });
}
