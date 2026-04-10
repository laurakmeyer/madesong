import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  const lyrics = req.nextUrl.searchParams.get("lyrics");
  const recipientName = req.nextUrl.searchParams.get("recipientName");
  const age = req.nextUrl.searchParams.get("age");
  const occasion = req.nextUrl.searchParams.get("occasion");
  const language = req.nextUrl.searchParams.get("language");
  const mood = req.nextUrl.searchParams.get("mood");

  if (!taskId) {
    return NextResponse.json({ error: "Keine taskId angegeben." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.mureka.ai/v1/song/query/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${process.env.MUREKA_API_KEY}`,
      },
    });

    const data = await res.json();

    if (data.status === "succeeded" && data.choices?.length > 0) {
      const songs = data.choices.map((s: { url: string; id: string }) => ({
        mp3_url: s.url,
        title: `Version ${s.id}`,
      }));

      // Song in Supabase speichern
      const shareSlug = nanoid(10);
      await supabaseAdmin.from("songs").insert({
        recipient_name: recipientName || "",
        age: age ? parseInt(age) : null,
        occasion,
        language,
        mood,
        lyrics: lyrics || "",
        mp3_url: songs[0].mp3_url,
        share_slug: shareSlug,
      });

      return NextResponse.json({
        status: "succeeded",
        songs,
        shareSlug,
      });
    }

    if (data.status === "failed") {
      return NextResponse.json({ status: "failed", error: "Song-Generierung fehlgeschlagen." });
    }

    return NextResponse.json({ status: "preparing" });
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json({ error: "Fehler beim Abrufen des Status." }, { status: 500 });
  }
}
