import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "dhina_admin_session";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Dhina18";
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "dhina-portfolio-hmac-secret-2026";
const SESSION_PAYLOAD = "dhina-admin-authenticated-v1";

export function createSessionToken(): string {
  const sig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(SESSION_PAYLOAD)
    .digest("hex");
  return `${SESSION_PAYLOAD}.${sig}`;
}

export function verifyPassword(input: string): boolean {
  const a = Buffer.from(input, "utf-8");
  const b = Buffer.from(ADMIN_PASSWORD, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  const a = Buffer.from(token, "utf-8");
  const b = Buffer.from(expected, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
