"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowUp, ArrowUpRight, Pause, Play, Wind } from "lucide-react";
import type Lenis from "lenis";
import { usePortfolio } from "@/context/PortfolioContext";

interface SpriteDef {
  src: string;
  naturalFacing: "L" | "R";
  aspect: number;
}

const CROWD_SPRITES: SpriteDef[] = [
  { src: "/crowd/char-01.png", naturalFacing: "R", aspect: 0.578 },
  { src: "/crowd/char-02.png", naturalFacing: "R", aspect: 0.597 },
  { src: "/crowd/char-03.png", naturalFacing: "R", aspect: 0.617 },
  { src: "/crowd/char-04.png", naturalFacing: "R", aspect: 0.589 },
  { src: "/crowd/char-05.png", naturalFacing: "R", aspect: 0.653 },
  { src: "/crowd/char-06.png", naturalFacing: "R", aspect: 0.583 },
  { src: "/crowd/char-07.png", naturalFacing: "R", aspect: 0.692 },
  { src: "/crowd/char-08.png", naturalFacing: "L", aspect: 0.622 },
  { src: "/crowd/char-09.png", naturalFacing: "L", aspect: 0.653 },
  { src: "/crowd/char-10.png", naturalFacing: "R", aspect: 0.578 },
  { src: "/crowd/char-11.png", naturalFacing: "R", aspect: 0.675 },
  { src: "/crowd/char-12.png", naturalFacing: "L", aspect: 0.636 },
  { src: "/crowd/char-13.png", naturalFacing: "R", aspect: 0.517 },
  { src: "/crowd/char-14.png", naturalFacing: "L", aspect: 0.644 },
  { src: "/crowd/char-15.png", naturalFacing: "L", aspect: 0.506 },
  { src: "/crowd/char-16.png", naturalFacing: "R", aspect: 0.528 },
  { src: "/crowd/char-17.png", naturalFacing: "R", aspect: 0.539 },
  { src: "/crowd/char-18.png", naturalFacing: "L", aspect: 0.606 },
];

type DepthLayer = "back" | "mid" | "front";
type SpeedMode = "chill" | "normal" | "rush";

const SPEED_MULTIPLIERS: Record<SpeedMode, number> = {
  chill: 0.58,
  normal: 1.0,
  rush: 1.75,
};

const PARALLAX_FACTORS: Record<DepthLayer, number> = {
  back: -10,
  mid: 12,
  front: 24,
};

interface WalkerConfig {
  id: number;
  sprite: SpriteDef;
  layer: DepthLayer;
  direction: 1 | -1;
  initialProgress: number;
  speed: number;
  heightPx: number;
  bottomPx: number;
  bobAmp: number;
  bobFreq: number;
  phaseOffset: number;
  zIndex: number;
}

function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function buildCrowd(): WalkerConfig[] {
  const walkers: WalkerConfig[] = [];
  let id = 0;

  for (let i = 0; i < 12; i++) {
    const r1 = seeded(i + 11);
    const r2 = seeded(i + 41);
    const sprite = CROWD_SPRITES[i % CROWD_SPRITES.length];
    const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
    walkers.push({
      id: id++,
      sprite,
      layer: "back",
      direction: dir,
      initialProgress: (i / 12 + r1 * 0.06) % 1,
      speed: 26 + r1 * 18,
      heightPx: Math.round(176 + r2 * 26),
      bottomPx: Math.round(48 + r1 * 28),
      bobAmp: 4.0 + r2 * 2.2,
      bobFreq: 4.8 + r1 * 1.4,
      phaseOffset: r2 * Math.PI * 2,
      zIndex: 10 + (i % 4),
    });
  }

  for (let i = 0; i < 10; i++) {
    const r1 = seeded(i + 101);
    const r2 = seeded(i + 157);
    const sprite = CROWD_SPRITES[(i + 6) % CROWD_SPRITES.length];
    const dir: 1 | -1 = i % 2 === 0 ? -1 : 1;
    walkers.push({
      id: id++,
      sprite,
      layer: "mid",
      direction: dir,
      initialProgress: (i / 10 + r1 * 0.08) % 1,
      speed: 44 + r1 * 22,
      heightPx: Math.round(214 + r2 * 28),
      bottomPx: Math.round(-12 + r1 * 24),
      bobAmp: 5.2 + r2 * 2.5,
      bobFreq: 5.5 + r1 * 1.5,
      phaseOffset: r1 * Math.PI * 2,
      zIndex: 25 + (i % 4),
    });
  }

  for (let i = 0; i < 8; i++) {
    const r1 = seeded(i + 211);
    const r2 = seeded(i + 269);
    const sprite = CROWD_SPRITES[(i + 11) % CROWD_SPRITES.length];
    const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
    walkers.push({
      id: id++,
      sprite,
      layer: "front",
      direction: dir,
      initialProgress: (i / 8 + r1 * 0.09) % 1,
      speed: 62 + r1 * 28,
      heightPx: Math.round(258 + r2 * 34),
      bottomPx: Math.round(-62 + r1 * 24),
      bobAmp: 6.2 + r2 * 2.8,
      bobFreq: 6.0 + r1 * 1.5,
      phaseOffset: r2 * Math.PI * 2,
      zIndex: 35 + (i % 4),
    });
  }

  return walkers;
}

