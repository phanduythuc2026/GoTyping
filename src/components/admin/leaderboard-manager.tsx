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
} from "lucide-react";
import { LeaderboardScholar } from "@/app/api/leaderboard/route";

export const LeaderboardManager: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardScholar[]>([]);
  const [cohortWeek, setCohortWeek] = useState("Tuần 41 / 2026");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Edit Score Modal
  const [editingScholar, setEditingScholar] = useState<LeaderboardScholar | null>(null);
  const [overrideWpm, setOverrideWpm] = useState(0);
  const [overrideAcc, setOverrideAcc] = useState(0);
  const [overrideWords, setOverrideWords] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/admin/leaderboard");
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        if (data.cohort_week) setCohortWeek(data.cohort_week);
      }
    } catch (e) {
      console.error("Fetch admin leaderboard error:", e);
    } finally {
      setIsLoading(false);
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
        setMessage(`Đã cập nhật điểm số cho ${editingScholar.display_name}.`);
        setEditingScholar(null);
        setTimeout(() => setMessage(""), 3000);
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
          userId: scholar.id,
          targetRank,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        setMessage(`Đã chuyển ${scholar.display_name} sang Hạng ${targetRank}.`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      console.error("Change rank error:", e);
    }
  };

  const handleDeleteSession = async (scholar: LeaderboardScholar) => {
    if (!confirm(`Xác nhận xóa bản ghi gian lận của ${scholar.display_name}?`)) return;

    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_session",
          userId: scholar.id,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        setMessage(`Đã xóa bản ghi của ${scholar.display_name}.`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      console.error("Delete session error:", e);
    }
  };

  const handleResetWeek = async () => {
    if (!confirm("Cảnh báo: Bạn có chắc chắn muốn reset toàn bộ Bảng Xếp Hạng sang tuần mới?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_week",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.cohort_week) setCohortWeek(data.cohort_week);
        if (Array.isArray(data.leaderboard)) setLeaderboard(data.leaderboard);
        setMessage(data.message || "Đã reset BXH sang tuần mới.");
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (e) {
      console.error("Reset week error:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        Đang tải bảng xếp hạng...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage("")} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header bar with Reset Week button */}
      <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Can Thiệp Bảng Xếp Hạng ({cohortWeek})</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-400 border border-surface-border">
              {leaderboard.length} học viên
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Quyền năng Super Admin: Chỉnh sửa điểm số, thay đổi thứ hạng, xóa cheat và reset tuần.
          </p>
        </div>

        <button
          onClick={handleResetWeek}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-surface-border hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer shadow"
          title="Reset Bảng Xếp Hạng sang chu kỳ tuần mới"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sang Tuần Mới</span>
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated border-b border-surface-border text-zinc-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Hạng</th>
                <th className="py-3 px-4">Học Viên</th>
                <th className="py-3 px-4">Target Band</th>
                <th className="py-3 px-4">Net WPM</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Từ Đã Gõ</th>
                <th className="py-3 px-4 text-right">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-zinc-300">
              {leaderboard.map((scholar) => {
                const isTop1 = scholar.rank === 1;
                return (
                  <tr key={scholar.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold">
                      <div className="flex items-center gap-1.5">
                        {scholar.rank === 1 ? (
                          <Crown className="w-4 h-4 text-amber-400" />
                        ) : scholar.rank === 2 ? (
                          <Medal className="w-4 h-4 text-zinc-300" />
                        ) : scholar.rank === 3 ? (
                          <Medal className="w-4 h-4 text-amber-600" />
                        ) : null}
                        <span>#{scholar.rank}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{scholar.display_name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{scholar.email}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                      Band {scholar.target_band.toFixed(1)}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {scholar.avg_net_wpm} WPM
                    </td>

                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                      {scholar.avg_accuracy}%
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-300">
                      {scholar.weekly_words.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Pin Top 1 */}
                        {!isTop1 && (
                          <button
                            onClick={() => handleChangeRank(scholar, 1)}
                            className="p-1.5 rounded-lg bg-surface-elevated text-zinc-400 hover:text-amber-400 border border-surface-border transition-colors cursor-pointer"
                            title="Ghim lên Top 1"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Move Up */}
                        {scholar.rank > 1 && (
                          <button
                            onClick={() => handleChangeRank(scholar, scholar.rank - 1)}
                            className="p-1.5 rounded-lg bg-surface-elevated text-zinc-400 hover:text-indigo-400 border border-surface-border transition-colors cursor-pointer"
                            title="Nâng hạng (+1)"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Move Down */}
                        {scholar.rank < leaderboard.length && (
                          <button
                            onClick={() => handleChangeRank(scholar, scholar.rank + 1)}
                            className="p-1.5 rounded-lg bg-surface-elevated text-zinc-400 hover:text-indigo-400 border border-surface-border transition-colors cursor-pointer"
                            title="Hạ hạng (-1)"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Score */}
                        <button
                          onClick={() => handleOpenEdit(scholar)}
                          className="p-1.5 rounded-lg bg-surface-elevated text-zinc-400 hover:text-indigo-400 border border-surface-border transition-colors cursor-pointer"
                          title="Chỉnh sửa điểm số & WPM"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Cheat */}
                        <button
                          onClick={() => handleDeleteSession(scholar)}
                          className="p-1.5 rounded-lg bg-surface-elevated text-zinc-400 hover:text-rose-400 border border-surface-border transition-colors cursor-pointer"
                          title="Xóa phiên gian lận"
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
      </div>

      {/* Edit Score Modal */}
      {editingScholar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveScore}
            className="bg-surface border border-surface-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>Can Thiệp Điểm Số BXH</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingScholar(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-400">
              Đang chỉnh sửa cho: <strong className="text-foreground">{editingScholar.display_name}</strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Net WPM:</label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  value={overrideWpm}
                  onChange={(e) => setOverrideWpm(Number(e.target.value))}
                  className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Accuracy (%):</label>
                <input
                  type="number"
                  step="0.1"
                  min={10}
                  max={100}
                  value={overrideAcc}
                  onChange={(e) => setOverrideAcc(Number(e.target.value))}
                  className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Tổng từ gõ trong tuần:</label>
              <input
                type="number"
                min={0}
                value={overrideWords}
                onChange={(e) => setOverrideWords(Number(e.target.value))}
                className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setEditingScholar(null)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Lưu Can Thiệp</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
