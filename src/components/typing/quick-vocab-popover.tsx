"use client";

import React, { useState } from "react";
import { Bookmark, BookmarkCheck, Volume2, Sparkles, X, Pin, PinOff } from "lucide-react";
import { QuickVocabDefinition } from "@/types/lexical.types";

interface QuickVocabPopoverProps {
  word: string;
  isAWL?: boolean;
  awlSublist?: number;
  isCollocation?: boolean;
  collocationGroup?: string;
  contextSentence?: string;
  isPinned?: boolean;
  onPinToggle?: () => void;
  onClose?: () => void;
  onSave?: (vocab: QuickVocabDefinition) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const QuickVocabPopover: React.FC<QuickVocabPopoverProps> = ({
  word,
  isAWL,
  awlSublist,
  isCollocation,
  collocationGroup,
  contextSentence,
  isPinned,
  onPinToggle,
  onClose,
  onSave,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [saved, setSaved] = useState(false);

  // Text-to-speech for British English pronunciation
  const speakWord = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-GB";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSave = () => {
    setSaved(true);
    if (onSave) {
      onSave({
        word,
        cefrLevel: isAWL ? "Academic (AWL)" : "C1",
        academicExample: contextSentence,
      });
    }
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative z-50 bg-white/95 dark:bg-zinc-900/95 border border-slate-300 dark:border-zinc-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-lg w-80 text-left animate-in fade-in zoom-in-95 duration-150 before:absolute before:-bottom-4 before:left-0 before:right-0 before:h-5 before:content-['']"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono capitalize">
            {word}
          </span>
          <button
            onClick={speakWord}
            type="button"
            className="p-1 rounded-md text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Nghe phát âm chuẩn (UK)"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {onPinToggle && (
            <button
              onClick={onPinToggle}
              type="button"
              className={`p-1 rounded transition-colors cursor-pointer ${
                isPinned
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                  : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              }`}
              title={isPinned ? "Bỏ ghim popover" : "Ghim popover cố định"}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        {isAWL && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            AWL Sublist {awlSublist ?? 1}
          </span>
        )}

        {isCollocation && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
            Collocation
          </span>
        )}

        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/50">
          IELTS Academic C1
        </span>
      </div>

      {/* Collocation preview if part of phrase */}
      {collocationGroup && (
        <div className="mt-2 text-xs text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 rounded-lg p-2 font-mono">
          Cụm: <span className="font-semibold underline">{collocationGroup}</span>
        </div>
      )}

      {/* Context Sentence */}
      {contextSentence && (
        <div className="mt-2.5 text-xs text-slate-600 dark:text-zinc-400 italic line-clamp-2 border-l-2 border-slate-300 dark:border-zinc-700 pl-2">
          &ldquo;{contextSentence}&rdquo;
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
          {isPinned ? "Đang ghim cố định" : "Di chuột để tra từ"}
        </span>
        <button
          onClick={handleSave}
          disabled={saved}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            saved
              ? "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 cursor-default"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          }`}
        >
          {saved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Đã lưu</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" />
              <span>Lưu từ này</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
