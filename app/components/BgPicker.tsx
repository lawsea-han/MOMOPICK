"use client";

interface BgPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const PRESETS = [
  { label: "투명", value: "transparent", style: "bg-transparent border-dashed" },
  { label: "흰색", value: "#ffffff" },
  { label: "검정", value: "#111111" },
  { label: "하늘", value: "#e0f2fe" },
  { label: "파랑", value: "#2563eb" },
  { label: "초록", value: "#16a34a" },
  { label: "빨강", value: "#dc2626" },
  { label: "노랑", value: "#fbbf24" },
];

export function BgPicker({ value, onChange }: BgPickerProps) {
  return (
    <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
      <p className="text-xs text-slate-500 mb-3 font-medium">배경 설정</p>
      <div className="flex flex-wrap gap-2 items-center">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            title={p.label}
            onClick={() => onChange(p.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              value === p.value
                ? "border-blue-400 scale-110 shadow-lg"
                : "border-white/20 hover:border-white/50"
            } ${p.value === "transparent" ? "border-dashed" : ""}`}
            style={
              p.value !== "transparent"
                ? { background: p.value }
                : {
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23888'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23888'/%3E%3Crect x='8' y='0' width='8' height='8' fill='%23bbb'/%3E%3Crect x='0' y='8' width='8' height='8' fill='%23bbb'/%3E%3C/svg%3E\")",
                  }
            }
          />
        ))}

        {/* 직접 색상 선택 */}
        <label
          className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-white/50 cursor-pointer overflow-hidden flex items-center justify-center transition-all"
          title="직접 선택"
          style={{ background: value !== "transparent" ? value : "#666" }}
        >
          <input
            type="color"
            className="opacity-0 w-0 h-0"
            value={value === "transparent" ? "#ffffff" : value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="text-white text-xs pointer-events-none">+</span>
        </label>
      </div>
    </div>
  );
}
