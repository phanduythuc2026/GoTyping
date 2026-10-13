"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/lib/auth-store";
import {
  Zap,
  Award,
  BookOpen,
  Target,
  AlertTriangle,
  TrendingUp,
  History,
  Lock,
  LogIn,
  UserPlus,
  ArrowRight,
  Keyboard,
  ShieldCheck,
} from "lucide-react";

interface UserSessionItem {
  id: string;
  title: string;
  domain: string;
  wpm: number;
  netWpm: number;
  accuracy: number;
  words: number;
  timeSpentSeconds?: number;
  date: string;
  keyErrorsSummary?: Record<string, number>;
}

export default function AnalyticsPage() {
  const { user, isLoading, initAuth } = useAuthStore();
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Load account-isolated sessions whenever user changes
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }

    const loadUserAnalytics = async () => {
      let loadedSessions: UserSessionItem[] = [];

      // 1. Read from account-scoped localStorage
      if (typeof window !== "undefined") {
        try {
          const userKey = `gotyping_sessions_${user.id}`;
          const localRaw = localStorage.getItem(userKey);
          if (localRaw) {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed)) {
              loadedSessions = parsed;
            }
          }
        } catch (e) {
          console.error("Error reading local user sessions:", e);
        }
      }

      // 2. Fetch server records for this user
      try {
        const res = await fetch(`/api/typing/session?userId=${user.id}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const serverMapped: UserSessionItem[] = data.sessions.map((s: Record<string, unknown>) => ({
            id: (s.id as string) || `sess-${Date.now()}`,
            title: (s.title as string) || "IELTS Academic Practice",
            domain: (s.domain as string) || "academic.edu",
            wpm: Number(s.wpm || s.net_wpm || 0),
            netWpm: Number(s.net_wpm || 0),
            accuracy: Number(s.accuracy || 0),
            words: Number(s.completed_words || s.words || 0),
            date: s.created_at ? new Date(s.created_at as string).toLocaleString("vi-VN") : "Gần đây",
            keyErrorsSummary: (s.key_errors_summary as Record<string, number>) || {},
          }));

          // Merge by unique id
          const existingIds = new Set(loadedSessions.map((x) => x.id));
          for (const s of serverMapped) {
            if (!existingIds.has(s.id)) {
              loadedSessions.push(s);
            }
          }
        }
      } catch (e) {
        console.warn("Could not fetch server sessions for user:", e);
      }

      setSessions(loadedSessions);
    };

    loadUserAnalytics();
  }, [user]);

  // Aggregate user statistics
  const bestNetWpm = sessions.length > 0 ? Math.max(...sessions.map((s) => s.netWpm)) : 0;
  const avgAccuracy =
    sessions.length > 0
      ? (sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length).toFixed(1)
      : "---";
  const totalWords = sessions.reduce((acc, s) => acc + (s.words || 0), 0);
  const targetBand = user?.target_band ?? 7.5;

  // Aggregate weak keys for this user
  const aggregatedErrors: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.keyErrorsSummary) {
      Object.entries(s.keyErrorsSummary).forEach(([key, count]) => {
        aggregatedErrors[key] = (aggregatedErrors[key] || 0) + count;
      });
    }
  });

  const sortedWeakKeys = Object.entries(aggregatedErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, count]) => ({
      key,
      count,
      label: `Lỗi nhận diện / gõ nhầm ký tự ${key}`,
    }));

  const defaultWeakKeys = [
    { key: "th -> ht", count: 8, label: "Đảo vị trí âm th trong từ học thuật" },
    { key: "tion -> toin", count: 6, label: "Hậu tố danh từ -tion" },
    { key: "ence -> ance", count: 4, label: "Nhầm lẫn hậu tố -ence/-ance" },
    { key: "ie -> ei", count: 3, label: "Quy tắc chính tả i trước e" },
  ];

  const displayedWeakKeys = sortedWeakKeys.length > 0 ? sortedWeakKeys : defaultWeakKeys;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Header Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
              IELTS Writing Reflex Tracking
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            Bảng Phân Tích Tiến Trình Luyện Gõ
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Theo dõi sự gia tăng phản xạ cơ bắp, độ chính xác từ vựng học thuật và điểm yếu gõ phím.
          </p>
        </div>

        {/* 1. GIAO DIỆN KHI CHƯA ĐĂNG NHẬP */}
        {!user && !isLoading ? (
          <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl p-8 sm:p-12 shadow-xl flex flex-col items-center text-center gap-6 my-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
                Yêu Cầu Đăng Nhập Để Xem Phân Tích
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Tính năng phân tích học thuật, đo lường Net WPM, phát hiện điểm yếu gõ phím và lưu lịch sử bài làm được cá nhân hóa riêng biệt theo từng tài khoản học viên.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left my-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex flex-col gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Bảo mật riêng tư</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Dữ liệu bài tập được cô lập hoàn toàn cho tài khoản của bạn.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex flex-col gap-1.5">
                <Target className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Chuẩn Target Band</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Tự do điều chỉnh mục tiêu 5.0 - 9.0 để đối soát chỉ số.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex flex-col gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Lịch sử tiến bộ</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Ghi nhận từng bước nhảy vọt về tốc độ phản xạ cơ bắp.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Tài Khoản</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold border border-slate-300 dark:border-zinc-700 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng Ký Tài Khoản Mới</span>
              </Link>
            </div>
          </div>
        ) : (
          /* 2. GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP */
          <>
            {/* User Account Scope Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-xl px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600 dark:text-zinc-400">Dữ liệu thuộc tài khoản:</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {user?.display_name || user?.username} ({user?.email})
                </span>
              </div>
              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/80">
                {sessions.length} bài gõ đã lưu
              </span>
            </div>

            {/* High-Level Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl p-5 flex flex-col justify-between shadow-md dark:shadow-lg">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Tốc Độ Tốt Nhất</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                    {bestNetWpm}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 ml-1.5 font-mono">Net WPM</span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Kỷ lục cá nhân cao nhất</span>
                </div>
              </div>

              <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl p-5 flex flex-col justify-between shadow-md dark:shadow-lg">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Độ Chính Xác TB</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                    {avgAccuracy !== "---" ? `${avgAccuracy}%` : "Chưa có"}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                  {avgAccuracy !== "---"
                    ? "Ngưỡng phản xạ cơ bắp hiện tại"
                    : "Làm bài gõ đầu tiên để ghi nhận"}
                </div>
              </div>

              <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl p-5 flex flex-col justify-between shadow-md dark:shadow-lg">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Tổng Từ Đã Gõ</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                    {totalWords.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 ml-1.5 font-mono">từ</span>
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                  Tích lũy từ {sessions.length} phiên luyện tập
                </div>
              </div>

              <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl p-5 flex flex-col justify-between shadow-md dark:shadow-lg">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Mục Tiêu IELTS</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-4xl font-extrabold text-purple-600 dark:text-purple-300 font-mono tracking-tight">
                    Band {targetBand.toFixed(1)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                  Tùy chỉnh tự do tại Header hoặc Luyện Gõ
                </div>
              </div>
            </div>

            {/* Weakness Radar & Analysis */}
            <section className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl p-6 shadow-md dark:shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-sans">
                  Phân Tích Điểm Yếu Gõ Phím (Weakness Radar)
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Hệ thống phát hiện các tổ hợp ký tự bạn hay bị khựng lại hoặc gõ sai nhiều nhất trong các phiên luyện tập của tài khoản này:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
                {displayedWeakKeys.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/40">
                        {item.key}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{item.count} lỗi</span>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-zinc-400 mt-2 font-sans">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Session History Table */}
            <section className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl p-6 shadow-md dark:shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-sans">
                    Lịch Sử Các Phiên Gõ Của Tài Khoản
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  {sessions.length} bản ghi
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center gap-3 text-slate-500 dark:text-zinc-400">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                    <Keyboard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                      Chưa có lịch sử làm bài cho tài khoản này
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Hãy hoàn thành bài gõ đầu tiên tại phòng Luyện Gõ để ghi nhận dữ liệu tiến trình học thuật!
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <span>Luyện Gõ Ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-sans">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Bài báo / Chủ đề</th>
                        <th className="py-3 px-4">Nguồn</th>
                        <th className="py-3 px-4 font-mono">Net WPM</th>
                        <th className="py-3 px-4 font-mono">Độ chính xác</th>
                        <th className="py-3 px-4 font-mono">Số từ</th>
                        <th className="py-3 px-4">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
                      {sessions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-850/50 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-zinc-100 max-w-xs truncate">
                            {s.title}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-500 dark:text-zinc-400">
                            {s.domain}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {s.netWpm}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {s.accuracy}%
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-300">
                            {s.words}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                            {s.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
