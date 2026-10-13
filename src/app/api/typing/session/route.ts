import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateSessionNonce,
  verifySessionNonce,
  validateKeystrokeTelemetry,
} from "@/lib/security/anti-cheat";
import { z } from "zod";

const sessionSchema = z.object({
  userId: z.string().min(1, "User ID bắt buộc"),
  netWpm: z.number().min(0),
  wpm: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  timeSpentSeconds: z.number().min(0),
  errorCount: z.number().min(0).default(0),
  completedWords: z.number().min(0),
  totalKeystrokes: z.number().min(0).optional(),
  completedChars: z.number().min(0).optional(),
  expectedChars: z.number().min(0).optional(),
  nonce: z.string().optional(),
  keyErrorsSummary: z.record(z.string(), z.number()).optional().default({}),
  articleId: z.string().optional().nullable(),
});

declare global {
  var __gotyping_user_sessions: Record<string, Record<string, unknown>[]> | undefined;
}

function getUserSessions(userId: string): Record<string, unknown>[] {
  if (!globalThis.__gotyping_user_sessions) {
    globalThis.__gotyping_user_sessions = {};
  }
  if (!globalThis.__gotyping_user_sessions[userId]) {
    globalThis.__gotyping_user_sessions[userId] = [];
  }
  return globalThis.__gotyping_user_sessions[userId];
}

/**
 * GET: Issues cryptographically signed anti-replay session nonce or lists user sessions
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");

  if (action === "nonce") {
    const targetUserId = userId || "guest";
    const articleId = searchParams.get("articleId");
    const nonce = generateSessionNonce(targetUserId, articleId);

    return NextResponse.json({
      success: true,
      nonce,
      timestamp: Date.now(),
    });
  }

  if (userId) {
    const sessions = getUserSessions(userId);
    return NextResponse.json({
      success: true,
      sessions,
    });
  }

  return NextResponse.json(
    { success: false, error: "Action hoặc userId không hợp lệ." },
    { status: 400 }
  );
}

/**
 * POST: Submits and persists typing session with strict anti-cheat verification
 */
export async function POST(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get("gotyping_role")?.value;
    const body = await req.json();
    const parsed = sessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu phiên không hợp lệ." },
        { status: 400 }
      );
    }

    const {
      userId,
      netWpm,
      wpm,
      accuracy,
      timeSpentSeconds,
      errorCount,
      completedWords,
      totalKeystrokes,
      completedChars,
      expectedChars,
      nonce,
      keyErrorsSummary,
      articleId,
    } = parsed.data;

    // 1. Session Nonce Verification (Replay Attack Defense)
    if (nonce) {
      const nonceCheck = verifySessionNonce(nonce, userId, articleId);
      if (!nonceCheck.valid) {
        console.warn("[SECURITY_AUDIT_LOG] Nonce verification failed", {
          timestamp: new Date().toISOString(),
          userId,
          reason: nonceCheck.reason,
        });
        return NextResponse.json(
          { success: false, error: nonceCheck.reason || "Xác thực phiên làm việc thất bại." },
          { status: 403 }
        );
      }
    }

    // 2. Keystroke Telemetry & Human Physiological Limit Validation
    const telemetryCheck = validateKeystrokeTelemetry({
      netWpm,
      grossWpm: wpm,
      accuracy,
      durationSeconds: timeSpentSeconds,
      totalKeystrokes: totalKeystrokes ?? completedWords * 5,
      completedChars: completedChars ?? completedWords * 5,
      errorKeystrokes: errorCount,
      expectedChars,
    });

    if (!telemetryCheck.valid) {
      console.warn("[SECURITY_AUDIT_LOG] Anti-cheat telemetry flagged anomaly", {
        timestamp: new Date().toISOString(),
        userId,
        netWpm,
        durationSeconds: timeSpentSeconds,
        reason: telemetryCheck.reason,
        code: telemetryCheck.code,
      });

      return NextResponse.json(
        {
          success: false,
          cheat_flagged: true,
          code: telemetryCheck.code,
          error: telemetryCheck.reason || "Dữ liệu phiên gõ không vượt qua kiểm định tính hợp lệ.",
        },
        { status: 422 }
      );
    }

    // Check if user is guest
    if (!userId || userId === "guest" || !roleCookie) {
      return NextResponse.json(
        {
          success: false,
          error: "Guest sessions are restricted from server persistence to optimize resources.",
        },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    const client = supabase as unknown as {
      from: (table: string) => {
        insert: (data: unknown) => {
          select: () => {
            single: () => Promise<{ data: unknown; error: { message: string } | null }>;
          };
        };
      };
    };

    // 3. Persist valid session
    const payload = {
      user_id: userId,
      article_id: articleId || null,
      wpm: Math.round(wpm),
      net_wpm: Math.round(netWpm),
      accuracy: Number(accuracy.toFixed(2)),
      time_spent_seconds: Math.round(timeSpentSeconds),
      error_count: errorCount,
      completed_words: completedWords,
      key_errors_summary: keyErrorsSummary,
    };

    const sessionRecord = {
      id: "sess-" + Date.now(),
      user_id: userId,
      net_wpm: Math.round(netWpm),
      wpm: Math.round(wpm),
      accuracy: Number(accuracy.toFixed(2)),
      completed_words: completedWords,
      time_spent_seconds: Math.round(timeSpentSeconds),
      error_count: errorCount,
      key_errors_summary: keyErrorsSummary,
      created_at: new Date().toISOString(),
    };
    getUserSessions(userId).unshift(sessionRecord);

    const { data, error } = await client
      .from("typing_sessions")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("[SECURITY_AUDIT_LOG] Supabase insert session fallback:", error.message);
      return NextResponse.json({
        success: true,
        persisted: false,
        message: "Phiên gõ đã được ghi nhận an toàn vào bộ nhớ tạm.",
        session: sessionRecord,
      });
    }

    return NextResponse.json({
      success: true,
      persisted: true,
      message: "Đồng bộ kết quả phiên gõ học thuật thành công.",
      session: data || sessionRecord,
    });
  } catch (err: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/typing/session",
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ khi đồng bộ phiên gõ." },
      { status: 500 }
    );
  }
}
