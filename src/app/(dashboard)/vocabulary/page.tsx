"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useVocabularyStore } from "@/lib/vocabulary-store";
import { VocabItemType, VocabTopic } from "@/modules/lexical-analyzer/auto-enricher";
import {
  Download,
  Volume2,
  Trash2,
  LayoutGrid,
  List,
  Star,
  BookOpen,
  Filter,
} from "lucide-react";

export default function VocabularyPage() {
  const { entries, initStore, updateMastery, removeTerm, exportToAnkiTSV } = useVocabularyStore();

  const [activeTab, setActiveTab] = useState<"all" | VocabItemType>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedMastery, setSelectedMastery] = useState<number | "all">("all");
  const [viewMode, setViewMode] = useState<"table" | "flashcard">("table");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    initStore();
  }, [initStore]);

  const speak = (term: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(term);
      u.lang = "en-GB";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter entries
  const filteredEntries = entries.filter((item) => {
    if (activeTab !== "all" && item.item_type !== activeTab) return false;
    if (selectedTopic !== "all" && item.topic !== selectedTopic) return false;
    if (selectedMastery !== "all" && item.mastery_level !== selectedMastery) return false;
    return true;
  });

  const topicsList: VocabTopic[] = [
    "Environment",
    "Technology",
    "Education",
    "Society",
    "Health",
    "Economy",
    "Academic Writing",
  ];

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 w-fit">
              Smart Lexicon & Collocation Notebook
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              Sổ Tay Từ Vựng & Cụm Từ Học Thuật
            </h1>
            <p className="text-sm text-zinc-400">
              Quản lý và ôn tập các từ vựng AWL, Collocations C1-C2 và công thức câu được lưu tự động trong lúc đọc và gõ.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Dạng bảng chi tiết"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("flashcard")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "flashcard" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Dạng Flashcard lật mặt"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export Anki TSV */}
            <button
              onClick={exportToAnkiTSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Thẻ Anki (.TSV)</span>
            </button>
          </div>
        </div>

        {/* Smart Tabs Filter */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "all"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
            }`}
          >
            Tất cả ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab("word")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "word"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
            }`}
          >
            Từ vựng đơn ({entries.filter((e) => e.item_type === "word").length})
          </button>
          <button
            onClick={() => setActiveTab("collocation")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "collocation"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
            }`}
          >
            Collocations ({entries.filter((e) => e.item_type === "collocation").length})
          </button>
          <button
            onClick={() => setActiveTab("idiomatic_phrase")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "idiomatic_phrase"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
            }`}
          >
            Cụm từ C1-C2 ({entries.filter((e) => e.item_type === "idiomatic_phrase").length})
          </button>
          <button
            onClick={() => setActiveTab("sentence_formula")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "sentence_formula"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
            }`}
          >
            Công thức câu ({entries.filter((e) => e.item_type === "sentence_formula").length})
          </button>
        </div>

        {/* Multi-Dimensional Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface border border-surface-border p-3.5 rounded-xl text-xs shadow-sm">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Bộ lọc:</span>
          </div>

          {/* Filter by Topic */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">Tất cả chủ đề</option>
            {topicsList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Filter by Mastery */}
          <select
            value={selectedMastery}
            onChange={(e) => setSelectedMastery(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">Tất cả cấp độ nhớ (1-5 sao)</option>
            <option value="1">1 sao (Mới học)</option>
            <option value="2">2 sao (Đang ghi nhớ)</option>
            <option value="3">3 sao (Khá)</option>
            <option value="4">4 sao (Thuần thục)</option>
            <option value="5">5 sao (Làm chủ)</option>
          </select>

          <span className="text-zinc-500 ml-auto">
            Hiển thị <strong>{filteredEntries.length}</strong> / {entries.length} mục
          </span>
        </div>

        {/* Entries Content */}
        {filteredEntries.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs bg-surface border border-surface-border rounded-2xl flex flex-col items-center gap-2">
            <BookOpen className="w-8 h-8 text-zinc-600" />
            <span>Không tìm thấy từ vựng hoặc cụm từ phù hợp với bộ lọc hiện tại.</span>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase font-semibold">
                    <th className="py-3.5 px-4">Thuật ngữ / Cụm từ</th>
                    <th className="py-3.5 px-4">Giải nghĩa tiếng Việt & Anh</th>
                    <th className="py-3.5 px-4">Chủ đề</th>
                    <th className="py-3.5 px-4">Mức độ nhớ</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 text-xs">
                  {filteredEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-100 font-mono text-sm">
                            {item.term}
                          </span>
                          <button
                            onClick={() => speak(item.term)}
                            className="text-zinc-500 hover:text-indigo-400 transition-colors p-1"
                            title="Nghe phát âm chuẩn"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          {item.ipa} • <span className="text-indigo-400">{item.part_of_speech}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-md">
                        <div className="font-medium text-emerald-400">
                          {item.definition_vi}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1 line-clamp-1 italic">
                          &ldquo;{item.context_sentence}&rdquo;
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {item.topic}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => updateMastery(item.id, star)}
                              className={`p-0.5 transition-colors cursor-pointer ${
                                star <= item.mastery_level
                                  ? "text-amber-400"
                                  : "text-zinc-700 hover:text-amber-500"
                              }`}
                              title={`Mức độ nhớ ${star}/5`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => removeTerm(item.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Xóa mục này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* FLASHCARD VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((item) => {
              const isFlipped = flippedCards[item.id] || false;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleFlip(item.id)}
                  className="bg-surface border border-surface-border hover:border-indigo-500/60 rounded-2xl p-5 shadow-lg min-h-[220px] flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {item.topic}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {isFlipped ? "Mặt sau (Nghĩa)" : "Mặt trước (Nhấp để lật)"}
                    </span>
                  </div>

                  {!isFlipped ? (
                    /* Front side */
                    <div className="my-auto flex flex-col items-center text-center gap-2">
                      <div className="text-xl font-bold font-mono text-zinc-100">
                        {item.term}
                      </div>
                      <div className="text-xs text-indigo-400 font-mono">
                        {item.ipa} • {item.part_of_speech}
                      </div>
                    </div>
                  ) : (
                    /* Back side */
                    <div className="my-auto flex flex-col gap-2 text-left">
                      <div className="text-sm font-bold text-emerald-400">
                        {item.definition_vi}
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed">
                        {item.definition_en}
                      </div>
                      <div className="text-[11px] text-zinc-500 italic border-l-2 border-zinc-700 pl-2">
                        &ldquo;{item.context_sentence}&rdquo;
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => updateMastery(item.id, star)}
                          className={`p-0.5 cursor-pointer ${
                            star <= item.mastery_level ? "text-amber-400" : "text-zinc-700"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(item.term);
                      }}
                      className="p-1 text-zinc-400 hover:text-indigo-400 transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
