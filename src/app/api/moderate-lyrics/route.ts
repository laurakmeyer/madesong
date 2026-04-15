import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { lyrics } = await req.json();

  if (!lyrics || typeof lyrics !== "string") {
    return NextResponse.json({ ok: false, reason: "Kein Text vorhanden." }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: "Du bist ein Content-Moderator. Antworte ausschließlich mit 'OK' oder 'ABGELEHNT: [kurzer Grund auf Deutsch]'.",
      messages: [{
        role: "user",
        content: `Prüfe diesen Songtext auf unangemessene Inhalte (sexuell, beleidigend, diskriminierend, mobbend, gewaltverherrlichend). Antworte nur mit OK oder ABGELEHNT:\n\n${lyrics.slice(0, 2000)}`,
      }],
    });

    const response = message.content[0].type === "text" ? message.content[0].text.trim() : "OK";
    const ok = response.startsWith("OK");
    const reason = ok ? null : response.replace("ABGELEHNT:", "").trim();

    return NextResponse.json({ ok, reason });
  } catch (error) {
    console.error("Moderation error:", error);
    // Im Fehlerfall durchlassen (fail open) — besser als den User zu blockieren
    return NextResponse.json({ ok: true });
  }
}
