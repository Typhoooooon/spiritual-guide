"use client";

interface ThinkerCardProps {
  name: string;
  tradition: string;
  avatar: string;
  answer: string;
  onSelect: () => void;
  loading?: boolean;
}

export function ThinkerCard({
  name,
  tradition,
  avatar,
  answer,
  onSelect,
  loading,
}: ThinkerCardProps) {
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
      <div className="text-center mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-50 mx-auto mb-3 flex items-center justify-center text-2xl border border-gray-100">
          {avatar}
        </div>
        <h3 className="font-serif font-semibold text-lg text-gray-900">{name}</h3>
        <p className="text-xs text-gray-500">{tradition}</p>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed flex-1 whitespace-pre-wrap">
        {answer}
      </p>
      <button
        onClick={onSelect}
        disabled={loading}
        className="mt-4 w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        与此人深入对话
      </button>
    </div>
  );
}
