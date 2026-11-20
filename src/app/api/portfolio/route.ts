import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  readPortfolioData,
  writePortfolioData,
  resetPortfolioData,
} from "@/lib/portfolio-server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { PortfolioData } from "@/data/portfolio";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readPortfolioData();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as PortfolioData;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid portfolio payload" }, { status: 400 });
    }
    const saved = await writePortfolioData(body);
    revalidatePath("/");
    revalidatePath("/dhina");
    return NextResponse.json({ ok: true, data: saved });
  } catch (err) {
    console.error("Failed to save portfolio data:", err);
    return NextResponse.json(
      { error: "Failed to save portfolio data" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const reset = await resetPortfolioData();
    revalidatePath("/");
    revalidatePath("/dhina");
    return NextResponse.json({ ok: true, data: reset });
  } catch (err) {
    console.error("Failed to reset portfolio data:", err);
    return NextResponse.json(
      { error: "Failed to reset portfolio data" },
      { status: 500 }
    );
  }
}
