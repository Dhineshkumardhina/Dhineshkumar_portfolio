"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoverType, setHoverType] = useState<"default" | "link" | "label">("default");
  const [cursorLabel, setCursorLabel] = useState("");
  const [pressed, setPressed] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const dotX = useSpring(mouseX, { stiffness: 680, damping: 42, mass: 0.25 });
  const dotY = useSpring(mouseY, { stiffness: 680, damping: 42, mass: 0.25 });
  const ringX = useSpring(mouseX, { stiffness: 200, damping: 25, mass: 0.5 });
  const ringY = useSpring(mouseY, { stiffness: 200, damping: 25, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const labelHost = target.closest("[data-cursor]") as HTMLElement | null;
      if (labelHost) {
        const label = labelHost.getAttribute("data-cursor") || "";
        if (label) {
          setCursorLabel(label);
          setHoverType("label");
          return;
        }
      }

      const interactive = target.closest("a, button, input, textarea, [role='button']");
      if (interactive) {
        setCursorLabel("");
        setHoverType("link");
      } else {
        setCursorLabel("");
        setHoverType("default");
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <>
      {/* Precision Inner Dot (crisp monochrome with subtle white halo, zero mix-blend glitch) */}
      <motion.div
        aria-hidden="true"
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: visible && hoverType !== "label" ? 1 : 0,
          scale: pressed ? 0.65 : hoverType === "link" ? 0.45 : 1,
        }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none fixed top-0 left-0 z-[90] -mt-1 -ml-1 h-2 w-2 rounded-full bg-[#0A0A0A] ring-1 ring-white/80"
      />

      {/* Trailing Frosted Glass Ring / Contextual Pill */}
      <motion.div
        aria-hidden="true"
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.88 : 1,
          width: hoverType === "label" ? 88 : hoverType === "link" ? 42 : 28,
          height: hoverType === "label" ? 28 : hoverType === "link" ? 42 : 28,
          marginLeft: hoverType === "label" ? -44 : hoverType === "link" ? -21 : -14,
          marginTop: hoverType === "label" ? -14 : hoverType === "link" ? -21 : -14,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className={`pointer-events-none fixed top-0 left-0 z-[89] flex items-center justify-center rounded-full ${
          hoverType === "label"
            ? "border border-white/25 bg-[#0A0A0A]/92 text-white shadow-[0_10px_28px_rgba(0,0,0,0.28)] backdrop-blur-md"
            : "border border-black/35 bg-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.65)] backdrop-blur-[1px]"
        }`}
      >
        {hoverType === "label" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-[family-name:var(--font-mono)] text-[9px] font-bold tracking-[0.14em] uppercase"
          >
            {cursorLabel}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
