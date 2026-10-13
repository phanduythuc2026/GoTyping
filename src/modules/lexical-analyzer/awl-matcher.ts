import { getWordVariants, cleanToken } from "./lemmatizer";

// Fallback embedded AWL map for zero-latency client evaluation
let awlCache: Map<string, number> | null = null;

export function initializeAWLMap(sublistsData: Record<string, string[]>): Map<string, number> {
  const map = new Map<string, number>();
  for (const [sublistStr, words] of Object.entries(sublistsData)) {
    const sublistNum = parseInt(sublistStr, 10);
    for (const w of words) {
      map.set(w.toLowerCase(), sublistNum);
    }
  }
  awlCache = map;
  return map;
}

export function isAWLWord(rawWord: string, customMap?: Map<string, number>): { isAWL: boolean; sublist?: number; matchedWord?: string } {
  const map = customMap || awlCache;
  if (!map) {
    // If not yet initialized, return false
    return { isAWL: false };
  }

  const variants = getWordVariants(rawWord);
  for (const variant of variants) {
    if (map.has(variant)) {
      return {
        isAWL: true,
        sublist: map.get(variant),
        matchedWord: variant,
      };
    }
  }

  const clean = cleanToken(rawWord);
  if (map.has(clean)) {
    return {
      isAWL: true,
      sublist: map.get(clean),
      matchedWord: clean,
    };
  }

  return { isAWL: false };
}
