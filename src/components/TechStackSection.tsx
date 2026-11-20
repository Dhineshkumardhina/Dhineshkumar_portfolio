"use client";

import { type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";

/** Cursor-tracking spotlight Bento card with silky hover elevation */
function SpotlightCard({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 200, damping: 26 });
  const sy = useSpring(my, { stiffness: 200, damping: 26 });

  const spotlight = useTransform(
    [sx, sy],
    ([lx, ly]: number[]) =>
      `radial-gradient(280px circle at ${(lx * 100).toFixed(1)}% ${(
        ly * 100
      ).toFixed(1)}%, rgba(0,0,0,0.045), transparent 70%)`
  );

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 24 } }}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-[#FAFAFA] p-6 transition-[border-color,background-color,box-shadow] duration-300 hover:border-black/25 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)]"
    >
      <motion.div
        style={{ background: spotlight }}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative z-10 flex h-full flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}

export default function TechStackSection() {
  const portfolio = usePortfolio();
  return (
    <section
      id="skills"
      className="relative w-full bg-white px-6 py-20 text-black sm:px-10 lg:px-14 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Compact Header Row */}
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 44, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em] text-[#0A0A0A] sm:text-6xl"
            >
              Tech Stack
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="max-w-xs text-left text-xs leading-relaxed text-neutral-500 sm:text-right sm:text-sm"
          >
            {portfolio.techStackSubtitle}
          </motion.p>
        </div>

        {/* Balanced 3-Column Spotlight Bento Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {portfolio.techCategories.map((category, colIdx) => (
            <SpotlightCard key={category.title} delay={colIdx * 0.1}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-6 items-center rounded-md bg-[#0A0A0A] px-2 font-[family-name:var(--font-mono)] text-[10px] font-semibold text-white">
                    0{colIdx + 1}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-[10px] text-neutral-400">
                    {category.skills.length} TOOLS
                  </span>
                </div>

                <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight tracking-[-0.025em] text-[#0A0A0A]">
                  {category.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                  {category.description}
                </p>
              </div>

              {/* Staggered Spring Pill Badges */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      delayChildren: 0.1 + colIdx * 0.08,
                      staggerChildren: 0.028,
                    },
                  },
                }}
                className="mt-6 flex flex-wrap gap-2 border-t border-black/[0.08] pt-5"
              >
                {category.skills.map((skill) => (
                  <motion.span
                    key={skill.name}
                    variants={{
                      hidden: { opacity: 0, y: 10, scale: 0.92 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 340,
                          damping: 22,
                        },
                      },
                    }}
                    whileHover={{
                      y: -3,
                      scale: 1.06,
                      transition: { type: "spring", stiffness: 450, damping: 18 },
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`cursor-default rounded-md border px-2.5 py-1.5 text-xs font-medium tracking-tight transition-colors duration-200 ${
                      skill.highlighted
                        ? "border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-xs hover:bg-neutral-800"
                        : "border-black/12 bg-white text-neutral-900 hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white"
                    }`}
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </motion.div>
            </SpotlightCard>
          ))}
        </div>

        {/* Bottom 4-Tile Engineering Architecture Strip */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portfolio.principles.map((item, idx) => (
            <motion.div
              key={item.code}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              whileHover={{ y: -3, transition: { type: "spring", stiffness: 360, damping: 24 } }}
              transition={{ duration: 0.55, delay: idx * 0.07 }}
              className="rounded-xl border border-black/10 bg-white px-4 py-3.5 shadow-2xs transition-all hover:border-black/25 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold text-neutral-400">
                  {item.code}
                </span>
                <h4 className="text-xs font-bold text-[#0A0A0A]">{item.title}</h4>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
