"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";

/**
 * Cinema-smooth GPU-composited White-Gallery Preloader:
 * - Single unified layer (no twin-curtain center seam flicker)
 * - Waits for hydration + font readiness (capped fast) before lifting
 * - Unmounts cleanly via onAnimationComplete (never cuts off mid-frame)
 */
export default function Preloader() {
  const portfolio = usePortfolio();
  const [stage, setStage] = useState<"loading" | "lifting" | "done">("loading");

  useEffect(() => {
    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const startLift = () => {
      if (cancelled) return;
      setStage("lifting");
    };

    // Wait 2 animation frames so initial layout & styles are painted smoothly,
    // then race document.fonts.ready against a tight 420ms ceiling.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const minHold = new Promise<void>((res) => setTimeout(res, 380));
        const fontsReady =
          typeof document !== "undefined" && "fonts" in document
            ? Promise.race([
                document.fonts.ready.then(() => undefined),
                new Promise<void>((res) => setTimeout(res, 420)),
              ])
            : Promise.resolve();

        Promise.all([minHold, fontsReady]).then(() => {
          if (!cancelled) startLift();
        });
      });
    });

    // Hard safety fallback so preloader can never get stuck
    timer = setTimeout(startLift, 1100);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (stage === "done") return null;

  return (
    <motion.div
      aria-hidden="true"
      initial={{ y: "0%", opacity: 1 }}
      animate={
        stage === "lifting"
          ? { y: "-100%", opacity: 1 }
          : { y: "0%", opacity: 1 }
      }
      transition={{
        duration: 0.62,
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={() => {
        if (stage === "lifting") {
          setStage("done");
        }
      }}
      style={{ willChange: "transform" }}
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAFA] shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
    >
      <motion.div
        animate={
          stage === "lifting"
            ? { opacity: 0, y: -18, scale: 0.98 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform, opacity" }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-[family-name:var(--font-mono)] text-2xl font-light text-neutral-400 sm:text-4xl">
            &lt;
          </span>
          <span className="block font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-[#0A0A0A] sm:text-5xl">
            {portfolio.brandMark}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-2xl font-light text-neutral-400 sm:text-4xl">
            /&gt;
          </span>
        </div>

        {/* Silky GPU-scaled hairline progress bar */}
        <div className="mt-4 h-[2px] w-36 overflow-hidden rounded-full bg-black/10 sm:w-44">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "0% 50%", willChange: "transform" }}
            className="h-full w-full bg-[#0A0A0A]"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
