"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, X, Send, CheckCircle2, Sparkles } from "lucide-react";
import { useFeedbackStore, FeedbackItem } from "@/lib/feedback-store";

export const FeedbackModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackItem["category"]>("Cải tiến giao diện / UX");
  const [content, setContent] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { addFeedback, initFeedbacks } = useFeedbackStore();

  useEffect(() => {
    initFeedbacks();
  }, [initFeedbacks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addFeedback({
      category,
      content: content.trim(),
      senderName: senderName.trim() || "Ẩn danh",
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setContent("");
      setSenderName("");
      setIsOpen(false);
    }, 1800);
  };

  return (
    <>
      {/* Floating Mini Button in Bottom Corner */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-indigo-300 border border-zinc-700/80 hover:border-indigo-500/50 rounded-full px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 group"
        title="Gửi ý kiến đóng góp hoặc báo lỗi"
      >
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse group-hover:bg-emerald-400 transition-colors" />
        <MessageSquarePlus className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
        <span className="hidden sm:inline">Góp ý cải tiến</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Góp Ý & Đề Xuất Cải Tiến</h3>
                  <p className="text-[11px] text-zinc-400">Giúp IELTS Scribe ngày càng hoàn thiện hơn</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-zinc-100">Cảm ơn bạn đã đóng góp!</h4>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Góp ý của bạn đã được gửi trực tiếp tới bảng quản trị của Super Admin.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {/* Category Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Phân loại góp ý</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackItem["category"])}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Lỗi gõ phím / IME">Lỗi gõ phím / IME</option>
                    <option value="Đề xuất bài báo học thuật">Đề xuất bài báo học thuật</option>
                    <option value="Cải tiến giao diện / UX">Cải tiến giao diện / UX</option>
                    <option value="Tính năng AI">Tính năng AI (Paraphrase/Ideas)</option>
                    <option value="Khác">Ý kiến khác</option>
                  </select>
                </div>

                {/* Sender Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Tên hoặc biệt danh (tùy chọn)</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ví dụ: Học viên IELTS 7.0"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Content Textarea */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Nội dung góp ý</label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Chia sẻ đề xuất tính năng, phản hồi trải nghiệm hoặc lỗi bạn gặp phải..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi góp ý</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
