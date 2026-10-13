"use client";

import { create } from "zustand";

export interface FeedbackItem {
  id: string;
  category: "Lỗi gõ phím / IME" | "Đề xuất bài báo học thuật" | "Cải tiến giao diện / UX" | "Tính năng AI" | "Khác";
  content: string;
  senderName?: string;
  createdAt: string;
  status: "pending" | "reviewed";
}

interface FeedbackState {
  feedbacks: FeedbackItem[];
  addFeedback: (item: Omit<FeedbackItem, "id" | "createdAt" | "status">) => void;
  markAsReviewed: (id: string) => void;
  deleteFeedback: (id: string) => void;
  initFeedbacks: () => void;
}

const DEFAULT_FEEDBACKS: FeedbackItem[] = [
  {
    id: "fb-1",
    category: "Lỗi gõ phím / IME",
    content: "Chế độ IME Safe hoạt động rất tốt với EVKey, không còn bị lỗi nuốt phím khi gõ nhanh 80+ WPM.",
    senderName: "Học viên IELTS 7.5",
    createdAt: "12/10/2026 21:40",
    status: "reviewed",
  },
  {
    id: "fb-2",
    category: "Đề xuất bài báo học thuật",
    content: "Đề xuất admin thêm các bài báo chủ đề Artificial Intelligence and Labor Economics từ tạp chí Nature.",
    senderName: "Trần Minh",
    createdAt: "12/10/2026 22:15",
    status: "pending",
  },
  {
    id: "fb-3",
    category: "Tính năng AI",
    content: "Nút Paraphrase của Gemini giải thích rất hay, mong admin tích hợp thêm chấm bài Task 2 theo 4 tiêu chí.",
    senderName: "Lê Hoàng",
    createdAt: "12/10/2026 22:50",
    status: "pending",
  },
];

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbacks: DEFAULT_FEEDBACKS,

  initFeedbacks: () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gotyping_feedbacks");
        if (saved) {
          set({ feedbacks: JSON.parse(saved) });
          return;
        }
      } catch (e) {
        console.error("Error loading feedbacks:", e);
      }
    }
  },

  addFeedback: (item) => {
    const newItem: FeedbackItem = {
      ...item,
      id: "fb-" + Date.now(),
      createdAt: new Date().toLocaleString("vi-VN"),
      status: "pending",
    };

    const updated = [newItem, ...get().feedbacks];
    set({ feedbacks: updated });

    if (typeof window !== "undefined") {
      localStorage.setItem("gotyping_feedbacks", JSON.stringify(updated));
    }
  },

  markAsReviewed: (id: string) => {
    const updated = get().feedbacks.map((f) =>
      f.id === id ? { ...f, status: "reviewed" as const } : f
    );
    set({ feedbacks: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("gotyping_feedbacks", JSON.stringify(updated));
    }
  },

  deleteFeedback: (id: string) => {
    const updated = get().feedbacks.filter((f) => f.id !== id);
    set({ feedbacks: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("gotyping_feedbacks", JSON.stringify(updated));
    }
  },
}));
