import { NextRequest, NextResponse } from "next/server";
import { setGuestCookie } from "@/lib/guest";
import { db } from "@/lib/db";
import { selectThreeThinkers } from "@/lib/thinkers";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { parallelChat } from "@/lib/llm";
import { DepthMode } from "@/data/thinkers";

export async function POST(request: NextRequest) {
  const userId = await setGuestCookie();

  const body = await request.json();
  const { question, depth = "gentle" as DepthMode, thinker: thinkerName } = body;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }
  if (question.length > 500) {
    return NextResponse.json({ error: "Question must be under 500 characters" }, { status: 400 });
  }

  const selectedThinkers = selectThreeThinkers(thinkerName || undefined);

  const messageSets = await Promise.all(
    selectedThinkers.map(async (thinker) => {
      const systemPrompt = buildSystemPrompt(thinker, depth);
      const userPrompt = buildUserPrompt(question.trim(), true);
      return [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt },
      ];
    })
  );

  try {
    const answers = await parallelChat(messageSets);

    const title = question.trim().slice(0, 50) + (question.trim().length > 50 ? "..." : "");

    const conversation = await db.conversation.create({
      data: {
        userId,
        title,
        thinkerName: "",
        thinkerTradition: "",
        isPresetThinker: true,
        depthMode: depth,
        status: "active",
        currentRound: 1,
        messages: {
          create: [
            {
              role: "user",
              content: question.trim(),
              roundNumber: 1,
              isFirstRound: false,
            },
            ...selectedThinkers.map((t, i) => ({
              role: "thinker" as const,
              content: answers[i],
              roundNumber: 1,
              isFirstRound: true,
            })),
          ],
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      thinkers: selectedThinkers.map((t, i) => ({
        id: t.id,
        name: t.name,
        tradition: t.tradition,
        avatar: t.avatar,
        answer: answers[i],
      })),
      userMessageId: conversation.messages[0].id,
      thinkerMessageIds: selectedThinkers.map(
        (_, i) => conversation.messages[i + 1].id
      ),
    });
  } catch (error) {
    console.error("Question error:", error);
    return NextResponse.json(
      { error: "Failed to generate answers" },
      { status: 500 }
    );
  }
}
