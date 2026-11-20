"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";

/**
 * Agency-grade scroll-velocity kinetic marquee:
 * Glides continuously and dynamically accelerates or reverses direction
 * in response to how fast the visitor scrolls!
 */
export default function EditorialMarquee() {
  const portfolio = usePortfolio();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 320,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 4.5], {
    clamp: false,
  });

  const directionRef = useRef(-1);

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta / 1000, 0.05);
    const vf = velocityFactor.get();
    if (vf < -0.15) directionRef.current = 1;
    else if (vf > 0.15) directionRef.current = -1;

    // Base cruise speed (% of half-track per second) + live scroll-velocity boost
    let moveBy = directionRef.current * 2.2 * dt;
    moveBy += directionRef.current * Math.abs(vf) * 3.8 * dt;

    let next = baseX.get() + moveBy;
    if (next <= -50) next += 50;
    if (next > 0) next -= 50;
    baseX.set(next);
  });

  const xPercent = useTransform(baseX, (v) => `${v.toFixed(3)}%`);
  const items = portfolio.marqueeItems.length > 0 ? portfolio.marqueeItems : ["AI ENGINEERING"];
  const repeated = [...items, ...items];

  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden border-y border-black bg-[#0A0A0A] py-3.5 text-white select-none"
    >
      {/* Edge fade masks for silky optical polish */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0A0A0A] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0A0A0A] to-transparent" />

      <motion.div
        style={{ x: xPercent, willChange: "transform" }}
        className="flex w-max items-center gap-8"
      >
        {repeated.map((label, idx) => (
          <div key={`${label}-${idx}`} className="flex items-center gap-8">
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium tracking-[0.22em] text-neutral-200 uppercase">
              {label}
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-500" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
