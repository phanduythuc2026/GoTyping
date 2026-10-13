"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, Palette, CheckCircle, X, Globe, Mail, Link as LinkIcon } from "lucide-react";
import { SystemSettingsMap } from "@/lib/admin-store";

export const GeneralSettingsManager: React.FC = () => {
  const [general, setGeneral] = useState<SystemSettingsMap["general_info"]>({
    appName: "IELTS Scribe",
    slogan: "Academic Typing & Lexical Reflex Engine",
    supportEmail: "admin@gotyping.local",
    canonicalUrl: "http://localhost:4000",
    studyGroups: {
      zalo: "https://zalo.me/g/ielts-scribe-pro",
      discord: "https://discord.gg/ielts-scribe",
    },
  });

  const [security, setSecurity] = useState<SystemSettingsMap["security_config"]>({
    rateLimitScraperPerMin: 15,
    rateLimitAiPerMin: 20,
    sessionTimeoutHours: 72,
    captchaEnabled: false,
    ipBlacklist: [],
  });

  const [themeDefaults, setThemeDefaults] = useState<SystemSettingsMap["theme_defaults"]>({
    defaultTheme: "dark",
    accentColor: "indigo",
    fontFamily: "JetBrains Mono",
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
      if (data.success && data.settings) {
        if (data.settings.general_info) setGeneral(data.settings.general_info);
        if (data.settings.security_config) setSecurity(data.settings.security_config);
        if (data.settings.theme_defaults) setThemeDefaults(data.settings.theme_defaults);
      }
    } catch (e) {
      console.error("Fetch settings error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      await Promise.all([
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "general_info", value: general }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "security_config", value: security }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "theme_defaults", value: themeDefaults }),
        }),
      ]);

      setMessage("Đã lưu toàn bộ thiết lập hệ thống và bảo mật thành công.");
      setTimeout(() => setMessage(""), 3500);
    } catch (e) {
      console.error("Save settings error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        Đang tải cấu hình hệ thống...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. General Info Card */}
      <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-5">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          <span>Thông Tin Nền Tảng &amp; Thương Hiệu (General Info)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Tên Nền Tảng (App Name):</label>
            <input
              type="text"
              value={general.appName}
              onChange={(e) => setGeneral({ ...general, appName: e.target.value })}
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Slogan Học Thuật:</label>
            <input
              type="text"
              value={general.slogan}
              onChange={(e) => setGeneral({ ...general, slogan: e.target.value })}
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>Email Hỗ Trợ Kỹ Thuật:</span>
            </label>
            <input
              type="email"
              value={general.supportEmail}
              onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>Canonical Base URL:</span>
            </label>
            <input
              type="url"
              value={general.canonicalUrl}
              onChange={(e) => setGeneral({ ...general, canonicalUrl: e.target.value })}
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Link Cộng Đồng Zalo:</span>
            </label>
            <input
              type="text"
              value={general.studyGroups?.zalo || ""}
              onChange={(e) =>
                setGeneral({
                  ...general,
                  studyGroups: { ...general.studyGroups, zalo: e.target.value },
                })
              }
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Link Discord Server:</span>
            </label>
            <input
              type="text"
              value={general.studyGroups?.discord || ""}
              onChange={(e) =>
                setGeneral({
                  ...general,
                  studyGroups: { ...general.studyGroups, discord: e.target.value },
                })
              }
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Security & Rate Limits Card */}
      <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-5">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Cấu Hình Bảo Mật &amp; Giới Hạn Rate Limit (Security Matrix)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Giới hạn cào bài (Requests/Phút):
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={security.rateLimitScraperPerMin}
              onChange={(e) =>
                setSecurity({ ...security, rateLimitScraperPerMin: Number(e.target.value) })
              }
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Giới hạn gọi AI (Requests/Phút):
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={security.rateLimitAiPerMin}
              onChange={(e) =>
                setSecurity({ ...security, rateLimitAiPerMin: Number(e.target.value) })
              }
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Thời gian phiên hết hạn (Giờ):
            </label>
            <input
              type="number"
              min={1}
              max={720}
              value={security.sessionTimeoutHours}
              onChange={(e) =>
                setSecurity({ ...security, sessionTimeoutHours: Number(e.target.value) })
              }
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Theme & Typography Defaults */}
      <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-5">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />
          <span>Giao Diện &amp; Typography Khởi Tạo (Defaults)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Theme mặc định cho khách:</label>
            <select
              value={themeDefaults.defaultTheme}
              onChange={(e) =>
                setThemeDefaults({
                  ...themeDefaults,
                  defaultTheme: e.target.value as "dark" | "light" | "system",
                })
              }
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
            >
              <option value="dark">Chế độ Tối (Dark Palette)</option>
              <option value="light">Chế độ Sáng (Light Focus)</option>
              <option value="system">Theo hệ điều hành (System)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Font chữ bàn gõ:</label>
            <input
              type="text"
              value={themeDefaults.fontFamily}
              onChange={(e) => setThemeDefaults({ ...themeDefaults, fontFamily: e.target.value })}
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Màu chủ đạo (Accent Color):</label>
            <input
              type="text"
              value={themeDefaults.accentColor}
              onChange={(e) => setThemeDefaults({ ...themeDefaults, accentColor: e.target.value })}
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Lưu Toàn Bộ Thiết Lập Hệ Thống</span>
        </button>
      </div>
    </form>
  );
};
