"use client";

import React, { useState } from "react";
import { Link2, Loader2, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { ExtractedArticle } from "@/types/article.types";

interface UrlExtractorBarProps {
  onArticleLoaded: (article: ExtractedArticle) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const SAMPLE_ARTICLES = [
  {
    title: "The Guardian: The Global Shift to Renewable Energy",
    domain: "theguardian.com",
    text: "The transition towards renewable energy has accelerated significantly over the past decade. Governments worldwide are implementing rigorous environmental policies to facilitate sustainable development and mitigate the catastrophic impacts of climate change. Empirical evidence indicates that investment in solar and wind infrastructure not only curtails greenhouse gas emissions but also generates substantial economic opportunities. Nevertheless, policymakers must address the intermittent nature of green power through advanced battery storage systems and cross-border grid integration.",
  },
  {
    title: "The Economist: Artificial Intelligence and Higher Education",
    domain: "economist.com",
    text: "The widespread adoption of artificial intelligence in higher education poses both formidable challenges and unprecedented pedagogical opportunities. While academic integrity remains a paramount concern, educators must adapt their assessment methodologies rather than imposing outright prohibitions. Collaborative human-machine learning frameworks can foster critical thinking, enhance student engagement, and provide individualized feedback. Consequently, universities must formulate comprehensive ethical guidelines to govern algorithmic decision-making in educational settings.",
  },
  {
    title: "BBC Academic: Urbanization and Sustainable Infrastructure",
    domain: "bbc.com",
    text: "Rapid urbanization has precipitated profound demographic and environmental transformations in emerging economies. Megacities face severe infrastructural constraints, ranging from inadequate public transportation to acute housing shortages. To accommodate expanding populations without exacerbating urban sprawl, municipal authorities must prioritize compact transit-oriented developments. Furthermore, integrating green spaces into city planning plays an indispensable role in enhancing mental well-being and mitigating the urban heat island effect.",
  },
];

export const UrlExtractorBar: React.FC<UrlExtractorBarProps> = ({
  onArticleLoaded,
  isLoading,
  setIsLoading,
}) => {
  const [url, setUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/parse-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể bóc tách nội dung từ link này.");
      }

      onArticleLoaded(data.data);
      setUrl("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_ARTICLES[0]) => {
    setErrorMsg(null);
    const mockArticle: ExtractedArticle = {
      title: sample.title,
      sourceUrl: `https://${sample.domain}/academic-sample`,
      sourceDomain: sample.domain,
      rawText: sample.text,
      cleanText: sample.text,
      wordCount: sample.text.split(/\s+/).length,
      lexicalLevel: "Academic",
      chunks: [sample.text],
      awlWords: [],
      collocations: [],
    };
    onArticleLoaded(mockArticle);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Search Input Bar */}
      <form onSubmit={handleExtract} className="relative flex items-center">
        <div className="absolute left-4 text-zinc-500 pointer-events-none">
          <Link2 className="w-5 h-5 text-indigo-400/80" />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Dán link bài báo học thuật (The Guardian, BBC, The Economist, Nature...)"
          disabled={isLoading}
          className="w-full pl-12 pr-36 py-3.5 bg-surface border border-surface-border rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-lg"
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="absolute right-2 px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shadow-md flex items-center gap-1.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang bóc tách...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Bóc tách bài</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 rounded-lg px-3.5 py-2">
          {errorMsg}
        </div>
      )}

      {/* Quick Academic Samples */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-400">
        <span className="flex items-center gap-1 text-zinc-500 font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          Bài mẫu IELTS:
        </span>
        {SAMPLE_ARTICLES.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample)}
            className="px-2.5 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors flex items-center gap-1"
          >
            <span>{sample.domain}</span>
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          </button>
        ))}
      </div>
    </div>
  );
};
