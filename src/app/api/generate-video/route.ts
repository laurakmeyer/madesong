import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import { createCanvas } from "canvas";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { shareSlug } = await req.json();

  if (!shareSlug) {
    return NextResponse.json({ error: "shareSlug fehlt" }, { status: 400 });
  }

  const { data: song } = await supabaseAdmin
    .from("songs")
    .select("*")
    .eq("share_slug", shareSlug)
    .single();

  if (!song) {
    return NextResponse.json({ error: "Song nicht gefunden" }, { status: 404 });
  }

  const tmpDir = join("/tmp", `video-${shareSlug}`);
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  try {
    // 1. Download MP3
    const audioRes = await fetch(song.mp3_url);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    const audioPath = join(tmpDir, "audio.mp3");
    writeFileSync(audioPath, audioBuffer);

    // 2. Create overlay image with lyrics
    const overlayPath = join(tmpDir, "overlay.png");
    await createOverlayImage(overlayPath, song);

    // 3. Download photo or use overlay as background
    let bgPath = overlayPath;
    if (song.photo_url) {
      const photoRes = await fetch(song.photo_url);
      const photoBuffer = Buffer.from(await photoRes.arrayBuffer());
      bgPath = join(tmpDir, "photo.jpg");
      writeFileSync(bgPath, photoBuffer);
    }

    // 4. Get ffmpeg path
    let ffmpegPath = "ffmpeg";
    try {
      const ffmpegStatic = require("ffmpeg-static");
      if (ffmpegStatic) ffmpegPath = ffmpegStatic;
    } catch {
      // fallback to system ffmpeg
    }

    // 5. Run FFmpeg
    const outputPath = join(tmpDir, "output.mp4");

    if (song.photo_url) {
      execSync(
        `${ffmpegPath} -y -loop 1 -i "${bgPath}" -i "${audioPath}" -i "${overlayPath}" ` +
        `-filter_complex "[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[bg];[bg][2:v]overlay=0:0[out]" ` +
        `-map "[out]" -map 1:a -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p ` +
        `-t 60 -shortest -movflags +faststart "${outputPath}"`,
        { timeout: 50000 }
      );
    } else {
      execSync(
        `${ffmpegPath} -y -loop 1 -i "${overlayPath}" -i "${audioPath}" ` +
        `-c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p ` +
        `-t 60 -shortest -movflags +faststart "${outputPath}"`,
        { timeout: 50000 }
      );
    }

    // 6. Upload to Supabase Storage
    const videoData = readFileSync(outputPath);
    const fileName = `videos/${shareSlug}.mp4`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("songs")
      .upload(fileName, videoData, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Video-Upload fehlgeschlagen" }, { status: 500 });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("songs")
      .getPublicUrl(fileName);

    // 7. Save video URL to database
    await supabaseAdmin
      .from("songs")
      .update({ video_url: publicUrl.publicUrl })
      .eq("share_slug", shareSlug);

    // 8. Cleanup
    [audioPath, overlayPath, bgPath, outputPath].forEach((f) => {
      try { unlinkSync(f); } catch {}
    });

    return NextResponse.json({ videoUrl: publicUrl.publicUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error("Video generation error:", msg);
    return NextResponse.json({ error: `Video-Generierung fehlgeschlagen: ${msg}` }, { status: 500 });
  }
}

async function createOverlayImage(path: string, song: { recipient_name: string; occasion: string; lyrics: string; mood: string }) {
  // Use sharp or canvas to create the overlay
  // For now, create a simple PNG with text
  const { createCanvas: cc } = require("canvas");
  const canvas = cc(720, 1280);
  const ctx = canvas.getContext("2d");

  // Dark overlay
  ctx.fillStyle = "rgba(10, 4, 0, 0.55)";
  ctx.fillRect(0, 0, 720, 1280);

  // Name
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 20;
  ctx.font = "bold 64px sans-serif";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(song.recipient_name, 360, 200);
  ctx.shadowBlur = 0;

  // Occasion
  const occasionLabel = song.occasion !== "Einfach so" ? song.occasion : "Ein persönlicher Song";
  ctx.font = "32px sans-serif";
  ctx.fillStyle = "rgba(255, 210, 120, 0.9)";
  ctx.fillText(occasionLabel, 360, 260);

  // Lyrics
  const lines = song.lyrics
    .split("\n")
    .filter((l: string) => !l.startsWith("[") && !l.startsWith("**") && l.trim());
  ctx.font = "22px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const startY = 400;
  lines.slice(0, 20).forEach((line: string, i: number) => {
    ctx.fillText(line.substring(0, 40), 360, startY + i * 34);
  });

  // Branding
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("madesong.com", 360, 1230);

  const buffer = canvas.toBuffer("image/png");
  writeFileSync(path, buffer);
}
