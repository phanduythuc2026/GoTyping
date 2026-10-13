"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { Sparkles, X, LogIn } from "lucide-react";

export const GuestAmbientBanner: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("gotyping_guest_banner_dismissed");
      setIsDismissed(dismissed === "true");
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("gotyping_guest_banner_dismissed", "true");
    }
  };

  // If user is logged in or loading or banner is dismissed, do not render
  if (isLoading || user || isDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto bg-zinc-900/90 hover:bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 text-xs text-zinc-300 leading-relaxed font-sans">
        <span>Bạn đang luyện tập ở chế độ </span>
        <strong className="text-amber-300 font-semibold">Khách</strong>.
        <span> Kết quả và từ vựng sẽ không được lưu khi đóng trình duyệt. </span>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2 ml-1"
        >
          <span>Đăng nhập ngay</span>
          <LogIn className="w-3 h-3 inline" />
        </Link>
        <span> để đồng bộ lịch sử và tham gia bảng xếp hạng.</span>
      </div>

      <button
        onClick={handleDismiss}
        title="Ẩn thông báo phiên khách này"
        className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors shrink-0 cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
