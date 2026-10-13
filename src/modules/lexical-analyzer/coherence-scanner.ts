export type CoherenceCategory = "addition" | "contrast" | "cause_effect" | "exemplification";

export interface CoherenceDeviceRule {
  phrase: string;
  category: CoherenceCategory;
  labelVi: string;
  colorClass: string;
  borderClass: string;
  badgeClass: string;
  ieltsRationale: string;
}

export interface DetectedCoherenceMatch {
  phrase: string;
  category: CoherenceCategory;
  labelVi: string;
  colorClass: string;
  borderClass: string;
  startIndex: number;
  endIndex: number;
  matchedText: string;
  sentenceContext: string;
  ieltsRationale: string;
}

export interface CoherenceRadarStats {
  totalCount: number;
  byCategory: Record<CoherenceCategory, number>;
  percentageByCategory: Record<CoherenceCategory, number>;
  distinctCategoriesCount: number;
  estimatedBand: number;
  bandEvaluation: string;
  tacticalAdvice: string;
}

export interface CoherenceScanResult {
  matches: DetectedCoherenceMatch[];
  stats: CoherenceRadarStats;
  isWordInDevice: (wordIndex: number, words: { original: string }[]) => DetectedCoherenceMatch | null;
}

export const COHERENCE_RULES: CoherenceDeviceRule[] = [
  // 1. Addition (Bổ sung)
  {
    phrase: "furthermore",
    category: "addition",
    labelVi: "Bổ sung luận điểm",
    colorClass: "text-sky-300",
    borderClass: "border-b-2 border-sky-400/90 shadow-[0_2px_8px_rgba(56,189,248,0.25)]",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ieltsRationale: "Mở rộng hoặc đưa thêm bằng chứng song song tăng tính thuyết phục của đoạn.",
  },
  {
    phrase: "moreover",
    category: "addition",
    labelVi: "Bổ sung luận điểm",
    colorClass: "text-sky-300",
    borderClass: "border-b-2 border-sky-400/90 shadow-[0_2px_8px_rgba(56,189,248,0.25)]",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ieltsRationale: "Đưa ra thêm một ý quan trọng hơn mang tính bổ trợ trực tiếp.",
  },
  {
    phrase: "in addition",
    category: "addition",
    labelVi: "Bổ sung thông tin",
    colorClass: "text-sky-300",
    borderClass: "border-b-2 border-sky-400/90 shadow-[0_2px_8px_rgba(56,189,248,0.25)]",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ieltsRationale: "Kết nối ý mới mượt mà, giúp cấu trúc đoạn mạch lạc.",
  },
  {
    phrase: "not to mention",
    category: "addition",
    labelVi: "Chưa kể đến / Hơn nữa",
    colorClass: "text-sky-300",
    borderClass: "border-b-2 border-sky-400/90 shadow-[0_2px_8px_rgba(56,189,248,0.25)]",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ieltsRationale: "Cụm nối tự nhiên, nhấn mạnh khía cạnh phụ trợ đắt giá.",
  },
  {
    phrase: "additionally",
    category: "addition",
    labelVi: "Thêm vào đó",
    colorClass: "text-sky-300",
    borderClass: "border-b-2 border-sky-400/90 shadow-[0_2px_8px_rgba(56,189,248,0.25)]",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ieltsRationale: "Liên từ trạng từ chuẩn văn phong học thuật Cambridge/Oxford.",
  },
  {
    phrase: "what is more",
    category: "addition",
    labelVi: "Đáng chú ý hơn nữa",
    colorClass: "text-sky-300",
    borderClass: "border-b-2 border-sky-400/90 shadow-[0_2px_8px_rgba(56,189,248,0.25)]",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ieltsRationale: "Tạo nhịp điệu chuyển ý uyển chuyển giữa các câu.",
  },

  // 2. Contrast (Tương phản)
  {
    phrase: "conversely",
    category: "contrast",
    labelVi: "Ngược lại hoàn toàn",
    colorClass: "text-violet-300",
    borderClass: "border-b-2 border-violet-400/90 shadow-[0_2px_8px_rgba(167,139,250,0.25)]",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    ieltsRationale: "Tạo sự đối lập sắc nét giữa hai mệnh đề hoặc hai luồng quan điểm đối nghịch.",
  },
  {
    phrase: "in stark contrast",
    category: "contrast",
    labelVi: "Tương phản sâu sắc",
    colorClass: "text-violet-300",
    borderClass: "border-b-2 border-violet-400/90 shadow-[0_2px_8px_rgba(167,139,250,0.25)]",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    ieltsRationale: "Cụm từ Collocation Band 8.0 nhấn mạnh độ cách biệt rõ rệt giữa hai luận cứ.",
  },
  {
    phrase: "notwithstanding",
    category: "contrast",
    labelVi: "Mặc dù vậy / Bất kể",
    colorClass: "text-violet-300",
    borderClass: "border-b-2 border-violet-400/90 shadow-[0_2px_8px_rgba(167,139,250,0.25)]",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    ieltsRationale: "Từ vựng trang trọng C2 thể hiện năng lực từ vựng và tư duy nhượng bộ sắc sảo.",
  },
  {
    phrase: "on the contrary",
    category: "contrast",
    labelVi: "Trái ngược lại",
    colorClass: "text-violet-300",
    borderClass: "border-b-2 border-violet-400/90 shadow-[0_2px_8px_rgba(167,139,250,0.25)]",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    ieltsRationale: "Bác bỏ luận điểm trước đó để khẳng định tính chân thực của ý đối trọng.",
  },
  {
    phrase: "nevertheless",
    category: "contrast",
    labelVi: "Tuy nhiên / Dẫu vậy",
    colorClass: "text-violet-300",
    borderClass: "border-b-2 border-violet-400/90 shadow-[0_2px_8px_rgba(167,139,250,0.25)]",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    ieltsRationale: "Cầu nối nhượng bộ kinh điển giữa 2 câu phức mang lại điểm C&C cao.",
  },
  {
    phrase: "nonetheless",
    category: "contrast",
    labelVi: "Mặc dù vậy",
    colorClass: "text-violet-300",
    borderClass: "border-b-2 border-violet-400/90 shadow-[0_2px_8px_rgba(167,139,250,0.25)]",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    ieltsRationale: "Tương đương nevertheless, nâng cao độ phong phú của từ vựng liên kết.",
  },
  {
    phrase: "by contrast",
    category: "contrast",
    labelVi: "Ngược lại",
    colorClass: "text-violet-300",
    borderClass: "border-b-2 border-violet-400/90 shadow-[0_2px_8px_rgba(167,139,250,0.25)]",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    ieltsRationale: "Cực kỳ hiệu quả trong dạng bài so sánh số liệu Task 1 và đối chiếu Task 2.",
  },
  {
    phrase: "on the other hand",
    category: "contrast",
    labelVi: "Mặt khác",
    colorClass: "text-violet-300",
    borderClass: "border-b-2 border-violet-400/90 shadow-[0_2px_8px_rgba(167,139,250,0.25)]",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    ieltsRationale: "Mở đầu phân đoạn đối trọng (counter-argument) chuẩn chỉnh.",
  },

  // 3. Cause & Effect (Hệ quả)
  {
    phrase: "consequently",
    category: "cause_effect",
    labelVi: "Hệ quả tất yếu",
    colorClass: "text-teal-300",
    borderClass: "border-b-2 border-teal-400/90 shadow-[0_2px_8px_rgba(45,212,191,0.25)]",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ieltsRationale: "Chỉ ra kết quả logic tiếp nối từ nguyên nhân được nêu trước đó.",
  },
  {
    phrase: "it follows that",
    category: "cause_effect",
    labelVi: "Từ đó suy ra rằng",
    colorClass: "text-teal-300",
    borderClass: "border-b-2 border-teal-400/90 shadow-[0_2px_8px_rgba(45,212,191,0.25)]",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ieltsRationale: "Cấu trúc lập luận triết học / học thuật suy diễn diễn dịch chặt chẽ.",
  },
  {
    phrase: "as a corollary",
    category: "cause_effect",
    labelVi: "Như một hệ quả tự nhiên",
    colorClass: "text-teal-300",
    borderClass: "border-b-2 border-teal-400/90 shadow-[0_2px_8px_rgba(45,212,191,0.25)]",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ieltsRationale: "Cụm danh từ Band 8.5+ gây ấn tượng mạnh với giám khảo chấm C&C.",
  },
  {
    phrase: "thereby",
    category: "cause_effect",
    labelVi: "Nhờ đó / Do đó",
    colorClass: "text-teal-300",
    borderClass: "border-b-2 border-teal-400/90 shadow-[0_2px_8px_rgba(45,212,191,0.25)]",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ieltsRationale: "Kết hợp với phân từ hiện tại (thereby + V-ing) tạo câu phức cực kỳ đắt giá.",
  },
  {
    phrase: "as a result",
    category: "cause_effect",
    labelVi: "Kết quả là",
    colorClass: "text-teal-300",
    borderClass: "border-b-2 border-teal-400/90 shadow-[0_2px_8px_rgba(45,212,191,0.25)]",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ieltsRationale: "Thiết lập mối quan hệ nguyên nhân - kết quả rõ ràng, dễ hiểu.",
  },
  {
    phrase: "therefore",
    category: "cause_effect",
    labelVi: "Vì vậy / Do đó",
    colorClass: "text-teal-300",
    borderClass: "border-b-2 border-teal-400/90 shadow-[0_2px_8px_rgba(45,212,191,0.25)]",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ieltsRationale: "Liên từ chuẩn mực để chốt hạ giải pháp hoặc kết luận nhỏ.",
  },
  {
    phrase: "thus",
    category: "cause_effect",
    labelVi: "Theo đó / Vì thế",
    colorClass: "text-teal-300",
    borderClass: "border-b-2 border-teal-400/90 shadow-[0_2px_8px_rgba(45,212,191,0.25)]",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ieltsRationale: "Ngắn gọn, súc tích, mang sắc thái trang trọng chuẩn học thuật.",
  },

  // 4. Exemplification (Dẫn chứng)
  {
    phrase: "to illustrate",
    category: "exemplification",
    labelVi: "Để minh họa cụ thể",
    colorClass: "text-amber-300",
    borderClass: "border-b-2 border-amber-400/90 shadow-[0_2px_8px_rgba(251,191,36,0.25)]",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ieltsRationale: "Mở đầu ví dụ thực tiễn để củng cố luận cứ (Supporting Idea).",
  },
  {
    phrase: "a case in point is",
    category: "exemplification",
    labelVi: "Một ví dụ điển hình là",
    colorClass: "text-amber-300",
    borderClass: "border-b-2 border-amber-400/90 shadow-[0_2px_8px_rgba(251,191,36,0.25)]",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ieltsRationale: "Cụm mẫu câu chứng minh Band 8.0 thay thế cho 'For example' quen thuộc.",
  },
  {
    phrase: "exemplified by",
    category: "exemplification",
    labelVi: "Được minh chứng bởi",
    colorClass: "text-amber-300",
    borderClass: "border-b-2 border-amber-400/90 shadow-[0_2px_8px_rgba(251,191,36,0.25)]",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ieltsRationale: "Cấu trúc bị động rút gọn đưa bằng chứng vào câu cực kỳ tinh tế.",
  },
  {
    phrase: "for instance",
    category: "exemplification",
    labelVi: "Chẳng hạn như",
    colorClass: "text-amber-300",
    borderClass: "border-b-2 border-amber-400/90 shadow-[0_2px_8px_rgba(251,191,36,0.25)]",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ieltsRationale: "Liên từ đưa ví dụ học thuật uy tín tương đương For example.",
  },
  {
    phrase: "for example",
    category: "exemplification",
    labelVi: "Ví dụ như",
    colorClass: "text-amber-300",
    borderClass: "border-b-2 border-amber-400/90 shadow-[0_2px_8px_rgba(251,191,36,0.25)]",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ieltsRationale: "Liên từ dẫn chứng cơ bản giúp minh định luận điểm rõ ràng.",
  },
  {
    phrase: "as an illustration",
    category: "exemplification",
    labelVi: "Như một dẫn chứng rõ ràng",
    colorClass: "text-amber-300",
    borderClass: "border-b-2 border-amber-400/90 shadow-[0_2px_8px_rgba(251,191,36,0.25)]",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ieltsRationale: "Cụm danh từ chỉ dẫn chứng trang trọng dùng trong bài luận Task 2.",
  },
];

