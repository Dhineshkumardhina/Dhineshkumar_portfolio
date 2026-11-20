export interface SkillItem {
  name: string;
  highlighted?: boolean;
}

export interface TechCategory {
  title: string;
  description: string;
  skills: SkillItem[];
}

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  shortTagline: string;
  ctaLabel: string;
  category: string;
  year: string;
  role: string;
  summary: string;
  impact: string[];
  stack: string[];
  githubUrl: string;
  liveUrl: string;
  themeAccent: "light" | "mono" | "grid" | "code";
  previewHeadline: string;
  previewMetrics: { label: string; value: string }[];
  previewSnippet: string[];
}

export interface ExperienceItem {
  period: string;
  title: string;
  organization: string;
  location?: string;
  description: string;
  tag?: string;
  isCurrent?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: "linkedin" | "github" | "instagram" | "spotify";
}

export interface MetricCardItem {
  value: string;
  label: string;
  dark?: boolean;
}

export interface CapabilityItem {
  label: string;
  detail: string;
}

export interface PrincipleItem {
  code: string;
  title: string;
  text: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface PortfolioData {
  firstName: string;
  fullName: string;
  watermarkName: string;
  brandMark: string;
  year: string;
  availabilityBadge: string;
  portfolioVersion: string;
  heroLine1: string;
  heroLine2: string;
  heroTagline: string;
  heroFocusNote: string;
  heroMetrics: MetricCardItem[];
  roleTitle: string;
  roleLines: string[];
  currentlyAt: {
    label: string;
    company: string;
    role: string;
    location: string;
  };
  aboutSummary: string;
  capabilities: CapabilityItem[];
  marqueeItems: string[];
  portraitSrc: string;
  email: string;
  replyTimeNote: string;
  githubHandle: string;
  socials: SocialLink[];
  techStackSubtitle: string;
  techCategories: TechCategory[];
  principles: PrincipleItem[];
  projectsSubtitle: string;
  projects: ProjectItem[];
  experienceSubtitle: string[];
  experiences: ExperienceItem[];
  contactSubtitle: string;
  footerLinksRow1: FooterLinkItem[];
  footerLinksRow2: FooterLinkItem[];
  crowdQuips: string[];
  aiSuggestions: string[];
}

export const defaultPortfolio: PortfolioData = {
  firstName: "Dhinesh",
  fullName: "Dhineshkumar",
  watermarkName: "DHINESH.",
  brandMark: "Dhinesh.",
  year: "2026",
  availabilityBadge: "AVAILABLE FOR ROLES & FREELANCE",
  portfolioVersion: "PORTFOLIO v2.6",
  heroLine1: "SOFTWARE",
  heroLine2: "ENGINEER",
  heroTagline: "{{ AI & FULL-STACK DEVELOPMENT }}",
  heroFocusNote:
    "Shipping dependable LLM pipelines, fast TypeScript interfaces, and automated backend workflows.",
  heroMetrics: [
    {
      value: "78%",
      label: "Avg. manual ops time cut via AI automation",
      dark: false,
    },
    {
      value: "04+",
      label: "Production RAG & multi-agent systems",
      dark: true,
    },
  ],
  roleTitle: "AI Engineer & Full-Stack Developer",
  roleLines: ["AI Engineer", "& Full-Stack", "Developer."],
  currentlyAt: {
    label: "CURRENTLY AT",
    company: "AI Systems & Product Lab",
    role: "Software Developer & AI Engineer",
    location: "Tamil Nadu, India",
  },
  aboutSummary:
    "I build RAG pipelines and automate repetitive workflows, saving hours of manual work.",
  capabilities: [
    { label: "RAG Pipelines", detail: "Hybrid retrieval & citations" },
    { label: "Agentic Workflows", detail: "LangGraph & tool orchestration" },
    { label: "Full-Stack Web", detail: "Next.js, TypeScript & FastAPI" },
  ],
  marqueeItems: [
    "LLM PIPELINES",
    "AGENTIC WORKFLOWS",
    "SEMANTIC RETRIEVAL",
    "NEXT.JS & TYPESCRIPT",
    "FASTAPI & PYTHON",
    "VECTOR DATABASES",
    "AUTOMATION SYSTEMS",
    "FULL-STACK ARCHITECTURE",
  ],
  portraitSrc: "/images/portrait.png",
  email: "dhineshkumar.dev@gmail.com",
  replyTimeNote: "Replies < 24 hrs",
  githubHandle: "Dhineshkumardhina",

  socials: [
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/dhineshkumar",
      icon: "linkedin",
    },
    {
      label: "GitHub",
      href: "https://github.com/Dhineshkumardhina",
      icon: "github",
    },
    {
      label: "Instagram",
      href: "https://instagram.com",
      icon: "instagram",
    },
    {
      label: "Spotify",
      href: "https://open.spotify.com",
      icon: "spotify",
    },
  ],

