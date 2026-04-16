import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const { mp3Url, lyrics, recipientName, age, occasion, language, mood, photoUrl } = await req.json();

  if (!mp3Url || !lyrics) {
    return NextResponse.json({ error: "Fehlende Daten." }, { status: 400 });
  }

  try {
    const shareSlug = nanoid(10);
    await supabaseAdmin.from("songs").insert({
      recipient_name: recipientName || "",
      age: age ? parseInt(age) : null,
      occasion: occasion || "",
      language: language || "Deutsch",
      mood: mood || "",
      lyrics,
      mp3_url: mp3Url,
      share_slug: shareSlug,
      photo_url: photoUrl || null,
    });
    return NextResponse.json({ shareSlug });
  } catch (error) {
    console.error("Save song error:", error);
    return NextResponse.json({ error: "Song konnte nicht gespeichert werden." }, { status: 500 });
  }
}
