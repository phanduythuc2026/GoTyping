"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Keyboard, BookOpen, Bookmark, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [typedText, setTypedText] = useState("");
  const targetScript = "router.push('/')";

  // Kinetic mini typing simulation
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= targetScript.length) {
        setTypedText(targetScript.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 90);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center selection:bg-indigo-500/30">
      {/* Visual Header / Large Neon 404 */}
      <div className="relative mb-3">
        <span className="text-8xl sm:text-9xl font-extrabold font-mono tracking-widest text-indigo-400/25 select-none drop-shadow-sm">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl backdrop-blur-sm">
            <Keyboard className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Academic Headline */}
      <h1 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight text-foreground mb-2">
        404 — Thesis Statement Not Found
      </h1>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">
        Giám khảo IELTS không tìm thấy dẫn chứng cho đường dẫn này. Có thể luận điểm đã lạc đề, liên kết đã hết hạn hoặc bài viết đã được di dời khỏi thư viện học thuật.
      </p>

      {/* Kinetic typing console box */}
      <div className="mb-8 px-4 py-2.5 rounded-xl bg-surface border border-surface-border font-mono text-xs text-zinc-300 flex items-center gap-2 shadow-inner">
        <span className="text-indigo-400 select-none">&gt;</span>
        <span className="text-emerald-400 font-semibold">{typedText}</span>
        <span className="w-1.5 h-4 bg-indigo-400 rounded-full animate-caret-breathe" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-md w-full">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Về Bàn Gõ (Dashboard)</span>
        </Link>
        <Link
          href="/library"
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Mở Thư Viện Bài Báo</span>
        </Link>
        <Link
          href="/vocabulary"
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
        >
          <Bookmark className="w-4 h-4 text-sky-400" />
          <span>Tra Cứu Từ Vựng</span>
        </Link>
      </div>
    </div>
  );
}
