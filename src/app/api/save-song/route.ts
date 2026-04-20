import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const { mp3Url, lyrics, recipientName, age, occasion, language, mood, photoUrl, bgVideoUrl } = await req.json();

  if (!mp3Url || !lyrics) {
    return NextResponse.json({ error: "Fehlende Daten." }, { status: 400 });
  }

  let userId: string | null = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch {}

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
      bg_video_url: bgVideoUrl || null,
      user_id: userId,
    });
    return NextResponse.json({ shareSlug });
  } catch (error) {
    console.error("Save song error:", error);
    return NextResponse.json({ error: "Song konnte nicht gespeichert werden." }, { status: 500 });
  }
}
