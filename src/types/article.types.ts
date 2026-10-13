export interface ExtractedArticle {
  id?: string;
  title: string;
  byline?: string;
  sourceUrl?: string;
  sourceDomain?: string;
  rawText: string;
  cleanText: string;
  wordCount: number;
  lexicalLevel: 'B2' | 'C1' | 'C2' | 'Academic';
  chunks: string[];
  awlWords: string[];
  collocations: string[];
}

export interface ParseArticleRequest {
  url: string;
}

export interface ParseArticleResponse {
  success: boolean;
  data?: ExtractedArticle;
  error?: string;
}
