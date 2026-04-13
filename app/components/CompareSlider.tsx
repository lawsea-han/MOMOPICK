"use client";

import { useRef, useState } from "react";

interface CompareSliderProps {
  before: string;
  after: string;
  bgColor: string;
}

// 투명 배경 체크무늬 패턴 (SVG data URL)
const CHECKER =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23888'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23888'/%3E%3Crect x='10' y='0' width='10' height='10' fill='%23bbb'/%3E%3Crect x='0' y='10' width='10' height='10' fill='%23bbb'/%3E%3C/svg%3E\")";

export function CompareSlider({ before, after, bgColor }: CompareSliderProps) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPos = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  };

  const background = bgColor === "transparent" ? CHECKER : bgColor;

  return (
    <div className="rounded-2xl overflow-hidden bg-[#1a1f2e] border border-white/10">
      {/* 이미지 비교 영역 */}
      <div
        ref={containerRef}
        className="relative select-none touch-none cursor-ew-resize"
        onMouseMove={(e) => {
          if (e.buttons === 1) getPos(e.clientX);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          getPos(e.touches[0].clientX);
        }}
      >
        {/* 뒤 레이어: 배경 제거된 결과 */}
        <div style={{ background }}>
          <img
            src={after}
            alt="배경 제거 결과"
            className="w-full block"
            draggable={false}
          />
        </div>

        {/* 앞 레이어: 원본 (왼쪽 pos% 만큼 표시) */}
        <img
          src={before}
          alt="원본"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          draggable={false}
        />

        {/* 구분선 */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/80 pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          {/* 핸들 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-600 font-bold text-xs"
            style={{ cursor: "ew-resize" }}
          >
            ◀▶
          </div>
        </div>

        {/* 슬라이더 (키보드·마우스·터치 공통 처리) */}
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(+e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>

      {/* 레이블 */}
      <div className="flex justify-between px-4 py-2 text-xs text-slate-500 border-t border-white/10">
        <span>← 원본</span>
        <span>배경 제거 →</span>
      </div>
    </div>
  );
}
