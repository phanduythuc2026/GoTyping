import crypto from "crypto";

const HMAC_SECRET =
  process.env.SESSION_SIGNING_SECRET ||
  process.env.SUPABASE_JWT_SECRET ||
  "gotyping_zero_trust_tamper_resistant_session_secret_2026";

// In-memory set of consumed nonces to prevent replay attacks
declare global {
  var __gotyping_consumed_nonces: Set<string> | undefined;
}

function getConsumedNonces(): Set<string> {
  if (!globalThis.__gotyping_consumed_nonces) {
    globalThis.__gotyping_consumed_nonces = new Set();
  }
  return globalThis.__gotyping_consumed_nonces;
}

export interface KeystrokeTelemetry {
  netWpm: number;
  grossWpm?: number;
  accuracy: number;
  durationSeconds: number;
  totalKeystrokes: number;
  completedChars: number;
  errorKeystrokes: number;
  expectedChars?: number;
}

export interface AntiCheatValidationResult {
  valid: boolean;
  code?: "PHYSIOLOGICAL_LIMIT_EXCEEDED" | "TYPING_FREQUENCY_ANOMALY" | "MATH_INCONSISTENCY" | "NONCE_INVALID";
  reason?: string;
  flaggedCheat?: boolean;
}

/**
 * Generates a cryptographically signed session nonce tied to userId, articleId, and timestamp.
 */
export function generateSessionNonce(userId: string, articleId?: string | null): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString("hex");
  const payload = `${userId}:${articleId || "custom"}:${timestamp}:${randomBytes}`;
  const signature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(payload)
    .digest("hex");

  // Format: payload.signature (Base64 encoded for safe transit)
  const token = Buffer.from(`${payload}.${signature}`).toString("base64url");
  return token;
}

/**
 * Verifies the integrity of a session nonce:
 * - Checks cryptographic HMAC signature
 * - Enforces freshness window (< 30 minutes)
 * - Verifies nonce has not been previously consumed (Replay prevention)
 */
export function verifySessionNonce(
  nonce: string,
  userId: string,
  articleId?: string | null
): { valid: boolean; reason?: string } {
  if (!nonce || typeof nonce !== "string") {
    return { valid: false, reason: "Thiếu chữ ký toàn vẹn phiên (Session Nonce)." };
  }

  const consumed = getConsumedNonces();
  if (consumed.has(nonce)) {
    return { valid: false, reason: "Phiên làm việc đã được sử dụng trước đó (Replay Attack Detected)." };
  }

  try {
    const decoded = Buffer.from(nonce, "base64url").toString("utf-8");
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) {
      return { valid: false, reason: "Cấu trúc token phiên không hợp lệ." };
    }

    const payload = decoded.substring(0, lastDot);
    const providedSig = decoded.substring(lastDot + 1);

    const expectedSig = crypto
      .createHmac("sha256", HMAC_SECRET)
      .update(payload)
      .digest("hex");

    const providedBuf = Buffer.from(providedSig);
    const expectedBuf = Buffer.from(expectedSig);

    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return { valid: false, reason: "Chữ ký toàn vẹn phiên không khớp (Tampered Session)." };
    }

    const parts = payload.split(":");
    const [tokenUserId, tokenArticleId, tokenTimestampStr] = parts;
    const tokenTimestamp = parseInt(tokenTimestampStr, 10);

    // Verify token ownership
    if (userId && tokenUserId !== userId && tokenUserId !== "guest") {
      return { valid: false, reason: "Phiên làm việc không thuộc về tài khoản này." };
    }

    if (articleId && tokenArticleId !== articleId && tokenArticleId !== "custom") {
      return { valid: false, reason: "Phiên làm việc không khớp với bài tập đang làm." };
    }

    // Max 30 minutes lifetime
    const now = Date.now();
    if (isNaN(tokenTimestamp) || now - tokenTimestamp > 30 * 60 * 1000) {
      return { valid: false, reason: "Phiên làm việc đã hết hạn (Quá 30 phút)." };
    }

    // Mark nonce as consumed
    consumed.add(nonce);

    // Prevent memory buildup: prune if set > 20,000 entries
    if (consumed.size > 20000) {
      consumed.clear();
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Không thể giải mã hoặc xác minh chữ ký phiên." };
  }
}

/**
 * Keystroke Telemetry Validation according to OWASP Anti-Cheat & Physiological Bounds:
 * 1. Human physiological limit: netWpm <= 250 WPM
 * 2. Typing frequency bound: duration_seconds >= (total_keystrokes / 25) (Human limit ~20-25 keys/sec max)
 * 3. Mathematical consistency: Gross keystrokes = completed_chars + error_keystrokes
 * 4. Text length deviation <= 5%
 */
export function validateKeystrokeTelemetry(
  telemetry: KeystrokeTelemetry
): AntiCheatValidationResult {
  const {
    netWpm,
    durationSeconds,
    totalKeystrokes,
    completedChars,
    errorKeystrokes,
    expectedChars,
  } = telemetry;

  // 1. Human physiological speed limit
  if (netWpm > 250) {
    return {
      valid: false,
      code: "PHYSIOLOGICAL_LIMIT_EXCEEDED",
      flaggedCheat: true,
      reason: `Tốc độ gõ phím (${netWpm} WPM) vượt ngưỡng sinh lý tối đa của con người (Kỷ lục Guinness thế giới: 216 WPM).`,
    };
  }

  // 2. Typing frequency bound (human typing reflex <= 25 keystrokes per second)
  if (totalKeystrokes > 20 && durationSeconds > 0) {
    const keysPerSecond = totalKeystrokes / durationSeconds;
    if (keysPerSecond > 25) {
      return {
        valid: false,
        code: "TYPING_FREQUENCY_ANOMALY",
        flaggedCheat: true,
        reason: `Tần số nhấn phím bất thường (${keysPerSecond.toFixed(1)} phím/giây). Hệ thống nghi vấn sử dụng công cụ gõ tự động (Macro/Bot).`,
      };
    }
  }

  // 3. Mathematical consistency check
  if (totalKeystrokes > 0) {
    const calculatedGross = completedChars + errorKeystrokes;
    // Allow slight discrepancy if extra backspaces were pressed
    if (calculatedGross > totalKeystrokes + 10) {
      return {
        valid: false,
        code: "MATH_INCONSISTENCY",
        flaggedCheat: true,
        reason: "Chỉ số tổng ký tự và phím lỗi sai lệch toán học so với dữ liệu nhật ký sự kiện gõ phím.",
      };
    }
  }

  // 4. Exercise length deviation check (must be within 5% of expected chars)
  if (expectedChars && expectedChars > 50) {
    const deviation = Math.abs(completedChars - expectedChars) / expectedChars;
    if (deviation > 0.05) {
      return {
        valid: false,
        code: "MATH_INCONSISTENCY",
        reason: `Số ký tự hoàn tất lệch quá 5% so với tổng độ dài thực tế của bài tập (${(deviation * 100).toFixed(1)}% sai lệch).`,
      };
    }
  }

  return { valid: true };
}
