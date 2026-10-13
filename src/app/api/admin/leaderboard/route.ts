import { NextRequest, NextResponse } from "next/server";
import { LeaderboardScholar } from "@/app/api/leaderboard/route";
import { isAuthorizedSuperAdmin } from "@/lib/auth/guards";

declare global {
  var __gotyping_admin_leaderboard: LeaderboardScholar[] | undefined;
  var __gotyping_cohort_week: string | undefined;
  var __gotyping_weekly_leaderboards: Record<string, LeaderboardScholar[]> | undefined;
}

const INITIAL_SCHOLARS: LeaderboardScholar[] = [
  {
    rank: 1,
    id: "usr-top-01",
    display_name: "Hoàng Nam IELTS 8.5",
    email: "hoangnam_scholar@oxford.edu",
    avatar_url: null,
    target_band: 8.5,
    weekly_words: 6420,
    avg_net_wpm: 84,
    avg_accuracy: 98.8,
    sessions_completed: 38,
    weekly_saved_vocab: 45,
    badge: "gold",
  },
  {
    rank: 2,
    id: "usr-top-02",
    display_name: "Thảo Vy (C2 Reflex)",
    email: "thaovy_lexical@cambridge.org",
    avatar_url: null,
    target_band: 8.0,
    weekly_words: 5890,
    avg_net_wpm: 79,
    avg_accuracy: 97.9,
    sessions_completed: 32,
    weekly_saved_vocab: 38,
    badge: "silver",
  },
  {
    rank: 3,
    id: "usr-top-03",
    display_name: "Minh Đăng Academic",
    email: "dang_minh_ielts@academic.edu.vn",
    avatar_url: null,
    target_band: 8.0,
    weekly_words: 5120,
    avg_net_wpm: 76,
    avg_accuracy: 97.4,
    sessions_completed: 29,
    weekly_saved_vocab: 31,
    badge: "bronze",
  },
  {
    rank: 4,
    id: "usr-top-04",
    display_name: "Lê Thu Hà",
    email: "ha_thu_le@gmail.com",
    avatar_url: null,
    target_band: 7.5,
    weekly_words: 4680,
    avg_net_wpm: 71,
    avg_accuracy: 96.5,
    sessions_completed: 24,
    weekly_saved_vocab: 27,
    badge: "top10",
  },
  {
    rank: 5,
    id: "usr-top-05",
    display_name: "Quốc Bảo Writer",
    email: "bao_quoc@outlook.com",
    avatar_url: null,
    target_band: 7.5,
    weekly_words: 4150,
    avg_net_wpm: 68,
    avg_accuracy: 96.0,
    sessions_completed: 22,
    weekly_saved_vocab: 23,
    badge: "top10",
  },
];

function getCohortWeek(): string {
  if (!globalThis.__gotyping_cohort_week) {
    globalThis.__gotyping_cohort_week = "Tuần 41 / 2026";
  }
  return globalThis.__gotyping_cohort_week!;
}

function getWeeklyLeaderboard(week: string): LeaderboardScholar[] {
  if (!globalThis.__gotyping_weekly_leaderboards) {
    globalThis.__gotyping_weekly_leaderboards = {};
  }
  if (!globalThis.__gotyping_weekly_leaderboards[week]) {
    const weekNum = parseInt(week.replace(/\D/g, "")) || 41;
    const diff = weekNum - 41;
    const seeded = INITIAL_SCHOLARS.map((s, idx) => ({
      ...s,
      weekly_words: Math.max(800, s.weekly_words + diff * 120 - idx * 40),
      avg_net_wpm: Math.max(35, s.avg_net_wpm + (diff % 4)),
      sessions_completed: Math.max(3, s.sessions_completed + (diff % 3)),
    }));
    globalThis.__gotyping_weekly_leaderboards[week] = seeded;
  }
  return globalThis.__gotyping_weekly_leaderboards[week];
}

