"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Keyboard, Lock, User, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const accessError = searchParams.get("error");

  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await login(usernameOrEmail, password);

      if (!res.success) {
        throw new Error(res.error || "Đăng nhập thất bại.");
      }

      if (usernameOrEmail.trim().toLowerCase() === "super_admin") {
        router.push("/admin");
      } else {
        router.push(redirectTarget);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
      {/* Brand */}
      <div className="flex flex-col items-center text-center gap-2">
        <Link
          href="/"
          className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 hover:scale-105 transition-transform"
        >
          <Keyboard className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-extrabold text-zinc-100">Đăng Nhập IELTS Scribe</h1>
        <p className="text-xs text-zinc-400">
          Hệ thống xác thực phản xạ gõ học thuật & phân quyền RBAC bảo mật cao.
        </p>
      </div>

      {/* Redirect notice if attempting unauthorized admin route */}
      {accessError === "unauthorized_admin_access" && (
        <div className="p-3 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Khu vực giới hạn: Vui lòng đăng nhập quyền Super Admin để tiếp tục.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-300">Tên đăng nhập hoặc Email</label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Nhập username hoặc email của bạn"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-300">Mật khẩu</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Vào Hệ Thống</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-zinc-400">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
          Đăng ký miễn phí
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-2xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
