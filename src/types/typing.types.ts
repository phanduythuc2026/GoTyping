export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'extra';

export interface CharNode {
  char: string;
  status: CharStatus;
}

export interface WordNode {
  wordIndex: number;
  original: string;
  cleanWord: string;
  chars: CharNode[];
  isAWL: boolean;
  awlSublist?: number;
  isCollocation: boolean;
  collocationGroup?: string;
  meaningPreview?: string;
  isCompleted: boolean;
  hasErrors: boolean;
}

export interface TypingSessionMetrics {
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  consistency: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorKeystrokes: number;
  completedWords: number;
  totalWords: number;
  errorLog: Record<string, number>;
  wpmHistory: number[];
}

export interface CaretCoordinates {
  x: number;
  y: number;
  height: number;
  visible: boolean;
}
