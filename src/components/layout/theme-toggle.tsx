"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("gotyping_theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = storedTheme ? storedTheme === "dark" : systemPrefersDark;

    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gotyping_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gotyping_theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-surface border border-surface-border animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
      title={isDark ? "Chuyển sang giao diện Sáng (Light Focus)" : "Chuyển sang giao diện Tối (Dark)"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
