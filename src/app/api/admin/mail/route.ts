import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteInquiry,
  getMailConfigStatus,
  readInquiries,
  saveMailConfigSecret,
  sendPortfolioEmail,
} from "@/lib/mail-server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [config, inquiries] = await Promise.all([
    getMailConfigStatus(),
    readInquiries(),
  ]);

  return NextResponse.json(
    { config, inquiries },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      receivingEmail?: string;
      gmailAppPassword?: string;
      web3formsKey?: string;
      clearGmailPassword?: boolean;
      clearWeb3formsKey?: boolean;
      sendTest?: boolean;
    };

    const config = await saveMailConfigSecret(body);

    let testResult: {
      deliveredVia: "gmail" | "web3forms" | "inbox-only";
      error?: string;
    } | null = null;

    if (body.sendTest) {
      testResult = await sendPortfolioEmail({
        name: "Portfolio Admin Test",
        email: config.receivingEmail,
        topic: "Test Delivery",
        message: `Hello! This is a test email from your /dhina Admin CMS confirming Direct Gmail Delivery to ${config.receivingEmail} is active.`,
      });
    }

    return NextResponse.json({ ok: true, config, testResult });
  } catch (err) {
    console.error("Mail config save failed:", err);
    return NextResponse.json(
      { error: "Failed to save email relay settings." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing inquiry id" }, { status: 400 });
  }

  const inquiries = await deleteInquiry(id);
  return NextResponse.json({ ok: true, inquiries });
}
