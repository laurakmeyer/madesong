import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import sharp from "sharp";

export const maxDuration = 60;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

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

    // 2. Create composite image (photo + overlay)
    const compositePath = join(tmpDir, "composite.png");
    await createCompositeImage(compositePath, song);
    console.log("Composite image created, size:", readFileSync(compositePath).length);

    // 3. Get ffmpeg path
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegPath: string = require("ffmpeg-static");
    console.log("FFmpeg path:", ffmpegPath, "exists:", existsSync(ffmpegPath));

    // 4. Make sure ffmpeg binary is executable
    try {
      execSync(`chmod +x "${ffmpegPath}"`, { timeout: 5000 });
    } catch {}

    // 5. Run FFmpeg — single image + audio → video
    const outputPath = join(tmpDir, "output.mp4");
    try {
      execSync(
        `${ffmpegPath} -y -loop 1 -i "${compositePath}" -i "${audioPath}" ` +
        `-c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p ` +
        `-t 60 -shortest -movflags +faststart "${outputPath}"`,
        { timeout: 50000, stdio: "pipe" }
      );
    } catch (ffErr: unknown) {
      const stderr = ffErr instanceof Error && "stderr" in ffErr ? String((ffErr as { stderr: unknown }).stderr) : "";
      console.error("FFmpeg stderr:", stderr);
      throw new Error(`FFmpeg failed: ${stderr.slice(-500)}`);
    }

    // 5. Upload to Supabase Storage
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

    // 6. Save video URL to database
    await supabaseAdmin
      .from("songs")
      .update({ video_url: publicUrl.publicUrl })
      .eq("share_slug", shareSlug);

    // 7. Cleanup
    [audioPath, compositePath, outputPath].forEach((f) => {
      try { unlinkSync(f); } catch {}
    });

    return NextResponse.json({ videoUrl: publicUrl.publicUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error("Video generation error:", msg);
    return NextResponse.json({ error: `Video-Generierung fehlgeschlagen: ${msg}` }, { status: 500 });
  }
}

async function createCompositeImage(
  outputPath: string,
  song: { recipient_name: string; occasion: string; lyrics: string; mood: string; photo_url?: string }
) {
  const W = 720;
  const H = 1280;

  // Build lyrics lines
  const lyricsLines = song.lyrics
    .split("\n")
    .filter((l: string) => !l.startsWith("[") && !l.startsWith("**") && l.trim())
    .slice(0, 20)
    .map((l: string) => l.substring(0, 40));

  const occasionLabel = song.occasion !== "Einfach so" ? song.occasion : "Ein persönlicher Song";

  // Build SVG text overlay
  const lyricsSvg = lyricsLines
    .map((line: string, i: number) => `<text x="360" y="${400 + i * 34}" font-size="22" fill="rgba(255,255,255,0.85)" text-anchor="middle" font-family="sans-serif">${escapeXml(line)}</text>`)
    .join("\n");

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="rgba(10,4,0,0.55)"/>
    <text x="360" y="200" font-size="56" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">${escapeXml(song.recipient_name)}</text>
    <text x="360" y="260" font-size="28" fill="rgba(255,210,120,0.9)" text-anchor="middle" font-family="sans-serif">${escapeXml(occasionLabel)}</text>
    ${lyricsSvg}
    <text x="360" y="1230" font-size="24" fill="rgba(255,255,255,0.5)" text-anchor="middle" font-family="sans-serif">madesong.com</text>
  </svg>`;

  const overlayBuffer = Buffer.from(svg);

  if (song.photo_url) {
    // Download and resize photo, then composite the text overlay
    const photoRes = await fetch(song.photo_url);
    const photoBuffer = Buffer.from(await photoRes.arrayBuffer());

    await sharp(photoBuffer)
      .resize(W, H, { fit: "cover" })
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png()
      .toFile(outputPath);
  } else {
    // No photo — just render the SVG overlay on a dark background
    await sharp({
      create: { width: W, height: H, channels: 4, background: { r: 20, g: 10, b: 5, alpha: 1 } },
    })
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png()
      .toFile(outputPath);
  }
}
