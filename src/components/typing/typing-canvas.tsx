"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useTypingStore } from "@/modules/typing-engine/store";
import { resolvePhysicalKeyEvent } from "@/modules/typing-engine/ime-interceptor";
import { calculateCaretPosition } from "@/modules/typing-engine/caret-tracker";
import { useAuthStore } from "@/lib/auth-store";
import { evaluateTypingAgainstBand } from "@/modules/typing-engine/benchmark-evaluator";
import { scanSyntacticPatterns } from "@/modules/syntactic-scanner/scanner";
import { scanCoherenceDevices } from "@/modules/lexical-analyzer/coherence-scanner";
import { getQuickHint } from "@/modules/lexical-analyzer/auto-enricher";
import { Caret } from "./caret";
import { QuickVocabPopover } from "./quick-vocab-popover";
import { UniversalCapturePopover } from "./universal-capture-popover";
import { GrammarInspectorModal } from "./grammar-inspector-modal";
import { CoherenceRadarModal } from "./coherence-radar-modal";
import { WordNode, TypingSessionMetrics } from "@/types/typing.types";
import {
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Award,
  Zap,
  Timer,
  Sparkles,
  Target,
  Brain,
  Compass,
  AlertCircle,
} from "lucide-react";

interface TypingCanvasProps {
  onSessionComplete?: (metrics: TypingSessionMetrics) => void;
  onNextChunk?: () => void;
  hasNextChunk?: boolean;
}

