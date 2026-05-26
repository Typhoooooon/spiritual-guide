import { NextResponse } from "next/server";
import { getGuestId } from "@/lib/guest";
import { db } from "@/lib/db";

export async function GET() {
  const userId = await getGuestId();

  const conversations = await db.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      thinkerName: true,
      thinkerTradition: true,
      status: true,
      currentRound: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(conversations);
}