function syncActiveLeaderboard(targetWeek?: string) {
  const currentWeek = targetWeek || getCohortWeek();
  const board = getWeeklyLeaderboard(currentWeek);
  globalThis.__gotyping_admin_leaderboard = board;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedSuperAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(req.url);
  const currentSystemWeek = getCohortWeek();
  const selectedWeek = searchParams.get("week") || currentSystemWeek;
  const leaderboard = getWeeklyLeaderboard(selectedWeek);

  return NextResponse.json({
    success: true,
    cohort_week: currentSystemWeek,
    selected_week: selectedWeek,
    leaderboard,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedSuperAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const {
      action,
      week,
      userId,
      newWpm,
      newAccuracy,
      newWords,
      targetRank,
      scholarName,
      scholarEmail,
      scholarBand,
    } = body;

    const currentActiveWeek = getCohortWeek();
    const targetWeek = week || currentActiveWeek;
    const leaderboard = getWeeklyLeaderboard(targetWeek);

    // 1. SET CURRENT ACTIVE WEEK (Advance or Rewind Arbitrarily)
    if (action === "set_current_week") {
      if (!week) {
        return NextResponse.json(
          { success: false, error: "Vui lòng chỉ định tuần cần kích hoạt." },
          { status: 400 }
        );
      }

      globalThis.__gotyping_cohort_week = week;
      syncActiveLeaderboard(week);

      return NextResponse.json({
        success: true,
        message: `Đã thiết lập ${week} làm tuần hiện tại của toàn hệ thống. Bảng xếp hạng công khai đã đồng bộ tức thì.`,
        cohort_week: week,
        selected_week: week,
        leaderboard: getWeeklyLeaderboard(week),
        instantApplied: true,
      });
    }

    // 2. OVERRIDE SCORE / WPM
    if (action === "override_score") {
      const entry = leaderboard.find((s) => s.id === userId);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy người dùng trên BXH tuần này." },
          { status: 404 }
        );
      }

      if (newWpm !== undefined) entry.avg_net_wpm = Number(newWpm);
      if (newAccuracy !== undefined) entry.avg_accuracy = Number(newAccuracy);
      if (newWords !== undefined) entry.weekly_words = Number(newWords);

      // Instant sync if modifying the active week
      if (targetWeek === currentActiveWeek) {
        syncActiveLeaderboard();
      }

      return NextResponse.json({
        success: true,
        message: `Đã can thiệp điểm số của ${entry.display_name} trên ${targetWeek} thành công. Áp dụng tức thì!`,
        entry,
        leaderboard,
        instantApplied: true,
      });
    }

    // 3. CHANGE RANK / MOVE UP / MOVE DOWN
    if (action === "change_rank") {
      const idx = leaderboard.findIndex((s) => s.id === userId);
      if (idx === -1) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy người dùng." },
          { status: 404 }
        );
      }

      const item = leaderboard.splice(idx, 1)[0];
      const targetIndex = Math.max(0, Math.min(leaderboard.length, Number(targetRank) - 1));
      leaderboard.splice(targetIndex, 0, item);

      // Re-assign ranks
      leaderboard.forEach((s, i) => {
        s.rank = i + 1;
        s.badge = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "top10";
      });

      if (targetWeek === currentActiveWeek) {
        syncActiveLeaderboard();
      }

      return NextResponse.json({
        success: true,
        message: `Đã chuyển ${item.display_name} sang Hạng ${targetRank} trên ${targetWeek}. Áp dụng tức thì!`,
        leaderboard,
        instantApplied: true,
      });
    }

    // 4. DELETE SCHOLAR / CHEAT ENTRY
    if (action === "delete_session") {
      const idx = leaderboard.findIndex((s) => s.id === userId);
      if (idx === -1) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy bản ghi." },
          { status: 404 }
        );
      }

      const removed = leaderboard.splice(idx, 1)[0];
      leaderboard.forEach((s, i) => {
        s.rank = i + 1;
        s.badge = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "top10";
      });

      if (targetWeek === currentActiveWeek) {
        syncActiveLeaderboard();
      }

      return NextResponse.json({
        success: true,
        message: `Đã xóa bản ghi của ${removed.display_name} khỏi ${targetWeek}. Áp dụng tức thì!`,
        leaderboard,
        instantApplied: true,
      });
    }

    // 5. ADD SCHOLAR TO WEEK
    if (action === "add_scholar") {
      if (!scholarName) {
        return NextResponse.json(
          { success: false, error: "Vui lòng nhập tên học viên." },
          { status: 400 }
        );
      }

      const newRank = leaderboard.length + 1;
      const newScholar: LeaderboardScholar = {
        rank: newRank,
        id: "usr-" + Date.now(),
        display_name: scholarName.trim(),
        email: scholarEmail?.trim() || `scholar_${Date.now()}@academic.edu`,
        avatar_url: null,
        target_band: Number(scholarBand) || 7.5,
        weekly_words: Number(newWords) || 3000,
        avg_net_wpm: Number(newWpm) || 60,
        avg_accuracy: Number(newAccuracy) || 96.0,
        sessions_completed: 10,
        weekly_saved_vocab: 15,
        badge: newRank === 1 ? "gold" : newRank === 2 ? "silver" : newRank === 3 ? "bronze" : "top10",
      };

      leaderboard.push(newScholar);

      if (targetWeek === currentActiveWeek) {
        syncActiveLeaderboard();
      }

      return NextResponse.json({
        success: true,
        message: `Đã thêm ${newScholar.display_name} vào BXH ${targetWeek}.`,
        leaderboard,
        instantApplied: true,
      });
    }

    // 6. INSTANT APPLY TO PUBLIC LEADERBOARD
    if (action === "instant_apply") {
      globalThis.__gotyping_cohort_week = targetWeek;
      syncActiveLeaderboard(targetWeek);

      return NextResponse.json({
        success: true,
        message: `Đã áp dụng ngay lập tức toàn bộ BXH ${targetWeek} lên giao diện công khai cho toàn thể học viên!`,
        cohort_week: targetWeek,
        leaderboard,
        instantApplied: true,
      });
    }

    // 7. LEGACY RESET WEEK (Now increments or creates new week)
    if (action === "reset_week") {
      const match = currentActiveWeek.match(/(\d+)/);
      const nextNum = match ? parseInt(match[1]) + 1 : 42;
      const nextWeek = `Tuần ${nextNum} / 2026`;
      globalThis.__gotyping_cohort_week = nextWeek;
      syncActiveLeaderboard(nextWeek);

      return NextResponse.json({
        success: true,
        message: `Đã chuyển sang ${nextWeek}.`,
        cohort_week: nextWeek,
        leaderboard: getWeeklyLeaderboard(nextWeek),
        instantApplied: true,
      });
    }

    return NextResponse.json(
      { success: false, error: "Hành động không xác định." },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/admin/leaderboard",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Lỗi nội bộ khi can thiệp BXH." },
      { status: 500 }
    );
  }
}
