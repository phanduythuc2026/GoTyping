import { NextRequest, NextResponse } from "next/server";
import { generateAcademicParaphrases } from "@/modules/extensions/ai-assistant/gemini-client";
import { RateLimiters } from "@/lib/security/rate-limiter";
import { z } from "zod";

const paraphraseSchema = z.object({
  sentence: z.string().min(5, "Câu văn quá ngắn để diễn đạt lại.").max(2000, "Câu văn quá dài."),
});

export async function POST(req: NextRequest) {
  // Rate limiting (15 req/min/IP)
  const rateLimit = RateLimiters.aiParaphrase(req);
  if (!rateLimit.allowed) {
    console.warn("[SECURITY_AUDIT_LOG] Rate limit exceeded on /api/ai/paraphrase", {
      timestamp: new Date().toISOString(),
      resetSeconds: rateLimit.resetSeconds,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Quá nhiều yêu cầu paraphrase học thuật. Vui lòng thử lại sau 1 phút.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetSeconds) },
      }
    );
  }

  try {
    const body = await req.json();
    const result = paraphraseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    const { sentence } = result.data;
    const alternatives = await generateAcademicParaphrases(sentence);

    return NextResponse.json({
      success: true,
      data: {
        original: sentence,
        alternatives,
      },
    });
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/ai/paraphrase",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Yêu cầu paraphrase không thể xử lý. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
