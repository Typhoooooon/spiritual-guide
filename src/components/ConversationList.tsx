"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ConvSummary {
  id: string;
  title: string;
  thinkerName: string;
  thinkerTradition: string;
  status: string;
  currentRound: number;
  updatedAt: string;
}

export function ConversationList({ currentId }: { currentId?: string }) {
  const [conversations, setConversations] = useState<ConvSummary[]>([]);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then(setConversations)
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Link
          href="/"
          className="block w-full py-2 text-center text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          新对话
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              c.id === currentId ? "bg-emerald-50 border-l-2 border-l-emerald-500" : ""
            }`}
          >
            <p className="text-sm font-medium text-gray-900 truncate">
              {c.thinkerName || "新对话"}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{c.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                {c.currentRound}/15轮
              </span>
              <span
                className={`text-xs ${
                  c.status === "active" ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {c.status === "active" ? "进行中" : "已结束"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
