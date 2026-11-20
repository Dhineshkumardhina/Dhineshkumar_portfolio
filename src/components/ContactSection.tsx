"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Send,
} from "lucide-react";
import { type SocialLink } from "@/data/portfolio";
import { usePortfolio } from "@/context/PortfolioContext";
import Magnetic from "@/components/Magnetic";

const INQUIRY_TOPICS = [
  "Full-Time Role",
  "Freelance Project",
  "AI / RAG System",
  "Collaboration",
];

const TIMELINES = ["ASAP", "This Month", "Flexible"];

const QUICK_STARTERS = [
  {
    label: "Hire for AI / Full-Stack Role",
    topic: "Full-Time Role",
    text: "Hi Dhineshkumar, we loved your work on RepoShield AI and Xerova. We'd love to discuss an engineering role on our team.",
  },
  {
    label: "Build a Custom Product",
    topic: "Freelance Project",
    text: "Hi Dhineshkumar, I have a product idea I'd like to scope out with you — looking for an end-to-end build with clean UI and scalable backend.",
  },
  {
    label: "AI / Automation System",
    topic: "AI / RAG System",
    text: "Hi Dhineshkumar, we're looking to automate our workflow with an LLM / RAG pipeline and would love your architecture input.",
  },
];

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  switch (icon) {
    case "linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "github":
      return <Github className="h-4 w-4" />;
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "spotify":
      return <Music2 className="h-4 w-4" />;
  }
}

