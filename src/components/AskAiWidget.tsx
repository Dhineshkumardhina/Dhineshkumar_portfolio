"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, MessageSquare, X } from "lucide-react";
import { type PortfolioData } from "@/data/portfolio";
import { usePortfolio } from "@/context/PortfolioContext";
import Magnetic from "@/components/Magnetic";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function generatePortfolioAnswer(rawQuery: string, portfolio: PortfolioData): string {
  const q = rawQuery.toLowerCase();

  if (
    q.includes("who") ||
    q.includes("about") ||
    q.includes("introduce") ||
    (q.includes("tell me about") && !q.includes("project") && !q.includes("stack"))
  ) {
    return `${portfolio.fullName} is an ${portfolio.roleTitle} based in ${portfolio.currentlyAt.location}. ${portfolio.aboutSummary} Currently working as a ${portfolio.currentlyAt.role} at ${portfolio.currentlyAt.company}, he specializes in LLM pipelines, RAG architectures, agentic workflows, and full-stack TypeScript/Python web applications.`;
  }

  if (
    q.includes("workflow") ||
    q.includes("smartops") ||
    q.includes("resumelens") ||
    q.includes("cris")
  ) {
    const match = portfolio.projects.find(
      (p) =>
        q.includes(p.id.replace("-", " ")) ||
        q.includes(p.title.toLowerCase()) ||
        q.includes(p.id)
    );
    if (match) {
      return `${match.title} (${match.year} · ${match.category}): ${match.summary} Key tech: ${match.stack.join(
        ", "
      )}. Highlight: ${match.impact[0]}`;
    }
  }

  if (
    q.includes("project") ||
    q.includes("build") ||
    q.includes("built") ||
    q.includes("rag") ||
    q.includes("work")
  ) {
    const list = portfolio.projects
      .map((p) => `• ${p.title} — ${p.shortTagline} (${p.stack.slice(0, 3).join(", ")})`)
      .join("\n");
    return `${portfolio.firstName}'s featured projects focus on production AI systems & full-stack engineering:\n\n${list}\n\nYou can open any 3D folder in the Featured Projects section to inspect architecture details and metrics.`;
  }

  if (
    q.includes("skill") ||
    q.includes("stack") ||
    q.includes("tech") ||
    q.includes("know") ||
    q.includes("language") ||
    q.includes("tool")
  ) {
    const summary = portfolio.techCategories
      .map(
        (cat) =>
          `• ${cat.title}: ${cat.skills
            .slice(0, 6)
            .map((s) => s.name)
            .join(", ")}`
      )
      .join("\n");
    return `${portfolio.firstName} works across AI/ML engineering and modern full-stack web development:\n\n${summary}`;
  }

  if (
    q.includes("experience") ||
    q.includes("education") ||
    q.includes("degree") ||
    q.includes("intern") ||
    q.includes("background")
  ) {
    const expList = portfolio.experiences
      .slice(0, 4)
      .map((e) => `• ${e.title} (${e.period}) — ${e.organization}`)
      .join("\n");
    return `Here is ${portfolio.firstName}'s recent timeline:\n\n${expList}`;
  }

  if (
    q.includes("contact") ||
    q.includes("hire") ||
    q.includes("email") ||
    q.includes("freelance") ||
    q.includes("reach")
  ) {
    return `${portfolio.firstName} is open to full-time AI/Full-Stack engineering roles and select freelance projects! Reach him directly at ${portfolio.email}, or drop a note in the "Let's talk." section above.`;
  }

  return `${portfolio.fullName} is an ${portfolio.roleTitle} focused on RAG pipelines, agentic automation, Python/FastAPI, and TypeScript/Next.js. Ask me about his projects (Workflow Automation, SmartOps, ResumeLens, CRIS), tech stack, experience, or how to get in touch!`;
}

export default function AskAiWidget() {
  const portfolio = usePortfolio();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 220);
    }
  }, [open]);

  const sendQuestion = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const fullAnswer = generatePortfolioAnswer(trimmed, portfolio);
    const assistantId = `a-${Date.now() + 1}`;

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const words = fullAnswer.split(" ");
      let idx = 0;
      const interval = setInterval(() => {
        idx += 2;
        const slice = words.slice(0, idx).join(" ");
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: slice } : m))
        );
        if (idx >= words.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 26);
    }, 300);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end sm:right-6 sm:bottom-6">
      {/* Mostly-White Floating Chat Drawer with Minimal Jet-Black Header */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="mb-3 flex h-[475px] w-[calc(100vw-2.5rem)] max-w-[370px] flex-col overflow-hidden rounded-2xl border border-black/15 bg-white text-black shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
          >
            {/* Minimal Jet-Black Header */}
            <div className="flex items-center justify-between bg-[#0A0A0A] px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/25 bg-neutral-200">
                  <img
                    src={portfolio.portraitSrc}
                    alt={portfolio.firstName}
                    className="h-full w-full object-cover object-top grayscale"
                  />
                  <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0A0A]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    {portfolio.firstName}&apos;s AI Assistant
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    Projects, skills &amp; experience
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
                className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Crisp White Body */}
            <div className="flex-1 overflow-y-auto bg-white px-4 py-5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col justify-between">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.35 }}
                    className="mt-6"
                  >
                    <h4 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight tracking-[-0.03em] text-black">
                      Get to know
                      <br />
                      {portfolio.firstName}&apos;s work.
                    </h4>
                    <p className="mt-2 text-xs text-neutral-500">
                      Ask anything about his AI projects, stack, or experience.
                    </p>
                  </motion.div>

                  {/* Quick Suggestions */}
                  <div className="space-y-1.5 pb-1">
                    {portfolio.aiSuggestions.map((prompt, idx) => (
                      <motion.button
                        key={prompt}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + idx * 0.05 }}
                        whileHover={{ x: 3 }}
                        onClick={() => sendQuestion(prompt)}
                        className="block w-full rounded-xl border border-black/10 bg-[#FAFAFA] px-3 py-2 text-left text-xs font-medium text-neutral-700 transition-colors hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "rounded-br-sm bg-[#0A0A0A] font-medium text-white"
                            : "rounded-bl-sm border border-black/10 bg-[#F5F5F5] text-neutral-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping &&
                    messages[messages.length - 1]?.role === "user" && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-1 rounded-2xl border border-black/10 bg-[#F5F5F5] px-3.5 py-2.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:300ms]" />
                        </div>
                      </div>
                    )}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            {/* Input Bar + Disclaimer */}
            <div className="border-t border-black/10 bg-[#FAFAFA] p-3">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-full border border-black/15 bg-white py-1.5 pr-1.5 pl-3.5 focus-within:border-[#0A0A0A] transition-colors"
              >
                <input
                  ref={inputRef}
                  type="text"
                  suppressHydrationWarning
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${portfolio.firstName}...`}
                  className="flex-1 bg-transparent text-xs text-black placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A0A0A] text-white transition-all hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </form>

              <p className="mt-2 text-center text-[10px] text-neutral-400">
                Answers are based on {portfolio.firstName}&apos;s portfolio data.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal Jet-Black Floating Pill Trigger ("Ask AI") */}
      <Magnetic strength={0.25}>
        <motion.button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className="relative inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.28)] transition-colors hover:bg-neutral-800 cursor-pointer"
        >
          {!open && (
            <span className="pointer-events-none absolute -inset-1 animate-ping rounded-full bg-black/20 [animation-duration:2.8s]" />
          )}
          <MessageSquare className="relative h-3.5 w-3.5" />
          <span className="relative">Ask AI</span>
        </motion.button>
      </Magnetic>
    </div>
  );
}
