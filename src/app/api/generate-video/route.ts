import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { join, resolve } from "path";
import sharp from "sharp";

export const maxDuration = 60;

const fontBoldPath = resolve(process.cwd(), "src/assets/Inter-Bold.ttf");
const fontRegularPath = resolve(process.cwd(), "src/assets/Inter-Regular.ttf");

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function getFontBase64(path: string): string {
  return readFileSync(path).toString("base64");
}

export async function POST(req: NextRequest) {
  const { shareSlug } = await req.json();

  if (!shareSlug) {
    return NextResponse.json({ error: "shareSlug fehlt" }, { status: 400 });
  }

  // Check if video already exists (idempotent / polling support)
  const { data: existingSong } = await supabaseAdmin
    .from("songs")
    .select("video_url")
    .eq("share_slug", shareSlug)
    .single();

  if (existingSong?.video_url) {
    return NextResponse.json({ videoUrl: existingSong.video_url, status: "ready" });
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

    // 2. Create overlay image with embedded fonts
    const overlayPath = join(tmpDir, "overlay.png");
    await createOverlayImage(overlayPath, song);

    // 3. Get ffmpeg path
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegPath: string = require("ffmpeg-static");
    try {
      execSync(`chmod +x "${ffmpegPath}"`, { timeout: 5000 });
    } catch {}

    const outputPath = join(tmpDir, "output.mp4");

    if (song.bg_video_url) {
      // 4a. Download background video + composite with overlay + audio
      const bgVideoRes = await fetch(song.bg_video_url);
      const bgVideoBuffer = Buffer.from(await bgVideoRes.arrayBuffer());
      const bgVideoPath = join(tmpDir, "bg_video.mp4");
      writeFileSync(bgVideoPath, bgVideoBuffer);

      try {
        execSync(
          `${ffmpegPath} -y -stream_loop -1 -i "${bgVideoPath}" -i "${audioPath}" -i "${overlayPath}" ` +
          `-filter_complex "[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[bg];[2:v]scale=720:1280[ov];[bg][ov]overlay=0:0[v]" ` +
          `-map "[v]" -map 1:a -c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p ` +
          `-c:a aac -b:a 128k -shortest -movflags +faststart "${outputPath}"`,
          { timeout: 55000, stdio: "pipe" }
        );
      } catch (ffErr: unknown) {
        const stderr = ffErr instanceof Error && "stderr" in ffErr ? String((ffErr as { stderr: unknown }).stderr) : "";
        console.error("FFmpeg stderr:", stderr);
        throw new Error(`FFmpeg failed: ${stderr.slice(-500)}`);
      }
    } else {
      // 4b. Static image (photo or plain) + audio
      const compositePath = join(tmpDir, "composite.png");
      await createCompositeImage(compositePath, overlayPath, song);

      try {
        execSync(
          `${ffmpegPath} -y -loop 1 -i "${compositePath}" -i "${audioPath}" ` +
          `-c:v libx264 -preset ultrafast -tune stillimage -crf 28 -c:a aac -b:a 128k -pix_fmt yuv420p ` +
          `-t 60 -shortest -movflags +faststart "${outputPath}"`,
          { timeout: 55000, stdio: "pipe" }
        );
      } catch (ffErr: unknown) {
        const stderr = ffErr instanceof Error && "stderr" in ffErr ? String((ffErr as { stderr: unknown }).stderr) : "";
        console.error("FFmpeg stderr:", stderr);
        throw new Error(`FFmpeg failed: ${stderr.slice(-500)}`);
      }
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

    // 8. Cleanup tmp dir
    try {
      const files = require("fs").readdirSync(tmpDir);
      for (const f of files) { try { unlinkSync(join(tmpDir, f)); } catch {} }
    } catch {}

    return NextResponse.json({ videoUrl: publicUrl.publicUrl, status: "ready" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error("Video generation error:", msg);
    return NextResponse.json({ error: `Video-Generierung fehlgeschlagen: ${msg}` }, { status: 500 });
  }
}

function buildOverlaySvg(song: { recipient_name: string; occasion: string; lyrics: string }) {
  const W = 720;
  const H = 1280;
  const boldB64 = getFontBase64(fontBoldPath);
  const regularB64 = getFontBase64(fontRegularPath);

  const lyricsLines = song.lyrics
    .split("\n")
    .filter((l: string) => !l.startsWith("[") && !l.startsWith("**") && l.trim())
    .slice(0, 20)
    .map((l: string) => l.substring(0, 40));

  const occasionLabel = song.occasion !== "Einfach so" ? song.occasion : "Ein persönlicher Song";

  const lyricsSvg = lyricsLines
    .map((line: string, i: number) => `<text x="360" y="${400 + i * 34}" font-size="22" fill="rgba(255,255,255,0.85)" text-anchor="middle" font-family="Inter">${escapeXml(line)}</text>`)
    .join("\n");

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face { font-family: 'Inter'; font-weight: 700; src: url('data:font/truetype;base64,${boldB64}') format('truetype'); }
      @font-face { font-family: 'Inter'; font-weight: 400; src: url('data:font/truetype;base64,${regularB64}') format('truetype'); }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="rgba(10,4,0,0.55)"/>
  <text x="360" y="200" font-size="56" font-weight="700" fill="white" text-anchor="middle" font-family="Inter">${escapeXml(song.recipient_name)}</text>
  <text x="360" y="260" font-size="28" fill="rgba(255,210,120,0.9)" text-anchor="middle" font-family="Inter">${escapeXml(occasionLabel)}</text>
  ${lyricsSvg}
  <text x="360" y="1230" font-size="24" fill="rgba(255,255,255,0.5)" text-anchor="middle" font-family="Inter">madesong.com</text>
</svg>`;
}

async function createOverlayImage(
  outputPath: string,
  song: { recipient_name: string; occasion: string; lyrics: string }
) {
  const svg = buildOverlaySvg(song);
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

async function createCompositeImage(
  outputPath: string,
  overlayPath: string,
  song: { recipient_name: string; occasion: string; lyrics: string; photo_url?: string }
) {
  const W = 720;
  const H = 1280;
  const overlayBuffer = readFileSync(overlayPath);

  if (song.photo_url) {
    const photoRes = await fetch(song.photo_url);
    const photoBuffer = Buffer.from(await photoRes.arrayBuffer());

    await sharp(photoBuffer)
      .resize(W, H, { fit: "cover" })
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png()
      .toFile(outputPath);
  } else {
    await sharp({
      create: { width: W, height: H, channels: 4, background: { r: 20, g: 10, b: 5, alpha: 1 } },
    })
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png()
      .toFile(outputPath);
  }
}
