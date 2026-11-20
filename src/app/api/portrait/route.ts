import { NextResponse } from "next/server";
import { getPortfolioKV } from "@/lib/cloudflare-kv";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const kv = await getPortfolioKV();
  if (!kv) {
    return NextResponse.redirect(new URL("/images/portrait.png", request.url));
  }

  try {
    const { value, metadata } = await kv.getWithMetadata<{
      contentType?: string;
    }>("portfolio:portrait", "arrayBuffer");

    if (!value) {
      return new NextResponse("Portrait not found", { status: 404 });
    }

    const contentType = metadata?.contentType || "image/png";
    return new NextResponse(value as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Failed to load portrait", { status: 500 });
  }
}
