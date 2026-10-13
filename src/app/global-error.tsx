"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 shadow-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Hệ Thống Gặp Sự Cố Khởi Động
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          Ứng dụng gặp gián đoạn ở cấp độ layout gốc. Vui lòng bấm thử lại để tải lại phiên học tập.
        </p>
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tải Lại Ứng Dụng</span>
        </button>
      </body>
    </html>
  );
}
