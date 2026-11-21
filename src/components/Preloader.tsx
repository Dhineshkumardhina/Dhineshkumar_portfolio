"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";

// Module-level guard so React StrictMode or remounts can never run the intro twice
let introCompleted = false;

/**
 * Clean, single-pass cinematic loading screen:
 * - Matte jet-black stage contrasting cleanly against the crisp white Hero
 * - Single continuous RAF-eased 00 → 100% counter & hairline progress bar
 * - Locks Lenis scroll during intro so no accidental double-scroll occurs
 * - Smooth GPU camera-dissolve exit into the ready Hero (zero vertical jump)
 */
export default function Preloader() {
  const portfolio = usePortfolio();
  const [percent, setPercent] = useState(0);
  const [stage, setStage] = useState<"loading" | "exiting" | "done">(() =>
    introCompleted ? "done" : "loading"
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (introCompleted || startedRef.current) return;
    startedRef.current = true;

    // Pause smooth scrolling while the loading screen is active
    const getLenis = () =>
      (window as unknown as { __lenis?: { stop: () => void; start: () => void } })
        .__lenis;
    getLenis()?.stop();

    let rafId = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const duration = 920; // Single smooth ~0.9s cinematic count
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth easeOutQuart progression
      const eased = 1 - Math.pow(1 - t, 4);
      const nextVal = Math.round(eased * 100);
      setPercent(nextVal);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        exitTimer = setTimeout(() => {
          introCompleted = true;
          getLenis()?.start();
          setStage("exiting");
        }, 120);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (exitTimer) clearTimeout(exitTimer);
      getLenis()?.start();
    };
  }, []);

  if (stage === "done") return null;

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 1, scale: 1 }}
      animate={
        stage === "exiting"
          ? { opacity: 0, scale: 1.03 }
          : { opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (stage === "exiting") {
          setStage("done");
        }
      }}
      style={{ willChange: "transform, opacity" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A] text-white select-none"
    >
      {/* Subtle radial spotlight behind center mark */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(480px circle at 50% 50%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />

      <motion.div
        animate={
          stage === "exiting"
            ? { opacity: 0, y: -12, scale: 0.97 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-xs flex-col items-center px-6"
      >
        {/* Crisp Brand Signature */}
        <div className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-mono)] text-xl font-light text-neutral-500 sm:text-2xl">
            &lt;
          </span>
          <span className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
            {portfolio.brandMark}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-xl font-light text-neutral-500 sm:text-2xl">
            /&gt;
          </span>
        </div>

        {/* Synchronized Hairline Progress Track */}
        <div className="mt-6 h-[2px] w-full overflow-hidden rounded-full bg-white/12">
          <div
            style={{
              transform: `scaleX(${percent / 100})`,
              transformOrigin: "0% 50%",
              willChange: "transform",
            }}
            className="h-full w-full bg-white"
          />
        </div>

        {/* Tabular Percentage + Year Row */}
        <div className="mt-3 flex w-full items-center justify-between font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] text-neutral-400 uppercase">
          <span>PORTFOLIO {portfolio.year}</span>
          <span className="font-semibold text-white tabular-nums">
            {String(percent).padStart(2, "0")}%
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
