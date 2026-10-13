"use client";

import { create } from "zustand";
import { EnrichedVocabEntry, enrichCapturedTerm } from "@/modules/lexical-analyzer/auto-enricher";

interface VocabularyState {
  entries: EnrichedVocabEntry[];
  addTerm: (term: string, contextSentence?: string) => EnrichedVocabEntry;
  updateMastery: (id: string, level: number) => void;
  removeTerm: (id: string) => void;
  initStore: () => void;
  exportToAnkiTSV: () => void;
}

const INITIAL_ENTRIES: EnrichedVocabEntry[] = [
  enrichCapturedTerm(
    "empirical evidence",
    "Empirical evidence indicates that investment in solar and wind infrastructure curtails greenhouse gas emissions."
  ),
  enrichCapturedTerm(
    "mitigate",
    "Governments worldwide are implementing rigorous environmental policies to mitigate the catastrophic impacts of climate change."
  ),
  enrichCapturedTerm(
    "paramount",
    "While academic integrity remains a paramount concern, educators must adapt their assessment methodologies."
  ),
  enrichCapturedTerm(
    "play a crucial role",
    "Integrating green spaces into city planning plays a crucial role in enhancing mental well-being."
  ),
  enrichCapturedTerm(
    "it is widely acknowledged that",
    "It is widely acknowledged that collaborative learning frameworks foster critical thinking."
  ),
];

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  entries: INITIAL_ENTRIES,

  initStore: () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gotyping_vocab_entries");
        if (saved) {
          set({ entries: JSON.parse(saved) });
          return;
        }
      } catch (e) {
        console.error("Error reading vocab store:", e);
      }
    }
  },

  addTerm: (term: string, contextSentence?: string) => {
    const enriched = enrichCapturedTerm(term, contextSentence);
    const updated = [enriched, ...get().entries];
    set({ entries: updated });

    if (typeof window !== "undefined") {
      localStorage.setItem("gotyping_vocab_entries", JSON.stringify(updated));
    }
    return enriched;
  },

  updateMastery: (id: string, level: number) => {
    const updated = get().entries.map((item) =>
      item.id === id ? { ...item, mastery_level: Math.max(1, Math.min(5, level)) } : item
    );
    set({ entries: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("gotyping_vocab_entries", JSON.stringify(updated));
    }
  },

  removeTerm: (id: string) => {
    const updated = get().entries.filter((item) => item.id !== id);
    set({ entries: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("gotyping_vocab_entries", JSON.stringify(updated));
    }
  },

  exportToAnkiTSV: () => {
    const { entries } = get();
    if (entries.length === 0) return;

    // TSV Header: Front \t Back \t Tags
    const tsvLines = entries.map((item) => {
      const front = `${item.term} <span style="color:#818cf8">${item.ipa}</span> <small>(${item.part_of_speech})</small>`;
      const back = `<b>${item.definition_vi}</b><br><br><span style="color:#71717a">${item.definition_en}</span><br><br><i>&ldquo;${item.context_sentence}&rdquo;</i>`;
      const tags = `IELTS_${item.item_type} Topic_${item.topic} Mastery_${item.mastery_level}`;
      return `${front}\t${back}\t${tags}`;
    });

    const blob = new Blob([tsvLines.join("\n")], { type: "text/tab-separated-values;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ielts_scribe_anki_deck_${Date.now()}.tsv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
}));
