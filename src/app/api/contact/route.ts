import { NextResponse } from "next/server";
import {
  saveInquiry,
  sendPortfolioEmail,
  type ContactInquiry,
} from "@/lib/mail-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      topic?: string;
      message?: string;
    };

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const topic = (body.topic ?? "General Inquiry").trim();
    const message = (body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in your name, email, and message." },
        { status: 400 }
      );
    }

    const emailResult = await sendPortfolioEmail({
      name,
      email,
      topic,
      message,
    });

    const inquiry: ContactInquiry = {
      id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      email,
      topic,
      message,
      createdAt: new Date().toISOString(),
      deliveredVia: emailResult.deliveredVia,
      deliveryNote: emailResult.error,
    };

    await saveInquiry(inquiry);

    return NextResponse.json({
      ok: true,
      deliveredVia: emailResult.deliveredVia,
      inquiryId: inquiry.id,
    });
  } catch (err) {
    console.error("Contact submission error:", err);
    return NextResponse.json(
      { error: "Could not process your message. Please try emailing directly." },
      { status: 500 }
    );
  }
}
