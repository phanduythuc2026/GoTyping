export interface BandBenchmark {
  targetBand: number;
  minWpm: number;
  minAccuracy: number;
  minAwlPercent: number;
  description: string;
}

export const IELTS_BAND_BENCHMARKS: Record<number, BandBenchmark> = {
  5.0: {
    targetBand: 5.0,
    minWpm: 25,
    minAccuracy: 90.0,
    minAwlPercent: 5,
    description: "Tốc độ cơ bản, kiểm soát lỗi chính tả phổ thông.",
  },
  5.5: {
    targetBand: 5.5,
    minWpm: 28,
    minAccuracy: 92.0,
    minAwlPercent: 6,
    description: "Duy trì phản xạ gõ đều đặn với các đoạn văn ngắn.",
  },
  6.0: {
    targetBand: 6.0,
    minWpm: 32,
    minAccuracy: 94.0,
    minAwlPercent: 8,
    description: "Bắt đầu làm quen với các gốc từ vựng học thuật B2.",
  },
  6.5: {
    targetBand: 6.5,
    minWpm: 35,
    minAccuracy: 95.0,
    minAwlPercent: 10,
    description: "WPM tối thiểu 35, tỷ lệ nhận diện từ vựng AWL đạt từ 10%.",
  },
  7.0: {
    targetBand: 7.0,
    minWpm: 40,
    minAccuracy: 95.5,
    minAwlPercent: 12,
    description: "WPM tối thiểu 40, phản xạ nhanh với các từ vựng AWL Sublist 1-5.",
  },
  7.5: {
    targetBand: 7.5,
    minWpm: 45,
    minAccuracy: 96.0,
    minAwlPercent: 15,
    description: "WPM tối thiểu 45, Accuracy >= 96%, làm chủ các cụm Collocation phổ biến.",
  },
  8.0: {
    targetBand: 8.0,
    minWpm: 55,
    minAccuracy: 98.0,
    minAwlPercent: 18,
    description: "WPM tối thiểu 55, Accuracy >= 98%, ghi nhận cấu trúc câu học thuật nâng cao.",
  },
  8.5: {
    targetBand: 8.5,
    minWpm: 65,
    minAccuracy: 98.5,
    minAwlPercent: 20,
    description: "Tốc độ phản xạ vượt trội, độ chính xác gần như tuyệt đối.",
  },
  9.0: {
    targetBand: 9.0,
    minWpm: 75,
    minAccuracy: 99.0,
    minAwlPercent: 22,
    description: "Chuẩn phản xạ của dịch giả & chuyên gia khảo thí ngôn ngữ.",
  },
};

export interface BenchmarkEvaluationResult {
  targetBand: number;
  isQualified: boolean;
  status: "exceeded" | "achieved" | "near_target" | "below_target";
  badgeText: string;
  badgeColorClass: string;
  feedback: string;
  wpmGap: number;
  accuracyGap: number;
}

export function evaluateTypingAgainstBand(params: {
  netWpm: number;
  accuracy: number;
  targetBand: number;
  awlWordsCount?: number;
  totalWords?: number;
}): BenchmarkEvaluationResult {
  const { netWpm, accuracy, targetBand } = params;
  const benchmark = IELTS_BAND_BENCHMARKS[targetBand] || IELTS_BAND_BENCHMARKS[7.5];

  const wpmPassed = netWpm >= benchmark.minWpm;
  const accuracyPassed = accuracy >= benchmark.minAccuracy;
  const isQualified = wpmPassed && accuracyPassed;

  const wpmGap = netWpm - benchmark.minWpm;
  const accuracyGap = Number((accuracy - benchmark.minAccuracy).toFixed(1));

  if (netWpm >= benchmark.minWpm + 10 && accuracy >= benchmark.minAccuracy) {
    return {
      targetBand,
      isQualified: true,
      status: "exceeded",
      badgeText: `VƯỢT CHUẨN BAND ${targetBand.toFixed(1)}`,
      badgeColorClass: "bg-emerald-950/70 text-emerald-300 border-emerald-600/60",
      feedback: `Xuất sắc! Tốc độ ${netWpm} WPM và độ chính xác ${accuracy}% đã vượt xa tiêu chuẩn Target Band ${targetBand}.`,
      wpmGap,
      accuracyGap,
    };
  }

  if (isQualified) {
    return {
      targetBand,
      isQualified: true,
      status: "achieved",
      badgeText: `ĐẠT CHUẨN BAND ${targetBand.toFixed(1)}`,
      badgeColorClass: "bg-indigo-950/70 text-indigo-300 border-indigo-600/60",
      feedback: `Chúc mừng! Phiên gõ đạt chuẩn phản xạ mục tiêu Band ${targetBand.toFixed(1)} (Yêu cầu: ${benchmark.minWpm} WPM, >=${benchmark.minAccuracy}% acc).`,
      wpmGap,
      accuracyGap,
    };
  }

  if (netWpm >= benchmark.minWpm - 5 && accuracy >= benchmark.minAccuracy - 2) {
    return {
      targetBand,
      isQualified: false,
      status: "near_target",
      badgeText: `SÁT CHUẨN BAND ${targetBand.toFixed(1)}`,
      badgeColorClass: "bg-amber-950/70 text-amber-300 border-amber-600/60",
      feedback: `Gần đạt mục tiêu! Bạn chỉ còn thiếu ${Math.max(0, -wpmGap)} WPM hoặc cần tăng thêm ${Math.max(0, -accuracyGap)}% độ chính xác.`,
      wpmGap,
      accuracyGap,
    };
  }

  return {
    targetBand,
    isQualified: false,
    status: "below_target",
    badgeText: `DƯỚI CHUẨN BAND ${targetBand.toFixed(1)}`,
    badgeColorClass: "bg-rose-950/70 text-rose-300 border-rose-600/60",
    feedback: `Chưa đạt chuẩn Band ${targetBand.toFixed(1)}. Hãy tập trung gõ chính xác các cụm từ trước khi tăng tốc độ.`,
    wpmGap,
    accuracyGap,
  };
}
