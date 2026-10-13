import { TypingSessionMetrics } from "@/types/typing.types";

/**
 * Calculates typing metrics following international standard:
 * 1 standard word = 5 keystrokes
 */
export function calculateTypingMetrics(params: {
  startTime: number | null;
  currentTime: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorKeystrokes: number;
  completedWords: number;
  totalWords: number;
  errorLog: Record<string, number>;
  wpmHistory: number[];
}): TypingSessionMetrics {
  const {
    startTime,
    currentTime,
    totalKeystrokes,
    correctKeystrokes,
    errorKeystrokes,
    completedWords,
    totalWords,
    errorLog,
    wpmHistory,
  } = params;

  if (!startTime || currentTime <= startTime) {
    return {
      startTime,
      endTime: null,
      elapsedSeconds: 0,
      rawWpm: 0,
      netWpm: 0,
      accuracy: 0,
      consistency: 100,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      errorKeystrokes: 0,
      completedWords: 0,
      totalWords,
      errorLog: {},
      wpmHistory: [],
    };
  }

  const elapsedSeconds = Math.max(1, Math.round((currentTime - startTime) / 1000));
  const elapsedMinutes = elapsedSeconds / 60;

  // Raw WPM: all keystrokes / 5 / minutes
  const rawWpm = Math.round((totalKeystrokes / 5) / elapsedMinutes);

  // Net WPM: correct keystrokes / 5 / minutes
  const netWpm = Math.max(0, Math.round((correctKeystrokes / 5) / elapsedMinutes));

  // Accuracy: correct keystrokes / total keystrokes * 100
  const accuracy = totalKeystrokes > 0
    ? Number(((correctKeystrokes / totalKeystrokes) * 100).toFixed(2))
    : 0;

  // Consistency: measure variance in rolling WPM (100% is perfectly consistent)
  let consistency = 100;
  if (wpmHistory.length > 2) {
    const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
    if (mean > 0) {
      const variance =
        wpmHistory.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
        wpmHistory.length;
      const stdDev = Math.sqrt(variance);
      const cv = (stdDev / mean) * 100;
      consistency = Math.max(0, Math.min(100, Math.round(100 - cv)));
    }
  }

  return {
    startTime,
    endTime: null,
    elapsedSeconds,
    rawWpm,
    netWpm,
    accuracy,
    consistency,
    totalKeystrokes,
    correctKeystrokes,
    errorKeystrokes,
    completedWords,
    totalWords,
    errorLog,
    wpmHistory,
  };
}
