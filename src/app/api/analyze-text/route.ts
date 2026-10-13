import { NextRequest, NextResponse } from "next/server";
import { parseTextIntoWordNodes } from "@/modules/lexical-analyzer/pipeline";
import { z } from "zod";

const analyzeSchema = z.object({
  text: z.string().min(1, "Văn bản phân tích không được để trống."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = analyzeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    const { text } = result.data;
    const tokens = parseTextIntoWordNodes(text);

    const awlList = tokens.filter((t) => t.isAWL).map((t) => ({ word: t.cleanWord, sublist: t.awlSublist }));
    const collocationList = tokens.filter((t) => t.isCollocation).map((t) => ({ phrase: t.collocationGroup || t.cleanWord }));

    return NextResponse.json({
      success: true,
      data: {
        totalWords: tokens.length,
        awlWords: awlList,
        collocations: collocationList,
        tokens,
      },
    });
  } catch (error: unknown) {
    console.error("[SECURITY_AUDIT_LOG]", {
      timestamp: new Date().toISOString(),
      route: "/api/analyze-text",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { success: false, error: "Yêu cầu phân tích văn bản không thể xử lý. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
