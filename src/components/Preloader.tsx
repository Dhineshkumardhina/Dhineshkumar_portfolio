"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";

/**
 * Ultra-fast White-Gallery Editorial Preloader (~0.68s total):
 * Plays once per browser session so repeat loads are 0ms instant,
 * and reveals the Hero rapidly without blocking perceived load speed.
 */
export default function Preloader() {
  const portfolio = usePortfolio();
  const [phase, setPhase] = useState<"intro" | "reveal" | "done">("intro");

  useEffect(() => {
    try {
      if (sessionStorage.getItem("dhina_intro_seen") === "1") {
        setPhase("done");
        return;
      }
      sessionStorage.setItem("dhina_intro_seen", "1");
    } catch {
      // Ignore storage restrictions
    }

    const t1 = setTimeout(() => setPhase("reveal"), 320);
    const t2 = setTimeout(() => setPhase("done"), 780);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="gallery-preloader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
        >
          {/* Twin Crisp White Curtain Halves */}
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: phase === "reveal" ? "-100%" : "0%" }}
            transition={{ duration: 0.44, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 border-r border-black/[0.06] bg-[#FAFAFA]"
          />
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: phase === "reveal" ? "100%" : "0%" }}
            transition={{ duration: 0.44, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-y-0 right-0 w-1/2 border-l border-black/[0.06] bg-[#FAFAFA]"
          />

          {/* Center Kinetic `< Dhina />` Signature */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={
              phase === "reveal"
                ? { opacity: 0, scale: 0.96 }
                : { opacity: 1, scale: 1 }
            }
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex h-full w-full flex-col items-center justify-center"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.span
                initial={{ x: 12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="font-[family-name:var(--font-mono)] text-2xl font-light text-neutral-400 sm:text-4xl"
              >
                &lt;
              </motion.span>

              <motion.span
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="block font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-[#0A0A0A] sm:text-5xl"
              >
                {portfolio.brandMark}
              </motion.span>

              <motion.span
                initial={{ x: -12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="font-[family-name:var(--font-mono)] text-2xl font-light text-neutral-400 sm:text-4xl"
              >
                /&gt;
              </motion.span>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 h-[1.5px] w-32 bg-[#0A0A0A] sm:w-40"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
