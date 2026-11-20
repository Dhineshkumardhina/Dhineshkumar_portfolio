export interface KVNamespaceLike {
  get(
    key: string,
    options?: { type?: "text" | "json" | "arrayBuffer" | "stream" } | "text" | "json" | "arrayBuffer" | "stream"
  ): Promise<unknown>;
  getWithMetadata<Metadata = Record<string, unknown>>(
    key: string,
    options?: { type?: "text" | "json" | "arrayBuffer" | "stream" } | "text" | "json" | "arrayBuffer" | "stream"
  ): Promise<{ value: unknown; metadata: Metadata | null }>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView,
    options?: { metadata?: Record<string, unknown> }
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

interface CloudflareEnvWithKV {
  PORTFOLIO_KV?: KVNamespaceLike;
}

/**
 * Safely resolves the Cloudflare KV binding (`PORTFOLIO_KV`) when running on
 * Cloudflare Workers via @opennextjs/cloudflare. Returns null in standard local
 * Node.js dev/build environments so local filesystem persistence works seamlessly.
 */
export async function getPortfolioKV(): Promise<KVNamespaceLike | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = await mod.getCloudflareContext({ async: true });
    const env = ctx?.env as CloudflareEnvWithKV | undefined;
    if (env && env.PORTFOLIO_KV && typeof env.PORTFOLIO_KV.get === "function") {
      return env.PORTFOLIO_KV;
    }
    return null;
  } catch {
    return null;
  }
}
