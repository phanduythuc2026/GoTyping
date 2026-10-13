"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Cpu,
  Globe,
  Brain,
  Compass,
  Trophy,
  CreditCard,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { SystemSettingsMap } from "@/lib/admin-store";

export const FeatureFlagsManager: React.FC = () => {
  const [flags, setFlags] = useState<SystemSettingsMap["feature_flags"]>({
    geminiAiEnabled: true,
    articleScraperEnabled: true,
    clozeModeEnabled: true,
    radarCCEnabled: true,
    leaderboardSyncEnabled: true,
    donationsEnabled: false,
    premiumQuotaLimit: 10,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings?.feature_flags) {
        setFlags(data.settings.feature_flags);
      }
    } catch (e) {
      console.error("Fetch flags error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlag = async (key: keyof SystemSettingsMap["feature_flags"]) => {
    const updatedValue = !flags[key];
    const newFlags = { ...flags, [key]: updatedValue };
    setFlags(newFlags);

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "feature_flags",
          value: newFlags,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Đã cập nhật công tắc tính năng '${key}'.`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      console.error("Update flag error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const featureList = [
    {
      key: "geminiAiEnabled" as const,
      title: "Gemini AI Engine (Paraphrase & Idea Extractor)",
      desc: "Trí tuệ nhân tạo phân tích từ đồng nghĩa và trích xuất luận điểm. Tắt để tiết kiệm token khi quá tải.",
      icon: Cpu,
      color: "text-purple-400 bg-purple-500/15",
    },
    {
      key: "articleScraperEnabled" as const,
      title: "Web Scraper (Cào bài báo từ URL tự do)",
      desc: "Cho phép người dùng dán link The Guardian, BBC,... để bóc tách bài gõ. Tắt khi hệ thống mạng scraper gặp sự cố.",
      icon: Globe,
      color: "text-sky-400 bg-sky-500/15",
    },
    {
      key: "clozeModeEnabled" as const,
      title: "Active Recall Cloze Mode (Chế độ đục lỗ)",
      desc: "Kích hoạt chức năng ẩn từ vựng AWL & Collocation để học viên rèn luyện phản xạ nhớ từ.",
      icon: Brain,
      color: "text-amber-400 bg-amber-500/15",
    },
    {
      key: "radarCCEnabled" as const,
      title: "Radar Từ Nối C&C (Coherence & Cohesion)",
      desc: "Quét và phân loại thiết bị kết nối mạch lạc câu chữ đạt chuẩn IELTS tiêu chí Coherence.",
      icon: Compass,
      color: "text-teal-400 bg-teal-500/15",
    },
    {
      key: "leaderboardSyncEnabled" as const,
      title: "Leaderboard Real-Time Sync",
      desc: "Tự động đồng bộ và ghi nhận điểm số các phiên gõ hợp lệ lên Bảng Xếp Hạng tuần/tháng.",
      icon: Trophy,
      color: "text-emerald-400 bg-emerald-500/15",
    },
    {
      key: "donationsEnabled" as const,
      title: "Cổng Thanh Toán / Quyên Góp Ủng Hộ (VietQR, MoMo)",
      desc: "Bật hiển thị widget ủng hộ duy trì server và các gói nâng cấp hạn mức cào báo học thuật.",
      icon: CreditCard,
      color: "text-rose-400 bg-rose-500/15",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        Đang tải công tắc tính năng...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage("")} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Master Feature Flags (Bật / Tắt Module Toàn Hệ Thống)</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Mọi thay đổi có hiệu lực tức thì trên toàn website mà không cần phải redeploy lại source code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {featureList.map((item) => {
            const Icon = item.icon;
            const isEnabled = Boolean(flags[item.key]);

            return (
              <div
                key={item.key}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all shadow-sm ${
                  isEnabled
                    ? "bg-surface-elevated/70 border-surface-border"
                    : "bg-surface/40 border-surface-border/50 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => toggleFlag(item.key)}
                  className={`flex-shrink-0 transition-transform active:scale-95 cursor-pointer p-1 ${
                    isEnabled ? "text-emerald-400" : "text-zinc-600"
                  }`}
                  title={isEnabled ? "Nhấp để tắt module" : "Nhấp để bật module"}
                >
                  {isEnabled ? (
                    <ToggleRight className="w-7 h-7" />
                  ) : (
                    <ToggleLeft className="w-7 h-7" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
