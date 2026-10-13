"use client";

import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  role: "super_admin" | "admin" | "user";
  target_band: number;
}

interface AuthState {
  user: UserProfile | null;
  guestTargetBand: number;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  initAuth: () => void;
  updateTargetBand: (band: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  guestTargetBand: 7.5,
  isLoading: true,

  initAuth: () => {
    if (typeof window !== "undefined") {
      let savedBand = 7.5;
      try {
        const storedBand = localStorage.getItem("target_band");
        if (storedBand) {
          const parsed = parseFloat(storedBand);
          if (!isNaN(parsed)) savedBand = parsed;
        }
      } catch (e) {
        console.error("Error loading local target_band:", e);
      }

      try {
        const saved = localStorage.getItem("gotyping_auth_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          set({ user: parsed, guestTargetBand: parsed.target_band || savedBand, isLoading: false });
          return;
        }
      } catch (e) {
        console.error("Error loading auth state:", e);
      }
      set({ user: null, guestTargetBand: savedBand, isLoading: false });
    }
  },

  login: async (usernameOrEmail: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Sai tài khoản hoặc mật khẩu.",
        };
      }

      const userProfile: UserProfile = data.user;
      if (typeof window !== "undefined") {
        localStorage.setItem("gotyping_auth_user", JSON.stringify(userProfile));
        localStorage.setItem("target_band", userProfile.target_band.toString());
      }

      set({ user: userProfile, guestTargetBand: userProfile.target_band });
      return { success: true };
    } catch (err: unknown) {
      console.error("Login request error:", err);
      return {
        success: false,
        error: "Không thể kết nối đến máy chủ xác thực.",
      };
    }
  },

  updateTargetBand: (band: number) => {
    const current = get().user;
    if (typeof window !== "undefined") {
      localStorage.setItem("target_band", band.toString());
    }
    if (current) {
      const updated = { ...current, target_band: band };
      if (typeof window !== "undefined") {
        localStorage.setItem("gotyping_auth_user", JSON.stringify(updated));
      }
      set({ user: updated, guestTargetBand: band });
    } else {
      set({ guestTargetBand: band });
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gotyping_auth_user");
      document.cookie = `gotyping_role=; path=/; max-age=0`;
    }
    set({ user: null });
  },
}));
