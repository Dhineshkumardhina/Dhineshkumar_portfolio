"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  Check,
  Code2,
  Download,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import type {
  PortfolioData,
  ProjectItem,
  ExperienceItem,
  SocialLink,
} from "@/data/portfolio";
import type { ContactInquiry, MailConfigStatus } from "@/lib/mail-server";

type TabId =
  | "mail"
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "contact";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "mail", label: "Gmail & Inbox", icon: Mail },
  { id: "hero", label: "Hero & Brand", icon: LayoutDashboard },
  { id: "about", label: "About & Marquee", icon: User },
  { id: "skills", label: "Tech Stack", icon: Code2 },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "contact", label: "Contact, Footer & AI", icon: MessageSquare },
];

const inputCls =
  "w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none transition-colors";
const labelCls =
  "mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase";

export default function AdminDashboard({
  initialData,
  initialMailConfig,
  initialInquiries,
}: {
  initialData: PortfolioData;
  initialMailConfig: MailConfigStatus;
  initialInquiries: ContactInquiry[];
}) {
  const router = useRouter();
  const [data, setData] = useState<PortfolioData>(initialData);
  const [activeTab, setActiveTab] = useState<TabId>("mail");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [newSkillInputs, setNewSkillInputs] = useState<Record<number, string>>({});
  const [newMarquee, setNewMarquee] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Direct Gmail Delivery + Contact Inquiries Inbox state
  const [mailConfig, setMailConfig] = useState<MailConfigStatus>(initialMailConfig);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(initialInquiries);
  const [receivingEmail, setReceivingEmail] = useState(
    initialMailConfig.receivingEmail || initialData.email
  );
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [web3formsKey, setWeb3formsKey] = useState("");
  const [mailSaving, setMailSaving] = useState(false);
  const [mailRefreshing, setMailRefreshing] = useState(false);
  const [mailTestResult, setMailTestResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const showToast = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3200);
  };

  const update = (updater: (prev: PortfolioData) => PortfolioData) => {
    setData((prev) => updater(prev));
    setDirty(true);
  };

  const broadcastUpdate = (payload: PortfolioData) => {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const ch = new BroadcastChannel("dhina-portfolio-sync");
        ch.postMessage({ type: "PORTFOLIO_UPDATED", payload });
        ch.close();
      }
    } catch {
      // BroadcastChannel optional
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setData(json.data);
      setDirty(false);
      broadcastUpdate(json.data);
      showToast("ok", "Saved! Live website updated immediately.");
    } catch (err) {
      showToast(
        "err",
        err instanceof Error ? err.message : "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleReset = async () => {
    if (!window.confirm("Reset all portfolio content back to factory defaults?")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Reset failed");
      setData(json.data);
      setDirty(false);
      broadcastUpdate(json.data);
      showToast("ok", "Portfolio reset to defaults.");
    } catch {
      showToast("err", "Could not reset portfolio.");
    } finally {
      setSaving(false);
    }
  };

  const handlePortraitUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      update((prev) => ({ ...prev, portraitSrc: json.url }));
      showToast("ok", "Portrait uploaded! Click Save Changes to publish.");
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as PortfolioData;
      if (!parsed.firstName || !Array.isArray(parsed.projects)) {
        throw new Error("Invalid portfolio JSON format.");
      }
      setData(parsed);
      setDirty(true);
      showToast("ok", "JSON imported! Click Save Changes to publish.");
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Import failed.");
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const addProject = () => {
    const nextIdx = String(data.projects.length + 1).padStart(2, "0");
    const newProj: ProjectItem = {
      id: `project-${Date.now()}`,
      index: nextIdx,
      title: "New Project",
      shortTagline: "Short description",
      ctaLabel: "View project",
      category: "AI / Full-Stack",
      year: data.year || "2026",
      role: "Creator & Engineer",
      summary: "Describe what this project solves and how you built it.",
      impact: ["Highlight key measurable outcome here."],
      stack: ["Next.js", "TypeScript", "Python"],
      githubUrl: "https://github.com/Dhineshkumardhina",
      liveUrl: "https://github.com/Dhineshkumardhina",
      themeAccent: "light",
      previewHeadline: "PROJECT PREVIEW",
      previewMetrics: [
        { label: "Metric 1", value: "99%" },
        { label: "Metric 2", value: "2x" },
      ],
      previewSnippet: ["pipeline.init()", "status: 200 OK"],
    };
    update((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const addExperience = () => {
    const item: ExperienceItem = {
      period: "2026 – Present",
      title: "New Role or Milestone",
      organization: "Organization Name",
      description: "Brief summary of your work or achievements.",
      tag: "MILESTONE",
      isCurrent: false,
    };
    update((prev) => ({
      ...prev,
      experiences: [...prev.experiences, item],
    }));
  };

  const handleSaveMailConfig = async (options: {
    sendTest?: boolean;
    clearGmailPassword?: boolean;
    clearWeb3formsKey?: boolean;
  }) => {
    setMailSaving(true);
    setMailTestResult(null);
    try {
      const res = await fetch("/api/admin/mail", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receivingEmail: receivingEmail.trim(),
          gmailAppPassword: gmailAppPassword.trim() || undefined,
          web3formsKey: web3formsKey.trim() || undefined,
          clearGmailPassword: options.clearGmailPassword,
          clearWeb3formsKey: options.clearWeb3formsKey,
          sendTest: options.sendTest,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        config?: MailConfigStatus;
        testResult?: {
          deliveredVia: "gmail" | "web3forms" | "inbox-only";
          error?: string;
        } | null;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.config) {
        throw new Error(json.error || "Failed to save email relay settings.");
      }

      setMailConfig(json.config);
      setReceivingEmail(json.config.receivingEmail);
      setGmailAppPassword("");
      setWeb3formsKey("");

      if (options.sendTest && json.testResult) {
        if (json.testResult.deliveredVia !== "inbox-only") {
          const providerLabel =
            json.testResult.deliveredVia === "gmail" ? "Gmail SMTP" : "Web3Forms";
          const msg = `Test email delivered via ${providerLabel} to ${json.config.receivingEmail}!`;
          setMailTestResult({ ok: true, text: msg });
          showToast("ok", msg);
        } else {
          const msg =
            json.testResult.error ||
            "Settings saved, but no email relay delivered the test email.";
          setMailTestResult({ ok: false, text: msg });
          showToast("err", "Settings saved — test email could not be delivered.");
        }
      } else {
        showToast("ok", "Direct Gmail delivery settings saved.");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save email relay settings.";
      setMailTestResult({ ok: false, text: msg });
      showToast("err", msg);
    } finally {
      setMailSaving(false);
    }
  };

  const handleRefreshInbox = async () => {
    setMailRefreshing(true);
    try {
      const res = await fetch("/api/admin/mail", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not refresh inbox");
      const json = (await res.json()) as {
        config: MailConfigStatus;
        inquiries: ContactInquiry[];
      };
      setMailConfig(json.config);
      setInquiries(json.inquiries);
    } catch {
      showToast("err", "Failed to refresh inbox.");
    } finally {
      setMailRefreshing(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/mail?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      const json = (await res.json()) as { inquiries: ContactInquiry[] };
      setInquiries(json.inquiries);
      showToast("ok", "Inquiry removed.");
    } catch {
      showToast("err", "Could not delete inquiry.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F7F7] text-[#0A0A0A]">
      {/* ================= STICKY GLASS ADMIN HEADER ================= */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/85 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A0A0A] font-[family-name:var(--font-display)] text-sm font-bold text-white">
              D.
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight text-black">
                  {data.brandMark} Admin CMS
                </h1>
                <span
                  className={`rounded-full px-2 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold uppercase ${
                    dirty
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {dirty ? "Unsaved changes" : "Synced"}
                </span>
              </div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] text-neutral-500">
                /dhina · Edit all live frontend content · Ctrl+S to save
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3.5 py-2 text-xs font-semibold text-black transition-colors hover:bg-neutral-100"
            >
              <span>View Live Site</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={handleExportJson}
              title="Export backup JSON"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <label
              title="Import backup JSON"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Import</span>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              title="Reset to defaults"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={async () => {
                await fetch("/api/admin/auth", { method: "DELETE" });
                router.refresh();
              }}
              title="Lock & Logout"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-black hover:bg-black hover:text-white cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-2xl ${
            toast.type === "ok"
              ? "bg-[#0A0A0A] text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "ok" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* ================= MAIN ADMIN WORKSPACE ================= */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-8 lg:grid-cols-12">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-1.5 rounded-2xl border border-black/10 bg-white p-2.5 shadow-xs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[#0A0A0A] text-white shadow-sm"
                      : "text-neutral-600 hover:bg-black/[0.05] hover:text-black"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                  </span>
                  {tab.id === "mail" && (
                    <span
                      className={`rounded-full px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold ${
                        active
                          ? "bg-white/20 text-white"
                          : mailConfig.connected
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-black/[0.07] text-neutral-700"
                      }`}
                    >
                      {inquiries.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Editor Canvas */}
        <div className="space-y-6 lg:col-span-9">
          {/* ==================== TAB 0: DIRECT GMAIL DELIVERY & INBOX ==================== */}
          {activeTab === "mail" && (
            <>
              {/* Direct Gmail Delivery Settings Card */}
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-[#FAFAFA] text-[#0A0A0A]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-[#0A0A0A] sm:text-lg">
                        Direct Gmail Delivery —{" "}
                        <span className="break-all">
                          {receivingEmail || data.email}
                        </span>
                      </h2>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Every contact form inquiry is delivered straight to your
                        Receiving Contact Email below.
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                      mailConfig.connected
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        mailConfig.connected
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                    {mailConfig.connected
                      ? `Email Relay Connected (${
                          mailConfig.activeProvider === "gmail"
                            ? "Gmail"
                            : "Web3Forms"
                        })`
                      : "Not Configured — Inbox Only"}
                  </span>
                </div>

                {/* 3-Column Credential Row */}
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Column 1: Receiving Contact Email */}
                  <div>
                    <label
                      htmlFor="mail-receiving-email"
                      className="mb-1.5 block text-xs font-semibold text-neutral-800"
                    >
                      Receiving Contact Email
                    </label>
                    <input
                      id="mail-receiving-email"
                      type="email"
                      value={receivingEmail}
                      onChange={(e) => setReceivingEmail(e.target.value)}
                      placeholder="dhineshkumardhina18@gmail.com"
                      className={inputCls}
                    />
                  </div>

                  {/* Column 2: Option 1 — Gmail App Password */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label
                        htmlFor="mail-gmail-password"
                        className="text-xs font-semibold text-neutral-800"
                      >
                        Option 1: Gmail App Password
                      </label>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A0A0A] underline decoration-black/25 underline-offset-4 hover:decoration-black"
                      >
                        <span>Get 16-char code</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <input
                      id="mail-gmail-password"
                      type="password"
                      autoComplete="new-password"
                      value={gmailAppPassword}
                      onChange={(e) => setGmailAppPassword(e.target.value)}
                      placeholder={
                        mailConfig.hasGmailPassword
                          ? "•••••••••••••••• (Saved securely)"
                          : "xxxx xxxx xxxx xxxx"
                      }
                      className={inputCls}
                    />
                    {mailConfig.hasGmailPassword && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleSaveMailConfig({
                            clearGmailPassword: true,
                          })
                        }
                        disabled={mailSaving}
                        className="mt-1 text-[11px] font-medium text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        Clear saved Gmail password
                      </button>
                    )}
                  </div>

                  {/* Column 3: Option 2 — Web3Forms Key */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label
                        htmlFor="mail-web3forms-key"
                        className="text-xs font-semibold text-neutral-800"
                      >
                        Option 2: Web3Forms Key
                      </label>
                      <a
                        href="https://web3forms.com/#start"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A0A0A] underline decoration-black/25 underline-offset-4 hover:decoration-black"
                      >
                        <span>Get free key</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <input
                      id="mail-web3forms-key"
                      type="text"
                      value={web3formsKey}
                      onChange={(e) => setWeb3formsKey(e.target.value)}
                      placeholder={
                        mailConfig.hasWeb3formsKey
                          ? "•••••••••••• (Saved securely)"
                          : "e.g. a1b2c3d4-e5f6-..."
                      }
                      className={inputCls}
                    />
                    {mailConfig.hasWeb3formsKey && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleSaveMailConfig({ clearWeb3formsKey: true })
                        }
                        disabled={mailSaving}
                        className="mt-1 text-[11px] font-medium text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        Clear saved Web3Forms key
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Action Row */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.07] pt-4">
                  <p className="max-w-lg text-[11px] leading-relaxed text-neutral-500">
                    Works with either a 16-char{" "}
                    <strong className="text-neutral-800">
                      Gmail App Password
                    </strong>{" "}
                    or a free{" "}
                    <strong className="text-neutral-800">Web3Forms Key</strong>{" "}
                    (recommended on Cloudflare Workers for instant HTTPS
                    delivery). Add both for automatic fallback.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={mailSaving}
                      onClick={() =>
                        void handleSaveMailConfig({ sendTest: false })
                      }
                      className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 transition-colors hover:border-black hover:text-black disabled:opacity-50 cursor-pointer"
                    >
                      Save Only
                    </button>
                    <button
                      type="button"
                      disabled={mailSaving}
                      onClick={() =>
                        void handleSaveMailConfig({ sendTest: true })
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0A0A0A] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>
                        {mailSaving
                          ? "Sending test..."
                          : "Save & Send Test Email"}
                      </span>
                    </button>
                  </div>
                </div>

                {mailTestResult && (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-xs font-medium ${
                      mailTestResult.ok
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-900"
                    }`}
                  >
                    {mailTestResult.text}
                  </div>
                )}
              </section>

              {/* Contact Inquiries Inbox Card */}
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] pb-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#0A0A0A]">
                      Contact Inquiries ({inquiries.length})
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Every submission from the Contact section is logged here
                      and forwarded to your Gmail.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshInbox}
                    disabled={mailRefreshing}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-black hover:text-black disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw
                      className={`h-3.5 w-3.5 ${
                        mailRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    <span>{mailRefreshing ? "Refreshing..." : "Refresh"}</span>
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-black/15 bg-[#FAFAFA] px-6 py-10 text-center">
                    <Mail className="mx-auto h-6 w-6 text-neutral-400" />
                    <p className="mt-2.5 text-sm font-semibold text-neutral-800">
                      No inquiries yet
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      When visitors submit the Contact form on your portfolio,
                      their message will show up here and be sent to{" "}
                      {receivingEmail || data.email}.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3.5">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="rounded-xl border border-black/10 bg-[#FAFAFA] p-4 transition-colors hover:border-black/20"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-black">
                                {inq.name}
                              </span>
                              <a
                                href={`mailto:${inq.email}`}
                                className="text-xs font-medium text-neutral-600 underline decoration-black/20 underline-offset-4 hover:text-black"
                              >
                                {inq.email}
                              </a>
                              <span className="rounded-full border border-black/12 bg-white px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold text-neutral-700">
                                {inq.topic}
                              </span>
                            </div>
                            <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] text-neutral-400">
                              {new Date(inq.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold ${
                                inq.deliveredVia === "gmail" ||
                                inq.deliveredVia === "web3forms"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-neutral-200 text-neutral-700"
                              }`}
                            >
                              {inq.deliveredVia === "gmail"
                                ? "Sent via Gmail"
                                : inq.deliveredVia === "web3forms"
                                  ? "Sent via Web3Forms"
                                  : "Inbox Only"}
                            </span>
                            <a
                              href={`mailto:${inq.email}?subject=${encodeURIComponent(
                                `Re: [${inq.topic}] Inquiry via Portfolio`
                              )}`}
                              className="inline-flex items-center gap-1 rounded-full bg-[#0A0A0A] px-3 py-1 text-[11px] font-semibold text-white hover:bg-neutral-800"
                            >
                              <span>Reply</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => void handleDeleteInquiry(inq.id)}
                              title="Delete inquiry"
                              className="rounded-full border border-black/10 bg-white p-1.5 text-neutral-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap rounded-lg border border-black/[0.06] bg-white px-3.5 py-3 text-sm leading-relaxed text-neutral-800">
                          {inq.message}
                        </p>

                        {inq.deliveryNote &&
                          inq.deliveredVia === "inbox-only" && (
                            <p className="mt-2 font-[family-name:var(--font-mono)] text-[10px] text-amber-700">
                              Delivery note: {inq.deliveryNote}
                            </p>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ==================== TAB 1: HERO & BRAND ==================== */}
          {activeTab === "hero" && (
            <>
              {/* Portrait Upload Card */}
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                  Portrait Photo &amp; Brand Identity
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Upload a new portrait photo (auto-styled monochrome in Hero &amp; About) or edit brand names.
                </p>

                <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-[#efefef]">
                    <img
                      src={data.portraitSrc}
                      alt={data.fullName}
                      className="h-full w-full object-cover object-top grayscale"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className={labelCls}>Portrait Image Path / URL</label>
                      <input
                        className={inputCls}
                        value={data.portraitSrc}
                        onChange={(e) =>
                          update((p) => ({ ...p, portraitSrc: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <span>
                          {uploading ? "Uploading..." : "Upload New Photo"}
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handlePortraitUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-neutral-400">
                        PNG, JPG, or WebP up to 10MB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelCls}>First Name</label>
                    <input
                      className={inputCls}
                      value={data.firstName}
                      onChange={(e) =>
                        update((p) => ({ ...p, firstName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input
                      className={inputCls}
                      value={data.fullName}
                      onChange={(e) =>
                        update((p) => ({ ...p, fullName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Navbar Brand Mark</label>
                    <input
                      className={inputCls}
                      value={data.brandMark}
                      onChange={(e) =>
                        update((p) => ({ ...p, brandMark: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Footer Giant Watermark</label>
                    <input
                      className={inputCls}
                      value={data.watermarkName}
                      onChange={(e) =>
                        update((p) => ({ ...p, watermarkName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Year</label>
                    <input
                      className={inputCls}
                      value={data.year}
                      onChange={(e) =>
                        update((p) => ({ ...p, year: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Portfolio Version Label</label>
                    <input
                      className={inputCls}
                      value={data.portfolioVersion}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          portfolioVersion: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Hero Headlines & Status */}
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                  Hero Headlines &amp; Focus Deck
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Headline Line 1</label>
                    <input
                      className={inputCls}
                      value={data.heroLine1}
                      onChange={(e) =>
                        update((p) => ({ ...p, heroLine1: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Headline Line 2</label>
                    <input
                      className={inputCls}
                      value={data.heroLine2}
                      onChange={(e) =>
                        update((p) => ({ ...p, heroLine2: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Top Availability Badge</label>
                    <input
                      className={inputCls}
                      value={data.availabilityBadge}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          availabilityBadge: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hero Mono Tagline</label>
                    <input
                      className={inputCls}
                      value={data.heroTagline}
                      onChange={(e) =>
                        update((p) => ({ ...p, heroTagline: e.target.value }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Hero Focus Description</label>
                    <textarea
                      rows={2}
                      className={inputCls}
                      value={data.heroFocusNote}
                      onChange={(e) =>
                        update((p) => ({ ...p, heroFocusNote: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Hero Metrics */}
                <div className="mt-6 border-t border-black/10 pt-5">
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>Hero Impact Metric Cards</label>
                    <button
                      type="button"
                      onClick={() =>
                        update((p) => ({
                          ...p,
                          heroMetrics: [
                            ...p.heroMetrics,
                            { value: "10+", label: "New metric", dark: false },
                          ],
                        }))
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-black/15 px-3 py-1 text-[11px] font-semibold hover:bg-black hover:text-white cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Metric
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {data.heroMetrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-black/10 bg-[#FAFAFA] p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            className={`${inputCls} w-28 font-bold`}
                            value={m.value}
                            placeholder="78%"
                            onChange={(e) =>
                              update((p) => {
                                const next = [...p.heroMetrics];
                                next[idx] = { ...next[idx], value: e.target.value };
                                return { ...p, heroMetrics: next };
                              })
                            }
                          />
                          <label className="inline-flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(m.dark)}
                              onChange={(e) =>
                                update((p) => {
                                  const next = [...p.heroMetrics];
                                  next[idx] = { ...next[idx], dark: e.target.checked };
                                  return { ...p, heroMetrics: next };
                                })
                              }
                            />
                            Dark Card
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              update((p) => ({
                                ...p,
                                heroMetrics: p.heroMetrics.filter((_, i) => i !== idx),
                              }))
                            }
                            className="ml-auto text-neutral-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <input
                          className={inputCls}
                          value={m.label}
                          placeholder="Metric caption"
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.heroMetrics];
                              next[idx] = { ...next[idx], label: e.target.value };
                              return { ...p, heroMetrics: next };
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ==================== TAB 2: ABOUT & MARQUEE ==================== */}
          {activeTab === "about" && (
            <>
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs space-y-5">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                  About Section &amp; Currently At
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Full Role Title (SEO &amp; Back Card)</label>
                    <input
                      className={inputCls}
                      value={data.roleTitle}
                      onChange={(e) =>
                        update((p) => ({ ...p, roleTitle: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Role Display Lines (one per line)</label>
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={data.roleLines.join("\n")}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          roleLines: e.target.value.split("\n"),
                        }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>About Bio Summary</label>
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={data.aboutSummary}
                      onChange={(e) =>
                        update((p) => ({ ...p, aboutSummary: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-black/10 pt-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Currently At — Badge Label</label>
                    <input
                      className={inputCls}
                      value={data.currentlyAt.label}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          currentlyAt: { ...p.currentlyAt, label: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Company / Lab Name</label>
                    <input
                      className={inputCls}
                      value={data.currentlyAt.company}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          currentlyAt: { ...p.currentlyAt, company: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Current Role</label>
                    <input
                      className={inputCls}
                      value={data.currentlyAt.role}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          currentlyAt: { ...p.currentlyAt, role: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <input
                      className={inputCls}
                      value={data.currentlyAt.location}
                      onChange={(e) =>
                        update((p) => ({
                          ...p,
                          currentlyAt: {
                            ...p.currentlyAt,
                            location: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* About Capability Cards */}
                <div className="border-t border-black/10 pt-5">
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>About Capability Cards</label>
                    <button
                      type="button"
                      onClick={() =>
                        update((p) => ({
                          ...p,
                          capabilities: [
                            ...p.capabilities,
                            { label: "New Capability", detail: "Short detail" },
                          ],
                        }))
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-black/15 px-3 py-1 text-[11px] font-semibold hover:bg-black hover:text-white cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Card
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {data.capabilities.map((cap, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-2 rounded-xl border border-black/10 bg-[#FAFAFA] p-3 sm:flex-row sm:items-center"
                      >
                        <input
                          className={inputCls}
                          value={cap.label}
                          placeholder="Title"
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.capabilities];
                              next[idx] = { ...next[idx], label: e.target.value };
                              return { ...p, capabilities: next };
                            })
                          }
                        />
                        <input
                          className={inputCls}
                          value={cap.detail}
                          placeholder="Short detail"
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.capabilities];
                              next[idx] = { ...next[idx], detail: e.target.value };
                              return { ...p, capabilities: next };
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            update((p) => ({
                              ...p,
                              capabilities: p.capabilities.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                          className="shrink-0 p-2 text-neutral-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Scrolling Marquee Ticker Items */}
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                  Scrolling Marquee Ribbon Items
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.marqueeItems.map((item, idx) => (
                    <span
                      key={`${item}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[11px] text-white"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          update((p) => ({
                            ...p,
                            marqueeItems: p.marqueeItems.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-neutral-400 hover:text-white cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    className={inputCls}
                    placeholder="Add new marquee item (e.g. CLOUD ARCHITECTURE)..."
                    value={newMarquee}
                    onChange={(e) => setNewMarquee(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMarquee.trim()) {
                        e.preventDefault();
                        update((p) => ({
                          ...p,
                          marqueeItems: [
                            ...p.marqueeItems,
                            newMarquee.trim().toUpperCase(),
                          ],
                        }));
                        setNewMarquee("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMarquee.trim()) return;
                      update((p) => ({
                        ...p,
                        marqueeItems: [
                          ...p.marqueeItems,
                          newMarquee.trim().toUpperCase(),
                        ],
                      }));
                      setNewMarquee("");
                    }}
                    className="shrink-0 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </section>
            </>
          )}

          {/* ==================== TAB 3: TECH STACK ==================== */}
          {activeTab === "skills" && (
            <>
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                      Tech Stack Categories &amp; Pills
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Click any pill to toggle solid-black highlight.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      update((p) => ({
                        ...p,
                        techCategories: [
                          ...p.techCategories,
                          {
                            title: "New Category",
                            description: "Category description",
                            skills: [{ name: "Skill 1", highlighted: true }],
                          },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-[#0A0A0A] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Category
                  </button>
                </div>

                <div>
                  <label className={labelCls}>Section Subtitle</label>
                  <input
                    className={inputCls}
                    value={data.techStackSubtitle}
                    onChange={(e) =>
                      update((p) => ({ ...p, techStackSubtitle: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  {data.techCategories.map((cat, catIdx) => (
                    <div
                      key={catIdx}
                      className="rounded-2xl border border-black/10 bg-[#FAFAFA] p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className={labelCls}>Category Title</label>
                            <input
                              className={inputCls}
                              value={cat.title}
                              onChange={(e) =>
                                update((p) => {
                                  const next = [...p.techCategories];
                                  next[catIdx] = {
                                    ...next[catIdx],
                                    title: e.target.value,
                                  };
                                  return { ...p, techCategories: next };
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Description</label>
                            <input
                              className={inputCls}
                              value={cat.description}
                              onChange={(e) =>
                                update((p) => {
                                  const next = [...p.techCategories];
                                  next[catIdx] = {
                                    ...next[catIdx],
                                    description: e.target.value,
                                  };
                                  return { ...p, techCategories: next };
                                })
                              }
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            update((p) => ({
                              ...p,
                              techCategories: p.techCategories.filter(
                                (_, i) => i !== catIdx
                              ),
                            }))
                          }
                          className="mt-5 p-2 text-neutral-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Skill Pills */}
                      <div className="flex flex-wrap gap-2">
                        {cat.skills.map((skill, sIdx) => (
                          <div
                            key={`${skill.name}-${sIdx}`}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                              skill.highlighted
                                ? "border-[#0A0A0A] bg-[#0A0A0A] text-white"
                                : "border-black/15 bg-white text-black"
                            }`}
                          >
                            <button
                              type="button"
                              title="Click to toggle highlight"
                              onClick={() =>
                                update((p) => {
                                  const cats = [...p.techCategories];
                                  const skills = [...cats[catIdx].skills];
                                  skills[sIdx] = {
                                    ...skills[sIdx],
                                    highlighted: !skills[sIdx].highlighted,
                                  };
                                  cats[catIdx] = { ...cats[catIdx], skills };
                                  return { ...p, techCategories: cats };
                                })
                              }
                              className="cursor-pointer"
                            >
                              {skill.name}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                update((p) => {
                                  const cats = [...p.techCategories];
                                  cats[catIdx] = {
                                    ...cats[catIdx],
                                    skills: cats[catIdx].skills.filter(
                                      (_, i) => i !== sIdx
                                    ),
                                  };
                                  return { ...p, techCategories: cats };
                                })
                              }
                              className="opacity-60 hover:opacity-100 cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Skill Input */}
                      <div className="flex gap-2">
                        <input
                          className={inputCls}
                          placeholder="Add tool or skill..."
                          value={newSkillInputs[catIdx] ?? ""}
                          onChange={(e) =>
                            setNewSkillInputs((prev) => ({
                              ...prev,
                              [catIdx]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            const val = (newSkillInputs[catIdx] ?? "").trim();
                            if (e.key === "Enter" && val) {
                              e.preventDefault();
                              update((p) => {
                                const cats = [...p.techCategories];
                                cats[catIdx] = {
                                  ...cats[catIdx],
                                  skills: [...cats[catIdx].skills, { name: val }],
                                };
                                return { ...p, techCategories: cats };
                              });
                              setNewSkillInputs((prev) => ({
                                ...prev,
                                [catIdx]: "",
                              }));
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = (newSkillInputs[catIdx] ?? "").trim();
                            if (!val) return;
                            update((p) => {
                              const cats = [...p.techCategories];
                              cats[catIdx] = {
                                ...cats[catIdx],
                                skills: [...cats[catIdx].skills, { name: val }],
                              };
                              return { ...p, techCategories: cats };
                            });
                            setNewSkillInputs((prev) => ({
                              ...prev,
                              [catIdx]: "",
                            }));
                          }}
                          className="shrink-0 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Engineering Principles */}
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs space-y-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                  Engineering Principles Strip (Bottom 4 Cards)
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {data.principles.map((pr, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-black/10 bg-[#FAFAFA] p-3.5 space-y-2"
                    >
                      <div className="flex gap-2">
                        <input
                          className={`${inputCls} w-16 font-mono`}
                          value={pr.code}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.principles];
                              next[idx] = { ...next[idx], code: e.target.value };
                              return { ...p, principles: next };
                            })
                          }
                        />
                        <input
                          className={inputCls}
                          value={pr.title}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.principles];
                              next[idx] = { ...next[idx], title: e.target.value };
                              return { ...p, principles: next };
                            })
                          }
                        />
                      </div>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={pr.text}
                        onChange={(e) =>
                          update((p) => {
                            const next = [...p.principles];
                            next[idx] = { ...next[idx], text: e.target.value };
                            return { ...p, principles: next };
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ==================== TAB 4: PROJECTS ==================== */}
          {activeTab === "projects" && (
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                    Featured Projects (3D Interactive Folders)
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Edit folder titles, preview metrics, code snippets, case study bullets, and links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProject}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </button>
              </div>

              <div>
                <label className={labelCls}>Section Subtitle</label>
                <input
                  className={inputCls}
                  value={data.projectsSubtitle}
                  onChange={(e) =>
                    update((p) => ({ ...p, projectsSubtitle: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-5">
                {data.projects.map((proj, idx) => (
                  <div
                    key={proj.id || idx}
                    className="rounded-2xl border border-black/12 bg-[#FAFAFA] p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-md bg-[#0A0A0A] px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs font-bold text-white">
                          {proj.index}
                        </span>
                        <h3 className="font-[family-name:var(--font-display)] text-base font-bold">
                          {proj.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          update((p) => ({
                            ...p,
                            projects: p.projects.filter((_, i) => i !== idx),
                          }))
                        }
                        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className={labelCls}>Index (01..)</label>
                        <input
                          className={inputCls}
                          value={proj.index}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = { ...next[idx], index: e.target.value };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          className={inputCls}
                          value={proj.title}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = { ...next[idx], title: e.target.value };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Category</label>
                        <input
                          className={inputCls}
                          value={proj.category}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = {
                                ...next[idx],
                                category: e.target.value,
                              };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Short Tagline</label>
                        <input
                          className={inputCls}
                          value={proj.shortTagline}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = {
                                ...next[idx],
                                shortTagline: e.target.value,
                              };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Year</label>
                        <input
                          className={inputCls}
                          value={proj.year}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = { ...next[idx], year: e.target.value };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Role</label>
                        <input
                          className={inputCls}
                          value={proj.role}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = { ...next[idx], role: e.target.value };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>CTA Label</label>
                        <input
                          className={inputCls}
                          value={proj.ctaLabel}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = {
                                ...next[idx],
                                ctaLabel: e.target.value,
                              };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>GitHub URL</label>
                        <input
                          className={inputCls}
                          value={proj.githubUrl}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = {
                                ...next[idx],
                                githubUrl: e.target.value,
                              };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Live URL</label>
                        <input
                          className={inputCls}
                          value={proj.liveUrl}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = { ...next[idx], liveUrl: e.target.value };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Case Study Summary</label>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={proj.summary}
                        onChange={(e) =>
                          update((p) => {
                            const next = [...p.projects];
                            next[idx] = { ...next[idx], summary: e.target.value };
                            return { ...p, projects: next };
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>
                          Tech Stack (comma separated)
                        </label>
                        <input
                          className={inputCls}
                          value={proj.stack.join(", ")}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = {
                                ...next[idx],
                                stack: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Folder Sheet Headline</label>
                        <input
                          className={inputCls}
                          value={proj.previewHeadline}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = {
                                ...next[idx],
                                previewHeadline: e.target.value,
                              };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Key Impact Bullets (one per line)
                        </label>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={proj.impact.join("\n")}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = {
                                ...next[idx],
                                impact: e.target.value.split("\n"),
                              };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Preview Code / Telemetry Lines (one per line)
                        </label>
                        <textarea
                          rows={3}
                          className={`${inputCls} font-mono text-xs`}
                          value={proj.previewSnippet.join("\n")}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.projects];
                              next[idx] = {
                                ...next[idx],
                                previewSnippet: e.target.value.split("\n"),
                              };
                              return { ...p, projects: next };
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================== TAB 5: EXPERIENCE ==================== */}
          {activeTab === "experience" && (
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                    Experience Wavy Timeline
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    The desktop wavy curve displays up to 5 chronological milestones left-to-right.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Milestone
                </button>
              </div>

              <div>
                <label className={labelCls}>Header Subtitle Lines (one per line)</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={data.experienceSubtitle.join("\n")}
                  onChange={(e) =>
                    update((p) => ({
                      ...p,
                      experienceSubtitle: e.target.value.split("\n"),
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                {data.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-black/10 bg-[#FAFAFA] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(exp.isCurrent)}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.experiences];
                              next[idx] = {
                                ...next[idx],
                                isCurrent: e.target.checked,
                              };
                              return { ...p, experiences: next };
                            })
                          }
                        />
                        Current Role (Glowing Pulse Dot)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          update((p) => ({
                            ...p,
                            experiences: p.experiences.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className={labelCls}>Period</label>
                        <input
                          className={inputCls}
                          value={exp.period}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.experiences];
                              next[idx] = { ...next[idx], period: e.target.value };
                              return { ...p, experiences: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Badge Tag</label>
                        <input
                          className={inputCls}
                          value={exp.tag ?? ""}
                          placeholder="CURRENT"
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.experiences];
                              next[idx] = { ...next[idx], tag: e.target.value };
                              return { ...p, experiences: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Role / Degree Title</label>
                        <input
                          className={inputCls}
                          value={exp.title}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.experiences];
                              next[idx] = { ...next[idx], title: e.target.value };
                              return { ...p, experiences: next };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Organization</label>
                        <input
                          className={inputCls}
                          value={exp.organization}
                          onChange={(e) =>
                            update((p) => {
                              const next = [...p.experiences];
                              next[idx] = {
                                ...next[idx],
                                organization: e.target.value,
                              };
                              return { ...p, experiences: next };
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={exp.description}
                        onChange={(e) =>
                          update((p) => {
                            const next = [...p.experiences];
                            next[idx] = {
                              ...next[idx],
                              description: e.target.value,
                            };
                            return { ...p, experiences: next };
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================== TAB 6: CONTACT, FOOTER & AI ==================== */}
          {activeTab === "contact" && (
            <>
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs space-y-5">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                  Contact &amp; Social Links
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Direct Email</label>
                    <input
                      className={inputCls}
                      value={data.email}
                      onChange={(e) =>
                        update((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Reply Time Badge</label>
                    <input
                      className={inputCls}
                      value={data.replyTimeNote}
                      onChange={(e) =>
                        update((p) => ({ ...p, replyTimeNote: e.target.value }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Contact Subtitle</label>
                    <input
                      className={inputCls}
                      value={data.contactSubtitle}
                      onChange={(e) =>
                        update((p) => ({ ...p, contactSubtitle: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="border-t border-black/10 pt-4 space-y-3">
                  <label className={labelCls}>Social Profiles</label>
                  {data.socials.map((soc, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-12"
                    >
                      <select
                        className={`${inputCls} sm:col-span-3`}
                        value={soc.icon}
                        onChange={(e) =>
                          update((p) => {
                            const next = [...p.socials];
                            next[idx] = {
                              ...next[idx],
                              icon: e.target.value as SocialLink["icon"],
                            };
                            return { ...p, socials: next };
                          })
                        }
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="instagram">Instagram</option>
                        <option value="spotify">Spotify</option>
                      </select>
                      <input
                        className={`${inputCls} sm:col-span-3`}
                        value={soc.label}
                        placeholder="Label"
                        onChange={(e) =>
                          update((p) => {
                            const next = [...p.socials];
                            next[idx] = { ...next[idx], label: e.target.value };
                            return { ...p, socials: next };
                          })
                        }
                      />
                      <input
                        className={`${inputCls} sm:col-span-5`}
                        value={soc.href}
                        placeholder="https://..."
                        onChange={(e) =>
                          update((p) => {
                            const next = [...p.socials];
                            next[idx] = { ...next[idx], href: e.target.value };
                            return { ...p, socials: next };
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          update((p) => ({
                            ...p,
                            socials: p.socials.filter((_, i) => i !== idx),
                          }))
                        }
                        className="flex items-center justify-center text-neutral-400 hover:text-red-600 sm:col-span-1 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      update((p) => ({
                        ...p,
                        socials: [
                          ...p.socials,
                          { label: "GitHub", href: "https://github.com", icon: "github" },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold hover:bg-black hover:text-white cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Social Link
                  </button>
                </div>
              </section>

              {/* Crowd Footer Speech Bubbles & AI Suggestions */}
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs space-y-5">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                  Crowd Footer Quips &amp; Ask AI Suggestions
                </h2>

                <div>
                  <label className={labelCls}>
                    Center Character Hover Speech Bubbles (one per line)
                  </label>
                  <textarea
                    rows={4}
                    className={inputCls}
                    value={data.crowdQuips.join("\n")}
                    onChange={(e) =>
                      update((p) => ({
                        ...p,
                        crowdQuips: e.target.value.split("\n"),
                      }))
                    }
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Ask AI Quick Suggestion Prompts (one per line)
                  </label>
                  <textarea
                    rows={4}
                    className={inputCls}
                    value={data.aiSuggestions.join("\n")}
                    onChange={(e) =>
                      update((p) => ({
                        ...p,
                        aiSuggestions: e.target.value.split("\n"),
                      }))
                    }
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
