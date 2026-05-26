import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = await db.conversation.findUnique({
    where: { shareId: id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) notFound();

  const displayMessages = conversation.messages.filter((m) => !m.isFirstRound);

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          {conversation.title}
        </h1>
        <p className="text-gray-500">
          {conversation.thinkerName} · {conversation.thinkerTradition} ·{" "}
          {conversation.currentRound}轮对话
        </p>
        <div className="mt-4 inline-block px-4 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
          由智者对话生成 · 分享
        </div>
      </div>

      <div className="space-y-6">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
              <p className="text-xs text-gray-400 mb-1">
                {msg.role === "user" ? "提问者" : conversation.thinkerName}
              </p>
              <div
                className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-emerald-50 text-gray-800"
                    : "bg-white border border-gray-100 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
