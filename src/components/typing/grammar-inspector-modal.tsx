"use client";

import React, { useState } from "react";
import { Sparkles, X, Award } from "lucide-react";
import { DetectedPattern } from "@/modules/syntactic-scanner/scanner";

interface GrammarInspectorModalProps {
  patterns: DetectedPattern[];
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarInspectorModal: React.FC<GrammarInspectorModalProps> = ({
  patterns,
  isOpen,
  onClose,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(
    patterns[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[88vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">
                  Bảng Phân Tích Cú Pháp Học Thuật (Syntactic Scanner)
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {patterns.length} cấu trúc đắt giá
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Các cấu trúc câu tiêu biểu giúp tối ưu hóa điểm số Grammatical Range & Accuracy (GRA)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto flex-1 pr-1">
          {/* Patterns List (Left Column) */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Cấu trúc nhận diện được:
            </span>

            {patterns.length === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 text-center">
                Đoạn văn này chủ yếu sử dụng các cấu trúc câu đơn giản. Thử dán bài báo từ The Guardian hoặc The Economist để nhận diện cấu trúc Band 7.5+!
              </div>
            ) : (
              patterns.map((item) => {
                const isSelected = selectedPattern?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPattern(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-indigo-950/60 border-indigo-500 text-zinc-100 shadow-md"
                        : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-sans line-clamp-1">
                        {item.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Band {item.bandTarget}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-zinc-400 line-clamp-1 italic">
                      &ldquo;{item.matchedPhrase}&rdquo;
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Pattern Deep Dive (Right Column) */}
          <div className="md:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
            {selectedPattern ? (
              <>
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100 font-sans">
                      {selectedPattern.name}
                    </h4>
                    <span className="text-[11px] text-indigo-400 font-mono">
                      Khuyến nghị cho Target Band {selectedPattern.bandTarget}
                    </span>
                  </div>
                </div>

                {/* Highlighted Sentence Box */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-400">Câu văn trong bài:</span>
                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-mono">
                    {selectedPattern.fullSentence.split(selectedPattern.matchedPhrase).map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <mark className="bg-amber-400/20 text-amber-300 px-1 py-0.5 rounded font-bold border border-amber-400/40">
                            {selectedPattern.matchedPhrase}
                          </mark>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Grammatical Explanation */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-400">Nguyên lý ngữ pháp:</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedPattern.explanation}
                  </p>
                </div>

                {/* GRA Examiner Rationale */}
                <div className="bg-indigo-950/40 border border-indigo-700/50 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Đánh Giá Từ Giám Khảo IELTS (GRA Rationale):
                  </span>
                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    {selectedPattern.graRationale}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                Chọn một cấu trúc bên trái để xem phân tích chi tiết.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
