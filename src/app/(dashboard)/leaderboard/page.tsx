"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { GuestAmbientBanner } from "@/components/layout/guest-ambient-banner";
import { useAuthStore } from "@/lib/auth-store";
import { LeaderboardScholar } from "@/app/api/leaderboard/route";
import {
  Trophy,
  Medal,
  Crown,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Loader2,
  RotateCcw,
} from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardScholar[]>([]);
  const [cohortWeek, setCohortWeek] = useState("Tuần 41 / 2026");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/leaderboard?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        if (data.cohort_week) setCohortWeek(data.cohort_week);
        if (isManual) {
          setRefreshMessage("Đã cập nhật!");
          setTimeout(() => setRefreshMessage(null), 2500);
        }
      }
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(false);
  }, [fetchLeaderboard]);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const remaining = leaderboard.slice(3);

  // Check if current user is logged in
  const currentUserRank = user
    ? leaderboard.find(
        (s) => s.id === user.id || s.email.toLowerCase() === user.email.toLowerCase()
      )
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 pb-28">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                {cohortWeek}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Chốt bảng: Chủ Nhật 23:59
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight font-sans">
              Bảng Xếp Hạng Nhóm Học Thuật Hàng Tuần
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Vinh danh Top 10 học viên tích lũy số từ học thuật cao nhất, tốc độ Net WPM và phản xạ cơ bắp chuẩn xác.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => fetchLeaderboard(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Tải lại dữ liệu mới nhất từ hệ thống"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-500" : ""}`} />
              <span>{refreshMessage || (isRefreshing ? "Đang đồng bộ..." : "Làm mới dữ liệu")}</span>
            </button>

            <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 flex items-center gap-2.5 text-xs shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Thời gian còn lại</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-300">3 ngày 10 giờ</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full h-72 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
            <span className="text-xs font-mono">Đang tải bảng xếp hạng nhóm học thuật...</span>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
              {/* Rank 2 (Silver) */}
              {top2 && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-slate-100 via-white to-white dark:from-slate-900/80 dark:to-zinc-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl p-5 shadow-lg dark:shadow-xl flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform">
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-300 text-zinc-950 font-black text-xs flex items-center gap-1 shadow-md">
                    <Medal className="w-3.5 h-3.5" />
                    <span>HẠNG 2</span>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-slate-800 dark:text-slate-200 font-extrabold text-xl mb-3 shadow-inner">
                    {top2.display_name.slice(0, 2).toUpperCase()}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 font-sans line-clamp-1">
                    {top2.display_name}
                  </h3>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono mb-3">
                    Target Band {top2.target_band.toFixed(1)}
                  </span>

                  <div className="w-full grid grid-cols-3 gap-2 bg-slate-100/90 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">Từ tuần</span>
                      <span className="font-mono font-extrabold text-slate-900 dark:text-zinc-200">
                        {top2.weekly_words}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">Net WPM</span>
                      <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                        {top2.avg_net_wpm}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">Accuracy</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {top2.avg_accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold - Crown) */}
              {top1 && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 via-white to-white dark:from-amber-950/40 dark:via-zinc-900 dark:to-zinc-900 border-2 border-amber-400/80 rounded-2xl p-6 shadow-xl dark:shadow-2xl flex flex-col items-center text-center relative hover:scale-[1.03] transition-transform md:-translate-y-2">
                  <div className="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                    <Crown className="w-4 h-4 fill-zinc-950" />
                    <span>QUÁN QUÂN TUẦN</span>
                  </div>

                  <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-700 dark:text-amber-300 font-black text-2xl mb-3 shadow-lg shadow-amber-500/20">
                    {top1.display_name.slice(0, 2).toUpperCase()}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 font-sans line-clamp-1">
                    {top1.display_name}
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold mb-4">
                    Target Band {top1.target_band.toFixed(1)} • {top1.sessions_completed} bài gõ
                  </span>

                  <div className="w-full grid grid-cols-3 gap-2 bg-amber-50/70 dark:bg-zinc-950/80 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Từ tuần</span>
                      <span className="font-mono font-black text-amber-700 dark:text-amber-300 text-sm">
                        {top1.weekly_words}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Net WPM</span>
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {top1.avg_net_wpm}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Accuracy</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {top1.avg_accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3 && (
                <div className="order-3 bg-gradient-to-b from-amber-50/60 via-white to-white dark:from-amber-950/20 dark:to-zinc-900/90 border border-amber-300 dark:border-amber-800/60 rounded-2xl p-5 shadow-lg dark:shadow-xl flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform">
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-700 text-white font-black text-xs flex items-center gap-1 shadow-md">
                    <Medal className="w-3.5 h-3.5" />
                    <span>HẠNG 3</span>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-600 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-400 font-extrabold text-xl mb-3 shadow-inner">
                    {top3.display_name.slice(0, 2).toUpperCase()}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 font-sans line-clamp-1">
                    {top3.display_name}
                  </h3>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono mb-3">
                    Target Band {top3.target_band.toFixed(1)}
                  </span>

                  <div className="w-full grid grid-cols-3 gap-2 bg-slate-100/90 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">Từ tuần</span>
                      <span className="font-mono font-extrabold text-slate-900 dark:text-zinc-200">
                        {top3.weekly_words}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">Net WPM</span>
                      <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                        {top3.avg_net_wpm}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">Accuracy</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {top3.avg_accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rank 4 - 10 Table */}
            <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl overflow-hidden shadow-lg dark:shadow-xl mt-2">
              <div className="p-4 border-b border-slate-200 dark:border-surface-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  Top 4 – 10 Học Viên Xuất Sắc
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
                  Chỉ tính điểm tài khoản đã đăng nhập
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-semibold">
                      <th className="py-3 px-4">Thứ Hạng</th>
                      <th className="py-3 px-4">Học Viên</th>
                      <th className="py-3 px-4">Target Band</th>
                      <th className="py-3 px-4">Từ Đã Gõ (Tuần)</th>
                      <th className="py-3 px-4">Tốc Độ Net WPM</th>
                      <th className="py-3 px-4">Độ Chính Xác</th>
                      <th className="py-3 px-4 text-right">Từ Vựng Đã Lưu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60 font-mono">
                    {remaining.map((scholar) => {
                      const isCurrentUserRow =
                        user &&
                        (scholar.id === user.id ||
                          scholar.email.toLowerCase() === user.email.toLowerCase());

                      return (
                        <tr
                          key={scholar.id}
                          className={`transition-colors ${
                            isCurrentUserRow
                              ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-bold border-l-4 border-indigo-500"
                              : "hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-slate-800 dark:text-zinc-300"
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-600 dark:text-zinc-400">
                            #{scholar.rank}
                          </td>
                          <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-zinc-200">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center text-xs font-bold font-mono">
                                {scholar.display_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                  {scholar.display_name}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                                  {scholar.email.split("@")[0]}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-amber-600 dark:text-amber-300 font-bold">
                            Band {scholar.target_band.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">
                            {scholar.weekly_words.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-bold">
                            {scholar.avg_net_wpm} WPM
                          </td>
                          <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                            {scholar.avg_accuracy}%
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-400">
                            {scholar.weekly_saved_vocab} từ
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Floating Bottom Card: User Rank or Guest Call-to-action */}
      <aside className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-surface/95 backdrop-blur-md border-t border-slate-300 dark:border-surface-border p-4 z-30 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {user ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                {currentUserRank ? `#${currentUserRank.rank}` : "Top 15"}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                  Vị trí tuần của bạn: {user.display_name || user.username}
                </span>
                <span className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  {currentUserRank
                    ? `Đang xếp hạng #${currentUserRank.rank} với ${currentUserRank.weekly_words} từ đã gõ. Tiếp tục luyện gõ để bứt phá vào Top 3!`
                    : "Bạn đã hoàn thành các phiên gõ trong tuần. Kết quả đang được tính dồn vào bảng xếp hạng!"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-amber-700 dark:text-amber-300 text-sm">
                  Bạn đang ở chế độ Khách (Guest Mode)
                </span>
                <span className="text-slate-600 dark:text-zinc-400 text-[11px]">
                  Chỉ những tài khoản đã đăng nhập mới được tích lũy điểm và vinh danh trên Bảng Xếp Hạng tuần.
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            {user ? (
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Luyện Gõ Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30"
              >
                <UserCheck className="w-4 h-4" />
                <span>Đăng Nhập Ghi Danh</span>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Guest Ambient Banner */}
      <GuestAmbientBanner />
    </div>
  );
}
