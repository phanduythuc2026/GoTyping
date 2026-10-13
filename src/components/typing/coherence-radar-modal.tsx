"use client";

import React, { useState } from "react";
import { X, Share2, Compass, CheckCircle2, Lightbulb } from "lucide-react";
import {
  CoherenceScanResult,
  DetectedCoherenceMatch,
} from "@/modules/lexical-analyzer/coherence-scanner";

interface CoherenceRadarModalProps {
  scanResult: CoherenceScanResult;
  isOpen: boolean;
  onClose: () => void;
}

export const CoherenceRadarModal: React.FC<CoherenceRadarModalProps> = ({
  scanResult,
  isOpen,
  onClose,
}) => {
  const { matches, stats } = scanResult;
  const [selectedMatch, setSelectedMatch] = useState<DetectedCoherenceMatch | null>(
    matches[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[88vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2 font-sans">
                Coherence & Cohesion Radar
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  IELTS Criterion C&C
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Phân tích độ đa dạng và tần suất phân bổ các liên từ kết nối lập luận trong bài.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Band Summary */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                C&C Band
              </span>
              <span className="text-2xl font-black text-indigo-300 font-mono">
                {stats.estimatedBand.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-200">{stats.bandEvaluation}</span>
              <span className="text-[11px] text-zinc-400 mt-0.5">{stats.tacticalAdvice}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 self-end sm:self-auto">
            <span>Tổng số liên từ:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-teal-300 font-bold">
              {stats.totalCount}
            </span>
          </div>
        </div>

        {/* 4 Category Radar Distribution Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Addition */}
          <div className="bg-zinc-900/60 border border-sky-500/20 rounded-xl p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                Bổ Sung
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300">
                {stats.byCategory.addition} ({stats.percentageByCategory.addition}%)
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.percentageByCategory.addition}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 line-clamp-1">
              Furthermore, Moreover, In addition...
            </span>
          </div>

          {/* 2. Contrast */}
          <div className="bg-zinc-900/60 border border-violet-500/20 rounded-xl p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wide">
                Tương Phản
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300">
                {stats.byCategory.contrast} ({stats.percentageByCategory.contrast}%)
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-violet-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.percentageByCategory.contrast}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 line-clamp-1">
              Conversely, However, Notwithstanding...
            </span>
          </div>

          {/* 3. Cause & Effect */}
          <div className="bg-zinc-900/60 border border-teal-500/20 rounded-xl p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wide">
                Hệ Quả
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300">
                {stats.byCategory.cause_effect} ({stats.percentageByCategory.cause_effect}%)
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.percentageByCategory.cause_effect}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 line-clamp-1">
              Consequently, Thereby, Therefore...
            </span>
          </div>

          {/* 4. Exemplification */}
          <div className="bg-zinc-900/60 border border-amber-500/20 rounded-xl p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                Dẫn Chứng
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300">
                {stats.byCategory.exemplification} ({stats.percentageByCategory.exemplification}%)
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.percentageByCategory.exemplification}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 line-clamp-1">
              To illustrate, For instance, Exemplified...
            </span>
          </div>
        </div>

        {/* Split List & Details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-hidden min-h-[220px]">
          {/* Matches List */}
          <div className="md:col-span-2 overflow-y-auto flex flex-col gap-2 pr-1">
            {matches.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800">
                Không tìm thấy cụm từ nối trong đoạn hiện tại.
              </div>
            ) : (
              matches.map((match, i) => {
                const isSelected = selectedMatch?.startIndex === match.startIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedMatch(match)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-zinc-800/90 border-indigo-500/50 shadow-md"
                        : "bg-zinc-900/50 hover:bg-zinc-800/50 border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-100 font-mono capitalize">
                        {match.phrase}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${
                          match.category === "addition"
                            ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                            : match.category === "contrast"
                            ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                            : match.category === "cause_effect"
                            ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {match.labelVi}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 line-clamp-1 italic">
                      &ldquo;{match.matchedText}&rdquo;
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Match Detail Panel */}
          <div className="md:col-span-3 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 overflow-y-auto flex flex-col gap-3">
            {selectedMatch ? (
              <>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-zinc-100 capitalize">
                      {selectedMatch.phrase}
                    </span>
                    <span className="text-[10px] text-zinc-400">({selectedMatch.labelVi})</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">
                    Nhóm: {selectedMatch.category}
                  </span>
                </div>

                {/* Sentence Context */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-indigo-400" />
                    Ngữ cảnh câu trong bài gõ:
                  </span>
                  <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-xs font-mono text-zinc-200 leading-relaxed">
                    {selectedMatch.sentenceContext}
                  </div>
                </div>

                {/* IELTS C&C Rationale */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-teal-400" />
                    Tiêu chí chấm điểm Coherence & Cohesion:
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/60">
                    {selectedMatch.ieltsRationale}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                Chọn một liên từ phía trái để xem phân tích chi tiết.
              </div>
            )}
          </div>
        </div>

        {/* Footer tip */}
        <div className="border-t border-surface-border pt-3 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Giám khảo chấm điểm cao khi liên từ được dùng tự nhiên và phân bố đều giữa các nhóm.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold cursor-pointer text-xs"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
