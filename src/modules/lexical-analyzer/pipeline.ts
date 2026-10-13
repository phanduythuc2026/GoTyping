import { isAWLWord, initializeAWLMap } from "./awl-matcher";
import { CollocationTrie } from "./collocation-trie";
import { cleanToken } from "./lemmatizer";
import { WordNode, CharNode } from "@/types/typing.types";

let globalTrie: CollocationTrie | null = null;
let initialized = false;

export async function ensureLexicalDictionariesLoaded() {
  if (initialized) return;

  try {
    // Attempt to load dictionaries from public static path or inline fallback
    let awlRes = null;
    let colRes = null;

    if (typeof window !== "undefined") {
      awlRes = await fetch("/dictionaries/awl_sublists.json").then((r) => r.json()).catch(() => null);
      colRes = await fetch("/dictionaries/academic_collocations.json").then((r) => r.json()).catch(() => null);
    }

    if (awlRes) {
      initializeAWLMap(awlRes);
    }
    
    globalTrie = new CollocationTrie();
    if (Array.isArray(colRes)) {
      for (const item of colRes) {
        globalTrie.insert(item.phrase, item.category, item.cefrLevel);
      }
    }
    initialized = true;
  } catch (err) {
    console.warn("Could not load lexical dictionaries from fetch:", err);
  }
}

/**
 * Parses raw text into an array of WordNode objects with character-level details and lexical flags
 */
export function parseTextIntoWordNodes(text: string): WordNode[] {
  if (!text) return [];

  // Split text into tokens while preserving whitespace as word separation
  const rawTokens = text.trim().split(/\s+/);
  const wordNodes: WordNode[] = [];

  let skipUntilIndex = -1;

  for (let i = 0; i < rawTokens.length; i++) {
    const rawWord = rawTokens[i];
    const clean = cleanToken(rawWord);
    
    // Check AWL
    const awlCheck = isAWLWord(clean);

    // Check Collocation match starting at i if trie is available
    let isColloc = false;
    let collocGroup: string | undefined;

    if (globalTrie && i >= skipUntilIndex) {
      const match = globalTrie.matchAt(rawTokens, i);
      if (match && match.matchLength > 1) {
        isColloc = true;
        collocGroup = match.phrase;
        skipUntilIndex = i + match.matchLength;
      }
    } else if (i < skipUntilIndex) {
      isColloc = true;
    }

    // Build character nodes for typing
    const chars: CharNode[] = [];
    for (let c = 0; c < rawWord.length; c++) {
      chars.push({
        char: rawWord[c],
        status: "pending",
      });
    }

    wordNodes.push({
      wordIndex: i,
      original: rawWord,
      cleanWord: clean,
      chars,
      isAWL: awlCheck.isAWL,
      awlSublist: awlCheck.sublist,
      isCollocation: isColloc,
      collocationGroup: collocGroup,
      isCompleted: false,
      hasErrors: false,
    });
  }

  return wordNodes;
}
