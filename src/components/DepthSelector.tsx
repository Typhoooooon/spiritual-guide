"use client";

export function DepthSelector({
  value,
  onChange,
}: {
  value: "gentle" | "deep";
  onChange: (v: "gentle" | "deep") => void;
}) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onChange("gentle")}
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
          value === "gentle"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        温和
      </button>
      <button
        type="button"
        onClick={() => onChange("deep")}
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
          value === "deep"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        深度
      </button>
    </div>
  );
}
