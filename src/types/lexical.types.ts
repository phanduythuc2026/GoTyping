export interface AWLEntry {
  headword: string;
  sublist: number;
  relatedForms: string[];
}

export interface CollocationEntry {
  phrase: string;
  category?: string;
  cefrLevel?: string;
}

export interface LexicalTokenMatch {
  word: string;
  cleanWord: string;
  index: number;
  isAWL: boolean;
  awlSublist?: number;
  isCollocation: boolean;
  collocationGroup?: string;
}

export interface QuickVocabDefinition {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  vietnameseMeaning?: string;
  englishDefinition?: string;
  academicExample?: string;
  cefrLevel?: string;
}
