"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Keyboard,
  BarChart3,
  BookOpen,
  Bookmark,
  User,
  Sparkles,
  ShieldCheck,
  LogOut,
  Trophy,
  Pencil,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { TargetBandModal } from "./target-band-modal";
import { ThemeToggle } from "./theme-toggle";
import { GlobalEmergencyBanner } from "./global-emergency-banner";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, guestTargetBand, initAuth, logout } = useAuthStore();
  const [isBandModalOpen, setIsBandModalOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const navItems = [
    { href: "/", label: "Luyện Gõ", icon: Keyboard },
    { href: "/leaderboard", label: "Bảng Xếp Hạng", icon: Trophy },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/library", label: "Thư Viện Bài", icon: BookOpen },
    { href: "/vocabulary", label: "Sổ Tay Từ Vựng", icon: Bookmark },
  ];

  const isSuperAdmin = user?.role === "super_admin" || user?.username === "super_admin";

  return (
    <>
      {/* Global Emergency & Super Admin Bypass Banner */}
      <GlobalEmergencyBanner />

      <header className="w-full bg-surface/90 border-b border-surface-border sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Keyboard className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-1.5 font-sans">
                IELTS Scribe
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-zinc-400 -mt-0.5">
                Academic Typing & Lexical Reflex
              </span>
            </div>
          </Link>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm"
                      : "text-zinc-400 hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin link visible if super_admin */}
            {isSuperAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/admin"
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-950/40"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Quản Trị Admin</span>
              </Link>
            )}
          </nav>

          {/* User Status, Target Band & Theme Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Target Band Button with Edit Pen Icon */}
            <button
              onClick={() => setIsBandModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border hover:border-amber-500/50 text-xs transition-colors cursor-pointer group shadow-sm"
              title="Nhấp để thay đổi Target Band mục tiêu IELTS (5.0 - 9.0)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-zinc-400">Mục tiêu:</span>
              <span className="font-bold text-amber-400 font-mono">
                Band {(user?.target_band ?? guestTargetBand ?? 7.5).toFixed(1)}
              </span>
              <Pencil className="w-3 h-3 text-zinc-400 group-hover:text-amber-400 group-hover:rotate-12 transition-all" />
            </button>

            {/* WCAG AAA Dual Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={isSuperAdmin ? "/admin" : "/"}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface hover:bg-surface-elevated border border-surface-border text-foreground transition-colors shadow-sm"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSuperAdmin ? 'bg-emerald-500 text-zinc-950' : 'bg-indigo-600 text-white'}`}>
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-mono hidden sm:inline">{user.username}</span>
                  {isSuperAdmin && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/30">
                      ADMIN
                    </span>
                  )}
                </Link>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer shadow-sm"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface hover:bg-surface-elevated border border-surface-border text-foreground transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>

        <TargetBandModal
          isOpen={isBandModalOpen}
          onClose={() => setIsBandModalOpen(false)}
        />
      </header>
    </>
  );
};
