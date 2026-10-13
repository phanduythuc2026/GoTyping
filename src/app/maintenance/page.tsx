"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Clock,
  Sparkles,
  BookOpen,
  MessageCircle,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

interface Flashcard {
  word: string;
  phonetics: string;
  pos: string;
  viMeaning: string;
  task2Example: string;
}

const C1_FLASHCARDS: Flashcard[] = [
  {
    word: "Ubiquitous",
    phonetics: "/juːˈbɪk.wɪ.təs/",
    pos: "Adjective (AWL C1)",
    viMeaning: "Có mặt ở khắp mọi nơi, phổ biến rộng rãi",
    task2Example:
      "The ubiquitous presence of smart devices in educational institutions has fundamentally transformed pedagogy.",
  },
  {
    word: "Detrimental",
    phonetics: "/ˌdet.rɪˈmen.təl/",
    pos: "Adjective (AWL C1)",
    viMeaning: "Có hại, gây bất lợi nghiêm trọng",
    task2Example:
      "Excessive reliance on automated artificial intelligence may exert a detrimental impact on students' analytical reasoning.",
  },
  {
    word: "Corroborate",
    phonetics: "/kəˈrɒb.ə.reɪt/",
    pos: "Verb (AWL C1)",
    viMeaning: "Cung cấp bằng chứng chứng thực, củng cố giả thuyết",
    task2Example:
      "A plethora of empirical studies corroborate the contention that bilingualism bolsters cognitive elasticity.",
  },
  {
    word: "Mitigate",
    phonetics: "/ˈmɪt.ɪ.ɡeɪt/",
    pos: "Verb (AWL C1)",
    viMeaning: "Làm dịu bớt, giảm nhẹ mức độ nghiêm trọng",
    task2Example:
      "Governments ought to implement fiscal incentives to mitigate the adverse repercussions of industrial emissions.",
  },
  {
    word: "Exacerbate",
    phonetics: "/ɪɡˈzæs.ə.beɪt/",
    pos: "Verb (AWL C1)",
    viMeaning: "Làm trầm trọng thêm, làm xấu đi tình hình",
    task2Example:
      "Unplanned rapid urbanization serves only to exacerbate traffic congestion and infrastructural strain in metropolitan hubs.",
  },
  {
    word: "Substantiate",
    phonetics: "/səbˈstæn.ʃi.eɪt/",
    pos: "Verb (AWL C1)",
    viMeaning: "Chứng minh có cơ sở xác thực",
    task2Example:
      "Proponents of remote learning frequently fail to substantiate their claims with longitudinal academic evaluations.",
  },
];

export default function MaintenancePage() {
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Hệ thống đang tiến hành nâng cấp engine từ vựng AWL và tối ưu hóa máy chủ bàn phím. Vui lòng quay lại sau ít phút!"
  );
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins default
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/maintenance");
        const data = await res.json();
        if (data.success && data.maintenance?.message) {
          setMaintenanceMessage(data.maintenance.message);
        }
      } catch (e) {
        console.error("Maintenance load error:", e);
      }
    }
    loadConfig();

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const nextFlashcard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % C1_FLASHCARDS.length);
  };

  const activeCard = C1_FLASHCARDS[currentCardIndex];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
      {/* Background decorative glow */}
      <div className="absolute top-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Status Badge */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="tracking-wide uppercase font-mono text-[11px]">
          HỆ THỐNG ĐANG NÂNG CẤP TỪ ĐIỂN &amp; ENGINE
        </span>
      </div>

      {/* Main Title & Message */}
      <div className="w-16 h-16 rounded-2xl bg-surface border border-surface-border flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
        <Wrench className="w-8 h-8 animate-pulse" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground text-center mb-2">
        IELTS Scribe — Tạm Khóa Để Hoàn Thiện
      </h1>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-lg text-center mb-6 leading-relaxed">
        {maintenanceMessage}
      </p>

      {/* Estimated Uptime Countdown Timer */}
      <div className="bg-surface/90 border border-surface-border rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-1.5 shadow-xl max-w-sm w-full mb-8">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Ước tính thời gian mở lại</span>
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tabular-nums tracking-widest">
          {formatCountdown(countdownSeconds)}
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Đồng hồ đếm ngược tự động</span>
      </div>

      {/* Academic Idle Widget: Flashcard */}
      <div className="max-w-lg w-full bg-surface border border-surface-border rounded-2xl p-5 sm:p-6 shadow-2xl relative mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Góc Ôn Luyện Nhẹ Trong Lúc Chờ (Academic Idle)</span>
          </div>
          <button
            onClick={nextFlashcard}
            className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg bg-surface-elevated border border-surface-border transition-colors cursor-pointer"
          >
            <RotateCw className="w-3 h-3" />
            <span>Từ khác</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl font-bold font-mono text-indigo-400">{activeCard.word}</h3>
            <span className="text-xs text-zinc-400 font-mono">{activeCard.phonetics}</span>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
              {activeCard.pos}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-foreground">
            {activeCard.viMeaning}
          </p>

          <div className="mt-2 p-3 rounded-xl bg-surface-elevated border border-surface-border text-xs text-zinc-300 italic leading-relaxed">
            &ldquo;{activeCard.task2Example}&rdquo;
          </div>
        </div>
      </div>

      {/* Community Links & Admin Bypass Link */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        <a
          href="https://zalo.me/g/ielts-scribe-pro"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-zinc-300 hover:text-white transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-sky-400" />
          <span>Tham gia nhóm Zalo Học Thuật</span>
        </a>
        <a
          href="https://discord.gg/ielts-scribe"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-zinc-300 hover:text-white transition-colors"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Discord Thông Báo Server</span>
        </a>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-emerald-400 hover:text-emerald-300 transition-colors"
          title="Super Admin Bypass"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bypass Admin</span>
        </Link>
      </div>
    </div>
  );
}
