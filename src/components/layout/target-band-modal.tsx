"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, CheckCircle2, Target, Sliders } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { IELTS_BAND_BENCHMARKS } from "@/modules/typing-engine/benchmark-evaluator";

interface TargetBandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_BANDS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

export const TargetBandModal: React.FC<TargetBandModalProps> = ({ isOpen, onClose }) => {
  const { user, guestTargetBand, updateTargetBand } = useAuthStore();
  const currentBand = user?.target_band ?? guestTargetBand ?? 7.5;
  const [selectedBand, setSelectedBand] = useState<number>(currentBand);

  // Sync state whenever modal opens or currentBand changes
  useEffect(() => {
    if (isOpen) {
      setSelectedBand(currentBand);
    }
  }, [isOpen, currentBand]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateTargetBand(selectedBand);
    onClose();
  };

  const currentBenchmark = IELTS_BAND_BENCHMARKS[selectedBand] || IELTS_BAND_BENCHMARKS[7.5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 text-slate-900 dark:text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Thiết Lập Mục Tiêu IELTS Writing
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Định lượng tiêu chuẩn WPM và độ chính xác phản xạ cơ bắp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Đóng modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9 Interactive Radio Pills */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Chọn Band Điểm Mục Tiêu (5.0 - 9.0):
            </label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80">
              Band {selectedBand.toFixed(1)}
            </span>
          </div>

          <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
            {AVAILABLE_BANDS.map((band) => {
              const isSelected = Math.abs(selectedBand - band) < 0.01;
              return (
                <button
                  key={band}
                  type="button"
                  onClick={() => setSelectedBand(band)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-400 shadow-md scale-105"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-slate-200 dark:hover:bg-zinc-750"
                  }`}
                >
                  {band.toFixed(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual Interactive Range Slider */}
        <div className="flex flex-col gap-1.5 px-1 py-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-indigo-500" />
              Thanh trượt vi chỉnh
            </span>
            <span>5.0 - 9.0 (bước 0.5)</span>
          </div>
          <input
            type="range"
            min="5.0"
            max="9.0"
            step="0.5"
            value={selectedBand}
            onChange={(e) => setSelectedBand(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
            <span>5.0</span>
            <span>6.0</span>
            <span>7.0</span>
            <span>8.0</span>
            <span>9.0</span>
          </div>
        </div>

        {/* Selected Band Benchmark Details */}
        <div className="bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Tiêu chuẩn cho Band {selectedBand.toFixed(1)}:
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold">
              Min {currentBenchmark.minWpm} WPM • &ge;{currentBenchmark.minAccuracy}% Acc
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
            {currentBenchmark.description}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
            <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Tốc độ tối thiểu</div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {currentBenchmark.minWpm} WPM
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Độ chính xác</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                &ge;{currentBenchmark.minAccuracy}%
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Từ vựng AWL</div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                &ge;{currentBenchmark.minAwlPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Lưu mục tiêu này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
