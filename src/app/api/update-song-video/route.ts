import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { shareSlug, bgVideoUrl } = await req.json();

  if (!shareSlug || !bgVideoUrl) {
    return NextResponse.json({ error: "Fehlende Daten." }, { status: 400 });
  }

  // Update the bg_video_url and clear any existing video_url so it can be regenerated
  const { error } = await supabaseAdmin
    .from("songs")
    .update({ bg_video_url: bgVideoUrl, video_url: null })
    .eq("share_slug", shareSlug);

  if (error) {
    console.error("Update song video error:", error);
    return NextResponse.json({ error: "Video konnte nicht gespeichert werden." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
