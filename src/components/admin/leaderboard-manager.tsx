"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Crown,
  Medal,
  RotateCcw,
  Trash2,
  Edit2,
  CheckCircle,
  X,
  Pin,
  ArrowUp,
  ArrowDown,
  Calendar,
  Zap,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { LeaderboardScholar } from "@/app/api/leaderboard/route";

const WEEKS_LIST = Array.from({ length: 52 }, (_, i) => `Tuần ${i + 1} / 2026`);

export const LeaderboardManager: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardScholar[]>([]);
  const [activeSystemWeek, setActiveSystemWeek] = useState("Tuần 41 / 2026");
  const [selectedWeek, setSelectedWeek] = useState("Tuần 41 / 2026");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isInstantSyncing, setIsInstantSyncing] = useState(false);

  // Edit Score Modal
  const [editingScholar, setEditingScholar] = useState<LeaderboardScholar | null>(null);
  const [overrideWpm, setOverrideWpm] = useState(0);
  const [overrideAcc, setOverrideAcc] = useState(0);
  const [overrideWords, setOverrideWords] = useState(0);

  // Add Scholar Modal
  const [isAddScholarModalOpen, setIsAddScholarModalOpen] = useState(false);
  const [newScholarName, setNewScholarName] = useState("");
  const [newScholarEmail, setNewScholarEmail] = useState("");
  const [newScholarBand, setNewScholarBand] = useState(7.5);
  const [newScholarWpm, setNewScholarWpm] = useState(70);
  const [newScholarAcc, setNewScholarAcc] = useState(97.0);
  const [newScholarWords, setNewScholarWords] = useState(4500);

  useEffect(() => {
    fetchLeaderboard(selectedWeek);
  }, [selectedWeek]);

  const fetchLeaderboard = async (targetWeek: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/leaderboard?week=${encodeURIComponent(targetWeek)}&_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        if (data.cohort_week) setActiveSystemWeek(data.cohort_week);
        if (data.selected_week) setSelectedWeek(data.selected_week);
      }
    } catch (e) {
      console.error("Fetch admin leaderboard error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAsCurrentWeek = async () => {
    try {
      setIsInstantSyncing(true);
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_current_week",
          week: selectedWeek,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveSystemWeek(selectedWeek);
        if (Array.isArray(data.leaderboard)) setLeaderboard(data.leaderboard);
        setMessage(`Đã thiết lập ${selectedWeek} làm tuần hiện tại của toàn hệ thống! Bảng xếp hạng công khai đã đồng bộ tức thì.`);
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (e) {
      console.error("Set current week error:", e);
    } finally {
      setIsInstantSyncing(false);
    }
  };

  const handleInstantApply = async () => {
    try {
      setIsInstantSyncing(true);
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "instant_apply",
          week: selectedWeek,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveSystemWeek(selectedWeek);
        setMessage(`Bảng xếp hạng ${selectedWeek} đã được áp dụng ngay lập tức cho toàn thể học viên!`);
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (e) {
      console.error("Instant apply error:", e);
    } finally {
      setIsInstantSyncing(false);
    }
  };

  const handleOpenEdit = (scholar: LeaderboardScholar) => {
    setEditingScholar(scholar);
    setOverrideWpm(scholar.avg_net_wpm);
    setOverrideAcc(scholar.avg_accuracy);
    setOverrideWords(scholar.weekly_words);
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScholar) return;

    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "override_score",
          week: selectedWeek,
          userId: editingScholar.id,
          newWpm: overrideWpm,
          newAccuracy: overrideAcc,
          newWords: overrideWords,
        }),
      });

      const data = await res.json();
      if (data.success && data.entry) {
        setLeaderboard((prev) =>
          prev.map((s) => (s.id === editingScholar.id ? data.entry : s))
        );
        setMessage(`Đã cập nhật điểm số cho ${editingScholar.display_name} trên ${selectedWeek}. Thay đổi có hiệu lực ngay lập tức!`);
        setEditingScholar(null);
        setTimeout(() => setMessage(""), 3500);
      }
    } catch (e) {
      console.error("Override score error:", e);
    }
  };

  const handleChangeRank = async (scholar: LeaderboardScholar, targetRank: number) => {
    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_rank",
          week: selectedWeek,
          userId: scholar.id,
          targetRank,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        setMessage(`Đã chuyển ${scholar.display_name} sang Hạng ${targetRank} trên ${selectedWeek}. Áp dụng tức thì!`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      console.error("Change rank error:", e);
    }
  };

  const handleDeleteSession = async (scholar: LeaderboardScholar) => {
    if (!confirm(`Xác nhận xóa bản ghi của ${scholar.display_name} khỏi ${selectedWeek}?`)) return;

    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_session",
          week: selectedWeek,
          userId: scholar.id,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        setMessage(`Đã xóa bản ghi của ${scholar.display_name} khỏi ${selectedWeek}.`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      console.error("Delete session error:", e);
    }
  };

  const handleAddScholar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_scholar",
          week: selectedWeek,
          scholarName: newScholarName,
          scholarEmail: newScholarEmail,
          scholarBand: newScholarBand,
          newWpm: newScholarWpm,
          newAccuracy: newScholarAcc,
          newWords: newScholarWords,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        setMessage(`Đã thêm ${newScholarName} vào ${selectedWeek} thành công!`);
        setIsAddScholarModalOpen(false);
        setNewScholarName("");
        setNewScholarEmail("");
        setTimeout(() => setMessage(""), 3500);
      }
    } catch (e) {
      console.error("Add scholar error:", e);
    }
  };

  const handleNavigateWeek = (direction: "prev" | "next") => {
    const currentIndex = WEEKS_LIST.indexOf(selectedWeek);
    if (direction === "prev" && currentIndex > 0) {
      setSelectedWeek(WEEKS_LIST[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < WEEKS_LIST.length - 1) {
      setSelectedWeek(WEEKS_LIST[currentIndex + 1]);
    }
  };

  const isCurrentActive = selectedWeek === activeSystemWeek;

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. THANH TÙY CHỌN TUẦN & THAO TÁC ÁP DỤNG NGAY LẬP TỨC */}
      <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Week Selector option bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Chọn Tuần Quản Trị:</span>
            </div>

            {/* Quick Prev Button */}
            <button
              onClick={() => handleNavigateWeek("prev")}
              disabled={WEEKS_LIST.indexOf(selectedWeek) === 0}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Lùi về tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dropdown Select Week */}
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
            >
              {WEEKS_LIST.map((w) => (
                <option key={w} value={w}>
                  {w} {w === activeSystemWeek ? "★ [TUẦN HIỆN TẠI]" : ""}
                </option>
              ))}
            </select>

            {/* Quick Next Button */}
            <button
              onClick={() => handleNavigateWeek("next")}
              disabled={WEEKS_LIST.indexOf(selectedWeek) === WEEKS_LIST.length - 1}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Tiến tới tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Status Indicator */}
            {isCurrentActive ? (
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Đang Kích Hoạt Toàn Hệ Thống
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-zinc-700">
                Chế độ xem tuần phụ (Hệ thống: {activeSystemWeek})
              </span>
            )}
          </div>

          {/* Action Buttons: Set as current & Instant Sync */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSetAsCurrentWeek}
              disabled={isInstantSyncing || isCurrentActive}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-500 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Đặt tuần này làm tuần chính thức của toàn hệ thống (có thể tiến hoặc lùi thoải mái)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thiết Lập Làm Tuần Hiện Tại</span>
            </button>

            <button
              onClick={handleInstantApply}
              disabled={isInstantSyncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
              title="Đồng bộ ngay lập tức BXH tuần này ra trang công khai cho toàn thể học viên"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Áp Dụng Thay Đổi Ngay Lập Tức</span>
            </button>

            <button
              onClick={() => setIsAddScholarModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Thêm Học Viên</span>
            </button>
          </div>
        </div>

        {/* Live sync note */}
        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>
            {isCurrentActive
              ? "Mọi can thiệp điểm số, hoán đổi thứ hạng trên tuần này sẽ hiển thị NGAY LẬP TỨC trên Bảng Xếp Hạng công khai của toàn bộ học viên."
              : `Bạn đang chỉnh sửa dữ liệu của ${selectedWeek}. Bấm 'Thiết Lập Làm Tuần Hiện Tại' hoặc 'Áp Dụng Thay Đổi Ngay Lập Tức' để kích hoạt ra trang công khai.`}
          </span>
        </div>
      </div>

      {/* 2. LEADERBOARD TABLE */}
      <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-50 dark:bg-surface-elevated border-b border-slate-200 dark:border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Danh Sách Học Viên Bảng Xếp Hạng ({selectedWeek})
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
              {leaderboard.length} học viên
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 dark:text-zinc-500 font-mono text-xs">
            Đang tải dữ liệu bảng xếp hạng {selectedWeek}...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-surface-border text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Hạng</th>
                  <th className="py-3 px-4">Học Viên</th>
                  <th className="py-3 px-4 font-mono">Target Band</th>
                  <th className="py-3 px-4 font-mono">Net WPM</th>
                  <th className="py-3 px-4 font-mono">Accuracy</th>
                  <th className="py-3 px-4 font-mono">Từ Đã Gõ</th>
                  <th className="py-3 px-4 font-mono">Phiên</th>
                  <th className="py-3 px-4 text-right">Tác Vụ Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-border text-slate-700 dark:text-zinc-300">
                {leaderboard.map((scholar) => {
                  const isTop1 = scholar.rank === 1;
                  return (
                    <tr key={scholar.id} className="hover:bg-slate-50 dark:hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          {scholar.rank === 1 ? (
                            <Crown className="w-4 h-4 text-amber-500" />
                          ) : scholar.rank === 2 ? (
                            <Medal className="w-4 h-4 text-slate-400 dark:text-zinc-300" />
                          ) : scholar.rank === 3 ? (
                            <Medal className="w-4 h-4 text-amber-700 dark:text-amber-600" />
                          ) : null}
                          <span className={scholar.rank <= 3 ? "text-indigo-600 dark:text-indigo-400" : ""}>
                            #{scholar.rank}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-zinc-100">{scholar.display_name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{scholar.email}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        Band {scholar.target_band.toFixed(1)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {scholar.avg_net_wpm} WPM
                      </td>

                      <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {scholar.avg_accuracy}%
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-zinc-300">
                        {scholar.weekly_words.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-zinc-400">
                        {scholar.sessions_completed} bài
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pin Top 1 */}
                          {!isTop1 && (
                            <button
                              onClick={() => handleChangeRank(scholar, 1)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-surface-elevated text-slate-500 dark:text-zinc-400 hover:text-amber-500 border border-slate-200 dark:border-surface-border transition-colors cursor-pointer"
                              title="Ghim lên Top 1"
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Move Up */}
                          {scholar.rank > 1 && (
                            <button
                              onClick={() => handleChangeRank(scholar, scholar.rank - 1)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-surface-elevated text-slate-500 dark:text-zinc-400 hover:text-indigo-500 border border-slate-200 dark:border-surface-border transition-colors cursor-pointer"
                              title="Nâng hạng (+1)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Move Down */}
                          {scholar.rank < leaderboard.length && (
                            <button
                              onClick={() => handleChangeRank(scholar, scholar.rank + 1)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-surface-elevated text-slate-500 dark:text-zinc-400 hover:text-indigo-500 border border-slate-200 dark:border-surface-border transition-colors cursor-pointer"
                              title="Hạ hạng (-1)"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Score */}
                          <button
                            onClick={() => handleOpenEdit(scholar)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-surface-elevated text-slate-500 dark:text-zinc-400 hover:text-indigo-500 border border-slate-200 dark:border-surface-border transition-colors cursor-pointer"
                            title="Chỉnh sửa trực tiếp điểm số & WPM"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Session / Entry */}
                          <button
                            onClick={() => handleDeleteSession(scholar)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-surface-elevated dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 border border-slate-200 dark:border-surface-border transition-colors cursor-pointer"
                            title="Xóa học viên khỏi tuần này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. MODAL: CHỈNH SỬA ĐIỂM SỐ TRỰC TIẾP */}
      {editingScholar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 text-slate-900 dark:text-zinc-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                <h4 className="text-base font-bold">
                  Chỉnh Sửa Điểm Số ({selectedWeek})
                </h4>
              </div>
              <button
                onClick={() => setEditingScholar(null)}
                className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Can thiệp trực tiếp điểm số của học viên{" "}
              <strong className="text-slate-900 dark:text-zinc-200">{editingScholar.display_name}</strong>. Cập nhật sẽ áp dụng tức thì lên BXH.
            </p>

            <form onSubmit={handleSaveScore} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Tốc độ Net WPM:
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  max={160}
                  value={overrideWpm}
                  onChange={(e) => setOverrideWpm(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Độ chính xác Accuracy (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min={50}
                  max={100}
                  value={overrideAcc}
                  onChange={(e) => setOverrideAcc(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Tổng số từ đã gõ trong tuần:
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={overrideWords}
                  onChange={(e) => setOverrideWords(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingScholar(null)}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Lưu & Áp Dụng Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: THÊM HỌC VIÊN MỚI VÀO TUẦN ĐANG CHỌN */}
      {isAddScholarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface border border-slate-300 dark:border-surface-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 text-slate-900 dark:text-zinc-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <h4 className="text-base font-bold">
                  Thêm Học Viên Vào {selectedWeek}
                </h4>
              </div>
              <button
                onClick={() => setIsAddScholarModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddScholar} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Tên hiển thị học viên:
                </label>
                <input
                  type="text"
                  required
                  value={newScholarName}
                  onChange={(e) => setNewScholarName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Long IELTS 8.0"
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Email học viên:
                </label>
                <input
                  type="email"
                  value={newScholarEmail}
                  onChange={(e) => setNewScholarEmail(e.target.value)}
                  placeholder="hoanglong@academic.edu.vn"
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Target Band:
                  </label>
                  <select
                    value={newScholarBand}
                    onChange={(e) => setNewScholarBand(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-amber-500 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                      <option key={b} value={b}>Band {b.toFixed(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Net WPM:
                  </label>
                  <input
                    type="number"
                    required
                    value={newScholarWpm}
                    onChange={(e) => setNewScholarWpm(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Độ chính xác (%):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newScholarAcc}
                    onChange={(e) => setNewScholarAcc(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Số từ trong tuần:
                  </label>
                  <input
                    type="number"
                    required
                    value={newScholarWords}
                    onChange={(e) => setNewScholarWords(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddScholarModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Thêm Vào BXH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
