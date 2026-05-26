import { NextRequest, NextResponse } from "next/server";
import { getGuestId } from "@/lib/guest";
import { db } from "@/lib/db";
import { getThinkerByName } from "@/lib/thinkers";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { chat } from "@/lib/llm";
import { DepthMode } from "@/data/thinkers";

const MAX_ROUNDS = 15;

export async function POST(request: NextRequest) {
  const userId = await getGuestId();

  const body = await request.json();
  const { conversationId, thinkerName, message } = body;

  if (!conversationId || !thinkerName || !message) {
    return NextResponse.json(
      { error: "conversationId, thinkerName, and message are required" },
      { status: 400 }
    );
  }
  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > 500) {
    return NextResponse.json({ error: "Message must be under 500 characters" }, { status: 400 });
  }

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (conversation.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (conversation.status !== "active") {
    return NextResponse.json({ error: "Conversation has ended" }, { status: 400 });
  }
  if (conversation.currentRound >= MAX_ROUNDS) {
    await db.conversation.update({
      where: { id: conversationId },
      data: { status: "completed" },
    });
    return NextResponse.json({ error: "Maximum rounds reached" }, { status: 400 });
  }

  const thinker = getThinkerByName(thinkerName);
  if (!thinker) {
    return NextResponse.json({ error: "Thinker not found" }, { status: 404 });
  }

  const newRound = conversation.currentRound + 1;

  const history = conversation.messages
    .filter((m) => !m.isFirstRound)
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

  const systemPrompt = buildSystemPrompt(thinker, conversation.depthMode as DepthMode);
  const userPrompt = buildUserPrompt(message.trim(), false, history);

  try {
    const answer = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const isLastRound = newRound >= MAX_ROUNDS;
    const finalAnswer = isLastRound
      ? answer + "\n\n（本轮对话即将结束。）"
      : answer;

    await db.conversation.update({
      where: { id: conversationId },
      data: {
        currentRound: newRound,
        status: isLastRound ? "completed" : "active",
        messages: {
          create: [
            { role: "user", content: message.trim(), roundNumber: newRound },
            { role: "thinker", content: finalAnswer, roundNumber: newRound },
          ],
        },
      },
    });

    return NextResponse.json({
      answer: finalAnswer,
      round: newRound,
      isComplete: isLastRound,
      remainingRounds: MAX_ROUNDS - newRound,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
