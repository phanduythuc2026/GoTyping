"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, X } from "lucide-react";

interface ChangelogData {
  id: string;
  title: string;
  content: string;
  version_tag: string;
}

export const ChangelogModal: React.FC = () => {
  const [changelog, setChangelog] = useState<ChangelogData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadChangelog() {
      try {
        const res = await fetch("/api/admin/announcements");
        const data = await res.json();
        if (data.success && Array.isArray(data.announcements)) {
          interface AnnItem {
            id: string;
            type: string;
            is_active: boolean;
            title: string;
            content: string;
            version_tag: string | null;
          }
          const activeChangelog = data.announcements.find(
            (a: AnnItem) => a.type === "changelog_modal" && a.is_active && a.version_tag
          );

          if (activeChangelog) {
            const hasSeen = localStorage.getItem(`gotyping_changelog_${activeChangelog.version_tag}`);
            if (!hasSeen) {
              setChangelog({
                id: activeChangelog.id,
                title: activeChangelog.title,
                content: activeChangelog.content,
                version_tag: activeChangelog.version_tag,
              });
              setIsOpen(true);
            }
          }
        }
      } catch (e) {
        console.error("Changelog fetch error:", e);
      }
    }

    loadChangelog();
  }, []);

  const handleDismiss = () => {
    if (changelog?.version_tag) {
      localStorage.setItem(`gotyping_changelog_${changelog.version_tag}`, "acknowledged");
    }
    setIsOpen(false);
  };

  if (!isOpen || !changelog) return null;

  const bulletPoints = changelog.content.split("\n").filter((line) => line.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">{changelog.title}</h3>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {changelog.version_tag}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Các tính năng & cải tiến học thuật mới nhất</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-2.5 py-1">
          {bulletPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-surface-border">
          <button
            onClick={handleDismiss}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã hiểu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
