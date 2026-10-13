"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Keyboard, Trophy, BarChart3, BookOpen, Bookmark, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin" || user?.username === "super_admin";

  const navItems = [
    { href: "/", label: "Luyện Gõ", icon: Keyboard },
    { href: "/leaderboard", label: "BXH", icon: Trophy },
    { href: "/analytics", label: "Thống Kê", icon: BarChart3 },
    { href: "/library", label: "Bài Báo", icon: BookOpen },
    { href: "/vocabulary", label: "Sổ Tay", icon: Bookmark },
  ];

  if (isSuperAdmin) {
    navItems.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 border-t border-surface-border backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive
                ? "text-indigo-400 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400 scale-110" : ""}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
