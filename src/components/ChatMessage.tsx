interface ChatMessageProps {
  role: "user" | "thinker";
  content: string;
  thinkerName?: string;
  thinkerAvatar?: string;
}

export function ChatMessage({ role, content, thinkerName, thinkerAvatar }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-6`}>
      {!isUser && thinkerAvatar && (
        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-lg flex-shrink-0">
          {thinkerAvatar}
        </div>
      )}
      <div className={`max-w-[75%] ${isUser ? "items-end" : ""}`}>
        {!isUser && thinkerName && (
          <p className="text-xs text-gray-400 mb-1">{thinkerName}</p>
        )}
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-emerald-50 text-gray-800"
              : "bg-white border border-gray-100 text-gray-800"
          }`}
        >
          {content}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
}
