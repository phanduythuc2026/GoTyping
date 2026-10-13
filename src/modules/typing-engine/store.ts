import { create } from "zustand";
import { WordNode, TypingSessionMetrics, CaretCoordinates } from "@/types/typing.types";
import { parseTextIntoWordNodes } from "@/modules/lexical-analyzer/pipeline";
import { calculateTypingMetrics } from "./metrics";
import { ResolvedKeyInput } from "./ime-interceptor";

export type EngineStatus = "idle" | "running" | "completed";
export type PressureMode = "free" | "task1_sprint" | "task2_paragraph";

interface TypingEngineState {
  // State
  status: EngineStatus;
  rawText: string;
  words: WordNode[];
  currentWordIndex: number;
  currentCharIndex: number;
  caret: CaretCoordinates;
  metrics: TypingSessionMetrics;
  imeSafeMode: boolean;

  // Extension Features
  clozeMode: boolean;
  pressureMode: PressureMode;
  pressureTimeLimit: number | null;
  timeRemaining: number | null;
  isPressureWarning: boolean;
  isTimeOut: boolean;

  // Actions
  initSession: (text: string) => void;
  resetSession: () => void;
  handleKeyInput: (resolved: ResolvedKeyInput) => void;
  tickTimer: () => void;
  setCaret: (coords: CaretCoordinates) => void;
  toggleImeSafeMode: () => void;
  toggleClozeMode: () => void;
  setPressureMode: (mode: PressureMode) => void;
}

const initialMetrics: TypingSessionMetrics = {
  startTime: null,
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
  totalWords: 0,
  errorLog: {},
  wpmHistory: [],
};