const WALKERS = buildCrowd();

const CENTER_QUIPS = [
  "Hey! You made it to the city.",
  "Click anywhere to make the crowd hop!",
  "Always shipping something new.",
  "Click 'Ask AI' to chat with my twin.",
  "Let's build something unforgettable.",
];

export default function CrowdFooter() {
  const portfolio = usePortfolio();
  const quips = portfolio.crowdQuips.length > 0 ? portfolio.crowdQuips : CENTER_QUIPS;
  const footerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const watermarkRef = useRef<HTMLDivElement | null>(null);
  const walkerEls = useRef<(HTMLDivElement | null)[]>([]);
  const positionsRef = useRef<number[]>([]);
  const hopVelRef = useRef<number[]>(WALKERS.map(() => 0));
  const hopOffsetRef = useRef<number[]>(WALKERS.map(() => 0));

  const [paused, setPaused] = useState(false);
  const [speedMode, setSpeedMode] = useState<SpeedMode>("normal");
  const [heroHovered, setHeroHovered] = useState(false);
  const [quipIndex, setQuipIndex] = useState(0);

  const targetSpeedScaleRef = useRef(1);
  const currentSpeedScaleRef = useRef(1);
  const targetParallaxRef = useRef(0);
  const smoothParallaxRef = useRef(0);

  useEffect(() => {
    targetSpeedScaleRef.current = paused ? 0 : SPEED_MULTIPLIERS[speedMode];
  }, [paused, speedMode]);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
  });
  const watermarkScrollY = useTransform(smoothScroll, [0, 1], [34, 0]);
  const watermarkScrollScale = useTransform(smoothScroll, [0, 1], [0.96, 1]);
  const centerHeroY = useTransform(smoothScroll, [0, 1], [24, 0]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let stageWidth = stage.clientWidth || 1440;
    const buffer = 240;
    const span = stageWidth + buffer * 2;
    positionsRef.current = WALKERS.map((w) => w.initialProgress * span - buffer);

    const onResize = () => {
      stageWidth = stage.clientWidth || 1440;
    };
    window.addEventListener("resize", onResize);

    let inView = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { rootMargin: "220px" }
    );
    observer.observe(stage);

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (inView) {
        currentSpeedScaleRef.current +=
          (targetSpeedScaleRef.current - currentSpeedScaleRef.current) *
          Math.min(1, dt * 6.5);

        smoothParallaxRef.current +=
          (targetParallaxRef.current - smoothParallaxRef.current) *
          Math.min(1, dt * 5.0);

        const speedScale = currentSpeedScaleRef.current;
        elapsed += dt * Math.max(speedScale, 0.04);

        if (watermarkRef.current) {
          const wmShift = (-smoothParallaxRef.current * 22).toFixed(2);
          watermarkRef.current.style.transform = `translate3d(${wmShift}px, 0, 0)`;
        }

        const maxBound = stageWidth + buffer;
        const minBound = -buffer;

        for (let i = 0; i < WALKERS.length; i++) {
          const w = WALKERS[i];
          const el = walkerEls.current[i];
          if (!el) continue;

          let x = positionsRef.current[i] + w.direction * w.speed * speedScale * dt;
          if (w.direction === 1 && x > maxBound) x = minBound;
          else if (w.direction === -1 && x < minBound) x = maxBound;
          positionsRef.current[i] = x;

          if (hopOffsetRef.current[i] < 0 || hopVelRef.current[i] !== 0) {
            hopVelRef.current[i] += 920 * dt;
            hopOffsetRef.current[i] += hopVelRef.current[i] * dt;
            if (hopOffsetRef.current[i] >= 0) {
              hopOffsetRef.current[i] = 0;
              hopVelRef.current[i] = 0;
            }
          }

          const phase = elapsed * w.bobFreq + w.phaseOffset;
          const strideEnergy = Math.min(1, speedScale + 0.08);
          const bobY =
            -Math.abs(Math.sin(phase)) * w.bobAmp * strideEnergy +
            hopOffsetRef.current[i];
          const tiltDeg = Math.sin(phase) * 1.75 * strideEnergy;
          const squashY = 1 + Math.sin(phase * 2) * 0.014 * strideEnergy;
          const parallaxX = smoothParallaxRef.current * PARALLAX_FACTORS[w.layer];

          const flipX =
            (w.direction === 1 && w.sprite.naturalFacing === "R") ||
            (w.direction === -1 && w.sprite.naturalFacing === "L")
              ? 1
              : -1;

          el.style.transform = `translate3d(${(x + parallaxX).toFixed(
            1
          )}px, ${bobY.toFixed(1)}px, 0) scaleX(${flipX}) scaleY(${squashY.toFixed(
            3
          )}) rotate(${tiltDeg.toFixed(2)}deg)`;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleStageMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const norm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetParallaxRef.current = norm;
  };

  const handleStageMouseLeave = () => {
    targetParallaxRef.current = 0;
  };

  const handleStageClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    for (let i = 0; i < WALKERS.length; i++) {
      const dist = Math.abs(positionsRef.current[i] + 75 - clickX);
      if (dist < 320) {
        const boost = 1 - dist / 320;
        hopVelRef.current[i] = -(190 + boost * 170);
      }
    }
  };

  const scrollToTop = () => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cycleSpeed = () => {
    setPaused(false);
    setSpeedMode((prev) =>
      prev === "chill" ? "normal" : prev === "normal" ? "rush" : "chill"
    );
  };

  return (
    <footer
      ref={footerRef}
      id="crowd-footer"
      className="relative w-full border-t border-black/10 bg-white text-black"
    >
      {/* ================= UPPER CRISP WHITE FOOTER ================= */}
      <div className="px-6 pt-14 pb-10 sm:px-10 lg:px-14">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 md:grid-cols-12">
          {/* Col 1: Brand + Role */}
          <div className="md:col-span-4">
            <a
              href="#hero"
              className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-black"
            >
              {portfolio.brandMark}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              AI Engineer &amp;
              <br />
              Full-Stack Developer
            </p>
          </div>

          {/* Col 2: Explore 2-Row Link Grid */}
          <div className="md:col-span-4">
            <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
              Explore
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-neutral-800">
              {portfolio.footerLinksRow1.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-opacity hover:opacity-60"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500">
              {portfolio.footerLinksRow2.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-black"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Get in Touch + Copyright */}
          <div className="md:col-span-4 md:text-right">
            <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
              Get in touch
            </p>
            <a
              href={`mailto:${portfolio.email}`}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-70"
            >
              <span>{portfolio.email}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <p className="mt-3 text-[11px] text-neutral-400">
              © {portfolio.year} {portfolio.fullName}
            </p>
          </div>
        </div>
      </div>

      {/* ================= MINIMAL JET-BLACK "SEE YOU AROUND." RIBBON ================= */}
      <div className="bg-[#0A0A0A] px-6 py-6 text-white sm:px-10 lg:px-14">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 32, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-white sm:text-4xl"
            >
              See you around.
            </motion.h2>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:bg-white hover:text-black cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* ================= THE MAIN CHARACTER: PURE WHITE ANIMATED CITY CROWD ================= */}
      <div
        ref={stageRef}
        data-cursor="HOP!"
        onMouseMove={handleStageMouseMove}
        onMouseLeave={handleStageMouseLeave}
        onClick={handleStageClick}
        className="relative h-[320px] w-full cursor-pointer overflow-hidden bg-white select-none sm:h-[380px] lg:h-[420px]"
        aria-label={`Animated black-and-white editorial ink crowd walking past ${portfolio.firstName}`}
      >
        {/* Layer 0: Giant Edge-to-Edge Light Gray Watermark Name (auto-scales for longer names) */}
        <motion.div
          style={{ y: watermarkScrollY, scale: watermarkScrollScale }}
          className="pointer-events-none absolute inset-x-0 top-4 z-0 flex justify-center px-2 sm:top-3"
        >
          <div ref={watermarkRef} style={{ willChange: "transform" }}>
            <span
              style={{
                fontSize: `clamp(3rem, ${Math.min(
                  19,
                  Math.max(9.2, 138 / Math.max(portfolio.watermarkName.length, 6))
                ).toFixed(1)}vw, 18.5rem)`,
              }}
              className="block whitespace-nowrap font-[family-name:var(--font-display)] font-extrabold leading-[0.88] tracking-[-0.04em] text-[#EAEAEA] uppercase"
            >
              {portfolio.watermarkName}
            </span>
          </div>
        </motion.div>

        {/* Layer 2: Stationary Center Main Character (Dhinesh) */}
        <motion.div
          style={{ y: centerHeroY }}
          onMouseEnter={() => {
            setHeroHovered(true);
            setQuipIndex((prev) => (prev + 1) % quips.length);
          }}
          onMouseLeave={() => setHeroHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            setHeroHovered(true);
            setQuipIndex((prev) => (prev + 1) % quips.length);
          }}
          className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 cursor-pointer sm:bottom-2"
        >
          <motion.div
            initial={false}
            animate={
              heroHovered
                ? { y: 0, scale: 1, opacity: 1 }
                : { y: 10, scale: 0.9, opacity: 0 }
            }
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-black bg-white px-3.5 py-1 text-[11px] font-semibold text-black shadow-[2px_2px_0px_#000]"
          >
            {quips[quipIndex % quips.length]}
            <span className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-black bg-white" />
          </motion.div>

          <img
            src="/crowd/center-dhinesh.png"
            alt={`${portfolio.firstName} standing in the crowd`}
            draggable={false}
            className="animate-hero-breathe h-[250px] w-auto object-contain sm:h-[305px] lg:h-[340px]"
          />
        </motion.div>

        {/* Layers 1, 3, 4: Animated Multi-Layer Walking Crowd */}
        {WALKERS.map((walker, idx) => (
          <div
            key={walker.id}
            ref={(el) => {
              walkerEls.current[idx] = el;
            }}
            style={{
              zIndex: walker.zIndex,
              bottom: `${walker.bottomPx}px`,
              height: `${walker.heightPx}px`,
              willChange: "transform",
            }}
            className="pointer-events-none absolute left-0 origin-bottom"
          >
            <img
              src={walker.sprite.src}
              alt=""
              draggable={false}
              loading="eager"
              className="h-full w-auto max-w-none object-contain"
            />
          </div>
        ))}
      </div>

      {/* ================= MINIMAL BOTTOM STATUS BAR ================= */}
      <div className="border-t border-black/10 bg-[#FAFAFA] px-6 py-3.5 text-neutral-600 sm:px-10 lg:px-14">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 text-[11px]">
          <span>
            Started with a simple footer. Built a whole city for{" "}
            <strong className="font-semibold text-black">{portfolio.firstName}</strong> — click the street to make passersby hop.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleSpeed}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-2.5 py-1 text-[10px] font-semibold text-neutral-700 capitalize transition-colors hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
            >
              <Wind className="h-2.5 w-2.5" />
              <span>Pace: {speedMode}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-2.5 py-1 text-[10px] font-semibold text-neutral-700 transition-colors hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
            >
              {paused ? (
                <>
                  <Play className="h-2.5 w-2.5 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-2.5 w-2.5 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
