"use client";

import { useState, useEffect, type MouseEvent } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, X, Github, ExternalLink, CheckCircle2 } from "lucide-react";
import { type ProjectItem } from "@/data/portfolio";
import { usePortfolio } from "@/context/PortfolioContext";

function FolderPreviewSheet({ project }: { project: ProjectItem }) {
  const isLight = project.themeAccent === "light" || project.themeAccent === "grid";

  return (
    <div
      className={`h-full w-full overflow-hidden rounded-lg border p-3 shadow-xl ${
        isLight
          ? "border-black/15 bg-white text-black"
          : "border-white/15 bg-[#1b1b1b] text-white"
      }`}
    >
      <div className="flex items-center justify-between border-b border-current/12 pb-2">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-25" />
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-15" />
        </div>
        <span className="font-[family-name:var(--font-mono)] text-[8px] font-semibold tracking-wider opacity-65">
          {project.previewHeadline}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {project.previewMetrics.map((m) => (
          <div
            key={m.label}
            className={`rounded px-2 py-1 ${
              isLight ? "bg-black/[0.05]" : "bg-white/[0.08]"
            }`}
          >
            <div className="font-[family-name:var(--font-mono)] text-[7px] uppercase opacity-60">
              {m.label}
            </div>
            <div className="font-[family-name:var(--font-display)] text-xs font-bold leading-tight">
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2.5 space-y-1 font-[family-name:var(--font-mono)] text-[7.5px] leading-tight opacity-75">
        {project.previewSnippet.slice(0, 3).map((line, i) => (
          <div key={i} className="truncate">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectFolderCard({
  project,
  index,
  onSelect,
}: {
  project: ProjectItem;
  index: number;
  onSelect: (project: ProjectItem) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 22 });

  const tiltY = useTransform(smoothX, [0, 1], [-6, 6]);
  const tiltX = useTransform(smoothY, [0, 1], [5, -5]);
  const sheenBg = useTransform(
    [smoothX, smoothY],
    ([lx, ly]: number[]) =>
      `radial-gradient(240px circle at ${(lx * 100).toFixed(1)}% ${(
        ly * 100
      ).toFixed(1)}%, rgba(255,255,255,0.16), transparent 65%)`
  );

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.68,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex flex-col rounded-2xl border border-black/10 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-black/25 hover:shadow-[0_18px_46px_rgba(0,0,0,0.09)]"
    >
      {/* Sleek Minimal Jet-Black 3D Folder Popping Against Crisp White */}
      <button
        type="button"
        data-cursor="OPEN"
        onClick={() => onSelect(project)}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setHovered(true)}
        onBlur={handleMouseLeave}
        className="perspective-1200 relative mt-4 h-[205px] w-full cursor-pointer text-left focus:outline-none sm:h-[218px]"
        aria-label={`Open ${project.title} project folder`}
      >
        <motion.div
          style={{
            rotateY: hovered ? tiltY : 0,
            rotateX: hovered ? tiltX : 0,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="preserve-3d relative h-full w-full"
        >
          {/* Back Folder Shell + Top-Left Tab */}
          <div className="absolute inset-0">
            <div className="flex items-end">
              <div className="flex h-7 w-28 items-center gap-2 rounded-t-xl border-x border-t border-black bg-[#1b1b1b] px-3">
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold text-white">
                  {project.index}
                </span>
                <span className="truncate font-[family-name:var(--font-mono)] text-[9px] text-neutral-400 uppercase">
                  {project.year}
                </span>
              </div>
              <div className="-ml-px h-3 w-4 bg-transparent" />
            </div>

            <div className="h-[calc(100%-1.75rem)] w-full rounded-b-2xl rounded-tr-2xl border border-black bg-[#161616] shadow-inner" />
          </div>

          {/* 3-Layer Fanned Inner Document Stack */}
          <div className="pointer-events-none absolute inset-x-3 top-6 bottom-6 overflow-visible">
            {/* Layer 1: Far back white sheet */}
            <motion.div
              animate={
                hovered
                  ? { y: -42, x: -10, rotate: -8.5, scale: 0.96 }
                  : { y: -2, x: -2, rotate: -2, scale: 0.94 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.02 }}
              className="absolute inset-x-3 top-1 h-[128px] rounded-lg border border-black/15 bg-neutral-100 shadow-md"
            />

            {/* Layer 2: Mid gray sheet */}
            <motion.div
              animate={
                hovered
                  ? { y: -50, x: 10, rotate: 7, scale: 0.98 }
                  : { y: -5, x: 2, rotate: 1.5, scale: 0.95 }
              }
              transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.04 }}
              className="absolute inset-x-2 top-0.5 h-[132px] rounded-lg border border-black/15 bg-neutral-200 p-2.5 shadow-md"
            >
              <div className="h-1.5 w-10 rounded-full bg-black/20" />
              <div className="mt-2 space-y-1.5">
                <div className="h-1 w-4/5 rounded bg-black/15" />
                <div className="h-1 w-3/5 rounded bg-black/15" />
              </div>
            </motion.div>

            {/* Layer 3: Primary crisp UI preview card */}
            <motion.div
              animate={
                hovered
                  ? { y: -60, x: 0, rotate: 1.2, scale: 1.03 }
                  : { y: -10, x: 0, rotate: 0.4, scale: 0.97 }
              }
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="absolute inset-x-1 top-1 h-[138px]"
            >
              <FolderPreviewSheet project={project} />
            </motion.div>
          </div>

          {/* Front Matte Jet-Black Folder Flap (3D Hinges Open on Hover) */}
          <motion.div
            animate={hovered ? { rotateX: -28, y: 4 } : { rotateX: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 230, damping: 22 }}
            style={{ transformOrigin: "bottom center" }}
            className="preserve-3d absolute inset-x-0 bottom-0 flex h-[142px] flex-col justify-between overflow-hidden rounded-2xl border border-black bg-gradient-to-b from-[#1e1e1e] via-[#121212] to-[#080808] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)]"
          >
            <motion.div
              style={{ background: sheenBg }}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            <div className="relative z-10 flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.14em] text-neutral-400 uppercase">
                {project.category}
              </span>
              <span className="h-1 w-8 rounded-full bg-white/15 transition-all duration-300 group-hover:w-12 group-hover:bg-white/35" />
            </div>

            <div className="relative z-10 flex items-end justify-between gap-2">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight tracking-[-0.02em] text-white">
                {project.title}
              </h3>

              <motion.span
                animate={
                  hovered ? { scale: 1.15, rotate: 12 } : { scale: 1, rotate: 0 }
                }
                transition={{ type: "spring", stiffness: 360, damping: 18 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-black"
              >
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      </button>

      {/* Structured Card Footer with Tagline + Tech Chips */}
      <div className="mt-4 flex flex-1 flex-col justify-between gap-3 pt-1">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-medium text-neutral-600">
            {project.shortTagline}
          </span>
          <button
            type="button"
            onClick={() => onSelect(project)}
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-black transition-opacity hover:opacity-70 cursor-pointer"
          >
            <span>{project.ctaLabel}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-black/[0.07] pt-3">
          {project.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded border border-black/10 bg-[#FAFAFA] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-neutral-600"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const portfolio = usePortfolio();
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveProject(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section
      id="projects"
      className="relative w-full border-t border-black/[0.08] bg-[#F7F7F7] px-6 py-20 text-black sm:px-10 lg:px-14 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Header Row */}
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: 46, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1] tracking-[-0.04em] text-[#0A0A0A] sm:text-6xl"
              >
                Featured Projects
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-3 max-w-lg text-xs leading-relaxed text-neutral-600 sm:text-sm"
            >
              {portfolio.projectsSubtitle}
            </motion.p>
          </div>

          <a
            href={portfolio.socials.find((s) => s.icon === "github")?.href ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 self-start rounded-full border border-black/15 bg-white px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-xs font-medium text-black transition-all hover:bg-[#0A0A0A] hover:text-white sm:self-end"
          >
            <span>01–0{portfolio.projects.length} ON GITHUB</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* 4-Column Interactive 3D Black Folder Cards on White Stage */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {portfolio.projects.map((project, idx) => (
            <ProjectFolderCard
              key={project.id}
              project={project}
              index={idx}
              onSelect={setActiveProject}
            />
          ))}
        </div>
      </div>

      {/* Crisp White Case Study Modal with Minimal Black Telemetry Header */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setActiveProject(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-black/15 bg-white p-6 text-black shadow-2xl sm:p-8"
            >
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                aria-label="Close case study"
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-[#FAFAFA] text-neutral-700 transition-colors hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-xs text-neutral-500">
                <span className="rounded bg-[#0A0A0A] px-2 py-0.5 font-semibold text-white">
                  {activeProject.index}
                </span>
                <span>{activeProject.category}</span>
                <span>•</span>
                <span>{activeProject.year}</span>
              </div>

              <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.03em] text-black sm:text-4xl">
                {activeProject.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">{activeProject.role}</p>

              {/* Minimal Black System Snapshot Box */}
              <div className="mt-6 rounded-xl bg-[#0A0A0A] p-4 text-white">
                <div className="flex items-center justify-between border-b border-white/12 pb-2.5">
                  <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-neutral-400 uppercase">
                    {activeProject.previewHeadline}
                  </span>
                  <div className="flex gap-4">
                    {activeProject.previewMetrics.map((m) => (
                      <div key={m.label} className="text-right">
                        <span className="block font-[family-name:var(--font-mono)] text-[9px] text-neutral-400 uppercase">
                          {m.label}
                        </span>
                        <span className="font-[family-name:var(--font-display)] text-sm font-bold text-white">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 space-y-1 font-[family-name:var(--font-mono)] text-xs text-neutral-300">
                  {activeProject.previewSnippet.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-neutral-700">
                {activeProject.summary}
              </p>

              <div className="mt-6">
                <h4 className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.14em] text-neutral-500 uppercase">
                  Key Highlights
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {activeProject.impact.map((point, idx) => (
                    <motion.li
                      key={point}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + idx * 0.06 }}
                      className="flex items-start gap-2.5 text-sm text-neutral-800"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-black" />
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {activeProject.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-black/15 bg-[#FAFAFA] px-2.5 py-1 text-xs font-medium text-neutral-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-black/10 pt-5">
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>Source Code</span>
                </a>
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/20 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-black/5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Live Preview</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
