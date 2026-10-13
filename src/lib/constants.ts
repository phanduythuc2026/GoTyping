export const APP_CONFIG = {
  name: "IELTS Scribe",
  tagline: "Academic Typing & Lexical Reflex Engine",
  defaultTargetBand: 7.0,
  chunkSize: {
    min: 150,
    max: 220,
  },
  standardCharsPerWord: 5,
};

export const CEFR_LEVELS = ["B2", "C1", "C2", "Academic"] as const;

export const IELTS_BANDS = [
  6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0
] as const;
