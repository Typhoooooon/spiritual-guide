"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ConversationList } from "@/components/ConversationList";

interface Message {
  id: string;
  role: "user" | "thinker";
  content: string;
  roundNumber: number;
  isFirstRound: boolean;
}

interface ConvData {
  id: string;
  thinkerName: string;
  thinkerTradition: string;
  status: string;
  currentRound: number;
  depthMode: string;
  messages: Message[];
}

const MAX_ROUNDS = 15;

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [conv, setConv] = useState<ConvData | null>(null);
  const [thinkerName, setThinkerName] = useState("");
  const [thinkerAvatar, setThinkerAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/conversations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/");
          return;
        }
        setConv(data);
        const selected = sessionStorage.getItem("selectedThinker");
        let storedName = "";
        if (selected) {
          const { thinkerName: name } = JSON.parse(selected);
          storedName = name;
          setThinkerName(name);
        }
        const ansData = sessionStorage.getItem("answerData");
        if (ansData && storedName) {
          const { thinkers } = JSON.parse(ansData);
          const match = thinkers.find(
            (t: { name: string }) => t.name === storedName
          );
          if (match) setThinkerAvatar(match.avatar);
        }
      })
      .catch(console.error);
  }, [id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages]);

  const handleSend = async (message: string) => {
    if (!conv || !thinkerName) return;
    setLoading(true);

    const tempUserMsg: Message = {
      id: "temp",
      role: "user",
      content: message,
      roundNumber: conv.currentRound + 1,
      isFirstRound: false,
    };

    setConv((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempUserMsg] } : prev
    );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conv.id,
          thinkerName,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        setConv((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.filter((m) => m.id !== "temp"),
              }
            : prev
        );
        return;
      }

      const thinkerMsg: Message = {
        id: String(Date.now()),
        role: "thinker",
        content: data.answer,
        roundNumber: data.round,
        isFirstRound: false,
      };

      setConv((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages.filter((m) => m.id !== "temp"),
                thinkerMsg,
              ],
              currentRound: data.round,
              status: data.isComplete ? "completed" : "active",
            }
          : prev
      );
    } catch {
      alert("发送失败");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!conv) return;
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conv.id }),
      });
      const data = await res.json();
      if (data.url) {
        const fullUrl = window.location.origin + data.url;
        await navigator.clipboard.writeText(fullUrl);
        alert("分享链接已复制到剪贴板");
      }
    } catch {
      alert("分享失败");
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">请先登录</p>
      </main>
    );
  }

  if (!conv) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </main>
    );
  }

  const displayMessages = conv.messages.filter(
    (m) => !m.isFirstRound
  );
  const remainingRounds = MAX_ROUNDS - conv.currentRound;
  const isComplete = conv.status === "completed";

  return (
    <div className="flex h-screen">
      <aside className="w-60 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-hidden">
        <ConversationList currentId={id} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {thinkerAvatar && (
              <span className="text-xl">{thinkerAvatar}</span>
            )}
            <div>
              <h2 className="font-serif font-semibold text-sm text-gray-900">
                {thinkerName || "对话中"}
              </h2>
              {conv.thinkerTradition && (
                <p className="text-xs text-gray-500">
                  {conv.thinkerTradition} · 第{conv.currentRound}/{MAX_ROUNDS}轮
                  {isComplete && " · 已结束"}
                </p>
              )}
            </div>
          </div>
          {isComplete && (
            <button
              onClick={handleShare}
              className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              生成分享链接
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {displayMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              thinkerName={thinkerName}
              thinkerAvatar={thinkerAvatar}
            />
          ))}
          {loading && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-lg">
                {thinkerAvatar}
              </div>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput
          onSend={handleSend}
          disabled={isComplete || loading}
          remainingRounds={Math.max(0, remainingRounds)}
        />

        {isComplete && (
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              开启新对话 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