export const TypingCanvas: React.FC<TypingCanvasProps> = ({
  onSessionComplete,
  onNextChunk,
  hasNextChunk,
}) => {
  const {
    words,
    status,
    rawText,
    currentWordIndex,
    currentCharIndex,
    caret,
    metrics,
    imeSafeMode,
    handleKeyInput,
    setCaret,
    resetSession,
    clozeMode,
    toggleClozeMode,
    pressureMode,
    pressureTimeLimit,
    timeRemaining,
    isPressureWarning,
    isTimeOut,
  } = useTypingStore();

  const { user, guestTargetBand } = useAuthStore();
  const targetBand = user?.target_band ?? guestTargetBand ?? 7.5;

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const activeWordRef = useRef<HTMLDivElement | null>(null);

  // Popover state for word inspection
  const [hoveredWord, setHoveredWord] = useState<{
    wordNode: WordNode;
    rect: DOMRect;
  } | null>(null);
  const [isVocabPinned, setIsVocabPinned] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close or unpin popover on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (hoveredWord || isVocabPinned)) {
        setIsVocabPinned(false);
        setHoveredWord(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredWord, isVocabPinned]);

  // Clean up closeTimer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Modals state
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
  const [isCoherenceModalOpen, setIsCoherenceModalOpen] = useState(false);

  // Syntactic patterns scanned from rawText
  const detectedGrammarPatterns = useMemo(() => {
    return scanSyntacticPatterns(rawText);
  }, [rawText]);

  // Coherence & Cohesion linking devices scanned from rawText
  const detectedCoherenceResult = useMemo(() => {
    return scanCoherenceDevices(rawText);
  }, [rawText]);

  // Focus input automatically
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, words]);

  // Subpixel Caret recalculation function
  const recomputeCaret = useCallback(() => {
    if (containerRef.current) {
      const coords = calculateCaretPosition(
        containerRef.current,
        activeCharRef.current,
        activeWordRef.current
      );
      setCaret(coords);

      // Smooth auto-scroll keeping the active word within comfortable viewing range
      if (activeWordRef.current && containerRef.current) {
        const wordTop = activeWordRef.current.offsetTop;
        const currentScroll = containerRef.current.scrollTop;
        if (wordTop - currentScroll > 160) {
          containerRef.current.scrollTo({
            top: wordTop - 80,
            behavior: "smooth",
          });
        } else if (wordTop < currentScroll) {
          containerRef.current.scrollTo({
            top: Math.max(0, wordTop - 40),
            behavior: "smooth",
          });
        }
      }
    }
  }, [setCaret]);

  // Update Caret position on keystroke state changes
  useEffect(() => {
    recomputeCaret();
  }, [currentWordIndex, currentCharIndex, words, recomputeCaret]);

  // ResizeObserver to eliminate any subpixel font or window shift
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      recomputeCaret();
    });

    observer.observe(containerRef.current);
    window.addEventListener("resize", recomputeCaret);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recomputeCaret);
    };
  }, [recomputeCaret]);

  // Notify parent on completion
  useEffect(() => {
    if (status === "completed" && onSessionComplete) {
      onSessionComplete(metrics);
    }
  }, [status, metrics, onSessionComplete]);

  // Key Event Interceptor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab + Enter resets session
    if (e.key === "Tab") {
      e.preventDefault();
      resetSession();
      return;
    }

    // Intercept and resolve physical key
    const resolved = resolvePhysicalKeyEvent(e.nativeEvent, imeSafeMode);
    if (!resolved.isIgnored) {
      e.preventDefault();
      handleKeyInput(resolved);
    }
  };

  // Block composition events to prevent IME buffer pollution
  const handleComposition = (e: React.CompositionEvent<HTMLInputElement>) => {
    if (imeSafeMode) {
      e.preventDefault();
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const benchmarkResult = evaluateTypingAgainstBand({
    netWpm: metrics.netWpm,
    accuracy: metrics.accuracy,
    targetBand,
    totalWords: metrics.totalWords,
  });

  if (words.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-zinc-500 font-mono text-sm bg-surface rounded-2xl border border-surface-border">
        Chưa có văn bản. Vui lòng nhập link bài báo hoặc chọn bài mẫu phía trên.
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col gap-3">
      {/* Floating Universal Capture for text selection */}
      <UniversalCapturePopover />

      {/* Top Tool Action Bar (Active Recall Cloze, C&C Radar, Grammar Inspector) */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 transition-all duration-200 ${
          status === "running"
            ? "opacity-25 -translate-y-1 pointer-events-none sm:pointer-events-auto"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500">
            Tip: Bôi đen từ/cụm từ để thêm nhanh vào sổ tay.
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Cloze Mode Switch */}
          <button
            onClick={toggleClozeMode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              clozeMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                : "bg-surface hover:bg-zinc-800 text-zinc-400 border-surface-border"
            }`}
            title="Chế độ đục lỗ: Ẩn từ vựng AWL & Collocations để kích hoạt Active Recall"
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>Cloze Mode</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                clozeMode ? "bg-amber-400 text-zinc-950" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {clozeMode ? "BẬT" : "TẮT"}
            </span>
          </button>

          {/* 2. Coherence & Cohesion Radar Button */}
          <button
            onClick={() => setIsCoherenceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface hover:bg-zinc-800 text-teal-400 dark:text-teal-300 border border-teal-500/30 hover:border-teal-500/60 transition-colors cursor-pointer text-xs font-semibold"
            title="Xem phân tích liên từ kết nối lập luận (Coherence & Cohesion)"
          >
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Radar Từ Nối C&C</span>
            {detectedCoherenceResult.matches.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                {detectedCoherenceResult.matches.length}
              </span>
            )}
          </button>

          {/* 3. Grammar Inspector Button */}
          <button
            onClick={() => setIsGrammarModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface hover:bg-zinc-800 text-indigo-400 dark:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 transition-colors cursor-pointer text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ngữ pháp Band 7.5+</span>
            {detectedGrammarPatterns.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                {detectedGrammarPatterns.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hidden zero-reflow keystroke input with 16px to prevent iOS Safari auto-zoom */}
      <input
        ref={inputRef}
        type="text"
        className="sr-only text-[16px]"
        style={{ fontSize: "16px" }}
        autoFocus
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleComposition}
        onCompositionUpdate={handleComposition}
        onCompositionEnd={handleComposition}
        value=""
        onChange={() => {}}
        aria-hidden="true"
      />

      {/* Main Typing Canvas Area with strict Monospace & Zero Ligature styles */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className={`relative w-full max-h-[380px] min-h-[220px] overflow-y-auto px-8 py-8 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-2xl cursor-text select-text shadow-sm dark:shadow-2xl transition-all ${
          isPressureWarning
            ? "border-rose-500/80 ring-2 ring-rose-500/50 shadow-[inset_0_0_45px_rgba(244,63,94,0.22)] animate-pulse"
            : ""
        }`}
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {/* Task Pressure Top Minimal Progress Line */}
        {pressureMode !== "free" && pressureTimeLimit && timeRemaining !== null && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800/80 rounded-t-2xl overflow-hidden z-20">
            <div
              className={`h-full transition-all duration-300 ease-out ${
                isPressureWarning ? "bg-rose-500 animate-pulse" : "bg-indigo-500"
              }`}
              style={{ width: `${Math.max(0, (timeRemaining / pressureTimeLimit) * 100)}%` }}
            />
          </div>
        )}

        {/* Floating Smooth Caret */}
        <Caret coordinates={caret} isTyping={status === "running"} />

        {/* Word Stream with strictly locked typography */}
        <div className="typing-canvas-content flex flex-wrap gap-x-3 gap-y-3.5 select-text">
          {words.map((wordNode, wIndex) => {
            const isCurrentWord = wIndex === currentWordIndex;
            const isPastWord = wIndex < currentWordIndex;

            // Check Coherence match
            const coherenceMatch = detectedCoherenceResult.isWordInDevice(wIndex, words);

            // Cloze Mode (Active Recall)
            const isClozeTarget = clozeMode && (wordNode.isAWL || wordNode.isCollocation);
            const clozeHint = isClozeTarget ? getQuickHint(wordNode.cleanWord) : null;

            // Determine border & underglow styling
            let borderStyle = "";
            if (coherenceMatch) {
              borderStyle = coherenceMatch.borderClass;
            } else if (wordNode.isAWL) {
              borderStyle = "border-b-2 border-amber-400 hover:bg-amber-400/10 cursor-help";
            } else if (wordNode.isCollocation) {
              borderStyle = "border-b-2 border-sky-400 hover:bg-sky-400/10 cursor-help";
            }

            return (
              <div
                key={wIndex}
                ref={isCurrentWord ? activeWordRef : null}
                className={`relative flex items-center rounded-sm transition-colors ${borderStyle}`}
                onMouseEnter={(e) => {
                  if (closeTimerRef.current) {
                    clearTimeout(closeTimerRef.current);
                    closeTimerRef.current = null;
                  }
                  if (wordNode.isAWL || wordNode.isCollocation) {
                    setHoveredWord({
                      wordNode,
                      rect: e.currentTarget.getBoundingClientRect(),
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (!isVocabPinned) {
                    closeTimerRef.current = setTimeout(() => {
                      setHoveredWord(null);
                    }, 250);
                  }
                }}
                onClick={(e) => {
                  if (wordNode.isAWL || wordNode.isCollocation) {
                    setHoveredWord({
                      wordNode,
                      rect: e.currentTarget.getBoundingClientRect(),
                    });
                    setIsVocabPinned((prev) => !prev);
                  }
                }}
              >
                {/* Cloze Hint Tooltip Pill */}
                {isClozeTarget && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-amber-950/95 text-amber-300 border border-amber-500/40 whitespace-nowrap pointer-events-none font-sans z-10 shadow-md">
                    <span className="font-bold uppercase tracking-wider">{clozeHint?.pos}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="max-w-[120px] truncate">{clozeHint?.vi}</span>
                  </span>
                )}

                {/* Character sequence */}
                {wordNode.chars.map((charNode, cIndex) => {
                  const isActiveChar = isCurrentWord && cIndex === currentCharIndex;

                  let charClass = "text-slate-500 dark:text-zinc-500 font-medium";
                  if (charNode.status === "correct") {
                    charClass = "text-typing-correct opacity-100 font-semibold";
                  } else if (charNode.status === "incorrect") {
                    charClass = "text-typing-incorrect bg-rose-500/20 underline decoration-rose-500 animate-subtle-shake opacity-100";
                  } else if (charNode.status === "extra") {
                    charClass = "text-typing-extra bg-rose-700/30 opacity-100";
                  }

                  // Active Recall Cloze masking: display '_' for pending un-typed letters
                  const displayChar =
                    isClozeTarget && charNode.status === "pending" ? "_" : charNode.char;

                  return (
                    <span
                      key={cIndex}
                      ref={isActiveChar ? activeCharRef : null}
                      className={`typing-char relative inline p-0 m-0 transition-colors duration-75 ${charClass} ${
                        isClozeTarget && charNode.status === "pending"
                          ? "text-amber-500 dark:text-amber-400 font-bold"
                          : ""
                      }`}
                    >
                      {displayChar}
                    </span>
                  );
                })}

                {/* Trailing space indicator if error occurred */}
                {isPastWord && wordNode.hasErrors && (
                  <span className="text-rose-500 text-xs ml-0.5 select-none">•</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Quick Vocab Popover */}
      {hoveredWord && (
        <div
          className="fixed z-50 pointer-events-auto"
          style={{
            top: `${Math.max(10, hoveredWord.rect.top - 180)}px`,
            left: `${Math.max(10, hoveredWord.rect.left - 40)}px`,
          }}
          onMouseEnter={() => {
            if (closeTimerRef.current) {
              clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
          }}
          onMouseLeave={() => {
            if (!isVocabPinned) {
              closeTimerRef.current = setTimeout(() => {
                setHoveredWord(null);
              }, 200);
            }
          }}
        >
          <QuickVocabPopover
            word={hoveredWord.wordNode.cleanWord}
            isAWL={hoveredWord.wordNode.isAWL}
            awlSublist={hoveredWord.wordNode.awlSublist}
            isCollocation={hoveredWord.wordNode.isCollocation}
            collocationGroup={hoveredWord.wordNode.collocationGroup}
            contextSentence={hoveredWord.wordNode.original}
            isPinned={isVocabPinned}
            onPinToggle={() => setIsVocabPinned((prev) => !prev)}
            onClose={() => {
              setIsVocabPinned(false);
              setHoveredWord(null);
            }}
          />
        </div>
      )}

      {/* Grammar & Structure Inspector Modal */}
      <GrammarInspectorModal
        patterns={detectedGrammarPatterns}
        isOpen={isGrammarModalOpen}
        onClose={() => setIsGrammarModalOpen(false)}
      />

      {/* Coherence & Cohesion Radar Modal */}
      <CoherenceRadarModal
        scanResult={detectedCoherenceResult}
        isOpen={isCoherenceModalOpen}
        onClose={() => setIsCoherenceModalOpen(false)}
      />

      {/* Completion Modal / Summary with Benchmark Evaluator & Milestone Glow */}
      {status === "completed" && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 z-30 animate-in fade-in zoom-in-95 duration-200 border border-surface-border overflow-hidden">
          {/* Milestone ambient radial glow */}
          <div className="absolute inset-0 milestone-glow pointer-events-none" />
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <CheckCircle2 className="w-8 h-8" />
            <h3 className="text-2xl font-extrabold font-sans">
              {isTimeOut ? "Hết Thời Gian Làm Bài!" : "Phiên Gõ Hoàn Tất!"}
            </h3>
          </div>

          {/* Timeout Alert if session ended via Pressure Mode */}
          {isTimeOut && (
            <div className="px-4 py-2 rounded-xl text-xs font-mono font-bold border my-2 flex items-center gap-2 bg-rose-950/70 text-rose-300 border-rose-700/70">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>HẾT GIỜ THI THỬ (TIME LIMIT REACHED)</span>
              <span className="text-zinc-400 font-normal">
                - Đã hoàn tất {metrics.completedWords} / {metrics.totalWords} từ
              </span>
            </div>
          )}

          {/* Benchmark Evaluator Banner */}
          <div
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border my-3 flex items-center gap-2 ${benchmarkResult.badgeColorClass}`}
          >
            <Target className="w-4 h-4" />
            <span>{benchmarkResult.badgeText}</span>
            <span className="text-zinc-400 font-normal">({benchmarkResult.feedback})</span>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl mb-6">
            <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col items-center">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Net WPM
              </span>
              <span className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">
                {metrics.netWpm}
              </span>
            </div>

            <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col items-center">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Accuracy
              </span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                {metrics.accuracy.toFixed(1)}%
              </span>
            </div>

            <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col items-center">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-zinc-400" />
                Thời gian
              </span>
              <span className="text-3xl font-extrabold text-zinc-200 font-mono mt-1">
                {metrics.elapsedSeconds}s
              </span>
            </div>

            <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col items-center">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Số từ đã gõ
              </span>
              <span className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
                {metrics.completedWords}
              </span>
            </div>
          </div>

          {/* Key Errors Breakdown if any */}
          {Object.keys(metrics.errorLog).length > 0 && (
            <div className="w-full max-w-xl bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 mb-6 text-xs text-zinc-300">
              <span className="text-zinc-400 font-medium mr-2">Phím gõ sai:</span>
              {Object.entries(metrics.errorLog)
                .slice(0, 5)
                .map(([key, count], i) => (
                  <span
                    key={i}
                    className="inline-block bg-zinc-800/80 px-2 py-0.5 rounded mr-2 font-mono text-rose-300"
                  >
                    {key} ({count})
                  </span>
                ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={resetSession}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Gõ lại bài này</span>
            </button>

            {hasNextChunk && onNextChunk && (
              <button
                onClick={onNextChunk}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <span>Đoạn tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
