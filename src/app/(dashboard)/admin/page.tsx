"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/lib/auth-store";
import { useFeedbackStore } from "@/lib/feedback-store";
import { MaintenanceConsole } from "@/components/admin/maintenance-console";
import { AnnouncementManager } from "@/components/admin/announcement-manager";
import { FeatureFlagsManager } from "@/components/admin/feature-flags-manager";
import { GeneralSettingsManager } from "@/components/admin/general-settings-manager";
import { LeaderboardManager } from "@/components/admin/leaderboard-manager";
import {
  ShieldCheck,
  Users,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Trash2,
  PlusCircle,
  Sparkles,
  KeyRound,
  Mail,
  Ban,
  RotateCcw,
  Copy,
  Wrench,
  Bell,
  Sliders,
  Settings,
  Trophy,
} from "lucide-react";

interface ManagedUser {
  id: string;
  email: string;
  display_name: string;
  role: "super_admin" | "admin" | "user";
  target_band: number;
  total_sessions_completed: number;
  is_active: boolean;
  created_at: string;
}

type AdminTab =
  | "maintenance"
  | "announcements"
  | "features"
  | "settings"
  | "leaderboard"
  | "users"
  | "articles"
  | "feedback";

export default function AdminPage() {
  const { user, initAuth } = useAuthStore();
  const { feedbacks, initFeedbacks, markAsReviewed, deleteFeedback } = useFeedbackStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("maintenance");
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "pending" | "reviewed">("all");

  // User management state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [owaspModalData, setOwaspModalData] = useState<{ email: string; tempPass: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Email update modal
  const [editingUserEmail, setEditingUserEmail] = useState<ManagedUser | null>(null);
  const [newEmailInput, setNewEmailInput] = useState("");

  // Articles state
  const [articles, setArticles] = useState([
    {
      id: "art-1",
      title: "The Global Shift to Renewable Energy and Sustainable Development",
      domain: "theguardian.com",
      lexicalLevel: "Academic",
      wordCount: 185,
    },
    {
      id: "art-2",
      title: "Artificial Intelligence and the Future of Higher Education",
      domain: "economist.com",
      lexicalLevel: "Academic",
      wordCount: 194,
    },
    {
      id: "art-3",
      title: "Urbanization, Housing Shortages, and Transit-Oriented Infrastructure",
      domain: "bbc.com",
      lexicalLevel: "C1",
      wordCount: 172,
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newText, setNewText] = useState("");

  useEffect(() => {
    initAuth();
    initFeedbacks();
    fetchUsers();
  }, [initAuth, initFeedbacks]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setManagedUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  };

  const handleResetPasswordOwasp = async (targetUser: ManagedUser) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          userId: targetUser.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.temporaryPassword) {
        setOwaspModalData({
          email: targetUser.email,
          tempPass: data.temporaryPassword,
        });
        setCopiedPass(false);
      }
    } catch (e) {
      console.error("Failed to reset password:", e);
    }
  };

  const handleToggleBan = async (targetUser: ManagedUser) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_ban",
          userId: targetUser.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setManagedUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: data.isActive } : u))
        );
      }
    } catch (e) {
      console.error("Failed to toggle ban:", e);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserEmail || !newEmailInput.trim()) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_email",
          userId: editingUserEmail.id,
          newEmail: newEmailInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setManagedUsers((prev) =>
          prev.map((u) =>
            u.id === editingUserEmail.id ? { ...u, email: newEmailInput.trim() } : u
          )
        );
        setEditingUserEmail(null);
        setNewEmailInput("");
      }
    } catch (e) {
      console.error("Failed to update email:", e);
    }
  };

  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const words = newText.trim().split(/\s+/).length;
    setArticles((prev) => [
      {
        id: "art-" + Date.now(),
        title: newTitle.trim(),
        domain: newDomain.trim() || "academic-source.org",
        lexicalLevel: "Academic",
        wordCount: words,
      },
      ...prev,
    ]);

    setNewTitle("");
    setNewDomain("");
    setNewText("");
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (feedbackFilter === "pending") return f.status === "pending";
    if (feedbackFilter === "reviewed") return f.status === "reviewed";
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Access Status Header */}
        <div className="bg-surface border border-surface-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100 font-mono">
                  {user?.username || "super_admin"}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SUPER ADMIN RBAC
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Bảo vệ bởi Server-Side RBAC Middleware và Supabase Service Role API.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SESSION SECURED</span>
          </div>
        </div>

        {/* High-level KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Hòm Thư Góp Ý
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-400 font-mono">
                {feedbacks.length}
              </span>
              <span className="text-xs text-zinc-500">
                ({feedbacks.filter((f) => f.status === "pending").length} chờ duyệt)
              </span>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Bài Báo Kho Dữ Liệu
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                {articles.length}
              </span>
              <span className="text-xs text-zinc-500">sẵn sàng</span>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Tài Khoản Học Viên
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400 font-mono">
                {managedUsers.length}
              </span>
              <span className="text-xs text-zinc-500">đang quản lý</span>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Target Band TB
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-300 font-mono">
                7.5
              </span>
              <span className="text-xs text-zinc-400">IELTS Writing</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-surface-border pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("maintenance")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "maintenance"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Bảo Trì Máy Chủ</span>
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "announcements"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Trung Tâm Thông Báo</span>
          </button>

          <button
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "features"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Công Tắc Tính Năng</span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "leaderboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Can Thiệp BXH</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài Đặt Hệ Thống</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Người Dùng ({managedUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "articles"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bài Báo ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "feedback"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Góp Ý ({feedbacks.length})</span>
          </button>
        </div>

        {/* TAB: MAINTENANCE COMMAND CONSOLE */}
        {activeTab === "maintenance" && <MaintenanceConsole />}

        {/* TAB: SYSTEM ANNOUNCEMENT CENTER */}
        {activeTab === "announcements" && <AnnouncementManager />}

        {/* TAB: MASTER FEATURE FLAGS */}
        {activeTab === "features" && <FeatureFlagsManager />}

        {/* TAB: LEADERBOARD OVERRIDE */}
        {activeTab === "leaderboard" && <LeaderboardManager />}

        {/* TAB: GENERAL SETTINGS */}
        {activeTab === "settings" && <GeneralSettingsManager />}

        {/* TAB: FEEDBACK INBOX */}
        {activeTab === "feedback" && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs">
                <button
                  onClick={() => setFeedbackFilter("all")}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    feedbackFilter === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Tất cả ({feedbacks.length})
                </button>
                <button
                  onClick={() => setFeedbackFilter("pending")}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    feedbackFilter === "pending" ? "bg-amber-950/60 text-amber-300" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Chờ xử lý ({feedbacks.filter((f) => f.status === "pending").length})
                </button>
                <button
                  onClick={() => setFeedbackFilter("reviewed")}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    feedbackFilter === "reviewed" ? "bg-emerald-950/60 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Đã ghi nhận ({feedbacks.filter((f) => f.status === "reviewed").length})
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {filteredFeedbacks.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs bg-surface border border-surface-border rounded-xl">
                  Không có góp ý nào trong danh mục này.
                </div>
              ) : (
                filteredFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface border border-surface-border rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-md transition-all hover:border-zinc-700"
                  >
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {item.category}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                            item.status === "reviewed"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                              : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                          }`}
                        >
                          {item.status === "reviewed" ? "ĐÃ GHI NHẬN" : "CHỜ XỬ LÝ"}
                        </span>

                        <span className="text-xs text-zinc-400">
                          Người gửi: <strong className="text-zinc-200">{item.senderName || "Ẩn danh"}</strong>
                        </span>

                        <span className="text-xs text-zinc-500 font-mono ml-auto sm:ml-0">
                          {item.createdAt}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-200 leading-relaxed font-sans bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {item.status === "pending" && (
                        <button
                          onClick={() => markAsReviewed(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Duyệt</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteFeedback(item.id)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* TAB 2: ARTICLES MANAGEMENT */}
        {activeTab === "articles" && (
          <section className="flex flex-col gap-6">
            <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-100">Nạp Bài Báo Mới Vào Thư Viện</h3>
              </div>

              <form onSubmit={handleAddArticle} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">Tiêu đề bài báo</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ví dụ: Climate Governance and Sustainable Energy Policies"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Tên miền nguồn</label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="theguardian.com, economist.com..."
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Cấp độ học thuật</label>
                  <select className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer">
                    <option value="Academic">Academic (Band 7.5+)</option>
                    <option value="C1">C1 Advanced</option>
                    <option value="C2">C2 Proficiency</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">Nội dung bài viết sạch</label>
                  <textarea
                    required
                    rows={4}
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Dán đoạn văn bản cần đưa vào thư viện luyện gõ..."
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Xuất Bản Bài Này</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-base font-bold text-zinc-100">Danh Sách Bài Báo Hiện Có</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase font-semibold">
                      <th className="py-3 px-3">Tiêu đề bài báo</th>
                      <th className="py-3 px-3">Nguồn</th>
                      <th className="py-3 px-3 font-mono">Độ dài</th>
                      <th className="py-3 px-3 font-mono">Cấp độ</th>
                      <th className="py-3 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300 text-xs">
                    {articles.map((art) => (
                      <tr key={art.id} className="hover:bg-zinc-850/50">
                        <td className="py-3.5 px-3 font-medium text-zinc-100 max-w-sm truncate">
                          {art.title}
                        </td>
                        <td className="py-3.5 px-3 text-zinc-400 font-mono">
                          {art.domain}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-zinc-300">
                          {art.wordCount} từ
                        </td>
                        <td className="py-3.5 px-3 font-mono text-amber-400">
                          {art.lexicalLevel}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setArticles((prev) => prev.filter((a) => a.id !== art.id))}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
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
          </section>
        )}

        {/* TAB 3: USERS & RBAC SERVER-SIDE MANAGEMENT */}
        {activeTab === "users" && (
          <section className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Quản Lý Học Viên & Quyền Super Admin</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Thao tác bảo mật: Cấp lại mật khẩu chuẩn OWASP, thay đổi email và khóa tài khoản học viên.
                </p>
              </div>
              <button
                onClick={fetchUsers}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead>
                  <tr className="border-b border-surface-border text-xs text-zinc-400 uppercase font-semibold">
                    <th className="py-3 px-3">Học viên</th>
                    <th className="py-3 px-3">Email hệ thống</th>
                    <th className="py-3 px-3 font-mono">Vai trò (RBAC)</th>
                    <th className="py-3 px-3 font-mono">Mục tiêu</th>
                    <th className="py-3 px-3 font-mono">Phiên gõ</th>
                    <th className="py-3 px-3 font-mono">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Tác vụ Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-zinc-300 text-xs">
                  {managedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-foreground">{u.display_name}</div>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {u.id}</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-zinc-300">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={u.role}
                          onChange={async (e) => {
                            const newRole = e.target.value as "super_admin" | "admin" | "user";
                            await fetch("/api/admin/users", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "change_role", userId: u.id, role: newRole }),
                            });
                            setManagedUsers((prev) =>
                              prev.map((usr) => (usr.id === u.id ? { ...usr, role: newRole } : usr))
                            );
                          }}
                          className="bg-surface-elevated border border-surface-border rounded-lg px-2 py-1 text-xs font-mono font-semibold cursor-pointer text-indigo-400"
                        >
                          <option value="user">Member</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={u.target_band}
                          onChange={async (e) => {
                            const newBand = Number(e.target.value);
                            await fetch("/api/admin/users", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "change_band", userId: u.id, targetBand: newBand }),
                            });
                            setManagedUsers((prev) =>
                              prev.map((usr) => (usr.id === u.id ? { ...usr, target_band: newBand } : usr))
                            );
                          }}
                          className="bg-surface-elevated border border-surface-border rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-400 cursor-pointer"
                        >
                          {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                            <option key={b} value={b}>Band {b.toFixed(1)}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-zinc-300">
                        {u.total_sessions_completed} bài
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            u.is_active
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                              : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                          }`}
                        >
                          {u.is_active ? "HOẠT ĐỘNG" : "ĐÃ KHÓA"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* OWASP Password Reset Button */}
                          <button
                            onClick={() => handleResetPasswordOwasp(u)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/40 transition-colors cursor-pointer"
                            title="Cấp lại mật khẩu đạt chuẩn OWASP (14+ ký tự)"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Update Email Button */}
                          <button
                            onClick={() => {
                              setEditingUserEmail(u);
                              setNewEmailInput(u.email);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-indigo-400 border border-zinc-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
                            title="Đổi địa chỉ email học viên"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* Lock / Unlock Account Button */}
                          <button
                            onClick={() => handleToggleBan(u)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              u.is_active
                                ? "bg-zinc-900 hover:bg-rose-950/50 text-zinc-300 hover:text-rose-400 border-zinc-800 hover:border-rose-800"
                                : "bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900"
                            }`}
                            title={u.is_active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* OWASP Generated Password Modal */}
            {owaspModalData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <KeyRound className="w-6 h-6" />
                    <h4 className="text-base font-bold text-zinc-100">
                      Mật Khẩu Mới Đạt Chuẩn OWASP
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Đã cấp phát mật khẩu ngẫu nhiên độ an toàn cao (chứa chữ hoa, chữ thường, số và ký tự đặc biệt) cho học viên{" "}
                    <strong className="text-zinc-200">{owaspModalData.email}</strong>:
                  </p>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-emerald-300 tracking-wider font-bold select-all break-all">
                      {owaspModalData.tempPass}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(owaspModalData.tempPass);
                        setCopiedPass(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedPass ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => setOwaspModalData(null)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Đã lưu & Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Email Modal */}
            {editingUserEmail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Mail className="w-6 h-6" />
                    <h4 className="text-base font-bold text-zinc-100">
                      Cập Nhật Email Học Viên
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Cập nhật địa chỉ email cho học viên{" "}
                    <strong className="text-zinc-200">{editingUserEmail.display_name}</strong> và đồng bộ sang Supabase Auth:
                  </p>

                  <form onSubmit={handleUpdateEmail} className="flex flex-col gap-3">
                    <input
                      type="email"
                      required
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="email_moi@academic.edu.vn"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingUserEmail(null)}
                        className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:bg-zinc-800 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Lưu Email Mới
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
