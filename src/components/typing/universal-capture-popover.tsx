"use client";

import React, { useState, useEffect } from "react";
import { BookmarkPlus, Check } from "lucide-react";
import { useVocabularyStore } from "@/lib/vocabulary-store";

export const UniversalCapturePopover: React.FC = () => {
  const [selectedText, setSelectedText] = useState("");
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const { addTerm } = useVocabularyStore();

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setCoords(null);
        setSelectedText("");
        setIsSaved(false);
        return;
      }

      const text = selection.toString().trim();
      if (text.length >= 2 && text.length <= 120) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setCoords({
          x: Math.max(10, rect.left + rect.width / 2 - 80),
          y: Math.max(10, rect.top - 46),
        });
        setIsSaved(false);
      } else {
        setCoords(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  if (!coords || !selectedText) return null;

  const handleCapture = (e: React.MouseEvent) => {
    e.stopPropagation();
    addTerm(selectedText);
    setIsSaved(true);
    setTimeout(() => {
      setCoords(null);
      setSelectedText("");
      setIsSaved(false);
      window.getSelection()?.removeAllRanges();
    }, 1200);
  };

  return (
    <div
      className="fixed z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
      style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
    >
      <button
        onClick={handleCapture}
        disabled={isSaved}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xl border transition-all cursor-pointer backdrop-blur-md ${
          isSaved
            ? "bg-emerald-950/90 text-emerald-300 border-emerald-600/70"
            : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 hover:scale-105"
        }`}
      >
        {isSaved ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đã lưu vào sổ tay!</span>
          </>
        ) : (
          <>
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>Thêm vào sổ tay</span>
          </>
        )}
      </button>
    </div>
  );
};