/**
 * Scans text and detects all IELTS Coherence & Cohesion linking devices
 */
export function scanCoherenceDevices(rawText: string): CoherenceScanResult {
  if (!rawText) {
    return {
      matches: [],
      stats: {
        totalCount: 0,
        byCategory: { addition: 0, contrast: 0, cause_effect: 0, exemplification: 0 },
        percentageByCategory: { addition: 0, contrast: 0, cause_effect: 0, exemplification: 0 },
        distinctCategoriesCount: 0,
        estimatedBand: 6.0,
        bandEvaluation: "Chưa phát hiện từ nối luận điểm.",
        tacticalAdvice: "Hãy bổ sung liên từ để tăng tính liền mạch logic giữa các ý.",
      },
      isWordInDevice: () => null,
    };
  }

  const matches: DetectedCoherenceMatch[] = [];

  // Sort rules by phrase length descending to match multi-word phrases first
  const sortedRules = [...COHERENCE_RULES].sort((a, b) => b.phrase.length - a.phrase.length);

  for (const rule of sortedRules) {
    // Regex matching whole phrase at word boundaries
    const escaped = rule.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawText)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      // Avoid overlapping with existing longer matches
      const isOverlapping = matches.some(
        (m) =>
          (startIndex >= m.startIndex && startIndex < m.endIndex) ||
          (endIndex > m.startIndex && endIndex <= m.endIndex)
      );

      if (!isOverlapping) {
        // Extract surrounding sentence context
        const sentenceStart = Math.max(0, rawText.lastIndexOf(".", startIndex) + 1);
        let sentenceEnd = rawText.indexOf(".", endIndex);
        if (sentenceEnd === -1) sentenceEnd = rawText.length;
        const sentenceContext = rawText.slice(sentenceStart, sentenceEnd + 1).trim();

        matches.push({
          phrase: rule.phrase,
          category: rule.category,
          labelVi: rule.labelVi,
          colorClass: rule.colorClass,
          borderClass: rule.borderClass,
          startIndex,
          endIndex,
          matchedText: match[0],
          sentenceContext,
          ieltsRationale: rule.ieltsRationale,
        });
      }
    }
  }

  // Sort matches by appearance in text
  matches.sort((a, b) => a.startIndex - b.startIndex);

  // Compute category statistics
  const byCategory: Record<CoherenceCategory, number> = {
    addition: 0,
    contrast: 0,
    cause_effect: 0,
    exemplification: 0,
  };

  for (const m of matches) {
    byCategory[m.category] = (byCategory[m.category] || 0) + 1;
  }

  const totalCount = matches.length;
  const distinctCategoriesCount = Object.values(byCategory).filter((c) => c > 0).length;

  const percentageByCategory: Record<CoherenceCategory, number> = {
    addition: totalCount > 0 ? Math.round((byCategory.addition / totalCount) * 100) : 0,
    contrast: totalCount > 0 ? Math.round((byCategory.contrast / totalCount) * 100) : 0,
    cause_effect: totalCount > 0 ? Math.round((byCategory.cause_effect / totalCount) * 100) : 0,
    exemplification: totalCount > 0 ? Math.round((byCategory.exemplification / totalCount) * 100) : 0,
  };

  let estimatedBand = 6.0;
  let bandEvaluation = "Mức độ liên kết câu ở mức trung bình (Band 6.0).";
  let tacticalAdvice = "Cần đa dạng hóa nhóm liên từ (thêm Tương phản và Hệ quả).";

  if (distinctCategoriesCount >= 4 && totalCount >= 4) {
    estimatedBand = 8.5;
    bandEvaluation = "Xuất sắc: Đa dạng hoàn hảo cả 4 nhóm liên kết luận điểm (Band 8.5+).";
    tacticalAdvice = "Dòng chảy lập luận tự nhiên, chuyển ý mạch lạc không bị lạm dụng từ nối cơ học.";
  } else if (distinctCategoriesCount >= 3 && totalCount >= 3) {
    estimatedBand = 7.5;
    bandEvaluation = "Tốt: Sử dụng đa dạng 3 nhóm từ nối học thuật (Band 7.5 - 8.0).";
    tacticalAdvice = "Bài viết có độ kết dính cao, chuyển ý mạch lạc giữa nguyên nhân và dẫn chứng.";
  } else if (distinctCategoriesCount >= 2 && totalCount >= 2) {
    estimatedBand = 6.5;
    bandEvaluation = "Khá: Có sử dụng từ nối nhưng phạm vi phân bổ chưa đồng đều (Band 6.5 - 7.0).";
    tacticalAdvice = "Thử kết hợp thêm cụm từ chỉ hệ quả (Thereby, Consequently) hoặc câu đối trọng.";
  }

  const isWordInDevice = (wordIndex: number, words: { original: string }[]): DetectedCoherenceMatch | null => {
    // Map word index to approximate position or check multi-word token
    const word = words[wordIndex];
    if (!word) return null;
    const clean = word.original.toLowerCase().replace(/[^a-z]/g, "");

    for (const m of matches) {
      const phraseClean = m.phrase.toLowerCase().replace(/[^a-z\s]/g, "");
      const phraseParts = phraseClean.split(/\s+/);
      if (phraseParts.includes(clean)) {
        return m;
      }
    }
    return null;
  };

  return {
    matches,
    stats: {
      totalCount,
      byCategory,
      percentageByCategory,
      distinctCategoriesCount,
      estimatedBand,
      bandEvaluation,
      tacticalAdvice,
    },
    isWordInDevice,
  };
}
