"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationFrame,
  type MotionValue,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Cpu,
  Database,
  Layers,
  RotateCw,
} from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import Magnetic from "@/components/Magnetic";

/**
 * Interactive ink-on-white telemetry field behind the Hero.
 * Subtle drifting dashes & soft architectural dots react smoothly to cursor movement.
 */
function HeroFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    const targetMouse = { x: -9999, y: -9999, active: false };
    const smoothMouse = { x: -9999, y: -9999, vx: 0, vy: 0 };

    interface Dash {
      x: number;
      y: number;
      len: number;
      speed: number;
      baseAlpha: number;
      phase: number;
      hasDot: boolean;
    }

    let dashes: Dash[] = [];
    let cachedRect = { left: 0, top: 0 };

    const updateRect = () => {
      const r = canvas.getBoundingClientRect();
      cachedRect = { left: r.left, top: r.top };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateRect();

      const rowGap = 24;
      const rows = Math.ceil(height / rowGap);
      dashes = [];
      for (let r = 0; r < rows; r++) {
        const count = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          dashes.push({
            x: Math.random() * width,
            y: r * rowGap + (Math.random() - 0.5) * 4,
            len: 18 + Math.random() * 68,
            speed: (0.16 + Math.random() * 0.36) * (r % 2 === 0 ? 1 : -1),
            baseAlpha: 0.04 + Math.random() * 0.065,
            phase: Math.random() * Math.PI * 2,
            hasDot: Math.random() > 0.72,
          });
        }
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      const nx = e.clientX - cachedRect.left;
      const ny = e.clientY - cachedRect.top;
      if (!targetMouse.active) {
        smoothMouse.x = nx;
        smoothMouse.y = ny;
      }
      targetMouse.x = nx;
      targetMouse.y = ny;
      targetMouse.active =
        nx >= 0 && nx <= width && ny >= 0 && ny <= height;
    };

    const onPointerLeave = () => {
      targetMouse.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    let time = 0;
    let inView = true;
    let running = false;

    const render = () => {
      if (!inView) {
        running = false;
        return;
      }
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      if (targetMouse.active) {
        const dx = targetMouse.x - smoothMouse.x;
        const dy = targetMouse.y - smoothMouse.y;
        smoothMouse.vx = dx * 0.12;
        smoothMouse.vy = dy * 0.12;
        smoothMouse.x += smoothMouse.vx;
        smoothMouse.y += smoothMouse.vy;

        const grad = ctx.createRadialGradient(
          smoothMouse.x,
          smoothMouse.y,
          0,
          smoothMouse.x,
          smoothMouse.y,
          260
        );
        grad.addColorStop(0, "rgba(0, 0, 0, 0.045)");
        grad.addColorStop(0.55, "rgba(0, 0, 0, 0.014)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      for (let i = 0; i < dashes.length; i++) {
        const d = dashes[i];
        d.x += d.speed;
        if (d.speed > 0 && d.x > width + d.len) d.x = -d.len;
        if (d.speed < 0 && d.x < -d.len) d.x = width + d.len;

        const shimmer = 0.014 * Math.sin(time * 1.4 + d.phase);
        let alpha = d.baseAlpha + shimmer;
        let extraLen = 0;
        let offsetY = 0;
        let lineWidth = 1;

        if (targetMouse.active) {
          const cx = d.x + d.len * 0.5;
          const dx = cx - smoothMouse.x;
          const dy = d.y - smoothMouse.y;
          const dist = Math.hypot(dx, dy);
          const radius = 220;
          if (dist < radius) {
            const influence = 1 - dist / radius;
            const eased = influence * influence * (3 - 2 * influence);
            alpha = Math.min(0.48, alpha + eased * 0.35);
            extraLen = eased * 32;
            offsetY = (dy / (dist + 1)) * eased * 10;
            lineWidth = 1 + eased * 0.8;
          }
        }

        ctx.strokeStyle = `rgba(10, 10, 10, ${Math.max(0.02, alpha).toFixed(3)})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y + offsetY);
        ctx.lineTo(d.x + d.len + extraLen, d.y + offsetY);
        ctx.stroke();

        if (d.hasDot && alpha > 0.15) {
          ctx.fillStyle = `rgba(10, 10, 10, ${(alpha * 1.1).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(d.x + d.len + extraLen, d.y + offsetY, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(render);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          updateRect();
          startLoop();
        } else if (running) {
          cancelAnimationFrame(rafId);
          running = false;
        }
      },
      { rootMargin: "150px" }
    );
    observer.observe(canvas);
    startLoop();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

function AnimatedWord({
  text,
  delayOffset = 0,
}: {
  text: string;
  delayOffset?: number;
}) {
  return (
    <span className="inline-flex overflow-hidden py-1 align-bottom">
      {text.split("").map((char, idx) => (
        <motion.span
          key={`${char}-${idx}`}
          initial={{ y: "105%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{
            duration: 0.62,
            delay: delayOffset + idx * 0.025,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ willChange: "transform, opacity" }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

const CAPABILITY_ICONS = [Database, Cpu, Layers];

/**
 * Double-sided 3D Rotatable Portrait Card:
 * - Drag freely in 360° (horizontal spin + vertical pitch) with silky spring flick momentum
 * - Quick click/tap smoothly flips 180° between Front Monochrome Photo & Back Jet-Black Dev Pass
 * - Works seamlessly on desktop mouse AND mobile touch
 */
function RotatablePortraitCard({
  sizeClass = "h-[292px] w-[268px]",
  photoParallaxX,
  photoParallaxY,
  photoZoom,
  glassGlare,
  sheenX,
  sheenOpacity,
  showHint = true,
}: {
  sizeClass?: string;
  photoParallaxX?: MotionValue<number>;
  photoParallaxY?: MotionValue<number>;
  photoZoom?: MotionValue<number>;
  glassGlare?: MotionValue<string>;
  sheenX?: MotionValue<string>;
  sheenOpacity?: MotionValue<number>;
  showHint?: boolean;
}) {
  const portfolio = usePortfolio();
  const [isDragging, setIsDragging] = useState(false);

  const rawRotY = useMotionValue(0);
  const rawRotX = useMotionValue(0);

  const smoothRotY = useSpring(rawRotY, { stiffness: 120, damping: 18, mass: 0.6 });
  const smoothRotX = useSpring(rawRotX, { stiffness: 140, damping: 20, mass: 0.55 });

  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    vx: 0,
    moved: 0,
  });

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: performance.now(),
      vx: 0,
      moved: 0,
    };
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const st = dragState.current;
    if (!st.active) return;

    const now = performance.now();
    const dx = e.clientX - st.lastX;
    const dy = e.clientY - st.lastY;
    const dt = Math.max(now - st.lastTime, 8);

    st.moved += Math.hypot(dx, dy);
    st.vx = (dx / dt) * 16; // px per frame equivalent
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.lastTime = now;

    // Free 360°+ horizontal rotation + controlled vertical pitch
    rawRotY.set(rawRotY.get() + dx * 0.85);
    const nextX = Math.max(-42, Math.min(42, rawRotX.get() - dy * 0.5));
    rawRotX.set(nextX);
  };

  const finishDrag = (e: PointerEvent<HTMLDivElement>) => {
    const st = dragState.current;
    if (!st.active) return;
    st.active = false;
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (st.moved < 6) {
      // Quick click/tap -> smooth 180° flip between front photo & back developer pass
      const current = rawRotY.get();
      const snappedNext = Math.round(current / 180) * 180 + 180;
      rawRotY.set(snappedNext);
      rawRotX.set(0);
    } else {
      // Silky flick momentum glide on release!
      rawRotY.set(rawRotY.get() + st.vx * 11);
      // Gently level out vertical pitch slightly while preserving user's horizontal rotation
      rawRotX.set(rawRotX.get() * 0.35);
    }
  };

  return (
    <div
      data-cursor="DRAG 360°"
      className="perspective-1200 relative flex flex-col items-center"
    >
      <motion.div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{
          rotateY: smoothRotY,
          rotateX: smoothRotX,
          willChange: "transform",
        }}
        className={`preserve-3d relative ${sizeClass} touch-none select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* ================= FRONT FACE: MONOCHROME PORTRAIT ================= */}
        <div
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-[#0A0A0A] bg-[#efefef] shadow-[0_26px_70px_rgba(0,0,0,0.2)] transition-shadow duration-500 group-hover:shadow-[0_36px_95px_rgba(0,0,0,0.3)]"
        >
          {/* Inner Photo with depth parallax & gentle zoom */}
          <motion.div
            style={{
              x: photoParallaxX,
              y: photoParallaxY,
              scale: photoZoom ?? 1.06,
              willChange: "transform",
            }}
            className="h-full w-full"
          >
            <img
              src={portfolio.portraitSrc}
              alt={portfolio.fullName}
              draggable={false}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-top grayscale contrast-110"
            />
          </motion.div>

          {/* Live Cursor-Tracking Studio Glass Glare */}
          {glassGlare && (
            <motion.div
              style={{ background: glassGlare }}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            />
          )}

          {/* Periodic Auto-Gliding Glass Sheen Sweep */}
          <motion.div
            animate={{ x: ["-160%", "230%"] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              repeatDelay: 3.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-16 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[2px]"
          />

          {/* Scroll-linked specular sheen */}
          {sheenX && sheenOpacity && (
            <motion.div
              style={{ x: sheenX, opacity: sheenOpacity }}
              className="pointer-events-none absolute inset-y-0 -inset-x-10 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent blur-sm"
            />
          )}

          {/* Bottom editorial name bar inside card */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between rounded-lg bg-white/92 px-3 py-1.5 shadow-sm backdrop-blur-md">
            <span className="font-[family-name:var(--font-mono)] text-[9px] font-bold tracking-widest text-black uppercase">
              {portfolio.fullName}
            </span>
            <span className="inline-flex items-center gap-1 font-[family-name:var(--font-mono)] text-[8px] font-semibold text-neutral-500">
              <RotateCw className="h-2.5 w-2.5" />
              360°
            </span>
          </div>
        </div>

        {/* ================= BACK FACE: JET-BLACK DEVELOPER ID CARD ================= */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A0A0A] bg-[#0A0A0A] p-5 text-white shadow-[0_26px_70px_rgba(0,0,0,0.3)]"
        >
          {/* Subtle architectural dot pattern on back card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
            <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.18em] text-neutral-400 uppercase">
              DEV PASS · {portfolio.year}
            </span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          </div>

          <div className="relative z-10 my-auto space-y-3 py-2">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none tracking-[-0.03em] text-white">
                {portfolio.fullName}
              </h3>
              <p className="mt-1 text-[11px] text-neutral-400">
                {portfolio.roleTitle}
              </p>
            </div>

            <div className="space-y-1.5 border-t border-white/12 pt-3 font-[family-name:var(--font-mono)] text-[10px]">
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500">FOCUS</span>
                <span className="text-neutral-200">RAG &amp; Agents</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500">STACK</span>
                <span className="text-neutral-200">Python · TS · Next</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500">BASE</span>
                <span className="truncate text-neutral-200">
                  {portfolio.currentlyAt.location}
                </span>
              </div>
            </div>
          </div>

          {/* Minimalist decorative barcode + flip hint */}
          <div className="relative z-10 border-t border-white/15 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex h-3.5 items-end gap-[2px] opacity-75">
                {[3, 1, 2, 4, 1, 2, 3, 1, 3, 2, 1, 4, 2].map((w, i) => (
                  <span
                    key={i}
                    style={{ width: `${w}px` }}
                    className="h-full bg-white"
                  />
                ))}
              </div>
              <span className="inline-flex items-center gap-1 font-[family-name:var(--font-mono)] text-[8px] tracking-wider text-neutral-400 uppercase">
                <RotateCw className="h-2.5 w-2.5" />
                FLIP BACK
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subtle interactive affordance pill right beneath the card */}
      {showHint && (
        <div className="pointer-events-none mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-medium tracking-wider text-neutral-500 uppercase shadow-xs backdrop-blur-sm">
          <RotateCw className="h-2.5 w-2.5 text-black" />
          <span>{isDragging ? "Rotating in 3D..." : "Drag to rotate · Click to flip"}</span>
        </div>
      )}
    </div>
  );
}

export default function HeroAboutStage() {
  const portfolio = usePortfolio();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [portraitHovered, setPortraitHovered] = useState(false);

  // 1) Silky low-stiffness spring cursor tracking (liquid-smooth follow, zero jitter)
  const mouseNormX = useMotionValue(0);
  const mouseNormY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseNormX, { stiffness: 65, damping: 20, mass: 0.7 });
  const smoothMouseY = useSpring(mouseNormY, { stiffness: 65, damping: 20, mass: 0.7 });

  // 2) Continuous GPU harmonic figure-8 zero-gravity motion (no keyframe stops!)
  const harmonicX = useMotionValue(0);
  const harmonicY = useMotionValue(0);
  const harmonicRotX = useMotionValue(0);
  const harmonicRotY = useMotionValue(0);
  const harmonicRotZ = useMotionValue(0);
  const photoZoom = useMotionValue(1.07);
  const shadowScale = useMotionValue(1);
  const shadowOpacity = useMotionValue(0.22);

  useAnimationFrame((timeMs) => {
    const t = timeMs * 0.001;
    const yWave = Math.sin(t * 1.25);
    const xWave = Math.cos(t * 0.78);
    harmonicY.set(yWave * 10);
    harmonicX.set(xWave * 4);
    harmonicRotY.set(Math.sin(t * 0.88) * 5.5);
    harmonicRotX.set(Math.cos(t * 0.67) * 3.8);
    harmonicRotZ.set(Math.sin(t * 0.54) * 1.4);
    photoZoom.set(1.075 + Math.sin(t * 0.65) * 0.025);
    shadowScale.set(0.96 - yWave * 0.07);
    shadowOpacity.set(0.22 - yWave * 0.055);
  });

  // 3) Combined smooth cursor tilt + depth parallax + live moving glass reflection
  const cursorTiltY = useTransform(smoothMouseX, [-1, 1], [-12, 12]);
  const cursorTiltX = useTransform(smoothMouseY, [-1, 1], [9, -9]);
  const photoParallaxX = useTransform(smoothMouseX, [-1, 1], [10, -10]);
  const photoParallaxY = useTransform(smoothMouseY, [-1, 1], [8, -8]);
  const badgeParallaxX = useTransform(smoothMouseX, [-1, 1], [-12, 12]);
  const badgeParallaxY = useTransform(smoothMouseY, [-1, 1], [-9, 9]);
  const glassGlare = useTransform(
    [smoothMouseX, smoothMouseY],
    ([mx, my]: number[]) =>
      `radial-gradient(240px circle at ${(50 + mx * 42).toFixed(1)}% ${(
        50 +
        my * 42
      ).toFixed(1)}%, rgba(255,255,255,0.34), transparent 65%)`
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseNormX.set(Math.max(-1, Math.min(1, nx)));
      mouseNormY.set(Math.max(-1, Math.min(1, ny)));
    };
    const onLeave = () => {
      mouseNormX.set(0);
      mouseNormY.set(0);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseNormX, mouseNormY]);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 24,
    mass: 0.6,
  });

  // Portrait choreography across Hero -> About (balanced for 720p–1440p screens)
  const portraitY = useTransform(smoothProgress, [0, 1], ["18vh", "0vh"]);
  const portraitScale = useTransform(smoothProgress, [0, 0.48, 1], [0.95, 1.0, 1.08]);
  const portraitRotateY = useTransform(
    smoothProgress,
    [0, 0.28, 0.54, 0.8, 1],
    [0, 26, -18, 6, 0]
  );
  const portraitRotateX = useTransform(smoothProgress, [0, 0.5, 1], [0, -6, 0]);
  const sheenX = useTransform(smoothProgress, [0, 0.5, 1], ["-120%", "30%", "140%"]);
  const sheenOpacity = useTransform(smoothProgress, [0, 0.35, 0.55, 1], [0, 0.5, 0.35, 0]);

  const heroTextY = useTransform(smoothProgress, [0, 0.65], ["0%", "-14%"]);
  const heroTextOpacity = useTransform(smoothProgress, [0, 0.55], [1, 0.12]);
  const line1ScrollX = useTransform(smoothProgress, [0, 0.7], ["0%", "-6%"]);
  const line2ScrollX = useTransform(smoothProgress, [0, 0.7], ["0%", "6%"]);

  return (
    <div ref={stageRef} className="relative bg-white text-black">
      {/* Subtle architectural dot pattern across the whole Hero + About stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.38]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Desktop Scroll-Linked + Silky Harmonic 360° Rotatable Portrait Centerpiece */}
      <div className="pointer-events-none sticky top-0 z-20 hidden h-screen w-full items-center justify-center lg:flex">
        <div className="perspective-1200">
          {/* Layer 0: Smooth entrance synced with Preloader lift */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
            className="preserve-3d relative"
          >
            {/* Layer 1: Scroll-linked position, scale & 3D horizon turn */}
            <motion.div
              style={{
                y: portraitY,
                scale: portraitScale,
                rotateY: portraitRotateY,
                rotateX: portraitRotateX,
                willChange: "transform",
              }}
              className="preserve-3d relative"
            >
              {/* Layer 2: Liquid-smooth cursor tilt */}
              <motion.div
                style={{
                  rotateY: cursorTiltY,
                  rotateX: cursorTiltX,
                  willChange: "transform",
                }}
                className="preserve-3d relative"
              >
                {/* Layer 3: Continuous 60/120fps harmonic figure-8 zero-gravity float */}
                <motion.div
                  style={{
                    x: harmonicX,
                    y: harmonicY,
                    rotateX: harmonicRotX,
                    rotateY: harmonicRotY,
                    rotateZ: harmonicRotZ,
                    willChange: "transform",
                  }}
                  animate={{ scale: portraitHovered ? 1.035 : 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  onMouseEnter={() => setPortraitHovered(true)}
                  onMouseLeave={() => setPortraitHovered(false)}
                  className="pointer-events-auto preserve-3d group relative"
                >
                  {/* Dual Counter-Rotating Minimal Orbit Frames pushed back in 3D space (prevents z-fighting when spinning 360°) */}
                  <motion.div
                    style={{ z: -60 }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-4 -right-4 -left-4 bottom-4 rounded-3xl border border-dashed border-black/15"
                  >
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#0A0A0A]" />
                  </motion.div>

                  <motion.div
                    style={{ z: -80 }}
                    animate={{ rotate: [360, 0] }}
                    transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-7 -right-7 -left-7 bottom-1 rounded-[2rem] border border-black/[0.06]"
                  />

                  {/* Dynamic Breathing Ground Shadow pushed behind 3D card */}
                  <motion.div
                    style={{ scale: shadowScale, opacity: shadowOpacity, z: -70 }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-4 bottom-3 h-7 rounded-full bg-black/45 blur-xl"
                  />

                  {/* Floating 3D Depth Badge — Top Left */}
                  <motion.div
                    style={{
                      x: badgeParallaxX,
                      y: badgeParallaxY,
                      z: 90,
                    }}
                    className="pointer-events-none absolute -top-3.5 -left-10 z-30"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                      className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white/95 px-2.5 py-1 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-md"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      <span className="font-[family-name:var(--font-mono)] text-[9px] font-bold tracking-wider text-black uppercase">
                        AI · RAG
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* Floating 3D Depth Badge — Bottom Right */}
                  <motion.div
                    style={{
                      x: photoParallaxX,
                      y: photoParallaxY,
                      z: 95,
                    }}
                    className="pointer-events-none absolute -right-11 bottom-16 z-30"
                  >
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{
                        duration: 4.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.6,
                      }}
                      className="rounded-full bg-[#0A0A0A] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[9px] font-semibold tracking-wider text-white shadow-[0_12px_26px_rgba(0,0,0,0.24)] uppercase"
                    >
                      FULL-STACK
                    </motion.div>
                  </motion.div>

                  {/* Free 360° Rotatable Double-Sided Card */}
                  <RotatablePortraitCard
                    photoParallaxX={photoParallaxX}
                    photoParallaxY={photoParallaxY}
                    photoZoom={photoZoom}
                    glassGlare={glassGlare}
                    sheenX={sheenX}
                    sheenOpacity={sheenOpacity}
                    showHint={true}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Pull Hero + About up beneath the sticky layer on desktop */}
      <div className="lg:-mt-[100vh]">
        {/* ================= SECTION 1: HERO (CRISP WHITE + STRUCTURED EDITORIAL CONTENT) ================= */}
        <section
          id="hero"
          className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden px-6 pt-24 pb-8 sm:px-10 sm:pt-28 lg:px-14"
        >
          <HeroFieldCanvas />

          {/* Lightweight static CSS ambient pearl gradients (zero GPU blur-animation cost) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(600px circle at 25% 15%, rgba(0,0,0,0.035), transparent 65%), radial-gradient(540px circle at 80% 85%, rgba(0,0,0,0.03), transparent 65%)",
            }}
          />

          {/* Center Display Headline + Clean Intro Line */}
          <motion.div
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            className="relative z-10 mx-auto flex w-full max-w-[96vw] flex-col items-center text-center"
          >
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(3.4rem,12.4vw,11.8rem)] font-bold leading-[0.83] tracking-[-0.055em] text-[#0A0A0A] select-none">
              <motion.span
                style={{ x: line1ScrollX, willChange: "transform" }}
                className="block whitespace-nowrap"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.65, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="mr-1.5 inline-block font-[family-name:var(--font-mono)] font-light text-neutral-400 sm:mr-3"
                >
                  &lt;
                </motion.span>
                <AnimatedWord text={portfolio.heroLine1} delayOffset={0.42} />
              </motion.span>
              <motion.span
                style={{ x: line2ScrollX, willChange: "transform" }}
                className="block whitespace-nowrap"
              >
                <AnimatedWord text={portfolio.heroLine2} delayOffset={0.54} />
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.65, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="ml-1.5 inline-block font-[family-name:var(--font-mono)] font-light text-neutral-400 sm:ml-3"
                >
                  /&gt;
                </motion.span>
              </motion.span>
            </h1>

            {/* Crisp Editorial Subtitle Line */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-2xl text-xs font-medium tracking-wide text-neutral-500 sm:text-sm"
            >
              <span className="font-semibold text-black">{portfolio.fullName}</span>
              <span className="mx-2 text-neutral-300">—</span>
              <span>{portfolio.roleTitle}</span>
            </motion.p>

            {/* Mobile Interactive 360° Rotatable Portrait */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              className="relative mt-8 lg:hidden"
            >
              <RotatablePortraitCard
                sizeClass="h-64 w-60"
                photoZoom={photoZoom}
                showHint={true}
              />
            </motion.div>
          </motion.div>

          {/* Outer Edge Vertical Architectural Rails (fills wide-screen left & right edges cleanly) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 z-10 hidden -translate-y-1/2 flex-col items-center gap-4 2xl:flex"
          >
            <span className="h-14 w-px bg-gradient-to-b from-transparent via-black/25 to-black/15" />
            <span className="[writing-mode:vertical-rl] rotate-180 font-[family-name:var(--font-mono)] text-[9px] tracking-[0.22em] text-neutral-400 uppercase">
              01 // {portfolio.firstName.toUpperCase()} · {portfolio.year}
            </span>
            <span className="h-14 w-px bg-gradient-to-b from-black/15 via-black/25 to-transparent" />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 flex-col items-center gap-4 2xl:flex"
          >
            <span className="h-12 w-px bg-gradient-to-b from-transparent to-black/20" />
            <span className="[writing-mode:vertical-rl] font-[family-name:var(--font-mono)] text-[9px] tracking-[0.22em] text-neutral-400 uppercase">
              SCROLL TO EXPLORE
            </span>
            <div className="relative h-14 w-px overflow-hidden bg-black/10">
              <motion.span
                animate={{ y: ["-100%", "220%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 top-0 h-5 bg-black"
              />
            </div>
          </div>

          {/* Balanced 3-Column Editorial Landing Deck */}
          <div className="relative z-10 mx-auto mt-8 grid w-full max-w-[1400px] grid-cols-1 items-end gap-6 lg:mt-2 lg:grid-cols-12 lg:gap-8">
            {/* LEFT FLANK: Clean Editorial "What I Build" List + Impact Metrics */}
            <motion.div
              initial={{ opacity: 0, x: -22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.72, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-5 lg:col-span-4"
            >
              {/* Borderless Swiss Editorial Focus List */}
              <div className="hidden lg:block">
                <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase">
                  WHAT I BUILD
                </p>
                <div className="mt-2.5 divide-y divide-black/10 border-y border-black/10">
                  {portfolio.capabilities.slice(0, 3).map((cap, idx) => (
                    <a
                      key={`${cap.label}-${idx}`}
                      href="#projects"
                      className="group flex items-baseline justify-between gap-3 py-2.5 transition-colors hover:text-black"
                    >
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-[family-name:var(--font-mono)] text-[10px] text-neutral-400">
                          0{idx + 1}
                        </span>
                        <span className="font-[family-name:var(--font-display)] text-sm font-bold text-[#0A0A0A]">
                          {cap.label}
                        </span>
                      </div>
                      <span className="truncate text-[11px] text-neutral-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-black">
                        {cap.detail}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Impact Metric Tiles */}
              <div className="grid grid-cols-2 gap-3">
                {portfolio.heroMetrics.map((metric, idx) => (
                  <div
                    key={`${metric.value}-${idx}`}
                    className={
                      metric.dark
                        ? "rounded-2xl border border-black/10 bg-[#0A0A0A] p-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)]"
                        : "rounded-2xl border border-black/10 bg-white/85 p-4 shadow-[0_6px_22px_rgba(0,0,0,0.03)] backdrop-blur-md transition-colors hover:border-black/25"
                    }
                  >
                    <span
                      className={`font-[family-name:var(--font-display)] text-2xl font-bold ${
                        metric.dark ? "text-white" : "text-black"
                      }`}
                    >
                      {metric.value}
                    </span>
                    <p
                      className={`mt-0.5 text-[11px] leading-snug ${
                        metric.dark ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CENTER SPACER: Floating 360° Rotatable Portrait sits cleanly here on desktop */}
            <div className="hidden lg:col-span-4 lg:block" aria-hidden="true" />

            {/* RIGHT FLANK: Value Statement + Primary Action CTAs + Direct Links */}
            <motion.div
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.72, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-5 lg:col-span-4"
            >
              {/* Clean Editorial Intro Statement & Primary CTA Buttons */}
              <div className="space-y-4">
                <p className="text-sm font-medium leading-relaxed text-neutral-700 sm:text-base">
                  {portfolio.heroFocusNote}
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Magnetic strength={0.18}>
                    <a
                      href="#contact"
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#0A0A0A] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition-all hover:bg-neutral-800 active:scale-95"
                    >
                      <span className="relative z-10 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      <span className="relative z-10">Hire Me</span>
                      <ArrowUpRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                    </a>
                  </Magnetic>

                  <Magnetic strength={0.18}>
                    <a
                      href="#projects"
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/85 px-5 py-2.5 text-xs font-semibold text-black backdrop-blur-md transition-all hover:border-black hover:bg-white active:scale-95"
                    >
                      <span>Explore Projects</span>
                    </a>
                  </Magnetic>
                </div>
              </div>

              {/* Clean Architectural Footer Meta & Direct Links */}
              <div className="border-t border-black/10 pt-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
                    {portfolio.heroTagline}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-sm font-bold text-black">
                    ©{portfolio.year}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-neutral-500">
                  {portfolio.socials.slice(0, 3).map((soc) => (
                    <a
                      key={soc.label}
                      href={soc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 transition-colors hover:text-black"
                    >
                      <span>{soc.label}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-60" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================= SECTION 2: ABOUT (MOSTLY WHITE + MINIMAL BLACK ACCENT CARD) ================= */}
        <section
          id="about"
          className="relative z-10 flex min-h-[88vh] w-full items-center border-t border-black/10 bg-[#FAFAFA]/90 px-6 py-20 text-black sm:px-10 lg:px-14"
        >
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Intro + Minimal Jet Black Currently At Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
              className="lg:col-span-4"
            >
              <motion.h2
                variants={{
                  hidden: { y: 36, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="font-[family-name:var(--font-display)] font-bold leading-[1.06] tracking-[-0.04em] text-[#0A0A0A]"
              >
                <span className="block text-4xl sm:text-5xl">Hi, I&apos;m</span>
                <span
                  className={`mt-1 block break-words ${
                    portfolio.firstName.length > 9
                      ? "text-[clamp(1.75rem,2.5vw,2.55rem)] leading-[1.08] tracking-[-0.03em]"
                      : "text-5xl sm:text-6xl"
                  }`}
                >
                  {portfolio.firstName}.
                </span>
              </motion.h2>

              <motion.p
                variants={{
                  hidden: { y: 18, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="mt-5 text-lg font-medium leading-snug text-neutral-700 sm:text-xl"
              >
                {portfolio.roleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </motion.p>

              {/* Minimal Jet Black Accent Card */}
              <motion.div
                variants={{
                  hidden: { y: 18, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="mt-7 rounded-2xl bg-[#0A0A0A] p-5 text-white shadow-[0_16px_38px_rgba(0,0,0,0.14)]"
              >
                <div className="flex items-center justify-between">
                  <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.18em] text-neutral-400 uppercase">
                    {portfolio.currentlyAt.label}
                  </p>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <p className="mt-2 font-[family-name:var(--font-display)] text-base font-bold text-white">
                  {portfolio.currentlyAt.company}
                </p>
                <p className="mt-0.5 text-xs text-neutral-300">
                  {portfolio.currentlyAt.role}
                </p>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] text-neutral-500">
                  {portfolio.currentlyAt.location}
                </p>
              </motion.div>
            </motion.div>

            {/* Center Column: Reserved slot for the 3D Portrait on desktop */}
            <div className="hidden h-[320px] lg:col-span-4 lg:block" aria-hidden="true" />

            {/* Mobile Portrait in About */}
            <div className="flex justify-center lg:hidden">
              <div className="h-72 w-64 overflow-hidden rounded-2xl border-2 border-[#0A0A0A] bg-[#efefef] shadow-xl">
                <img
                  src={portfolio.portraitSrc}
                  alt={portfolio.fullName}
                  className="h-full w-full object-cover object-top grayscale contrast-110"
                />
              </div>
            </div>

            {/* Right Column: Summary + 3 Capability Cards + Black Pill CTA */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              className="lg:col-span-4"
            >
              <p className="text-xl font-semibold leading-snug tracking-[-0.02em] text-[#0A0A0A] sm:text-2xl">
                {portfolio.aboutSummary}
              </p>

              {/* Compact Capability Rows (fills right column with rich visual rhythm) */}
              <div className="mt-6 space-y-2.5">
                {portfolio.capabilities.map((cap, idx) => {
                  const Icon = CAPABILITY_ICONS[idx % CAPABILITY_ICONS.length];
                  return (
                    <div
                      key={`${cap.label}-${idx}`}
                      className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 shadow-2xs transition-colors hover:border-black/25"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A0A0A] text-white">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-black">{cap.label}</p>
                        <p className="text-[11px] text-neutral-500">{cap.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7">
                <Magnetic strength={0.22}>
                  <a
                    href="#projects"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-[#0A0A0A] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all hover:bg-neutral-800 active:scale-95"
                  >
                    <span>Explore projects</span>
                    <motion.span
                      animate={{ y: [0, 2.5, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </motion.span>
                  </a>
                </Magnetic>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
