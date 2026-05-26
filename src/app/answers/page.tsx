"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThinkerCard } from "@/components/ThinkerCard";

interface AnswerData {
  conversationId: string;
  thinkers: {
    id: string;
    name: string;
    tradition: string;
    avatar: string;
    answer: string;
  }[];
  thinkerMessageIds: string[];
}

export default function AnswersPage() {
  const [data, setData] = useState<AnswerData | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("answerData");
    if (!stored) {
      router.push("/");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </main>
    );
  }

  const handleSelect = async (thinkerName: string) => {
    setSelecting(thinkerName);
    sessionStorage.setItem(
      "selectedThinker",
      JSON.stringify({ conversationId: data.conversationId, thinkerName })
    );
    router.push(`/chat/${data.conversationId}`);
  };

  return (
    <main className="min-h-screen px-4 py-12 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          三位智者给出了不同的视角
        </h2>
        <p className="text-gray-500">选择一位，继续深入对话</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.thinkers.map((t) => (
          <ThinkerCard
            key={t.id}
            name={t.name}
            tradition={t.tradition}
            avatar={t.avatar}
            answer={t.answer}
            loading={selecting === t.name}
            onSelect={() => handleSelect(t.name)}
          />
        ))}
      </div>
    </main>
  );
}
