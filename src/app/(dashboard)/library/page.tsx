"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Sparkles, Globe, ArrowRight } from "lucide-react";

export default function LibraryPage() {
  const articles = [
    {
      id: "renewable-energy",
      title: "The Global Shift to Renewable Energy and Sustainable Development",
      domain: "theguardian.com",
      lexicalLevel: "Academic",
      wordCount: 185,
      awlCount: 24,
      category: "Môi Trường & Năng Lượng",
      description: "Bài báo phân tích các chính sách thúc đẩy năng lượng tái tạo, giảm phát thải khí nhà kính và cơ hội kinh tế xanh.",
    },
    {
      id: "ai-education",
      title: "Artificial Intelligence and the Future of Higher Education",
      domain: "economist.com",
      lexicalLevel: "Academic",
      wordCount: 194,
      awlCount: 28,
      category: "Công Nghệ & Giáo Dục",
      description: "Thách thức về tính liêm chính học thuật và cơ hội hợp tác người - máy trong các trường đại học toàn cầu.",
    },
    {
      id: "urbanization-infrastructure",
      title: "Urbanization, Housing Shortages, and Transit-Oriented Infrastructure",
      domain: "bbc.com",
      lexicalLevel: "C1",
      wordCount: 172,
      awlCount: 22,
      category: "Đô Thị & Xã Hội",
      description: "Tác động nhân khẩu học của làn sóng đô thị hóa nhanh và giải pháp phát triển không gian xanh.",
    },
    {
      id: "biodiversity-loss",
      title: "Biodiversity Conservation and Ecosystem Resilience in the 21st Century",
      domain: "nature.com",
      lexicalLevel: "C2",
      wordCount: 210,
      awlCount: 31,
      category: "Khoa Học & Sinh Thái",
      description: "Nghiên cứu về sự suy giảm đa dạng sinh học và các biện pháp bảo tồn hệ sinh thái tự nhiên.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 w-fit">
            Academic Articles Repository
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
            Thư Viện Bài Báo Học Thuật Tuyển Chọn
          </h1>
          <p className="text-sm text-zinc-400">
            Các bài báo chuẩn văn phong báo chí quốc tế, giàu cụm collocations và từ vựng AWL Sublist 1–10.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-surface border border-surface-border hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-md"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {art.domain}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3" />
                    {art.lexicalLevel}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {art.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>{art.wordCount} từ</span>
                  <span>•</span>
                  <span className="text-amber-400">{art.awlCount} từ AWL</span>
                </div>

                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all"
                >
                  <span>Luyện bài này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
