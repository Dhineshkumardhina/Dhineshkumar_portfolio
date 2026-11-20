"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";

/**
 * Native White-Gallery Editorial Preloader:
 * Matches the mostly-white minimalist palette & `< />` Hero typography.
 * Brackets smoothly part open to reveal `Dhinesh.` before cleanly parting
 * like twin gallery curtains into the Hero with zero harsh black flash.
 */
export default function Preloader() {
  const portfolio = usePortfolio();
  const [phase, setPhase] = useState<"intro" | "reveal" | "done">("intro");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 820);
    const t2 = setTimeout(() => setPhase("done"), 1550);
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
          transition={{ duration: 0.2 }}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
        >
          {/* Twin Crisp White Architectural Curtain Halves (part smoothly left & right) */}
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: phase === "reveal" ? "-100%" : "0%" }}
            transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 border-r border-black/[0.06] bg-[#FAFAFA]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.10) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <motion.div
            initial={{ x: "0%" }}
            animate={{ x: phase === "reveal" ? "100%" : "0%" }}
            transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-y-0 right-0 w-1/2 border-l border-black/[0.06] bg-[#FAFAFA]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.10) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Center Kinetic `< Dhinesh. />` Signature Mark */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={
              phase === "reveal"
                ? { opacity: 0, scale: 0.94, filter: "blur(6px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex h-full w-full flex-col items-center justify-center"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Left bracket gliding outward */}
              <motion.span
                initial={{ x: 18, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="font-[family-name:var(--font-mono)] text-2xl font-light text-neutral-400 sm:text-4xl"
              >
                &lt;
              </motion.span>

              {/* Brand name rising smoothly between the brackets */}
              <div className="overflow-hidden py-1">
                <motion.span
                  initial={{ y: "105%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.58,
                    delay: 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="block font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-[#0A0A0A] sm:text-5xl"
                >
                  {portfolio.brandMark}
                </motion.span>
              </div>

              {/* Right bracket gliding outward */}
              <motion.span
                initial={{ x: -18, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="font-[family-name:var(--font-mono)] text-2xl font-light text-neutral-400 sm:text-4xl"
              >
                /&gt;
              </motion.span>
            </div>

            {/* Expanding Minimal Jet-Black Ink Hairline */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 h-[1.5px] w-36 bg-[#0A0A0A] sm:w-44"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
