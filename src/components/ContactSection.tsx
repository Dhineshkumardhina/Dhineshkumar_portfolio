"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Instagram,
  Linkedin,
  Music2,
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

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  switch (icon) {
    case "linkedin":
      return <Linkedin className="h-3.5 w-3.5" />;
    case "github":
      return <Github className="h-3.5 w-3.5" />;
    case "instagram":
      return <Instagram className="h-3.5 w-3.5" />;
    case "spotify":
      return <Music2 className="h-3.5 w-3.5" />;
  }
}

export default function ContactSection() {
  const portfolio = usePortfolio();
  const [selectedTopic, setSelectedTopic] = useState<string>(INQUIRY_TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveredVia, setDeliveredVia] = useState<
    "gmail" | "web3forms" | "inbox-only" | null
  >(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(portfolio.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
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
          topic: selectedTopic,
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
    `[${selectedTopic}] Portfolio inquiry from ${name || "Visitor"}`
  )}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;

  return (
    <section
      id="contact"
      className="relative w-full border-t border-black/[0.08] bg-[#FAFAFA] px-6 py-24 text-[#0A0A0A] sm:px-10 lg:px-14 lg:py-28"
      style={{
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.09) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* ================= FULL-WIDTH SWISS EDITORIAL HEADER ================= */}
        <div className="flex flex-col justify-between gap-6 border-b border-black/12 pb-10 lg:flex-row lg:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase"
            >
              05 // GET IN TOUCH
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] tracking-[-0.045em] text-[#0A0A0A] sm:text-6xl lg:text-7xl"
            >
              Let&apos;s talk.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600"
            >
              {portfolio.contactSubtitle}
            </motion.p>
          </div>

          {/* Clickable Editorial Direct Email Display + Copy Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="flex flex-col items-start gap-2.5 lg:items-end"
          >
            <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
              DIRECT EMAIL
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={`mailto:${portfolio.email}`}
                className="group inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-[#0A0A0A] underline decoration-black/20 underline-offset-8 transition-colors hover:decoration-black sm:text-2xl"
              >
                <span>{portfolio.email}</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold text-black shadow-2xs transition-colors hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>COPY</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ================= ASYMMETRIC 2-COLUMN EDITORIAL BODY ================= */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* LEFT COLUMN: Interactive Topic Selector + Clean Architectural Info + Social Index */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between space-y-10 lg:col-span-5"
          >
            {/* Interactive Inquiry Topic Pills */}
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase">
                WHAT ARE WE BUILDING?
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {INQUIRY_TOPICS.map((topic) => {
                  const active = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        active
                          ? "border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)]"
                          : "border-black/12 bg-white text-neutral-700 hover:border-black hover:text-black"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Borderless Hairline Architectural Details */}
            <div className="divide-y divide-black/10 border-y border-black/10 text-xs">
              <div className="flex items-center justify-between py-3.5">
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.14em] text-neutral-400 uppercase">
                  STATUS
                </span>
                <span className="inline-flex items-center gap-2 font-semibold text-black">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Open to Opportunities
                </span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.14em] text-neutral-400 uppercase">
                  RESPONSE TIME
                </span>
                <span className="font-medium text-neutral-800">
                  {portfolio.replyTimeNote}
                </span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.14em] text-neutral-400 uppercase">
                  LOCATION
                </span>
                <span className="font-medium text-neutral-800">
                  {portfolio.currentlyAt.location}
                </span>
              </div>
            </div>

            {/* Editorial Social Directory */}
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase">
                ELSEWHERE
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {portfolio.socials.map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    className="group inline-flex items-center gap-2 rounded-full border border-black/12 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 transition-all hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white"
                  >
                    <SocialIcon icon={s.icon} />
                    <span>{s.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Sleek Frosted-Glass Minimalist Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.68, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-black/10 bg-white/85 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-10 lg:col-span-7"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="flex h-full min-h-[300px] flex-col items-start justify-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A0A0A] text-white">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-black">
                  {deliveredVia === "gmail" || deliveredVia === "web3forms"
                    ? `Message sent, ${name}.`
                    : `Message received, ${name}.`}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600">
                  {deliveredVia === "gmail" || deliveredVia === "web3forms" ? (
                    <>
                      Topic tagged as{" "}
                      <strong className="text-black">{selectedTopic}</strong>.
                      Your message has been delivered directly to{" "}
                      {portfolio.firstName}&apos;s Gmail inbox — expect a reply
                      soon.
                    </>
                  ) : (
                    <>
                      Topic tagged as{" "}
                      <strong className="text-black">{selectedTopic}</strong>.
                      Your note is saved in {portfolio.firstName}&apos;s inbox.
                      You can also send a direct copy via your mail app below.
                    </>
                  )}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {deliveredVia === "gmail" || deliveredVia === "web3forms" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setDeliveredVia(null);
                          setName("");
                          setEmail("");
                          setMessage("");
                        }}
                        className="rounded-full bg-[#0A0A0A] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 cursor-pointer"
                      >
                        Write another note
                      </button>
                      <a
                        href={mailtoHref}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-black hover:text-black"
                      >
                        <span>Open in Mail App</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </>
                  ) : (
                    <>
                      <Magnetic strength={0.18}>
                        <a
                          href={mailtoHref}
                          className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                        >
                          <span>Open in Mail App</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </Magnetic>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setDeliveredVia(null);
                          setName("");
                          setEmail("");
                          setMessage("");
                        }}
                        className="rounded-full border border-black/15 px-5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-black hover:text-black cursor-pointer"
                      >
                        Write another note
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.08] pb-4">
                  <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                    SEND A MESSAGE
                  </span>
                  <span className="rounded-full border border-black/10 bg-[#FAFAFA] px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium text-neutral-700">
                    Topic: {selectedTopic}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <div className="relative">
                    <label
                      htmlFor="contact-name"
                      className={`block text-xs font-semibold transition-colors ${
                        focusedField === "name" ? "text-black" : "text-neutral-500"
                      }`}
                    >
                      Your name
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
                      className="mt-2 w-full border-b border-black/18 bg-transparent pb-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none"
                    />
                    <motion.span
                      animate={{ scaleX: focusedField === "name" ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: "0% 50%" }}
                      className="pointer-events-none absolute right-0 bottom-0 left-0 h-[2px] bg-[#0A0A0A]"
                    />
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="contact-email"
                      className={`block text-xs font-semibold transition-colors ${
                        focusedField === "email" ? "text-black" : "text-neutral-500"
                      }`}
                    >
                      Email address
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
                      className="mt-2 w-full border-b border-black/18 bg-transparent pb-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none"
                    />
                    <motion.span
                      animate={{ scaleX: focusedField === "email" ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: "0% 50%" }}
                      className="pointer-events-none absolute right-0 bottom-0 left-0 h-[2px] bg-[#0A0A0A]"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="contact-message"
                    className={`block text-xs font-semibold transition-colors ${
                      focusedField === "message" ? "text-black" : "text-neutral-500"
                    }`}
                  >
                    Project or opportunity details
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    suppressHydrationWarning
                    value={message}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell me about what you're building, your timeline, or the role..."
                    className="mt-2 w-full resize-none border-b border-black/18 bg-transparent pb-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none"
                  />
                  <motion.span
                    animate={{ scaleX: focusedField === "message" ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "0% 50%" }}
                    className="pointer-events-none absolute right-0 bottom-0 left-0 h-[2px] bg-[#0A0A0A]"
                  />
                </div>

                {submitError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                    {submitError}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <Magnetic strength={0.18}>
                    <button
                      type="submit"
                      disabled={sending}
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#0A0A0A] px-6 py-3 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      <span className="relative z-10">
                        {sending ? "Sending..." : "Send Message"}
                      </span>
                      <ArrowUpRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                    </button>
                  </Magnetic>

                  <span className="font-[family-name:var(--font-mono)] text-[10px] text-neutral-400">
                    DIRECT TO {portfolio.firstName.toUpperCase()}
                  </span>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
