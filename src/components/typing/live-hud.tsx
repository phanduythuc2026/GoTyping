"use client";

import React, { useEffect } from "react";
import { useTypingStore } from "@/modules/typing-engine/store";
import { useAuthStore } from "@/lib/auth-store";
import { evaluateTypingAgainstBand } from "@/modules/typing-engine/benchmark-evaluator";
import { RotateCcw, ShieldCheck, ShieldAlert, Zap, Timer, Award, Target } from "lucide-react";

export const LiveHUD: React.FC = () => {
  const {
    status,
    metrics,
    resetSession,
    tickTimer,
    imeSafeMode,
    toggleImeSafeMode,
    pressureMode,
    setPressureMode,
    timeRemaining,
    isPressureWarning,
  } = useTypingStore();
  const { user, guestTargetBand } = useAuthStore();
  const targetBand = user?.target_band ?? guestTargetBand ?? 7.5;

  // Run 1-second interval timer when typing session is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (status === "running") {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, tickTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent =
    metrics.totalWords > 0
      ? Math.min(100, Math.round((metrics.completedWords / metrics.totalWords) * 100))
      : 0;

  const bandEval = evaluateTypingAgainstBand({
    netWpm: metrics.netWpm,
    accuracy: metrics.accuracy,
    targetBand,
    totalWords: metrics.totalWords,
  });

  return (
    <div className="w-full bg-white/95 dark:bg-surface/80 backdrop-blur-md border border-slate-300 dark:border-surface-border rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-md dark:shadow-xl flex flex-wrap items-center justify-between gap-3 sm:gap-4 transition-all">
      {/* Mobile Compact Bar (< sm) */}
      <div className="flex sm:hidden items-center justify-between w-full py-1 border-b border-slate-200 dark:border-surface-border font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-surface-elevated border border-slate-200 dark:border-surface-border text-indigo-600 dark:text-indigo-400">
          <Zap className="w-3 h-3" />
          <span className="tabular-nums">{metrics.netWpm} WPM</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-surface-elevated border border-slate-200 dark:border-surface-border text-emerald-600 dark:text-emerald-400">
          <Award className="w-3 h-3" />
          <span className="tabular-nums">{metrics.accuracy.toFixed(1)}% ACC</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-surface-elevated border border-slate-200 dark:border-surface-border text-slate-800 dark:text-zinc-200">
          <Timer className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
          <span className="tabular-nums">
            {pressureMode !== "free" && timeRemaining !== null
              ? formatTime(timeRemaining)
              : formatTime(metrics.elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* Metrics Row (Desktop / Tablet >= sm) */}
      <div className="hidden sm:flex items-center gap-6 sm:gap-8 flex-wrap">
        {/* Net WPM */}
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Net WPM
          </span>
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight tabular-nums">
            {metrics.netWpm}
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            Accuracy
          </span>
          <span
            className={`text-3xl font-extrabold font-mono tracking-tight tabular-nums ${
              metrics.accuracy >= 95
                ? "text-emerald-600 dark:text-emerald-400"
                : metrics.accuracy >= 85
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {metrics.accuracy.toFixed(1)}%
          </span>
        </div>

        {/* Timer / Pressure Countdown */}
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Timer className={`w-3.5 h-3.5 ${isPressureWarning ? "text-rose-500 animate-pulse" : "text-slate-500 dark:text-zinc-400"}`} />
            {pressureMode === "free" ? "Thời gian" : "Thời gian còn lại"}
          </span>
          <span
            className={`text-3xl font-extrabold font-mono tracking-tight tabular-nums ${
              isPressureWarning
                ? "text-rose-600 dark:text-rose-400 animate-pulse"
                : pressureMode !== "free"
                ? "text-amber-600 dark:text-amber-300"
                : "text-slate-800 dark:text-zinc-200"
            }`}
          >
            {pressureMode !== "free" && timeRemaining !== null
              ? formatTime(timeRemaining)
              : formatTime(metrics.elapsedSeconds)}
          </span>
        </div>

        {/* Target Band Benchmark Evaluator Badge */}
        <div className="hidden lg:flex flex-col justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1">
            <Target className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            Đối Soát Band {targetBand.toFixed(1)}
          </span>
          <div
            className={`mt-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${bandEval.badgeColorClass}`}
            title={bandEval.feedback}
          >
            {bandEval.badgeText}
          </div>
        </div>
      </div>

      {/* Progress & Quick Actions */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {/* Task Pressure Mode Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-900/90 border border-slate-300 dark:border-zinc-800 rounded-lg p-0.5 text-[11px] font-medium">
          <button
            onClick={() => setPressureMode("free")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              pressureMode === "free"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            Tự do
          </button>
          <button
            onClick={() => setPressureMode("task1_sprint")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              pressureMode === "task1_sprint"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
            title="Mô phỏng áp lực thời gian Task 1: 5 phút"
          >
            Task 1 (5p)
          </button>
          <button
            onClick={() => setPressureMode("task2_paragraph")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              pressureMode === "task2_paragraph"
                ? "bg-amber-600 text-white font-bold shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
            title="Mô phỏng áp lực thời gian Task 2: 10 phút"
          >
            Task 2 (10p)
          </button>
        </div>

        {/* Progress Pill */}
        <div className="hidden md:flex flex-col items-end gap-1.5 min-w-[120px]">
          <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
            {metrics.completedWords} / {metrics.totalWords} ({progressPercent}%)
          </span>
          <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* IME Protection Toggle */}
        <button
          onClick={toggleImeSafeMode}
          title={
            imeSafeMode
              ? "Chế độ chặn lỗi gõ Telex/VNI: ĐANG BẬT"
              : "Chế độ chặn lỗi gõ Telex/VNI: ĐANG TẮT"
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            imeSafeMode
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              : "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
          }`}
        >
          {imeSafeMode ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>IME Safe</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
              <span>Raw Key</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={resetSession}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors shadow-xs cursor-pointer"
          title="Khởi động lại bài gõ (hoặc ấn Tab + Enter)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
