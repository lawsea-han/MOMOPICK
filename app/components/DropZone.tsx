"use client";

import { useState, useCallback } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;

export function DropZone({ onFile }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        alert("PNG, JPG, WEBP 이미지만 지원합니다.");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        alert(`${MAX_MB}MB 이하 이미지만 지원합니다.`);
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <label
      className={`flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
          : "border-white/20 hover:border-blue-500/60 hover:bg-white/5"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={onChange}
      />
      <div className="text-5xl mb-4 select-none">🖼️</div>
      <p className="text-slate-300 font-medium text-base">
        이미지를 드래그하거나 클릭하세요
      </p>
      <p className="text-slate-600 text-sm mt-1">PNG · JPG · WEBP · 최대 20MB</p>
    </label>
  );
}
