"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import Magnetic from "@/components/Magnetic";

const navItems = [
  { id: "hero", label: "Home", href: "#hero" },
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Stack", href: "#skills" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "crowd-footer", label: "City", href: "#crowd-footer" },
];

export default function Navbar() {
  const portfolio = usePortfolio();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("hero");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Smooth scroll progress line subtly refracted along the bottom glass rim
  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.0005,
  });

  // Live cursor-following specular liquid-glass highlight across the navbar surface
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseX, { stiffness: 180, damping: 24 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 180, damping: 24 });
  const glassSpotlight = useTransform(
    [smoothMouseX, smoothMouseY],
    ([mx, my]: number[]) =>
      `radial-gradient(220px circle at ${(mx * 100).toFixed(1)}% ${(
        my * 100
      ).toFixed(1)}%, rgba(255,255,255,0.85), rgba(255,255,255,0.18) 45%, transparent 72%)`
  );

  const handleNavMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = navRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleNavMouseLeave = () => {
    setHoveredId(null);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section cleanly with IntersectionObserver
  useEffect(() => {
    const allIds = [...navItems.map((n) => n.id), "contact"];
    const sections = allIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { threshold: [0.15, 0.4, 0.7], rootMargin: "-14% 0px -36% 0px" }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const pillTargetId = hoveredId ?? activeId;

  return (
    <header className="pointer-events-none fixed top-4 right-0 left-0 z-50 flex justify-center px-4">
      <div className="pointer-events-auto relative flex flex-col items-center">
        {/* ================= LIQUID FROSTED GLASS NAV PILL ================= */}
        <motion.nav
          ref={navRef}
          onMouseMove={handleNavMouseMove}
          onMouseLeave={handleNavMouseLeave}
          initial={{ y: -28, opacity: 0, scale: 0.94 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: scrolled ? 0.985 : 1,
          }}
          transition={{
            y: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.65 },
            scale: { type: "spring", stiffness: 220, damping: 26 },
          }}
          style={{
            boxShadow: scrolled
              ? "0 16px 42px -10px rgba(0,0,0,0.16), 0 4px 14px -2px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(0,0,0,0.06)"
              : "0 10px 30px -8px rgba(0,0,0,0.10), 0 2px 8px -2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)",
          }}
          className={`relative flex items-center gap-3 overflow-hidden rounded-full border border-white/80 bg-white/58 px-3.5 py-2 text-black ring-1 ring-black/[0.08] backdrop-blur-2xl backdrop-saturate-[1.85] transition-[background-color,padding] duration-500 ease-out sm:gap-4 ${
            scrolled ? "bg-white/70 sm:px-4.5" : "bg-white/54 sm:px-5"
          }`}
        >
          {/* Dynamic Liquid-Glass Specular Cursor Spotlight */}
          <motion.div
            style={{ background: glassSpotlight }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-80"
          />

          {/* Subtle Top Crystal Refraction Edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
          />

          {/* Brand Mark */}
          <a
            href="#hero"
            className="relative z-10 flex items-center gap-2 rounded-full px-3 py-1.5 font-[family-name:var(--font-display)] text-base font-bold tracking-tight text-[#0A0A0A] transition-opacity hover:opacity-70"
          >
            <span className="h-2 w-2 rounded-full bg-[#0A0A0A]" />
            <span>{portfolio.brandMark}</span>
          </a>

          {/* Vertical Hairline Glass Divider (Desktop) */}
          <span
            aria-hidden="true"
            className="relative z-10 hidden h-5 w-px bg-black/10 md:block"
          />

          {/* Desktop Smooth Sliding Liquid-Pill Links */}
          <div className="relative z-10 hidden items-center gap-1 md:flex">
            {navItems.slice(1).map((item) => {
              const isHighlighted = pillTargetId === item.id;
              const isCurrent = activeId === item.id;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onFocus={() => setHoveredId(item.id)}
                  onBlur={() => setHoveredId(null)}
                  className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 ${
                    isHighlighted
                      ? "text-black"
                      : isCurrent
                        ? "text-black"
                        : "text-neutral-600 hover:text-black"
                  }`}
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="liquid-glass-nav-pill"
                      transition={{
                        type: "spring",
                        stiffness: 340,
                        damping: 30,
                        mass: 0.75,
                      }}
                      style={{
                        boxShadow:
                          "0 2px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
                      }}
                      className="absolute inset-0 -z-10 rounded-full border border-black/[0.08] bg-white/85 backdrop-blur-md"
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="h-1 w-1 rounded-full bg-[#0A0A0A]" />
                    )}
                    <span>{item.label}</span>
                  </span>
                </a>
              );
            })}
          </div>

          {/* Mobile Active Section Micro Label */}
          <div className="relative z-10 flex items-center gap-1.5 border-l border-black/10 pl-3 md:hidden">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0A0A0A]" />
            <div className="relative h-4 w-16 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeId}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-wider text-neutral-700 uppercase"
                >
                  {navItems.find((n) => n.id === activeId)?.label ??
                    (activeId === "contact" ? "Contact" : "Home")}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Controls: Mobile Glass Menu Toggle + Magnetic Jet-Black Talk CTA */}
          <div className="relative z-10 flex items-center gap-1.5 pl-1">
            <motion.button
              type="button"
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/75 text-neutral-800 shadow-xs backdrop-blur-md transition-colors hover:bg-white hover:text-black md:hidden cursor-pointer"
            >
              <motion.span
                animate={{ rotate: menuOpen ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
              >
                {menuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </motion.span>
            </motion.button>

            <Magnetic strength={0.14}>
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#0A0A0A] px-5 py-2 text-[13px] font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-all duration-300 hover:bg-neutral-800 active:scale-95"
              >
                <span className="relative z-10 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="relative z-10">Hire Me</span>
                <ArrowUpRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                {/* Subtle hover sheen across the dark Hire Me CTA */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              </a>
            </Magnetic>
          </div>

          {/* Ultra-Subtle Scroll Progress Refraction Bar along Bottom Edge of Glass Pill */}
          <motion.div
            style={{ scaleX: smoothScrollProgress, transformOrigin: "0% 50%" }}
            aria-hidden="true"
            className="pointer-events-none absolute right-4 bottom-0 left-4 h-[1.5px] rounded-full bg-gradient-to-r from-black/30 via-black/70 to-black"
          />
        </motion.nav>

        {/* ================= FROSTED LIQUID GLASS MOBILE DRAWER ================= */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.94, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              style={{
                boxShadow:
                  "0 24px 60px -12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.92)",
              }}
              className="mt-2.5 w-60 overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-2 text-black ring-1 ring-black/[0.08] backdrop-blur-2xl backdrop-saturate-[1.85] md:hidden"
            >
              <div className="flex flex-col gap-0.5">
                {[...navItems.slice(1), { id: "contact", label: "Contact", href: "#contact" }].map(
                  (item, i) => {
                    const isActive = activeId === item.id;
                    return (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.035,
                          type: "spring",
                          stiffness: 340,
                          damping: 26,
                        }}
                        onClick={() => setMenuOpen(false)}
                        className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-[#0A0A0A] text-white shadow-sm"
                            : "text-neutral-700 hover:bg-white/80 hover:text-black"
                        }`}
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight
                          className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                            isActive
                              ? "opacity-100"
                              : "opacity-40 group-hover:opacity-100"
                          }`}
                        />
                      </motion.a>
                    );
                  }
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
