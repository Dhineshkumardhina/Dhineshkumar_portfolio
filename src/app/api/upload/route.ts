import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "images");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `portrait-uploaded.${ext}`;
    const fullPath = path.join(uploadDir, filename);
    await fs.writeFile(fullPath, buffer);

    // Cache-busted URL so browser immediately refreshes the newly uploaded portrait
    const url = `/images/${filename}?v=${Date.now()}`;
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("Portrait upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
