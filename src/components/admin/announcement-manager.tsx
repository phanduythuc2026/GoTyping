"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  PlusCircle,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertOctagon,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { AnnouncementItem } from "@/lib/admin-store";

export const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "toast" | "changelog_modal" | "global_banner">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Modal create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<"toast" | "changelog_modal" | "global_banner">("toast");
  const [newSeverity, setNewSeverity] = useState<"info" | "warning" | "critical">("info");
  const [newVersionTag, setNewVersionTag] = useState("v2.1.0");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.success && Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      }
    } catch (e) {
      console.error("Fetch announcements error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (item: AnnouncementItem) => {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: item.id,
          updates: { is_active: !item.is_active },
        }),
      });
      const data = await res.json();
      if (data.success && data.announcement) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === item.id ? data.announcement : a))
        );
      }
    } catch (e) {
      console.error("Toggle active error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error("Delete announcement error:", e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          item: {
            title: newTitle.trim(),
            content: newContent.trim(),
            type: newType,
            severity: newSeverity,
            version_tag: newType === "changelog_modal" ? newVersionTag.trim() : null,
            is_active: true,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setIsModalOpen(false);
        setNewTitle("");
        setNewContent("");
      }
    } catch (e) {
      console.error("Create announcement error:", e);
    }
  };

  const filtered = announcements.filter((a) => {
    if (filterType === "all") return true;
    return a.type === filterType;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-surface hover:bg-surface-elevated text-zinc-400 border border-surface-border"
            }`}
          >
            Tất Cả ({announcements.length})
          </button>
          <button
            onClick={() => setFilterType("toast")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === "toast"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-surface hover:bg-surface-elevated text-zinc-400 border border-surface-border"
            }`}
          >
            Toast Góc Màn Hình
          </button>
          <button
            onClick={() => setFilterType("changelog_modal")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === "changelog_modal"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-surface hover:bg-surface-elevated text-zinc-400 border border-surface-border"
            }`}
          >
            Changelog Modal
          </button>
          <button
            onClick={() => setFilterType("global_banner")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === "global_banner"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-surface hover:bg-surface-elevated text-zinc-400 border border-surface-border"
            }`}
          >
            Banner Toàn Server
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Thông Báo Mới</span>
        </button>
      </div>

      {/* Announcement List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">
            Đang tải danh sách thông báo...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 bg-surface border border-surface-border rounded-2xl text-xs">
            Chưa có thông báo nào trong danh mục này.
          </div>
        ) : (
          filtered.map((item) => {
            const isToast = item.type === "toast";
            const isChangelog = item.type === "changelog_modal";

            return (
              <div
                key={item.id}
                className={`bg-surface border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md ${
                  item.is_active
                    ? "border-surface-border"
                    : "border-surface-border/40 opacity-60 bg-surface/50"
                }`}
              >
                <div className="flex items-start gap-3.5 max-w-2xl">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isToast
                        ? "bg-indigo-500/15 text-indigo-400"
                        : isChangelog
                        ? "bg-purple-500/15 text-purple-400"
                        : item.severity === "critical"
                        ? "bg-rose-500/15 text-rose-400"
                        : item.severity === "warning"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-sky-500/15 text-sky-400"
                    }`}
                  >
                    {isToast ? (
                      <Bell className="w-5 h-5" />
                    ) : isChangelog ? (
                      <Sparkles className="w-5 h-5" />
                    ) : item.severity === "critical" ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : item.severity === "warning" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-400 border border-surface-border">
                        {isToast ? "Toast" : isChangelog ? "Changelog" : "Global Banner"}
                      </span>
                      {item.version_tag && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {item.version_tag}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                          item.severity === "critical"
                            ? "bg-rose-500/20 text-rose-400"
                            : item.severity === "warning"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-indigo-500/20 text-indigo-400"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      item.is_active
                        ? "bg-emerald-950/40 text-emerald-300 border-emerald-600/40"
                        : "bg-surface-elevated text-zinc-400 border-surface-border"
                    }`}
                  >
                    {item.is_active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                    <span>{item.is_active ? "Đang phát" : "Tạm dừng"}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 border border-surface-border transition-colors cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreate}
            className="bg-surface border border-surface-border rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <span>Soạn Thông Báo Hệ Thống</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Tiêu đề thông báo:</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="VD: Cập Nhật Tính Năng Mới..."
                className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Phân loại hiển thị:</label>
                <select
                  value={newType}
                  onChange={(e) =>
                    setNewType(e.target.value as "toast" | "changelog_modal" | "global_banner")
                  }
                  className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
                >
                  <option value="toast">Mini Toast (Góc màn hình)</option>
                  <option value="changelog_modal">Changelog Modal (Popup)</option>
                  <option value="global_banner">Global Banner (Đầu trang)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Mức độ nghiêm trọng:</label>
                <select
                  value={newSeverity}
                  onChange={(e) =>
                    setNewSeverity(e.target.value as "info" | "warning" | "critical")
                  }
                  className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500"
                >
                  <option value="info">Info (Xanh dương)</option>
                  <option value="warning">Warning (Hổ phách)</option>
                  <option value="critical">Critical (Đỏ neon)</option>
                </select>
              </div>
            </div>

            {newType === "changelog_modal" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Mã phiên bản (Version Tag):</label>
                <input
                  type="text"
                  value={newVersionTag}
                  onChange={(e) => setNewVersionTag(e.target.value)}
                  placeholder="VD: v2.1.0"
                  className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nội dung chi tiết:</label>
              <textarea
                rows={4}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Nhập nội dung thông báo hoặc danh sách gạch đầu dòng tính năng..."
                className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Xuất Bản Thông Báo</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
