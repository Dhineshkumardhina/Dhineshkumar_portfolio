import { promises as fs } from "fs";
import path from "path";
import { defaultPortfolio, type PortfolioData } from "@/data/portfolio";

const STORE_PATH = path.join(process.cwd(), "src", "data", "portfolio-store.json");

export async function readPortfolioData(): Promise<PortfolioData> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PortfolioData>;
    return {
      ...defaultPortfolio,
      ...parsed,
      currentlyAt: {
        ...defaultPortfolio.currentlyAt,
        ...(parsed.currentlyAt ?? {}),
      },
    };
  } catch {
    return defaultPortfolio;
  }
}

export async function writePortfolioData(data: PortfolioData): Promise<PortfolioData> {
  const merged: PortfolioData = {
    ...defaultPortfolio,
    ...data,
    currentlyAt: {
      ...defaultPortfolio.currentlyAt,
      ...(data.currentlyAt ?? {}),
    },
  };
  await fs.writeFile(STORE_PATH, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}

export async function resetPortfolioData(): Promise<PortfolioData> {
  try {
    await fs.unlink(STORE_PATH);
  } catch {
    // Already clean / using defaults
  }
  return defaultPortfolio;
}
