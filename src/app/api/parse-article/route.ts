import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchArticleHtml } from "@/modules/article-extractor/scraper";
import { validateUrlAgainstSsrf } from "@/modules/article-extractor/ssrf-guard";
import { extractReadableContent } from "@/modules/article-extractor/readability";
import { sanitizeTextForTyping } from "@/modules/article-extractor/sanitizer";
import { chunkTextIntoSessions } from "@/modules/article-extractor/chunker";
import { RateLimiters } from "@/lib/security/rate-limiter";
import { ExtractedArticle } from "@/types/article.types";

const urlSchema = z.object({
  url: z.string().url("Vui lòng cung cấp một URL hợp lệ."),
});

export async function POST(req: NextRequest) {
  // 1. Sliding Window Rate Limiting (10 req/min/IP)
  const rateLimit = RateLimiters.parseArticle(req);
  if (!rateLimit.allowed) {
    console.warn("[SECURITY_AUDIT_LOG] Rate limit exceeded on /api/parse-article", {
      timestamp: new Date().toISOString(),
      resetSeconds: rateLimit.resetSeconds,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Bạn đã gửi quá nhiều yêu cầu trích xuất bài báo. Vui lòng thử lại sau 1 phút.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const result = urlSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message || "URL không hợp lệ" },
        { status: 400 }
      );
    }

    const { url } = result.data;

    // 2. Pre-flight Zero-Trust SSRF & IP Inspection
    const ssrfCheck = await validateUrlAgainstSsrf(url);
    if (!ssrfCheck.valid) {
      console.warn("[SECURITY_AUDIT_LOG] Blocked SSRF attempt on /api/parse-article", {
        timestamp: new Date().toISOString(),
        targetUrl: url,
        reason: ssrfCheck.error,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Liên kết bị từ chối do vi phạm chính sách bảo mật máy chủ (SSRF Protection).",
        },
        { status: 403 }
      );
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, "");

    // 3. Fetch HTML through safe scraper with streaming limit
    const html = await fetchArticleHtml(url);

    // 4. Extract clean readability content
    const readabilityOutput = extractReadableContent(html, url);
    if (!readabilityOutput || !readabilityOutput.textContent.trim()) {
      return NextResponse.json(
        { success: false, error: "Không thể trích xuất nội dung văn bản từ liên kết này." },
        { status: 422 }
      );
    }

    // 5. Sanitize characters
    const cleanText = sanitizeTextForTyping(readabilityOutput.textContent);
    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (wordCount < 50) {
      return NextResponse.json(
        { success: false, error: "Bài viết quá ngắn hoặc nội dung bị chặn." },
        { status: 422 }
      );
    }

    // 6. Chunk into typing segments
    const chunks = chunkTextIntoSessions(cleanText, 150, 220);

    const articleData: ExtractedArticle = {
      title: readabilityOutput.title,
      byline: readabilityOutput.byline,
      sourceUrl: url,
      sourceDomain: domain,
      rawText: readabilityOutput.textContent,
      cleanText,
      wordCount,
      lexicalLevel: wordCount > 300 ? "Academic" : "C1",
      chunks,
      awlWords: [],
      collocations: [],
    };

    return NextResponse.json({
      success: true,
      data: articleData,
    });
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/parse-article",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Yêu cầu không thể xử lý. Vui lòng kiểm tra lại đường dẫn và thử lại sau.",
      },
      { status: 500 }
    );
  }
}