  techStackSubtitle:
    "The tools behind my work. Carefully chosen for speed, reliability, and production AI scale.",
  techCategories: [
    {
      title: "AI & Machine Learning",
      description: "LLM Pipelines, Embeddings & Semantic Search Automation",
      skills: [
        { name: "LLMs", highlighted: true },
        { name: "Generative AI" },
        { name: "RAG", highlighted: true },
        { name: "Agentic Workflows" },
        { name: "LangChain" },
        { name: "LangGraph" },
        { name: "Prompt Engineering" },
        { name: "Sentence Transformers" },
        { name: "BGE / E5", highlighted: true },
      ],
    },
    {
      title: "Languages & Frameworks",
      description: "REST API Design & AI Integrations, Full-Stack Web",
      skills: [
        { name: "Python", highlighted: true },
        { name: "TypeScript", highlighted: true },
        { name: "FastAPI" },
        { name: "Django" },
        { name: "React", highlighted: true },
        { name: "Next.js" },
        { name: "Tailwind CSS" },
        { name: "RESTful APIs" },
      ],
    },
    {
      title: "Tools, Databases & Cloud",
      description: "Database Modeling, Data Processing & Deployment",
      skills: [
        { name: "PostgreSQL", highlighted: true },
        { name: "SQL" },
        { name: "SQLite" },
        { name: "ChromaDB" },
        { name: "Pandas" },
        { name: "NumPy" },
        { name: "Scikit-learn" },
        { name: "Docker" },
        { name: "Git & GitHub", highlighted: true },
        { name: "Playwright" },
        { name: "Cloudflare" },
        { name: "Vercel" },
      ],
    },
  ],
  principles: [
    {
      code: "01",
      title: "Grounded Retrieval",
      text: "Hybrid dense + lexical search with reranking and strict source citations.",
    },
    {
      code: "02",
      title: "Resilient Agents",
      text: "State-machine LangGraph flows with schema checks and human checkpoints.",
    },
    {
      code: "03",
      title: "Type-Safe UI",
      text: "Fast, accessible Next.js & React interfaces with fluid motion feedback.",
    },
    {
      code: "04",
      title: "Production Ready",
      text: "Dockerized Python/FastAPI services backed by PostgreSQL & CI pipelines.",
    },
  ],

  projectsSubtitle:
    "Independent projects and professional work. Open a folder to explore a project or case study.",
  projects: [
    {
      id: "workflow-automation",
      index: "01",
      title: "Workflow Automation",
      shortTagline: "Enterprise AI Orchestration",
      ctaLabel: "Read case study",
      category: "AI Automation / Agents",
      year: "2026",
      role: "Lead AI & Backend Engineer",
      summary:
        "End-to-end multi-step workflow automation platform powered by agentic LLMs and deterministic validation pipelines. Eliminates repetitive document triage, data extraction, and CRM synchronization across teams.",
      impact: [
        "Cut manual document processing time by 78% across weekly operational pipelines.",
        "Built resilient LangGraph execution nodes with human-in-the-loop approval checkpoints.",
        "Integrated real-time observability and retry policies for 99.4% task completion.",
      ],
      stack: ["Python", "LangGraph", "FastAPI", "PostgreSQL", "Next.js", "Docker"],
      githubUrl: "https://github.com/Dhineshkumardhina",
      liveUrl: "https://github.com/Dhineshkumardhina",
      themeAccent: "code",
      previewHeadline: "AUTOMATION ENGINE v2.4",
      previewMetrics: [
        { label: "Time Saved", value: "78%" },
        { label: "Runs / Day", value: "1.4k" },
      ],
      previewSnippet: [
        "pipeline.node('extract_pdf')",
        "  -> validate(schema=InvoiceV2)",
        "  -> route(confidence >= 0.94)",
        "status: 200 OK · 412ms",
      ],
    },
    {
      id: "smartops",
      index: "02",
      title: "SmartOps",
      shortTagline: "Multi-agent Ops Assistant",
      ctaLabel: "View project",
      category: "Multi-Agent RAG",
      year: "2025",
      role: "Full-Stack AI Developer",
      summary:
        "An intelligent operations co-pilot that connects internal runbooks, logs, and ticketing APIs via hybrid semantic search (BGE embeddings + BM25) to diagnose incidents and draft root-cause summaries in seconds.",
      impact: [
        "Reduced first-response triage latency from 18 minutes to under 45 seconds.",
        "Implemented hybrid vector + keyword retrieval over 40,000+ indexed runbook chunks.",
        "Designed an interactive streaming UI with inline citation verification.",
      ],
      stack: ["TypeScript", "Next.js", "FastAPI", "ChromaDB", "LangChain", "Tailwind CSS"],
      githubUrl: "https://github.com/Dhineshkumardhina",
      liveUrl: "https://github.com/Dhineshkumardhina",
      themeAccent: "mono",
      previewHeadline: "SMARTOPS CO-PILOT",
      previewMetrics: [
        { label: "Triage Speed", value: "24x" },
        { label: "Recall@5", value: "96.2%" },
      ],
      previewSnippet: [
        "query: 'auth-service 502 spike'",
        "matched: runbook#44 · redis-pool",
        "action: scale_pool(min=16)",
        "verified: 3 citations",
      ],
    },
    {
      id: "resumelens",
      index: "03",
      title: "ResumeLens",
      shortTagline: "Semantic Resume Matcher",
      ctaLabel: "View project",
      category: "NLP / Semantic Search",
      year: "2025",
      role: "Creator & Full-Stack Engineer",
      summary:
        "High-precision ATS & semantic resume analyzer that embeds job descriptions and resumes using Sentence Transformers, scoring skill alignment, detecting gaps, and rewriting bullet points for clarity.",
      impact: [
        "Processes multi-page PDF resumes in under 1.2s with structured JSON extraction.",
        "Generates side-by-side semantic gap maps and tailored impact bullet rewrites.",
        "Used by 500+ students and job seekers to refine technical resumes.",
      ],
      stack: ["Python", "Sentence Transformers", "React", "FastAPI", "PostgreSQL", "Vercel"],
      githubUrl: "https://github.com/Dhineshkumardhina",
      liveUrl: "https://github.com/Dhineshkumardhina",
      themeAccent: "light",
      previewHeadline: "MATCH SCORE: 94 / 100",
      previewMetrics: [
        { label: "Semantic Fit", value: "94%" },
        { label: "Latency", value: "0.9s" },
      ],
      previewSnippet: [
        "✓ RAG & Vector Search matched",
        "✓ TypeScript + Next.js matched",
        "→ Suggest: quantify API p95 gain",
        "export: ATS_Clean_v3.pdf",
      ],
    },
    {
      id: "cris",
      index: "04",
      title: "CRIS",
      shortTagline: "Contextual Retrieval System",
      ctaLabel: "View project",
      category: "RAG Architecture",
      year: "2024",
      role: "AI Systems Architect",
      summary:
        "Contextual Retrieval & Intelligence System built for dense technical knowledge bases. Combines recursive semantic chunking, cross-encoder reranking, and citation-grounded generation.",
      impact: [
        "Improved retrieval precision by 31% over naive fixed-size chunking baselines.",
        "Built automated eval harness measuring faithfulness and hallucination rates.",
        "Packaged with Docker Compose and Cloudflare Tunnel for zero-downtime demos.",
      ],
      stack: ["Python", "BGE/E5", "ChromaDB", "Django", "Playwright", "Cloudflare"],
      githubUrl: "https://github.com/Dhineshkumardhina",
      liveUrl: "https://github.com/Dhineshkumardhina",
      themeAccent: "grid",
      previewHeadline: "CRIS RETRIEVAL CORE",
      previewMetrics: [
        { label: "Precision", value: "+31%" },
        { label: "Faithfulness", value: "98.1%" },
      ],
      previewSnippet: [
        "chunks: 12,840 contextualized",
        "reranker: bge-reranker-large",
        "grounding: strict_citations=True",
        "eval_suite: 120/120 passed",
      ],
    },
  ],

