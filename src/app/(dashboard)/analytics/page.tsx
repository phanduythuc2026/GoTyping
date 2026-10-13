"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { GuestAmbientBanner } from "@/components/layout/guest-ambient-banner";
import { Zap, Award, BookOpen, Target, AlertTriangle, TrendingUp, History } from "lucide-react";

export default function AnalyticsPage() {
  // Mock historical session records
  const [sessions] = useState([
    {
      id: "1",
      title: "The Guardian: The Global Shift to Renewable Energy",
      domain: "theguardian.com",
      wpm: 78,
      netWpm: 76,
      accuracy: 98.2,
      words: 165,
      date: "12/10/2026 21:30",
    },
    {
      id: "2",
      title: "The Economist: Artificial Intelligence and Higher Education",
      domain: "economist.com",
      wpm: 74,
      netWpm: 71,
      accuracy: 96.5,
      words: 182,
      date: "12/10/2026 20:15",
    },
    {
      id: "3",
      title: "BBC Academic: Urbanization and Sustainable Infrastructure",
      domain: "bbc.com",
      wpm: 81,
      netWpm: 79,
      accuracy: 99.0,
      words: 154,
      date: "12/10/2026 19:40",
    },
  ]);

  const topWeakKeys = [
    { key: "th -> ht", count: 12, label: "Đảo vị trí âm th" },
    { key: "tion -> toin", count: 9, label: "Hậu tố danh từ -tion" },
    { key: "ence -> ance", count: 7, label: "Nhầm lẫn hậu tố -ence/-ance" },
    { key: "ie -> ei", count: 5, label: "Quy tắc chính tả i trước e" },
  ];

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Header Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              IELTS Writing Reflex Tracking
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
            Bảng Phân Tích Tiến Trình Luyện Gõ
          </h1>
          <p className="text-sm text-zinc-400">
            Theo dõi sự gia tăng phản xạ cơ bắp, độ chính xác từ vựng học thuật và điểm yếu gõ phím.
          </p>
        </div>

        {/* High-Level Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-surface-border rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Tốc Độ Tốt Nhất</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-indigo-400 font-mono tracking-tight">
                79
              </span>
              <span className="text-xs text-zinc-400 ml-1.5 font-mono">Net WPM</span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+6 WPM so với tuần trước</span>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Độ Chính Xác TB</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
                97.9%
              </span>
            </div>
            <div className="mt-3 text-xs text-zinc-400">
              Đạt ngưỡng chuẩn phản xạ IELTS Writing
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng Từ Đã Gõ</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-amber-400 font-mono tracking-tight">
                5,420
              </span>
              <span className="text-xs text-zinc-400 ml-1.5 font-mono">từ</span>
            </div>
            <div className="mt-3 text-xs text-zinc-400">
              Gồm 680 lượt từ vựng AWL Sublist 1-10
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Mục Tiêu IELTS</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-purple-300 font-mono tracking-tight">
                Band 7.5
              </span>
            </div>
            <div className="mt-3 text-xs text-zinc-400">
              Dự kiến cần thêm ~15 phiên luyện
            </div>
          </div>
        </div>

        {/* Weakness Radar & Analysis */}
        <section className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-zinc-100 font-sans">
              Phân Tích Điểm Yếu Gõ Phím (Weakness Radar)
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Hệ thống phát hiện các tổ hợp ký tự bạn hay bị khựng lại hoặc gõ sai nhiều nhất trong các phiên luyện tập gần đây:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
            {topWeakKeys.map((item, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                    {item.key}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">{item.count} lỗi</span>
                </div>
                <span className="text-xs text-zinc-400 mt-2 font-sans">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Session History Table */}
        <section className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-100 font-sans">
              Lịch Sử Các Phiên Gõ Gần Đây
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Bài báo / Chủ đề</th>
                  <th className="py-3 px-4">Nguồn</th>
                  <th className="py-3 px-4 font-mono">Net WPM</th>
                  <th className="py-3 px-4 font-mono">Độ chính xác</th>
                  <th className="py-3 px-4 font-mono">Số từ</th>
                  <th className="py-3 px-4">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-zinc-100 max-w-xs truncate">
                      {s.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-zinc-400">
                      {s.domain}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {s.netWpm}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                      {s.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {s.words}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-400 font-mono">
                      {s.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <GuestAmbientBanner />
    </div>
  );
}
