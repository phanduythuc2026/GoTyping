"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

interface ToastData {
  id: string;
  title: string;
  content: string;
  severity: "info" | "warning" | "critical";
}

export const MiniToast: React.FC = () => {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function loadToast() {
      try {
        const res = await fetch("/api/admin/announcements");
        const data = await res.json();
        if (data.success && Array.isArray(data.announcements)) {
          interface AnnItem {
            id: string;
            type: string;
            is_active: boolean;
            title: string;
            content: string;
            severity: "info" | "warning" | "critical";
          }
          const activeToast = data.announcements.find(
            (a: AnnItem) => a.type === "toast" && a.is_active
          );
          if (activeToast) {
            setToast({
              id: activeToast.id,
              title: activeToast.title,
              content: activeToast.content,
              severity: activeToast.severity || "info",
            });
            setVisible(true);
          }
        }
      } catch (e) {
        console.error("Toast fetch error:", e);
      }
    }

    loadToast();
  }, []);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible || !toast) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-surface/95 border border-surface-border text-foreground p-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-400 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              {toast.title}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              {toast.content}
            </p>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
