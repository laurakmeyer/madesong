import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Fehlender Parameter." }, { status: 400 });
  }

  const { data: song } = await supabaseAdmin
    .from("songs")
    .select("video_url, recipient_name")
    .eq("share_slug", slug)
    .single();

  if (!song?.video_url) {
    return NextResponse.json({ error: "Video nicht gefunden." }, { status: 404 });
  }

  // Fetch the video and return it with download headers
  const videoRes = await fetch(song.video_url);
  if (!videoRes.ok) {
    return NextResponse.json({ error: "Video konnte nicht geladen werden." }, { status: 500 });
  }

  const videoBuffer = await videoRes.arrayBuffer();
  const fileName = `madesong-${song.recipient_name || "song"}.mp4`;

  return new NextResponse(videoBuffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": videoBuffer.byteLength.toString(),
    },
  });
}
