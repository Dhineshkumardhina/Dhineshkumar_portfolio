import { getPortfolioKV } from "@/lib/cloudflare-kv";
import { readPortfolioData } from "@/lib/portfolio-server";

export interface MailConfigSecret {
  receivingEmail: string;
  gmailAppPassword: string;
  web3formsKey: string;
}

export interface MailConfigStatus {
  receivingEmail: string;
  hasGmailPassword: boolean;
  hasWeb3formsKey: boolean;
  connected: boolean;
  activeProvider: "gmail" | "web3forms" | "none";
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
  deliveredVia: "gmail" | "web3forms" | "inbox-only";
  deliveryNote?: string;
}

const KV_MAIL_CONFIG = "admin:mail-config";
const KV_INQUIRIES = "admin:inquiries";

async function readLocalJson<T>(filename: string): Promise<T | null> {
  try {
    const [{ promises: fs }, path] = await Promise.all([
      import("fs"),
      import("path"),
    ]);
    const full = path.join(process.cwd(), filename);
    const raw = await fs.readFile(full, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeLocalJson(filename: string, data: unknown): Promise<void> {
  const [{ promises: fs }, path] = await Promise.all([
    import("fs"),
    import("path"),
  ]);
  const full = path.join(process.cwd(), filename);
  await fs.writeFile(full, JSON.stringify(data, null, 2), "utf-8");
}

export async function readMailConfigSecret(): Promise<MailConfigSecret> {
  const portfolio = await readPortfolioData();
  const fallbackEmail =
    process.env.RECEIVING_EMAIL ||
    portfolio.email ||
    "dhineshkumardhina18@gmail.com";

  let stored: Partial<MailConfigSecret> | null = null;
  const kv = await getPortfolioKV();
  if (kv) {
    try {
      const raw = (await kv.get(KV_MAIL_CONFIG, "text")) as string | null;
      if (raw) stored = JSON.parse(raw) as Partial<MailConfigSecret>;
    } catch {
      stored = null;
    }
  } else {
    stored = await readLocalJson<Partial<MailConfigSecret>>(
      ".mail-config.local.json"
    );
  }

  return {
    receivingEmail: (stored?.receivingEmail || fallbackEmail).trim(),
    gmailAppPassword: (
      stored?.gmailAppPassword ||
      process.env.GMAIL_APP_PASSWORD ||
      ""
    )
      .replace(/\s+/g, "")
      .trim(),
    web3formsKey: (
      stored?.web3formsKey ||
      process.env.WEB3FORMS_KEY ||
      ""
    ).trim(),
  };
}

export async function getMailConfigStatus(): Promise<MailConfigStatus> {
  const cfg = await readMailConfigSecret();
  const hasGmailPassword = cfg.gmailAppPassword.length >= 8;
  const hasWeb3formsKey = cfg.web3formsKey.length >= 8;
  const activeProvider = hasGmailPassword
    ? "gmail"
    : hasWeb3formsKey
      ? "web3forms"
      : "none";

  return {
    receivingEmail: cfg.receivingEmail,
    hasGmailPassword,
    hasWeb3formsKey,
    connected: hasGmailPassword || hasWeb3formsKey,
    activeProvider,
  };
}

export async function saveMailConfigSecret(patch: {
  receivingEmail?: string;
  gmailAppPassword?: string;
  web3formsKey?: string;
  clearGmailPassword?: boolean;
  clearWeb3formsKey?: boolean;
}): Promise<MailConfigStatus> {
  const current = await readMailConfigSecret();
  const next: MailConfigSecret = {
    receivingEmail:
      patch.receivingEmail !== undefined && patch.receivingEmail.trim()
        ? patch.receivingEmail.trim()
        : current.receivingEmail,
    gmailAppPassword: patch.clearGmailPassword
      ? ""
      : patch.gmailAppPassword !== undefined &&
          patch.gmailAppPassword.trim() !== ""
        ? patch.gmailAppPassword.replace(/\s+/g, "").trim()
        : current.gmailAppPassword,
    web3formsKey: patch.clearWeb3formsKey
      ? ""
      : patch.web3formsKey !== undefined && patch.web3formsKey.trim() !== ""
        ? patch.web3formsKey.trim()
        : current.web3formsKey,
  };

  const kv = await getPortfolioKV();
  if (kv) {
    await kv.put(KV_MAIL_CONFIG, JSON.stringify(next));
  } else {
    await writeLocalJson(".mail-config.local.json", next);
  }

  return getMailConfigStatus();
}

export async function readInquiries(): Promise<ContactInquiry[]> {
  const kv = await getPortfolioKV();
  if (kv) {
    try {
      const raw = (await kv.get(KV_INQUIRIES, "text")) as string | null;
      return raw ? (JSON.parse(raw) as ContactInquiry[]) : [];
    } catch {
      return [];
    }
  }
  const local = await readLocalJson<ContactInquiry[]>(
    "src/data/inquiries-store.json"
  );
  return Array.isArray(local) ? local : [];
}

export async function saveInquiry(
  inquiry: ContactInquiry
): Promise<ContactInquiry[]> {
  const existing = await readInquiries();
  const next = [inquiry, ...existing].slice(0, 100);
  const kv = await getPortfolioKV();
  if (kv) {
    await kv.put(KV_INQUIRIES, JSON.stringify(next));
  } else {
    await writeLocalJson("src/data/inquiries-store.json", next);
  }
  return next;
}

export async function deleteInquiry(id: string): Promise<ContactInquiry[]> {
  const existing = await readInquiries();
  const next = existing.filter((item) => item.id !== id);
  const kv = await getPortfolioKV();
  if (kv) {
    await kv.put(KV_INQUIRIES, JSON.stringify(next));
  } else {
    await writeLocalJson("src/data/inquiries-store.json", next);
  }
  return next;
}

function toBase64(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64");
}

function sanitizeHeader(val: string): string {
  return val.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Lightweight zero-dependency SMTPS (port 465 TLS) client for Gmail App Password.
 * Works on Node.js (`node:tls`) AND Cloudflare Workers (`nodejs_compat` TLS / sockets).
 */
async function sendViaGmailSmtp(params: {
  gmailUser: string;
  appPassword: string;
  toEmail: string;
  replyTo: string;
  subject: string;
  bodyText: string;
}): Promise<void> {
  const tls = await import("tls");

  const mimeMessage = [
    `From: "Portfolio Contact" <${sanitizeHeader(params.gmailUser)}>`,
    `To: <${sanitizeHeader(params.toEmail)}>`,
    `Reply-To: ${sanitizeHeader(params.replyTo)}`,
    `Subject: ${sanitizeHeader(params.subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    params.bodyText.replace(/\r?\n/g, "\r\n").replace(/^\./gm, ".."),
    `.`,
  ].join("\r\n");

  await new Promise<void>((resolve, reject) => {
    const socket = tls.connect(
      {
        host: "smtp.gmail.com",
        port: 465,
        servername: "smtp.gmail.com",
        timeout: 12000,
      },
      () => {
        // Connected — server sends 220 banner first
      }
    );

    let buffer = "";
    let step = 0;

    const steps = [
      () => `EHLO portfolio.local\r\n`,
      () => `AUTH LOGIN\r\n`,
      () => `${toBase64(params.gmailUser)}\r\n`,
      () => `${toBase64(params.appPassword)}\r\n`,
      () => `MAIL FROM:<${sanitizeHeader(params.gmailUser)}>\r\n`,
      () => `RCPT TO:<${sanitizeHeader(params.toEmail)}>\r\n`,
      () => `DATA\r\n`,
      () => `${mimeMessage}\r\n`,
      () => `QUIT\r\n`,
    ];

    const finish = (err?: Error) => {
      try {
        socket.end();
        socket.destroy();
      } catch {
        // ignore
      }
      if (err) reject(err);
      else resolve();
    };

    socket.on("timeout", () => finish(new Error("Gmail SMTP connection timed out")));
    socket.on("error", (err) => finish(err));

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf-8");
      const lines = buffer.split("\r\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line || line.length < 3) continue;
        // Multi-line SMTP response has '-' at index 3; wait for final line with ' '
        if (line[3] === "-") continue;

        const code = Number(line.slice(0, 3));
        if (Number.isNaN(code)) continue;

        if (code >= 400) {
          finish(new Error(`Gmail SMTP error (${code}): ${line}`));
          return;
        }

        if (step < steps.length) {
          const cmd = steps[step++]();
          socket.write(cmd);
        } else {
          finish();
          return;
        }
      }
    });
  });
}

async function sendViaWeb3Forms(params: {
  accessKey: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}): Promise<void> {
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: params.accessKey,
      name: params.senderName,
      email: params.senderEmail,
      subject: params.subject,
      message: params.message,
      from_name: "Dhineshkumar Portfolio",
    }),
  });
  const json = (await res.json()) as { success?: boolean; message?: string };
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Web3Forms HTTP ${res.status}`);
  }
}

export async function sendPortfolioEmail(payload: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<{
  deliveredVia: "gmail" | "web3forms" | "inbox-only";
  error?: string;
}> {
  const cfg = await readMailConfigSecret();
  const subject = `[${payload.topic}] New inquiry from ${payload.name}`;
  const formattedBody = [
    `New message from your Portfolio Contact Form`,
    `--------------------------------------------------`,
    `Topic:   ${payload.topic}`,
    `Name:    ${payload.name}`,
    `Email:   ${payload.email}`,
    `--------------------------------------------------`,
    ``,
    payload.message,
  ].join("\n");

  const errors: string[] = [];

  // Option 1: Direct Gmail App Password (SMTPS 465)
  if (cfg.gmailAppPassword.length >= 8 && cfg.receivingEmail) {
    try {
      await sendViaGmailSmtp({
        gmailUser: cfg.receivingEmail,
        appPassword: cfg.gmailAppPassword,
        toEmail: cfg.receivingEmail,
        replyTo: `${payload.name} <${payload.email}>`,
        subject,
        bodyText: formattedBody,
      });
      return { deliveredVia: "gmail" };
    } catch (err) {
      errors.push(
        `Gmail SMTP: ${err instanceof Error ? err.message : "failed"}`
      );
    }
  }

  // Option 2: Web3Forms Key (100% HTTP — ideal fallback on Cloudflare Workers)
  if (cfg.web3formsKey.length >= 8) {
    try {
      await sendViaWeb3Forms({
        accessKey: cfg.web3formsKey,
        senderName: payload.name,
        senderEmail: payload.email,
        subject,
        message: formattedBody,
      });
      return { deliveredVia: "web3forms" };
    } catch (err) {
      errors.push(
        `Web3Forms: ${err instanceof Error ? err.message : "failed"}`
      );
    }
  }

  return {
    deliveredVia: "inbox-only",
    error:
      errors.length > 0
        ? errors.join(" | ")
        : "No email relay configured yet (saved to Admin Inbox).",
  };
}
