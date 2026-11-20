import { defaultPortfolio, type PortfolioData } from "@/data/portfolio";
import bundledStore from "@/data/portfolio-store.json";
import { getPortfolioKV } from "@/lib/cloudflare-kv";

const KV_PORTFOLIO_KEY = "portfolio:data";

function mergePortfolio(partial?: Partial<PortfolioData> | null): PortfolioData {
  const base: PortfolioData = {
    ...defaultPortfolio,
    ...(bundledStore as Partial<PortfolioData>),
    currentlyAt: {
      ...defaultPortfolio.currentlyAt,
      ...((bundledStore as Partial<PortfolioData>).currentlyAt ?? {}),
    },
  };

  if (!partial) return base;

  return {
    ...base,
    ...partial,
    currentlyAt: {
      ...base.currentlyAt,
      ...(partial.currentlyAt ?? {}),
    },
  };
}

export async function readPortfolioData(): Promise<PortfolioData> {
  // 1. Prefer Cloudflare KV when deployed on Cloudflare Workers
  const kv = await getPortfolioKV();
  if (kv) {
    try {
      const raw = (await kv.get(KV_PORTFOLIO_KEY, "text")) as string | null;
      if (raw) {
        return mergePortfolio(JSON.parse(raw) as Partial<PortfolioData>);
      }
      return mergePortfolio(null);
    } catch {
      return mergePortfolio(null);
    }
  }

  // 2. Local Node.js dev fallback: read live from src/data/portfolio-store.json
  try {
    const [{ promises: fs }, path] = await Promise.all([
      import("fs"),
      import("path"),
    ]);
    const storePath = path.join(
      process.cwd(),
      "src",
      "data",
      "portfolio-store.json"
    );
    const raw = await fs.readFile(storePath, "utf-8");
    return mergePortfolio(JSON.parse(raw) as Partial<PortfolioData>);
  } catch {
    return mergePortfolio(null);
  }
}

export async function writePortfolioData(
  data: PortfolioData
): Promise<PortfolioData> {
  const merged = mergePortfolio(data);

  // 1. Cloudflare Workers KV persistence
  const kv = await getPortfolioKV();
  if (kv) {
    await kv.put(KV_PORTFOLIO_KEY, JSON.stringify(merged));
    return merged;
  }

  // 2. Local Node.js dev filesystem persistence
  try {
    const [{ promises: fs }, path] = await Promise.all([
      import("fs"),
      import("path"),
    ]);
    const storePath = path.join(
      process.cwd(),
      "src",
      "data",
      "portfolio-store.json"
    );
    await fs.writeFile(storePath, JSON.stringify(merged, null, 2), "utf-8");
    return merged;
  } catch (err) {
    throw new Error(
      "Storage unavailable: bind a Cloudflare KV namespace named PORTFOLIO_KV in wrangler.jsonc to save edits on Cloudflare."
    );
  }
}

export async function resetPortfolioData(): Promise<PortfolioData> {
  const kv = await getPortfolioKV();
  if (kv) {
    await kv.delete(KV_PORTFOLIO_KEY);
    return defaultPortfolio;
  }

  try {
    const [{ promises: fs }, path] = await Promise.all([
      import("fs"),
      import("path"),
    ]);
    const storePath = path.join(
      process.cwd(),
      "src",
      "data",
      "portfolio-store.json"
    );
    await fs.writeFile(
      storePath,
      JSON.stringify(defaultPortfolio, null, 2),
      "utf-8"
    );
  } catch {
    // Ignore on read-only FS
  }
  return defaultPortfolio;
}
