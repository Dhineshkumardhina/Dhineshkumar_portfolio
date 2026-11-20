"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";

const NODE_POINTS = [
  { x: 100, y: 34 },
  { x: 300, y: 84 },
  { x: 500, y: 38 },
  { x: 700, y: 82 },
  { x: 900, y: 46 },
];

const WAVE_PATH =
  "M 0 54 C 45 50, 62 34, 100 34 C 175 34, 225 84, 300 84 C 375 84, 425 38, 500 38 C 575 38, 625 82, 700 82 C 775 82, 825 46, 900 46 C 945 46, 972 56, 1000 60";

const MILESTONE_TAGS = ["CURRENT", "FREELANCE", "POSTGRAD", "INTERNSHIP", "UNDERGRAD"];

export default function ExperienceSection() {
  const portfolio = usePortfolio();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Live scroll-scrubbed ink curve drawing
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "center 45%"],
  });
  const scrubbedPath = useSpring(
    useTransform(scrollYProgress, [0, 1], [0.05, 1]),
    { stiffness: 90, damping: 24 }
  );

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative w-full border-t border-black/[0.08] bg-white px-6 py-20 text-black sm:px-10 lg:px-14 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Header Row */}
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 46, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em] text-[#0A0A0A] sm:text-6xl"
            >
              Experience.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-left text-xs leading-relaxed text-neutral-500 sm:text-right sm:text-sm"
          >
            {portfolio.experienceSubtitle.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Desktop Horizontal Jet-Black Wavy SVG Timeline */}
        <div className="mt-10 hidden lg:block">
          <div className="relative h-[112px] w-full">
            <svg
              viewBox="0 0 1000 120"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <path
                d={WAVE_PATH}
                fill="none"
                stroke="rgba(0,0,0,0.10)"
                strokeWidth="1.5"
              />

              <motion.path
                d={WAVE_PATH}
                fill="none"
                stroke="url(#waveGradDark)"
                strokeWidth="2.3"
                strokeLinecap="round"
                style={{ pathLength: scrubbedPath }}
              />

              {/* Continuous black ink comet traveling along the sine curve */}
              <circle r="4.5" fill="#0A0A0A" opacity="0.92">
                <animateMotion
                  dur="6.5s"
                  repeatCount="indefinite"
                  path={WAVE_PATH}
                />
              </circle>

              <defs>
                <linearGradient id="waveGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0A0A0A" stopOpacity="1" />
                  <stop offset="60%" stopColor="#333333" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#888888" stopOpacity="0.55" />
                </linearGradient>
              </defs>
            </svg>

            {/* Milestone Dots */}
            {portfolio.experiences.slice(0, 5).map((item, idx) => {
              const pt = NODE_POINTS[idx];
              if (!pt) return null;
              const isActive = hoveredIdx === idx;
              const isCurrent = item.isCurrent;

              return (
                <motion.div
                  key={item.title}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 20,
                    delay: 0.16 + idx * 0.14,
                  }}
                  style={{
                    left: `${(pt.x / 1000) * 100}%`,
                    top: `${(pt.y / 120) * 100}%`,
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <div
                    className={`pointer-events-none absolute top-3 left-1/2 w-px -translate-x-1/2 transition-all duration-300 ${
                      isActive || isCurrent
                        ? "h-16 bg-gradient-to-b from-black/75 to-transparent"
                        : "h-10 bg-gradient-to-b from-black/20 to-transparent"
                    }`}
                  />

                  {isCurrent && (
                    <span className="absolute -inset-2.5 animate-ping rounded-full bg-black/20" />
                  )}

                  <motion.span
                    animate={{ scale: isCurrent || isActive ? 1.3 : 1 }}
                    transition={{ type: "spring", stiffness: 360, damping: 20 }}
                    className={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                      isCurrent || isActive
                        ? "border-[#0A0A0A] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.22)]"
                        : "border-black/40 bg-white"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        isCurrent || isActive ? "bg-[#0A0A0A]" : "bg-neutral-400"
                      }`}
                    />
                  </motion.span>
                </motion.div>
              );
            })}
          </div>

          {/* 5-Column Structured Architectural Cards (no empty floating gaps) */}
          <div className="mt-5 grid grid-cols-5 gap-4">
            {portfolio.experiences.slice(0, 5).map((item, idx) => {
              const isActive = hoveredIdx === idx;
              const isCurrent = item.isCurrent;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.58,
                    delay: 0.18 + idx * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  animate={{ y: isActive ? -5 : 0 }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                    isActive
                      ? "border-[#0A0A0A] bg-white shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
                      : "border-black/10 bg-[#FAFAFA]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold tracking-wider ${
                          isCurrent
                            ? "bg-[#0A0A0A] text-white"
                            : "border border-black/12 bg-white text-neutral-600"
                        }`}
                      >
                        {item.tag || MILESTONE_TAGS[idx] || "MILESTONE"}
                      </span>
                    </div>

                    <p className="mt-3 font-[family-name:var(--font-mono)] text-[10px] text-neutral-500">
                      {item.period}
                    </p>
                    <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-sm font-bold leading-snug tracking-[-0.02em] text-[#0A0A0A]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs font-semibold text-neutral-700">
                      {item.organization}
                    </p>
                  </div>

                  <p className="mt-3 border-t border-black/[0.06] pt-2.5 text-[11px] leading-relaxed text-neutral-500">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile / Tablet Vertical Timeline */}
        <div className="mt-10 space-y-4 lg:hidden">
          {portfolio.experiences.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="rounded-2xl border border-black/10 bg-[#FAFAFA] p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded px-2 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold ${
                    item.isCurrent
                      ? "bg-[#0A0A0A] text-white"
                      : "border border-black/12 bg-white text-neutral-600"
                  }`}
                >
                  {item.tag || MILESTONE_TAGS[idx] || "MILESTONE"}
                </span>
                <p className="font-[family-name:var(--font-mono)] text-[11px] text-neutral-500">
                  {item.period}
                </p>
              </div>
              <h3 className="mt-2.5 font-[family-name:var(--font-display)] text-lg font-bold text-[#0A0A0A]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-neutral-700">
                {item.organization}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
