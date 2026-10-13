"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { LiveHUD } from "@/components/typing/live-hud";
import { TypingCanvas } from "@/components/typing/typing-canvas";
import { UrlExtractorBar } from "@/components/typing/url-extractor-bar";
import { GuestAmbientBanner } from "@/components/layout/guest-ambient-banner";
import { useTypingStore } from "@/modules/typing-engine/store";
import { useAuthStore } from "@/lib/auth-store";
import { ensureLexicalDictionariesLoaded } from "@/modules/lexical-analyzer/pipeline";
import { ExtractedArticle } from "@/types/article.types";
import { TypingSessionMetrics } from "@/types/typing.types";
import { Sparkles, Globe, Layers } from "lucide-react";

const INITIAL_ACADEMIC_PASSAGE = `The transition towards renewable energy has accelerated significantly over the past decade. Governments worldwide are implementing rigorous environmental policies to facilitate sustainable development and mitigate the catastrophic impacts of climate change. Empirical evidence indicates that investment in solar and wind infrastructure not only curtails greenhouse gas emissions but also generates substantial economic opportunities. Nevertheless, policymakers must address the intermittent nature of green power through advanced battery storage systems and cross-border grid integration.`;

export default function WorkspacePage() {
  const { initSession } = useTypingStore();
  const [currentArticle, setCurrentArticle] = useState<ExtractedArticle | null>(null);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);

  // Preload dictionaries and initialize default passage
  useEffect(() => {
    ensureLexicalDictionariesLoaded().then(() => {
      initSession(INITIAL_ACADEMIC_PASSAGE);
    });
  }, [initSession]);

  // Clean guest session memory upon tab or window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!useAuthStore.getState().user) {
        try {
          sessionStorage.removeItem("gotyping_guest_last_session");
          sessionStorage.removeItem("gotyping_guest_article");
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Tiered Session Lifecycle Manager
  const handleSessionComplete = useCallback(
    async (metrics: TypingSessionMetrics) => {
      const currentUser = useAuthStore.getState().user;

      // 1. Guest Mode: Store exclusively in client ephemeral storage (Zero Server Requests)
      if (!currentUser) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "gotyping_guest_last_session",
              JSON.stringify({
                metrics,
                completedAt: new Date().toISOString(),
              })
            );
          } catch {
            // Ignore
          }
        }
        return;
      }

      // 2. Authenticated Mode: Synchronize session to database via API & trigger rollup
      try {
        // Fetch fresh cryptographic nonce for replay attack defense
        let sessionNonce: string | undefined = undefined;
        try {
          const nonceRes = await fetch(`/api/typing/session?action=nonce&userId=${currentUser.id}`);
          const nonceData = await nonceRes.json();
          if (nonceData.success && nonceData.nonce) {
            sessionNonce = nonceData.nonce;
          }
        } catch {
          // Fallback in case of local offline preview
        }

        const totalErrors = Object.values(metrics.errorLog).reduce((a, b) => a + b, 0);

        // Save immediately to account-isolated localStorage
        if (typeof window !== "undefined") {
          try {
            const userKey = `gotyping_sessions_${currentUser.id}`;
            const existingRaw = localStorage.getItem(userKey);
            const userSessions = existingRaw ? JSON.parse(existingRaw) : [];
            userSessions.unshift({
              id: "sess-" + Date.now(),
              title: currentArticle?.title || "IELTS Academic Practice",
              domain: currentArticle?.sourceDomain || "academic.edu",
              wpm: metrics.rawWpm,
              netWpm: metrics.netWpm,
              accuracy: metrics.accuracy,
              words: metrics.completedWords,
              timeSpentSeconds: metrics.elapsedSeconds,
              keyErrorsSummary: metrics.errorLog,
              date: new Date().toLocaleString("vi-VN"),
              completedAt: new Date().toISOString(),
            });
            localStorage.setItem(userKey, JSON.stringify(userSessions.slice(0, 50)));
          } catch (e) {
            console.error("Local user session storage error:", e);
          }
        }

        await fetch("/api/typing/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            netWpm: metrics.netWpm,
            wpm: metrics.rawWpm,
            accuracy: metrics.accuracy,
            timeSpentSeconds: metrics.elapsedSeconds,
            errorCount: totalErrors,
            completedWords: metrics.completedWords,
            totalKeystrokes: metrics.totalKeystrokes || (metrics.completedWords * 5 + totalErrors),
            completedChars: metrics.completedWords * 5,
            nonce: sessionNonce,
            keyErrorsSummary: metrics.errorLog,
            articleId: null,
          }),
        });
      } catch (err) {
        console.warn("Could not sync typing session:", err);
      }
    },
    [currentArticle]
  );

  const handleArticleLoaded = (article: ExtractedArticle) => {
    setCurrentArticle(article);
    setChunkIndex(0);
    const firstChunk = article.chunks[0] || article.cleanText;
    initSession(firstChunk);
  };

  const handleSelectChunk = (index: number) => {
    if (!currentArticle || !currentArticle.chunks[index]) return;
    setChunkIndex(index);
    initSession(currentArticle.chunks[index]);
  };

  const handleNextChunk = () => {
    if (currentArticle && chunkIndex + 1 < currentArticle.chunks.length) {
      handleSelectChunk(chunkIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Top Extractor & Selector */}
        <section className="w-full">
          <UrlExtractorBar
            onArticleLoaded={handleArticleLoaded}
            isLoading={isLoadingArticle}
            setIsLoading={setIsLoadingArticle}
          />
        </section>

        {/* Article Meta Header if loaded */}
        {currentArticle && (
          <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {currentArticle.sourceDomain || "Học thuật"}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {currentArticle.lexicalLevel}
                </span>
                <span className="text-xs text-zinc-400">
                  {currentArticle.wordCount} từ tổng thể
                </span>
              </div>
              <h2 className="text-base font-bold text-zinc-100 font-sans line-clamp-1">
                {currentArticle.title}
              </h2>
            </div>

            {/* Chunk Navigator */}
            {currentArticle.chunks.length > 1 && (
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
                <Layers className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
                <span className="text-xs text-zinc-400 font-medium mr-1">Đoạn:</span>
                {currentArticle.chunks.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectChunk(idx)}
                    className={`w-7 h-7 rounded-md text-xs font-mono font-bold transition-colors ${
                      idx === chunkIndex
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live HUD Bar */}
        <section className="w-full">
          <LiveHUD />
        </section>

        {/* Main Typing Area */}
        <section className="w-full">
          <TypingCanvas
            onSessionComplete={handleSessionComplete}
            hasNextChunk={Boolean(currentArticle && chunkIndex + 1 < currentArticle.chunks.length)}
            onNextChunk={handleNextChunk}
          />
        </section>

        {/* Instructional Legend Footer */}
        <footer className="w-full py-4 border-t border-surface-border text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Đúng ký tự
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              Sai ký tự
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Từ vựng AWL (hover tra cứu)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              Cụm Collocation C1
            </span>
          </div>

          <div>
            <span>Ấn phím <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">Tab</kbd> để đặt lại</span>
          </div>
        </footer>
      </main>

      {/* Ambient Floating Banner for Guest Session */}
      <GuestAmbientBanner />
    </div>
  );
}
