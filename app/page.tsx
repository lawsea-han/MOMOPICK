"use client";

import { useState, useCallback } from "react";
import { DropZone } from "./components/DropZone";
import { CompareSlider } from "./components/CompareSlider";
import { BgPicker } from "./components/BgPicker";

type Step = "idle" | "processing" | "done" | "error";

interface Images {
  original: string; // blob URL
  result: string;   // blob URL (투명 PNG)
}

function ProgressScreen({
  progress,
  msg,
}: {
  progress: number;
  msg: string;
}) {
  return (
    <main className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-slate-200 mb-2">배경 제거 중</h2>
        <p className="text-sm text-slate-500 mb-6 h-5">{msg || "잠시만 기다려주세요..."}</p>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-600 mt-2">{progress}%</p>
        {progress < 10 && (
          <p className="text-xs text-slate-700 mt-4">
            첫 실행 시 AI 모델을 다운로드합니다 (~50MB)
          </p>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("idle");
  const [images, setImages] = useState<Images | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [bgColor, setBgColor] = useState("transparent");
  const [error, setError] = useState("");

  const handleFile = useCallback(async (file: File) => {
    // 이전 blob URL 해제
    setImages((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.original);
        URL.revokeObjectURL(prev.result);
      }
      return null;
    });

    setStep("processing");
    setProgress(0);
    setProgressMsg("");
    setError("");

    const originalUrl = URL.createObjectURL(file);

    try {
      // 클라이언트에서만 동적 import (SSR 방지)
      const { removeBackground } = await import("@imgly/background-removal");

      const resultBlob = await removeBackground(file, {
        debug: false,
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          setProgress(pct);

          if (key.includes("fetch")) {
            setProgressMsg("AI 모델 다운로드 중...");
          } else if (key.includes("compute") || key.includes("inference")) {
            setProgressMsg("배경 분석 중...");
          } else {
            setProgressMsg("처리 중...");
          }
        },
      });

      const resultUrl = URL.createObjectURL(resultBlob);
      setImages({ original: originalUrl, result: resultUrl });
      setStep("done");
    } catch (err) {
      URL.revokeObjectURL(originalUrl);
      const msg =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(msg);
      setStep("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setImages((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.original);
        URL.revokeObjectURL(prev.result);
      }
      return null;
    });
    setStep("idle");
    setProgress(0);
    setBgColor("transparent");
    setError("");
  }, []);

  const handleDownload = useCallback(() => {
    if (!images) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 배경 채우기 (투명이면 생략 → PNG 투명도 유지)
      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `removed_bg_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = images.result;
  }, [images, bgColor]);

  // ── 처리 중 화면 ─────────────────────────────────
  if (step === "processing") {
    return <ProgressScreen progress={progress} msg={progressMsg} />;
  }

  // ── 결과 화면 ─────────────────────────────────────
  if (step === "done" && images) {
    return (
      <main className="min-h-screen bg-[#0f1117] p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-100">🍑 MomoPick</h1>
              <p className="text-xs text-slate-600 mt-0.5">
                슬라이더를 드래그해서 전후를 비교하세요
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-sm font-medium transition-colors"
            >
              새 이미지
            </button>
          </div>

          {/* 비교 슬라이더 */}
          <CompareSlider
            before={images.original}
            after={images.result}
            bgColor={bgColor}
          />

          {/* 배경 선택 + 다운로드 */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <BgPicker value={bgColor} onChange={setBgColor} />
            <button
              onClick={handleDownload}
              className="sm:w-44 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              PNG 다운로드
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── 업로드 화면 (idle / error) ────────────────────
  return (
    <main className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            브라우저에서 처리 · 이미지 외부 전송 없음
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            🍑 MomoPick
          </h1>
          <p className="text-slate-500 text-sm">
            AI가 자동으로 배경을 제거합니다 · 무료 · 무제한
          </p>
        </div>

        {/* 업로드 영역 */}
        <DropZone onFile={handleFile} />

        {/* 오류 메시지 */}
        {step === "error" && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <strong className="block mb-1">오류 발생</strong>
            {error}
          </div>
        )}

        <p className="text-center text-xs text-slate-700 mt-5">
          PNG · JPG · WEBP 지원 · 최대 20MB
        </p>
      </div>
    </main>
  );
}