export default function ContactSection() {
  const portfolio = usePortfolio();
  const [selectedTopic, setSelectedTopic] = useState<string>(INQUIRY_TOPICS[0]);
  const [timeline, setTimeline] = useState<string>(TIMELINES[1]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveredVia, setDeliveredVia] = useState<
    "gmail" | "web3forms" | "inbox-only" | null
  >(null);
  const [istTime, setIstTime] = useState<string>("--:-- IST");
  const [spot, setSpot] = useState({ x: 50, y: 30, active: false });

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
        setIstTime(`${formatted.toUpperCase()} IST`);
      } catch {
        setIstTime("ONLINE · IST");
      }
    };
    updateClock();
    const id = setInterval(updateClock, 30000);
    return () => clearInterval(id);
  }, []);

  // Readiness meter (0 -> 100%)
  const filledCount =
    (name.trim() ? 1 : 0) +
    (email.trim().includes("@") ? 1 : 0) +
    (message.trim().length >= 8 ? 1 : 0);
  const readiness = Math.round((filledCount / 3) * 100);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(portfolio.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleDarkMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || sending) return;

    setSending(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: `${selectedTopic} · ${timeline}`,
          message: message.trim(),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        deliveredVia?: "gmail" | "web3forms" | "inbox-only";
        error?: string;
      };
      if (!res.ok || !json.ok) {
        throw new Error(
          json.error || "Could not send message. Please try emailing directly."
        );
      }
      setDeliveredVia(json.deliveredVia ?? "inbox-only");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Network error — please try emailing directly."
      );
    } finally {
      setSending(false);
    }
  };

  const mailtoHref = `mailto:${portfolio.email}?subject=${encodeURIComponent(
    `[${selectedTopic} · ${timeline}] Portfolio inquiry from ${name || "Visitor"}`
  )}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;

  const githubSocial = portfolio.socials.find((s) => s.icon === "github");
  const linkedinSocial = portfolio.socials.find((s) => s.icon === "linkedin");
  const extraSocial = portfolio.socials.find(
    (s) => s.icon !== "github" && s.icon !== "linkedin"
  );

  return (
    <section
      id="contact"
      className="relative w-full border-t border-black/[0.08] bg-[#FAFAFA] px-6 py-24 text-[#0A0A0A] sm:px-10 lg:px-14 lg:py-28"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* ================= HEADER: 05 · GET IN TOUCH / Let's Talk. ================= */}
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45 }}
            className="font-[family-name:var(--font-mono)] text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase"
          >
            05 &middot; GET IN TOUCH
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2.5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-[#0A0A0A] sm:text-5xl lg:text-6xl"
          >
            Let&apos;s Talk.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mt-3.5 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base"
          >
            Have an interesting project, an engineering problem to solve, or
            just want to connect? My inbox is always open.
          </motion.p>
        </div>

        {/* ================= HERO STATEMENT CARD: LET'S CREATE SOMETHING BOLD / XEROVA ================= */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center rounded-[28px] border border-black/[0.08] bg-white px-6 py-14 text-center shadow-[0_18px_50px_rgba(0,0,0,0.045)] sm:px-12 sm:py-20"
        >
          <h3 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#0A0A0A] uppercase sm:text-5xl md:text-6xl">
            LET&apos;S CREATE SOMETHING
            <br />
            BOLD.
          </h3>

          <p className="mt-5 text-sm font-medium text-neutral-500 sm:text-base">
            Turning Ideas Into Intelligent Digital Experiences.
          </p>

          {/* Signature Tilted XEROVA Mark with Bold Underline */}
          <motion.div
            whileHover={{ rotate: 0, scale: 1.04 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="mt-7 inline-flex -rotate-2 flex-col items-center select-none"
          >
            <span className="font-[family-name:var(--font-display)] text-3xl font-black tracking-[0.06em] text-[#0A0A0A] sm:text-4xl">
              XEROVA
            </span>
            <span className="mt-1.5 h-[4.5px] w-full rounded-full bg-[#0A0A0A]" />
          </motion.div>

          {/* Centered Email Pill Bar with Floating COPY Tooltip */}
          <div className="relative mt-9 w-full max-w-md">
            <div className="flex items-center justify-between gap-3 rounded-full border border-black/12 bg-[#FAFAFA] px-3 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-colors hover:border-black/25">
              <a
                href={`mailto:${portfolio.email}`}
                className="flex min-w-0 items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="truncate font-[family-name:var(--font-mono)] text-xs font-semibold text-[#0A0A0A] sm:text-sm">
                  {portfolio.email}
                </span>
              </a>

              <div className="relative shrink-0">
                {(copyHovered || copied) && (
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-[#0A0A0A] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-bold tracking-wider text-white uppercase shadow-md">
                    {copied ? "COPIED" : "COPY"}
                  </span>
                )}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={handleCopyEmail}
                  onMouseEnter={() => setCopyHovered(true)}
                  onMouseLeave={() => setCopyHovered(false)}
                  aria-label="Copy email address"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-700 transition-colors hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Circular Social Action Row */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-7 sm:gap-10">
            {githubSocial && (
              <motion.a
                href={githubSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="group flex flex-col items-center gap-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/12 bg-white text-[#0A0A0A] shadow-xs transition-all duration-200 group-hover:border-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white">
                  <Github className="h-4.5 w-4.5" />
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition-colors group-hover:text-[#0A0A0A]">
                  GITHUB
                </span>
              </motion.a>
            )}

            {linkedinSocial && (
              <motion.a
                href={linkedinSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="group flex flex-col items-center gap-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/12 bg-white text-[#0A0A0A] shadow-xs transition-all duration-200 group-hover:border-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white">
                  <Linkedin className="h-4.5 w-4.5" />
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition-colors group-hover:text-[#0A0A0A]">
                  LINKEDIN
                </span>
              </motion.a>
            )}

            {extraSocial ? (
              <motion.a
                href={extraSocial.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="group flex flex-col items-center gap-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/12 bg-white text-[#0A0A0A] shadow-xs transition-all duration-200 group-hover:border-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white">
                  <SocialIcon icon={extraSocial.icon} />
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition-colors group-hover:text-[#0A0A0A]">
                  {extraSocial.label.toUpperCase()}
                </span>
              </motion.a>
            ) : (
              <motion.a
                href={`mailto:${portfolio.email}`}
                whileHover={{ y: -3 }}
                className="group flex flex-col items-center gap-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/12 bg-white text-[#0A0A0A] shadow-xs transition-all duration-200 group-hover:border-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white">
                  <MessageCircle className="h-4.5 w-4.5" />
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition-colors group-hover:text-[#0A0A0A]">
                  DIRECT
                </span>
              </motion.a>
            )}
          </div>
        </motion.div>

        {/* ================= INTERACTIVE SPLIT LIVE-DISPATCH CONSOLE ================= */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.68, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid grid-cols-1 overflow-hidden rounded-[28px] border border-black/12 bg-white shadow-[0_22px_60px_rgba(0,0,0,0.06)] lg:grid-cols-12"
        >
          {/* LEFT PANEL: Jet-Black Live Dispatch Preview + IST Clock + 1-Click Starters */}
          <div
            onMouseMove={handleDarkMouseMove}
            onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
            className="relative flex flex-col justify-between overflow-hidden bg-[#0A0A0A] p-7 text-white sm:p-9 lg:col-span-5"
          >
            {/* Interactive Mouse-Follow Radial Spotlight */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: spot.active ? 1 : 0.45,
                background: `radial-gradient(360px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.11), transparent 65%)`,
              }}
            />

            {/* Subtle Architectural Dot Grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            <div className="relative z-10 space-y-6">
              {/* Top Live Telemetry Header */}
              <div className="flex items-center justify-between gap-2 border-b border-white/12 pb-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-wider text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  INBOX LIVE
                </span>
                <span
                  suppressHydrationWarning
                  className="font-[family-name:var(--font-mono)] text-[10px] tracking-widest text-neutral-400"
                >
                  {istTime}
                </span>
              </div>

              {/* Headline */}
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
                  LIVE DISPATCH PREVIEW
                </p>
                <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-white">
                  Direct to Gmail.
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
                  Type on the right — watch your brief assemble live before it
                  hits {portfolio.firstName}&apos;s inbox.
                </p>
              </div>

              {/* Dynamic Live Packet / Ticket Preview */}
              <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 font-[family-name:var(--font-mono)] text-[11px] backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[10px] text-neutral-400">
                  <span>PACKET // {selectedTopic.toUpperCase()}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white">
                    {timeline}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-neutral-300">
                  <div className="flex gap-2">
                    <span className="w-12 shrink-0 text-neutral-500">TO:</span>
                    <span className="truncate text-white">
                      {portfolio.email}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-12 shrink-0 text-neutral-500">FROM:</span>
                    <span className="truncate text-neutral-200">
                      {name.trim() || "Waiting for your name..."}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-12 shrink-0 text-neutral-500">MAIL:</span>
                    <span className="truncate text-neutral-300">
                      {email.trim() || "you@company.com"}
                    </span>
                  </div>
                  <div className="mt-2 rounded-lg border border-white/8 bg-black/40 p-2.5 text-[11px] leading-relaxed text-neutral-300">
                    {message.trim()
                      ? message.trim().slice(0, 120) +
                        (message.trim().length > 120 ? "..." : "")
                      : "Your project note or opportunity brief will preview right here..."}
                  </div>
                </div>

                {/* Live Readiness Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[9px] tracking-wider text-neutral-400 uppercase">
                    <span>DISPATCH READINESS</span>
                    <span
                      className={
                        readiness === 100
                          ? "font-bold text-emerald-400"
                          : "text-neutral-300"
                      }
                    >
                      {readiness}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      animate={{ width: `${readiness}%` }}
                      transition={{ type: "spring", stiffness: 220, damping: 24 }}
                      className={`h-full rounded-full ${
                        readiness === 100 ? "bg-emerald-400" : "bg-white"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 1-Click Quick Prompt Starters */}
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  OR PICK A 1-CLICK STARTER
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {QUICK_STARTERS.map((starter) => (
                    <button
                      key={starter.label}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(starter.topic);
                        setMessage(starter.text);
                        setSubmitted(false);
                      }}
                      className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-neutral-200 transition-all hover:border-white hover:bg-white hover:text-black cursor-pointer"
                    >
                      + {starter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Location & Serial Stamp */}
            <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/10 pt-4 font-[family-name:var(--font-mono)] text-[10px] text-neutral-500">
              <span>{portfolio.currentlyAt.location.toUpperCase()}</span>
              <span>{portfolio.replyTimeNote.toUpperCase()}</span>
            </div>
          </div>

          {/* RIGHT PANEL: Crisp Tactile Swiss Form Studio */}
          <div className="p-7 sm:p-10 lg:col-span-7">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="flex h-full min-h-[380px] flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A0A0A] text-white shadow-xl"
                >
                  <Check className="h-6 w-6 text-emerald-400" />
                </motion.div>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-black sm:text-3xl">
                  {deliveredVia === "gmail" || deliveredVia === "web3forms"
                    ? `Dispatched, ${name}!`
                    : `Message logged, ${name}.`}
                </h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-neutral-600">
                  {deliveredVia === "gmail" || deliveredVia === "web3forms" ? (
                    <>
                      Tagged as{" "}
                      <strong className="text-black">
                        {selectedTopic} · {timeline}
                      </strong>
                      . Delivered straight to {portfolio.firstName}&apos;s Gmail
                      inbox — expect a reply soon.
                    </>
                  ) : (
                    <>
                      Tagged as{" "}
                      <strong className="text-black">
                        {selectedTopic} · {timeline}
                      </strong>
                      . Saved in {portfolio.firstName}&apos;s inbox. You can
                      also open a direct copy in your mail app below.
                    </>
                  )}
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setDeliveredVia(null);
                      setName("");
                      setEmail("");
                      setMessage("");
                    }}
                    className="rounded-full bg-[#0A0A0A] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 cursor-pointer"
                  >
                    Send another brief
                  </button>
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-black hover:text-black"
                  >
                    <span>Open in Mail App</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 01: Topic + Timeline Selector */}
                <div className="space-y-4 border-b border-black/[0.08] pb-6">
                  <div>
                    <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase">
                      01 // WHAT ARE WE BUILDING?
                    </span>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {INQUIRY_TOPICS.map((topic) => {
                        const active = selectedTopic === topic;
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => setSelectedTopic(topic)}
                            className={`relative rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                              active
                                ? "border-[#0A0A0A] text-white"
                                : "border-black/12 bg-[#FAFAFA] text-neutral-700 hover:border-black hover:text-black"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="contactTopicPill"
                                transition={{
                                  type: "spring",
                                  stiffness: 380,
                                  damping: 30,
                                }}
                                className="absolute inset-0 rounded-full bg-[#0A0A0A]"
                              />
                            )}
                            <span className="relative z-10">{topic}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-neutral-400 uppercase">
                      TIMELINE:
                    </span>
                    {TIMELINES.map((t) => {
                      const active = timeline === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTimeline(t)}
                          className={`rounded-lg px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold transition-all cursor-pointer ${
                            active
                              ? "bg-black/10 text-black ring-1 ring-black/25"
                              : "text-neutral-500 hover:bg-black/[0.04] hover:text-black"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 02: Identity Fields */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className={`mb-2 block font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                        focusedField === "name"
                          ? "text-black"
                          : "text-neutral-500"
                      }`}
                    >
                      02 // YOUR NAME
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      suppressHydrationWarning
                      value={name}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="What should I call you?"
                      className="w-full rounded-xl border border-black/12 bg-[#FAFAFA] px-4 py-3 text-sm text-black placeholder:text-neutral-400 transition-all focus:border-[#0A0A0A] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className={`mb-2 block font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                        focusedField === "email"
                          ? "text-black"
                          : "text-neutral-500"
                      }`}
                    >
                      03 // EMAIL ADDRESS
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      suppressHydrationWarning
                      value={email}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-black/12 bg-[#FAFAFA] px-4 py-3 text-sm text-black placeholder:text-neutral-400 transition-all focus:border-[#0A0A0A] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Step 03: Brief Details */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="contact-message"
                      className={`font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                        focusedField === "message"
                          ? "text-black"
                          : "text-neutral-500"
                      }`}
                    >
                      04 // PROJECT OR OPPORTUNITY BRIEF
                    </label>
                    <span className="font-[family-name:var(--font-mono)] text-[10px] text-neutral-400">
                      {message.trim().length} chars
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    suppressHydrationWarning
                    value={message}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell me about what you're building, your goals, or the role..."
                    className="w-full resize-none rounded-xl border border-black/12 bg-[#FAFAFA] px-4 py-3 text-sm leading-relaxed text-black placeholder:text-neutral-400 transition-all focus:border-[#0A0A0A] focus:bg-white focus:outline-none"
                  />
                </div>

                {submitError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                    {submitError}
                  </p>
                )}

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <Magnetic strength={0.18}>
                    <button
                      type="submit"
                      disabled={sending}
                      className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#0A0A0A] px-7 py-3.5 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      <Send className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      <span className="relative z-10">
                        {sending ? "Dispatching..." : "Dispatch to Gmail"}
                      </span>
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                    </button>
                  </Magnetic>

                  <span className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[10px] text-neutral-500">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        readiness === 100
                          ? "bg-emerald-500"
                          : "bg-neutral-300"
                      }`}
                    />
                    {readiness === 100
                      ? "READY TO SEND"
                      : `DIRECT TO ${portfolio.firstName.toUpperCase()}`}
                  </span>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
