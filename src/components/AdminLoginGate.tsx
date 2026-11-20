"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, Lock } from "lucide-react";

export default function AdminLoginGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Incorrect password.");
        setShakeKey((k) => k + 1);
        setPassword("");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#FAFAFA] px-4 text-[#0A0A0A]"
      style={{
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.11) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Back to live site link */}
      <a
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs backdrop-blur-md transition-colors hover:border-black hover:text-black"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Portfolio</span>
      </a>

      <motion.div
        key={shakeKey}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={
          shakeKey > 0
            ? { opacity: 1, y: 0, scale: 1, x: [0, -10, 10, -7, 7, -3, 0] }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: shakeKey > 0 ? 0.45 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-black/12 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.09)]"
      >
        {/* Minimal Jet-Black Header */}
        <div className="flex items-center justify-between bg-[#0A0A0A] px-7 py-6 text-white">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] text-neutral-400 uppercase">
              PROTECTED ROUTE · /DHINA
            </p>
            <h1 className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
              Admin Login
            </h1>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
            <Lock className="h-4 w-4 text-white" />
          </span>
        </div>

        {/* Clean White Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-7">
          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase"
            >
              Enter Admin Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoFocus
                required
                suppressHydrationWarning
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter password..."
                className="w-full rounded-xl border border-black/15 bg-[#FAFAFA] py-3 pr-11 pl-4 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-neutral-400 transition-colors hover:text-black cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {error && (
              <p className="mt-2.5 text-xs font-medium text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#0A0A0A] px-5 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-40 cursor-pointer"
          >
            <span>{loading ? "Verifying..." : "Unlock Admin CMS"}</span>
            {!loading && (
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
