import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPortfolioKV } from "@/lib/cloudflare-kv";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

const KV_PORTRAIT_KEY = "portfolio:portrait";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported image format. Use PNG, JPG, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be smaller than 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    // 1. On Cloudflare Workers with PORTFOLIO_KV bound: store image binary in KV
    const kv = await getPortfolioKV();
    if (kv) {
      await kv.put(KV_PORTRAIT_KEY, arrayBuffer, {
        metadata: { contentType: file.type },
      });
      return NextResponse.json({
        ok: true,
        url: `/api/portrait?v=${Date.now()}`,
      });
    }

    // 2. Local Node.js dev fallback: save into public/images/
    const [{ promises: fs }, path] = await Promise.all([
      import("fs"),
      import("path"),
    ]);
    const uploadDir = path.join(process.cwd(), "public", "images");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `portrait-uploaded.${ext}`;
    const fullPath = path.join(uploadDir, filename);
    await fs.writeFile(fullPath, Buffer.from(arrayBuffer));

    const url = `/images/${filename}?v=${Date.now()}`;
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("Portrait upload failed:", err);
    return NextResponse.json(
      {
        error:
          "Upload failed. On Cloudflare, ensure the PORTFOLIO_KV namespace binding is configured.",
      },
      { status: 500 }
    );
  }
}
