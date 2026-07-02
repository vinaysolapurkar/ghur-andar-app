"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions/auth";

type Role = "admin" | "dtd";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRoleSelect(role: Role) {
    setSelectedRole(role);
    setPin("");
    setError("");
  }

  function handleBack() {
    setSelectedRole(null);
    setPin("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole || pin.length !== 4) return;

    setLoading(true);
    setError("");

    try {
      const result = await login(pin, selectedRole);
      if (result.success) {
        router.push(selectedRole === "admin" ? "/admin/dashboard" : "/dtd/dashboard");
      } else {
        setError("Incorrect PIN");
        setPin("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-amber-400"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
          Ghur<span className="text-amber-400">.</span>Andar
        </h1>
        <p className="text-slate-400 text-sm mt-1">Order Management</p>
      </div>

      <div className="w-full max-w-sm">
        {!selectedRole ? (
          /* Role Selection */
          <div className="space-y-4">
            <p className="text-center text-slate-400 text-sm mb-6">Who are you?</p>

            <button
              type="button"
              onClick={() => handleRoleSelect("admin")}
              className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/80 active:scale-[0.98] transition-all text-left group"
            >
              <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-amber-400"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <div>
                <div className="font-semibold text-slate-100 text-base">I&apos;m Nilesh</div>
                <div className="text-sm text-slate-400">Admin access</div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-slate-600 ml-auto"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("dtd")}
              className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/80 active:scale-[0.98] transition-all text-left group"
            >
              <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700/50 border border-slate-600/50 group-hover:border-slate-500/50 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-slate-300"
                >
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </span>
              <div>
                <div className="font-semibold text-slate-100 text-base">I&apos;m DTD Partner</div>
                <div className="text-sm text-slate-400">Delivery & tracking</div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-slate-600 ml-auto"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : (
          /* PIN Entry */
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 mb-6 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-4 h-4"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>

            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-slate-100">
                {selectedRole === "admin" ? "Welcome, Nilesh" : "Welcome, DTD Partner"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">Enter your 4-digit PIN</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPin(val);
                    setError("");
                  }}
                  placeholder="••••"
                  className="w-full text-center text-3xl tracking-[0.5em] font-bold px-6 py-5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  autoFocus
                  autoComplete="current-password"
                />
                {error && (
                  <p className="mt-3 text-center text-sm text-red-400 font-medium">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={pin.length !== 4 || loading}
                className="w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
