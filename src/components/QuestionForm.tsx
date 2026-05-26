"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThinkerInput } from "./ThinkerInput";
import { DepthSelector } from "./DepthSelector";

export function QuestionForm() {
  const [question, setQuestion] = useState("");
  const [thinker, setThinker] = useState("");
  const [depth, setDepth] = useState<"gentle" | "deep">("gentle");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (question.length > 500) return;

    setLoading(true);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          thinker: thinker.trim() || undefined,
          depth,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "提交失败");
        return;
      }

      const data = await res.json();
      sessionStorage.setItem("answerData", JSON.stringify(data));
      router.push("/answers");
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          向智者提问
        </h1>
        <p className="text-gray-500">你的困惑，千年前的智者也曾思考过</p>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="写下你的问题或困惑..."
        className="w-full h-32 px-4 py-3 text-base border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        maxLength={500}
      />
      <div className="text-right text-xs text-gray-400 mt-1 mb-4">
        {question.length}/500
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <ThinkerInput value={thinker} onChange={setThinker} />
        <span className="text-xs text-gray-400">留空则自动匹配三位智者</span>
        <DepthSelector value={depth} onChange={setDepth} />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "思考中..." : "提问"}
        </button>
      </div>
    </form>
  );
}