  experienceSubtitle: ["Current work.", "Back to the foundations."],
  experiences: [
    {
      period: "Oct 2025 – Present",
      title: "Software Developer & AI Engineer",
      organization: "AI Systems & Product Lab",
      description:
        "Architecting RAG pipelines, agentic automation tools, and full-stack web products.",
      tag: "CURRENT",
      isCurrent: true,
    },
    {
      period: "2024 – Present",
      title: "Freelance Web Developer",
      organization: "Client Projects",
      description:
        "Built custom websites, AI dashboards, and full-stack apps for startups and independent founders.",
      tag: "FREELANCE",
    },
    {
      period: "2023 – 2025",
      title: "Master of Computer Applications",
      organization: "University",
      description:
        "Focused on Machine Learning, Distributed Systems, and Modern Software Engineering.",
      tag: "POSTGRAD",
    },
    {
      period: "Sep 2024 – Oct 2024",
      title: "Data Science Intern",
      organization: "Analytics & AI Research",
      description:
        "Completed a hands-on data science and NLP modeling internship working on real datasets.",
      tag: "INTERNSHIP",
    },
    {
      period: "2020 – 2023",
      title: "Bachelor of Computer Applications",
      organization: "Undergraduate Degree",
      description:
        "Built strong fundamentals in algorithms, databases, and full-stack software development.",
      tag: "UNDERGRAD",
    },
  ],

  contactSubtitle:
    "Whether it's a full-time role or a freelance project, my inbox is open.",

  footerLinksRow1: [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
  ],
  footerLinksRow2: [
    { label: "Freelance", href: "#contact" },
    { label: "World of Dhinesh", href: "#crowd-footer" },
    { label: "Contact", href: "#contact" },
  ],

  crowdQuips: [
    "Hey! You made it to the city.",
    "Click anywhere to make the crowd hop!",
    "Always shipping something new.",
    "Click 'Ask AI' to chat with my twin.",
    "Let's build something unforgettable.",
  ],

  aiSuggestions: [
    "Who is Dhinesh & what does he build?",
    "Tell me about his AI & RAG projects",
    "What is his tech stack?",
    "How can I hire or contact him?",
  ],
};

// Backwards-compatible default export alias
export const portfolio = defaultPortfolio;
