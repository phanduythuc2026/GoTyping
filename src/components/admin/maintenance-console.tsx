"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  AlertTriangle,
  Clock,
  ShieldAlert,
  PowerOff,
  CheckCircle,
  FileText,
  AlertOctagon,
  X,
} from "lucide-react";

interface MaintenanceConfig {
  isActive: boolean;
  mode: "hard" | "soft";
  reason: string;
  message: string;
  estimatedUptime: string | null;
  notifyBanner: boolean;
}

export const MaintenanceConsole: React.FC = () => {
  const [config, setConfig] = useState<MaintenanceConfig>({
    isActive: false,
    mode: "hard",
    reason: "Nâng cấp engine từ vựng AWL & Database",
    message: "Hệ thống đang tiến hành nâng cấp thuật toán bàn phím. Vui lòng quay lại sau ít phút!",
    estimatedUptime: "30 phút",
    notifyBanner: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Safety Confirmation Modal state
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [safetyConfirmationInput, setSafetyConfirmationInput] = useState("");

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const res = await fetch("/api/admin/maintenance");
      const data = await res.json();
      if (data.success && data.maintenance) {
        setConfig(data.maintenance);
      }
    } catch (e) {
      console.error("Fetch maintenance error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleClick = () => {
    // If turning ON in hard mode, open safety modal
    if (!config.isActive && config.mode === "hard") {
      setSafetyConfirmationInput("");
      setIsSafetyModalOpen(true);
      return;
    }

    // Otherwise toggle directly
    executeToggle(!config.isActive);
  };

  const executeToggle = async (targetActive: boolean, safetyText?: string) => {
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: targetActive,
          mode: config.mode,
          reason: config.reason,
          message: config.message,
          estimatedUptime: config.estimatedUptime,
          notifyBanner: config.notifyBanner,
          safetyConfirmText: safetyText,
        }),
      });

      const data = await res.json();
      if (data.success && data.maintenance) {
        setConfig(data.maintenance);
        setSuccessMsg(data.message);
        setIsSafetyModalOpen(false);
      } else {
        setErrorMsg(data.error || "Không thể cập nhật bảo trì.");
      }
    } catch (e) {
      setErrorMsg("Lỗi kết nối máy chủ khi cập nhật bảo trì.");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConfigOnly = async () => {
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          safetyConfirmText: config.isActive && config.mode === "hard" ? "LOCKDOWN" : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.maintenance) {
        setConfig(data.maintenance);
        setSuccessMsg("Đã lưu các thông số bảo trì thành công.");
      } else {
        setErrorMsg(data.error || "Lỗi khi lưu thông số.");
      }
    } catch (e) {
      setErrorMsg("Lỗi máy chủ.");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-xs">
        Đang tải thông số bảo trì...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-rose-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Master Toggle Banner */}
      <div
        className={`rounded-2xl p-6 border transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          config.isActive
            ? "bg-rose-950/30 border-rose-600/60 shadow-[0_0_25px_rgba(244,63,94,0.15)]"
            : "bg-surface border-surface-border"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              config.isActive
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-surface-elevated text-zinc-400 border border-surface-border"
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                Master Switch: Chế Độ Bảo Trì Hệ Thống
              </h3>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  config.isActive
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {config.isActive ? "ĐANG BẬT (" + config.mode.toUpperCase() + ")" : "ĐANG TẮT"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Khi bật ở chế độ Khóa toàn diện (Hard Lockdown), toàn bộ học viên sẽ được chuyển hướng tự động sang trang `/maintenance`. Super Admin có đặc quyền Bypass để kiểm thử.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleClick}
          disabled={isSaving}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg flex-shrink-0 ${
            config.isActive
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 hover:scale-105"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-500"
          }`}
        >
          <PowerOff className="w-4 h-4" />
          <span>{config.isActive ? "TẮT BẢO TRÌ NGAY" : "KÍCH HOẠT BẢO TRÌ"}</span>
        </button>
      </div>

      {/* Maintenance Settings Card */}
      <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Wrench className="w-4 h-4 text-indigo-400" />
          <span>Cấu Hình Chi Tiết Thông Số Bảo Trì</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance Mode Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-zinc-300">Cấp độ bảo trì:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: "soft" })}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  config.mode === "soft"
                    ? "bg-amber-950/40 border-amber-500/60 text-amber-300"
                    : "bg-surface-elevated border-surface-border text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Cấp 1: Cảnh báo mềm</span>
                </div>
                <span className="text-[11px] opacity-80">
                  Chỉ hiện banner đếm ngược trên Header, không khóa trang.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: "hard" })}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  config.mode === "hard"
                    ? "bg-rose-950/40 border-rose-500/60 text-rose-300"
                    : "bg-surface-elevated border-surface-border text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Cấp 2: Khóa toàn diện</span>
                </div>
                <span className="text-[11px] opacity-80">
                  Chặn 100% người dùng, chuyển hướng về /maintenance.
                </span>
              </button>
            </div>
          </div>

          {/* Estimated Uptime Quick Pick */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ước tính thời gian mở lại (Estimated Uptime):</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["15 phút", "30 phút", "1 giờ", "2 giờ"].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setConfig({ ...config, estimatedUptime: time })}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    config.estimatedUptime === time
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : "bg-surface-elevated border-surface-border text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={config.estimatedUptime || ""}
              onChange={(e) => setConfig({ ...config, estimatedUptime: e.target.value })}
              placeholder="Hoặc nhập thời gian tự do (ví dụ: 23:00 tối nay)..."
              className="mt-1 px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Lý do bảo trì:</label>
            <input
              type="text"
              value={config.reason}
              onChange={(e) => setConfig({ ...config, reason: e.target.value })}
              placeholder="VD: Nâng cấp thuật toán bàn phím & Tối ưu hóa Database..."
              className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notification Banner Switch */}
          <div className="flex items-center justify-between p-3.5 bg-surface-elevated border border-surface-border rounded-xl">
            <div>
              <span className="text-xs font-bold text-zinc-200">Hiển thị Banner Thông Báo</span>
              <p className="text-[11px] text-zinc-400">Ghim cảnh báo cố định trên Header cho người dùng</p>
            </div>
            <input
              type="checkbox"
              checked={config.notifyBanner}
              onChange={(e) => setConfig({ ...config, notifyBanner: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Custom Message for Students */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Thông điệp hiển thị cho học viên trên trang `/maintenance`:</span>
          </label>
          <textarea
            rows={3}
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
            placeholder="Soạn nội dung nhắn nhủ học viên..."
            className="px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveConfigOnly}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Lưu Thay Đổi Cấu Hình</span>
          </button>
        </div>
      </div>

      {/* Safety Confirmation Modal (Typing LOCKDOWN) */}
      {isSafetyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-rose-600/60 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 border-b border-surface-border pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Xác Nhận Khóa Hệ Thống</h3>
                <p className="text-[11px] text-zinc-400">Hard Lockdown Confirmation</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Bạn đang chuẩn bị kích hoạt chế độ <strong className="text-rose-400">KHÓA TOÀN DIỆN</strong>. Mọi người dùng đang gõ bài sẽ bị ngắt kết nối và chuyển về trang bảo trì.
            </p>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-elevated border border-surface-border text-xs">
              <span className="text-zinc-400">
                Để xác nhận, vui lòng gõ chính xác từ khóa <strong className="text-rose-400 font-mono">LOCKDOWN</strong> vào ô dưới đây:
              </span>
              <input
                type="text"
                value={safetyConfirmationInput}
                onChange={(e) => setSafetyConfirmationInput(e.target.value.toUpperCase())}
                placeholder="Gõ LOCKDOWN..."
                autoFocus
                className="mt-1 px-3 py-2 bg-surface border border-rose-500/60 rounded-xl text-center font-mono font-bold tracking-widest text-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setIsSafetyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={safetyConfirmationInput !== "LOCKDOWN" || isSaving}
                onClick={() => executeToggle(true, safetyConfirmationInput)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
              >
                Xác Nhận Khóa Máy Chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