export const useTypingStore = create<TypingEngineState>((set, get) => ({
  status: "idle",
  rawText: "",
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  caret: { x: 0, y: 0, height: 28, visible: true },
  metrics: initialMetrics,
  imeSafeMode: true,

  clozeMode: false,
  pressureMode: "free",
  pressureTimeLimit: null,
  timeRemaining: null,
  isPressureWarning: false,
  isTimeOut: false,

  initSession: (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const words = parseTextIntoWordNodes(trimmed);
    const currentPressureLimit = get().pressureTimeLimit;

    set({
      status: "idle",
      rawText: trimmed,
      words,
      currentWordIndex: 0,
      currentCharIndex: 0,
      caret: { x: 0, y: 0, height: 28, visible: true },
      timeRemaining: currentPressureLimit,
      isPressureWarning: false,
      isTimeOut: false,
      metrics: {
        ...initialMetrics,
        totalWords: words.length,
      },
    });
  },

  resetSession: () => {
    const { rawText } = get();
    if (rawText) {
      get().initSession(rawText);
    }
  },

  toggleImeSafeMode: () => {
    set((state) => ({ imeSafeMode: !state.imeSafeMode }));
  },

  toggleClozeMode: () => {
    set((state) => ({ clozeMode: !state.clozeMode }));
  },

  setPressureMode: (mode: PressureMode) => {
    let limit: number | null = null;
    if (mode === "task1_sprint") limit = 300; // 5 mins
    if (mode === "task2_paragraph") limit = 600; // 10 mins

    set({
      pressureMode: mode,
      pressureTimeLimit: limit,
      timeRemaining: limit,
      isPressureWarning: false,
      isTimeOut: false,
    });
  },

  setCaret: (coords: CaretCoordinates) => {
    set({ caret: coords });
  },

  tickTimer: () => {
    const { status, metrics, pressureMode, pressureTimeLimit, timeRemaining, words } = get();
    if (status !== "running" || !metrics.startTime) return;

    const updated = calculateTypingMetrics({
      startTime: metrics.startTime,
      currentTime: Date.now(),
      totalKeystrokes: metrics.totalKeystrokes,
      correctKeystrokes: metrics.correctKeystrokes,
      errorKeystrokes: metrics.errorKeystrokes,
      completedWords: metrics.completedWords,
      totalWords: metrics.totalWords,
      errorLog: metrics.errorLog,
      wpmHistory: [...metrics.wpmHistory, metrics.netWpm],
    });

    let nextRemaining = timeRemaining;
    let nextStatus: EngineStatus = status;
    let isWarning = false;
    let isTimeOut = false;

    if (pressureMode !== "free" && timeRemaining !== null) {
      nextRemaining = Math.max(0, timeRemaining - 1);

      // Warning when remaining < 20% or pace is critically below target requirement
      const totalLimit = pressureTimeLimit || 300;
      const isUnder20Percent = nextRemaining <= totalLimit * 0.2;
      const wordsLeft = Math.max(0, words.length - metrics.completedWords);
      const minutesLeft = nextRemaining / 60;
      const requiredWpm = minutesLeft > 0 ? wordsLeft / minutesLeft : 999;
      const isPaceInsufficient = requiredWpm > Math.max(20, updated.netWpm * 1.25);

      isWarning = isUnder20Percent || isPaceInsufficient;

      if (nextRemaining === 0) {
        nextStatus = "completed";
        isTimeOut = true;
        updated.endTime = Date.now();
      }
    }

    set({
      metrics: updated,
      status: nextStatus,
      timeRemaining: nextRemaining,
      isPressureWarning: isWarning && nextStatus === "running",
      isTimeOut,
    });
  },

  handleKeyInput: (resolved: ResolvedKeyInput) => {
    const { status, words, currentWordIndex, currentCharIndex, metrics } = get();
    if (status === "completed" || words.length === 0) return;

    let newStatus = status;
    let newStartTime = metrics.startTime;

    // First keypress transitions from idle to running
    if (status === "idle") {
      if (resolved.isIgnored) return;
      newStatus = "running";
      newStartTime = Date.now();
    }

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    // 1. Backspace logic
    if (resolved.isBackspace) {
      if (currentCharIndex > 0) {
        const updatedWords = [...words];
        const wordChars = [...currentWord.chars];
        const prevIndex = currentCharIndex - 1;

        if (wordChars[prevIndex].status === "extra") {
          wordChars.splice(prevIndex, 1);
        } else {
          wordChars[prevIndex] = {
            ...wordChars[prevIndex],
            status: "pending",
          };
        }

        updatedWords[currentWordIndex] = {
          ...currentWord,
          chars: wordChars,
        };

        set({
          status: newStatus,
          words: updatedWords,
          currentCharIndex: prevIndex,
          metrics: {
            ...metrics,
            startTime: newStartTime,
          },
        });
      } else if (currentWordIndex > 0) {
        // Step back to previous word if it had errors
        const prevWord = words[currentWordIndex - 1];
        if (prevWord.hasErrors || !prevWord.isCompleted) {
          set({
            status: newStatus,
            currentWordIndex: currentWordIndex - 1,
            currentCharIndex: prevWord.chars.length,
            metrics: {
              ...metrics,
              startTime: newStartTime,
            },
          });
        }
      }
      return;
    }

    // 2. Space key logic (Word completed)
    if (resolved.isSpace) {
      if (currentCharIndex === 0) {
        // Ignore leading space on a word
        return;
      }

      const updatedWords = [...words];
      const hasErrors = currentWord.chars.some(
        (c) => c.status === "incorrect" || c.status === "extra" || c.status === "pending"
      );

      // Mark uncompleted chars in current word as incorrect if skipped
      const finishedChars = currentWord.chars.map((c) =>
        c.status === "pending" ? { ...c, status: "incorrect" as const } : c
      );

      updatedWords[currentWordIndex] = {
        ...currentWord,
        chars: finishedChars,
        isCompleted: true,
        hasErrors,
      };

      const nextWordIndex = currentWordIndex + 1;
      const isFinished = nextWordIndex >= words.length;

      const finalStatus: EngineStatus = isFinished ? "completed" : newStatus;
      const completedWordsCount = metrics.completedWords + 1;

      const updatedMetrics = calculateTypingMetrics({
        startTime: newStartTime,
        currentTime: Date.now(),
        totalKeystrokes: metrics.totalKeystrokes + 1,
        correctKeystrokes: metrics.correctKeystrokes + (hasErrors ? 0 : 1),
        errorKeystrokes: metrics.errorKeystrokes + (hasErrors ? 1 : 0),
        completedWords: completedWordsCount,
        totalWords: words.length,
        errorLog: metrics.errorLog,
        wpmHistory: metrics.wpmHistory,
      });

      if (isFinished) {
        updatedMetrics.endTime = Date.now();
      }

      set({
        status: finalStatus,
        words: updatedWords,
        currentWordIndex: isFinished ? currentWordIndex : nextWordIndex,
        currentCharIndex: 0,
        metrics: updatedMetrics,
      });
      return;
    }

    // 3. Regular printable character
    if (resolved.isChar && resolved.char) {
      const typedChar = resolved.char;
      const updatedWords = [...words];
      const wordChars = [...currentWord.chars];
      let correctInc = 0;
      let errorInc = 0;
      const updatedErrorLog = { ...metrics.errorLog };

      if (currentCharIndex < wordChars.length) {
        const expectedChar = wordChars[currentCharIndex].char;
        if (typedChar === expectedChar) {
          wordChars[currentCharIndex] = {
            ...wordChars[currentCharIndex],
            status: "correct",
          };
          correctInc = 1;
        } else {
          wordChars[currentCharIndex] = {
            ...wordChars[currentCharIndex],
            status: "incorrect",
          };
          errorInc = 1;
          const key = `${expectedChar}->${typedChar}`;
          updatedErrorLog[key] = (updatedErrorLog[key] || 0) + 1;
        }
      } else {
        // Extra character typed beyond original word length (max 10 extra)
        if (wordChars.length - currentWord.original.length < 10) {
          wordChars.push({
            char: typedChar,
            status: "extra",
          });
          errorInc = 1;
          const key = `extra:${typedChar}`;
          updatedErrorLog[key] = (updatedErrorLog[key] || 0) + 1;
        }
      }

      const nextCharIndex = currentCharIndex + 1;
      const hasErrorsSoFar = wordChars.some(
        (c) => c.status === "incorrect" || c.status === "extra"
      );

      updatedWords[currentWordIndex] = {
        ...currentWord,
        chars: wordChars,
        hasErrors: hasErrorsSoFar,
      };

      // Check if last character of last word
      const isLastWord = currentWordIndex === words.length - 1;
      const isLastChar = nextCharIndex === wordChars.length;
      const isFinished = isLastWord && isLastChar && !hasErrorsSoFar;

      const updatedMetrics = calculateTypingMetrics({
        startTime: newStartTime,
        currentTime: Date.now(),
        totalKeystrokes: metrics.totalKeystrokes + 1,
        correctKeystrokes: metrics.correctKeystrokes + correctInc,
        errorKeystrokes: metrics.errorKeystrokes + errorInc,
        completedWords: isFinished ? words.length : metrics.completedWords,
        totalWords: words.length,
        errorLog: updatedErrorLog,
        wpmHistory: metrics.wpmHistory,
      });

      if (isFinished) {
        updatedMetrics.endTime = Date.now();
      }

      set({
        status: isFinished ? "completed" : newStatus,
        words: updatedWords,
        currentCharIndex: nextCharIndex,
        metrics: updatedMetrics,
      });
    }
  },
}));
