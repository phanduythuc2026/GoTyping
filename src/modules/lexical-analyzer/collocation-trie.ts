import { cleanToken } from "./lemmatizer";

interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfCollocation: boolean;
  phrase?: string;
  category?: string;
  cefrLevel?: string;
}

export class CollocationTrie {
  private root: TrieNode;

  constructor() {
    this.root = {
      children: new Map(),
      isEndOfCollocation: false,
    };
  }

  public insert(phrase: string, category?: string, cefrLevel?: string) {
    const rawTokens = phrase.trim().split(/\s+/);
    if (rawTokens.length === 0) return;

    let current = this.root;
    for (const raw of rawTokens) {
      const token = cleanToken(raw);
      if (!token) continue;

      if (!current.children.has(token)) {
        current.children.set(token, {
          children: new Map(),
          isEndOfCollocation: false,
        });
      }
      current = current.children.get(token)!;
    }

    current.isEndOfCollocation = true;
    current.phrase = phrase;
    current.category = category;
    current.cefrLevel = cefrLevel;
  }

  /**
   * Scans ahead starting from tokens[startIndex] and finds the longest matching collocation.
   * Returns length of tokens matched and the metadata.
   */
  public matchAt(tokens: string[], startIndex: number): { matchLength: number; phrase?: string; category?: string; cefrLevel?: string } | null {
    let current = this.root;
    let longestMatch: { matchLength: number; phrase?: string; category?: string; cefrLevel?: string } | null = null;
    let matchedCount = 0;

    for (let i = startIndex; i < tokens.length; i++) {
      const clean = cleanToken(tokens[i]);
      if (!clean) {
        matchedCount++;
        continue;
      }

      if (!current.children.has(clean)) {
        break;
      }

      current = current.children.get(clean)!;
      matchedCount++;

      if (current.isEndOfCollocation) {
        longestMatch = {
          matchLength: matchedCount,
          phrase: current.phrase,
          category: current.category,
          cefrLevel: current.cefrLevel,
        };
      }
    }

    return longestMatch;
  }
}
