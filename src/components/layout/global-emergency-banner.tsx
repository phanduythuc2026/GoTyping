"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Info, AlertOctagon, X, PowerOff, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

interface BannerData {
  id?: string;
  title: string;
  content: string;
  severity: "info" | "warning" | "critical";
}

export const GlobalEmergencyBanner: React.FC = () => {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin" || user?.username === "super_admin";

  const [banner, setBanner] = useState<BannerData | null>(null);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<"hard" | "soft">("hard");
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/maintenance");
      const data = await res.json();
      if (data.success && data.maintenance) {
        setIsMaintenanceActive(data.maintenance.isActive);
        setMaintenanceMode(data.maintenance.mode);
        setMaintenanceMsg(data.maintenance.message);
      }

      // Check general announcements
      const annRes = await fetch("/api/admin/announcements");
      const annData = await annRes.json();
      if (annData.success && Array.isArray(annData.announcements)) {
        interface AnnItem {
          type: string;
          is_active: boolean;
          title: string;
          content: string;
          severity: "info" | "warning" | "critical";
        }
        const activeBanner = annData.announcements.find(
          (a: AnnItem) => a.type === "global_banner" && a.is_active
        );
        if (activeBanner) {
          setBanner({
            title: activeBanner.title,
            content: activeBanner.content,
            severity: activeBanner.severity || "info",
          });
        }
      }
    } catch (e) {
      console.error("Banner status error:", e);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleTurnOffMaintenance = async () => {
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsMaintenanceActive(false);
      }
    } catch (e) {
      console.error("Turn off maintenance error:", e);
    }
  };

  // 1. Super Admin Maintenance Bypass Alert Banner (Hạng mục 3.3 - 4)
  if (isSuperAdmin && isMaintenanceActive) {
    return (
      <div className="w-full bg-rose-950/95 border-b border-rose-600/80 px-4 py-2 text-rose-100 flex items-center justify-between shadow-lg z-50 text-xs animate-in slide-in-from-top">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="font-mono font-bold tracking-wide">
            [ ⚠️ SERVER ĐANG BẢO TRÌ - CHẾ ĐỘ BYPASS SUPER ADMIN ({maintenanceMode.toUpperCase()}) ]
          </span>
          <span className="hidden md:inline text-rose-300/80 max-w-xl truncate">
            {maintenanceMsg}
          </span>
        </div>
        <button
          onClick={handleTurnOffMaintenance}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow cursor-pointer text-xs flex-shrink-0"
          title="Tắt nhanh chế độ bảo trì và mở lại máy chủ"
        >
          <PowerOff className="w-3.5 h-3.5" />
          <span>Tắt Bảo Trì (1-Click)</span>
        </button>
      </div>
    );
  }

  // 2. Soft Warning Maintenance Countdown Banner for regular users
  if (isMaintenanceActive && maintenanceMode === "soft" && !isDismissed) {
    return (
      <div className="w-full bg-amber-950/90 border-b border-amber-600/80 px-4 py-2 text-amber-200 flex items-center justify-between shadow-md z-50 text-xs animate-in slide-in-from-top">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-semibold">
            Hệ thống sắp bảo trì nâng cấp: Vui lòng lưu kết quả và hoàn thành phiên gõ dở dang!
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-amber-400 hover:text-amber-200 p-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // 3. Regular active global announcement banner
  if (banner && !isDismissed) {
    const isCritical = banner.severity === "critical";
    const isWarning = banner.severity === "warning";

    return (
      <div
        className={`w-full border-b px-4 py-2 flex items-center justify-between text-xs shadow-md z-40 animate-in slide-in-from-top ${
          isCritical
            ? "bg-rose-950/90 border-rose-600/60 text-rose-200"
            : isWarning
            ? "bg-amber-950/90 border-amber-600/60 text-amber-200"
            : "bg-indigo-950/90 border-indigo-600/60 text-indigo-200"
        }`}
      >
        <div className="flex items-center gap-2 max-w-5xl">
          {isCritical ? (
            <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          )}
          <span className="font-bold">{banner.title}:</span>
          <span className="opacity-90">{banner.content}</span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};
