import { NextRequest, NextResponse } from "next/server";
import { LeaderboardScholar } from "@/app/api/leaderboard/route";
import { isAuthorizedSuperAdmin } from "@/lib/auth/guards";

// In-memory persistent registry for leaderboard administration
declare global {
  var __gotyping_admin_leaderboard: LeaderboardScholar[] | undefined;
  var __gotyping_cohort_week: string | undefined;
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

function getAdminLeaderboard(): LeaderboardScholar[] {
  if (!globalThis.__gotyping_admin_leaderboard) {
    globalThis.__gotyping_admin_leaderboard = JSON.parse(JSON.stringify(INITIAL_SCHOLARS));
  }
  return globalThis.__gotyping_admin_leaderboard!;
}

function getCohortWeek(): string {
  if (!globalThis.__gotyping_cohort_week) {
    globalThis.__gotyping_cohort_week = "Tuần 41 / 2026";
  }
  return globalThis.__gotyping_cohort_week!;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedSuperAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    cohort_week: getCohortWeek(),
    leaderboard: getAdminLeaderboard(),
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
    const { action, userId, newWpm, newAccuracy, newWords, targetRank } = body;
    const leaderboard = getAdminLeaderboard();

    // 1. Direct Score / WPM Override
    if (action === "override_score") {
      const entry = leaderboard.find((s) => s.id === userId);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy người dùng trên BXH." },
          { status: 404 }
        );
      }

      if (newWpm !== undefined) entry.avg_net_wpm = Number(newWpm);
      if (newAccuracy !== undefined) entry.avg_accuracy = Number(newAccuracy);
      if (newWords !== undefined) entry.weekly_words = Number(newWords);

      return NextResponse.json({
        success: true,
        message: `Đã can thiệp điểm số của ${entry.display_name} thành công.`,
        entry,
      });
    }

    // 2. Change Rank / Pin Top 1
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

      return NextResponse.json({
        success: true,
        message: `Đã chuyển ${item.display_name} sang Hạng ${targetRank}.`,
        leaderboard,
      });
    }

    // 3. Delete Cheat Session / Entry
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

      return NextResponse.json({
        success: true,
        message: `Đã xóa phiên gõ gian lận của ${removed.display_name}.`,
        leaderboard,
      });
    }

    // 4. Reset Week
    if (action === "reset_week") {
      globalThis.__gotyping_cohort_week = `Tuần ${Math.floor(Math.random() * 10 + 42)} / 2026`;
      leaderboard.forEach((s) => {
        s.weekly_words = 0;
        s.sessions_completed = 0;
      });

      return NextResponse.json({
        success: true,
        message: `Đã đặt lại BXH cho ${globalThis.__gotyping_cohort_week}.`,
        cohort_week: globalThis.__gotyping_cohort_week,
        leaderboard,
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
