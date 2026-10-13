"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const errorDetails = `Digest: ${error.digest || "N/A"}\nMessage: ${error.message}\nStack: ${error.stack || "N/A"}`;
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      {/* Icon with subtle amber glow */}
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-xl shadow-amber-500/5">
        <AlertTriangle className="w-8 h-8" />
      </div>

      {/* Academic Headline */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
        Nhịp Gõ Bị Gián Đoạn Tạm Thời
      </h1>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        Hệ thống gặp sự cố ngoài dự kiến trong khi xử lý câu chữ. Tiến trình từ vựng và phiên gõ của bạn đã được lưu tạm an toàn trong bộ nhớ máy.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Thử Lại Ngay</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Quay Về Trang Chủ</span>
        </Link>
      </div>

      {/* Collapsible Diagnostic Drawer */}
      <div className="max-w-md w-full text-left">
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-surface/70 hover:bg-surface border border-surface-border text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <span>Chi tiết kỹ thuật (Developer Diagnostics)</span>
          {showDiagnostics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDiagnostics && (
          <div className="mt-2 p-4 rounded-xl bg-surface-elevated border border-surface-border font-mono text-[11px] text-zinc-300 relative animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border mb-2 text-zinc-400">
              <span>Mã nhận dạng (Digest): {error.digest || "INTERNAL_FLOW_FAULT"}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Đã copy" : "Copy"}</span>
              </button>
            </div>
            <div className="text-rose-400 font-semibold mb-1 truncate">{error.message}</div>
            <div className="text-[10px] text-zinc-500 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {error.stack || "Không có stack trace."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
