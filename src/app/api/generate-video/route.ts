import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync, copyFileSync } from "fs";
import { join, resolve } from "path";
import sharp from "sharp";

export const maxDuration = 60;

const fontBoldPath = resolve(process.cwd(), "src/assets/Inter-Bold.ttf");
const fontRegularPath = resolve(process.cwd(), "src/assets/Inter-Regular.ttf");

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function setupFonts() {
  const fontDir = "/tmp/fonts";
  if (!existsSync(fontDir)) mkdirSync(fontDir, { recursive: true });

  const boldDest = join(fontDir, "Inter-Bold.ttf");
  const regularDest = join(fontDir, "Inter-Regular.ttf");
  if (!existsSync(boldDest)) copyFileSync(fontBoldPath, boldDest);
  if (!existsSync(regularDest)) copyFileSync(fontRegularPath, regularDest);

  const fontsConf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/tmp/fonts</dir>
  <match target="pattern">
    <test name="family"><string>Inter</string></test>
    <edit name="family" mode="assign" binding="strong"><string>Inter</string></edit>
  </match>
  <match target="pattern">
    <test name="family"><string>sans-serif</string></test>
    <edit name="family" mode="prepend" binding="strong"><string>Inter</string></edit>
  </match>
</fontconfig>`;

  const confPath = join(fontDir, "fonts.conf");
  writeFileSync(confPath, fontsConf);
  process.env.FONTCONFIG_FILE = confPath;
  process.env.FONTCONFIG_PATH = fontDir;
}

export async function POST(req: NextRequest) {
  const { shareSlug } = await req.json();

  if (!shareSlug) {
    return NextResponse.json({ error: "shareSlug fehlt" }, { status: 400 });
  }

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

  // Setup fonts for SVG rendering
  setupFonts();

  const tmpDir = join("/tmp", `video-${shareSlug}`);
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  try {
    // 1. Download MP3
    const audioRes = await fetch(song.mp3_url);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    const audioPath = join(tmpDir, "audio.mp3");
    writeFileSync(audioPath, audioBuffer);

    // 2. Create overlay PNG via SVG (fontconfig provides fonts)
    const overlayPath = join(tmpDir, "overlay.png");
    await createOverlayImage(overlayPath, song);

    // 3. Get ffmpeg path
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegPath: string = require("ffmpeg-static");
    try { execSync(`chmod +x "${ffmpegPath}"`, { timeout: 5000 }); } catch {}

    const outputPath = join(tmpDir, "output.mp4");

    if (song.bg_video_url) {
      // 4a. Background video + overlay + audio
      const bgVideoRes = await fetch(song.bg_video_url);
      const bgVideoBuffer = Buffer.from(await bgVideoRes.arrayBuffer());
      const bgVideoPath = join(tmpDir, "bg_video.mp4");
      writeFileSync(bgVideoPath, bgVideoBuffer);

      try {
        // Step 1: Downscale bg video to small loop clip (fast)
        const smallBgPath = join(tmpDir, "bg_small.mp4");
        execSync(
          `${ffmpegPath} -y -i "${bgVideoPath}" -an ` +
          `-vf "scale=540:960:force_original_aspect_ratio=increase,crop=540:960" ` +
          `-c:v libx264 -preset ultrafast -crf 30 -pix_fmt yuv420p -r 20 "${smallBgPath}"`,
          { timeout: 25000, stdio: "pipe" }
        );

        // Step 2: Loop small bg + overlay + audio → final video
        execSync(
          `${ffmpegPath} -y -stream_loop -1 -i "${smallBgPath}" -i "${audioPath}" -i "${overlayPath}" ` +
          `-filter_complex "[2:v]scale=540:960[ov];[0:v][ov]overlay=0:0[v]" ` +
          `-map "[v]" -map 1:a -c:v libx264 -preset ultrafast -crf 30 -pix_fmt yuv420p ` +
          `-c:a aac -b:a 128k -shortest -movflags +faststart "${outputPath}"`,
          { timeout: 30000, stdio: "pipe" }
        );
      } catch (ffErr: unknown) {
        const stderr = ffErr instanceof Error && "stderr" in ffErr ? String((ffErr as { stderr: unknown }).stderr) : "";
        console.error("FFmpeg stderr:", stderr);
        throw new Error(`FFmpeg failed: ${stderr.slice(-500)}`);
      }
    } else {
      // 4b. Photo (or plain bg) + overlay composited by sharp, then encode with audio
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

async function createOverlayImage(
  outputPath: string,
  song: { recipient_name: string; occasion: string; lyrics: string }
) {
  const W = 720;
  const H = 1280;

  const lyricsLines = song.lyrics
    .split("\n")
    .filter((l: string) => !l.startsWith("[") && !l.startsWith("**") && l.trim())
    .slice(0, 18)
    .map((l: string) => l.substring(0, 40));

  const occasionLabel = song.occasion !== "Einfach so" ? song.occasion : "Ein persönlicher Song";

  const lyricsSvg = lyricsLines
    .map((line: string, i: number) =>
      `<text x="360" y="${380 + i * 32}" font-size="20" fill="rgba(255,255,255,0.85)" text-anchor="middle" font-family="Inter, sans-serif">${escapeXml(line)}</text>`
    )
    .join("\n");

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="rgba(10,4,0,0.55)"/>
  <text x="360" y="180" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Inter, sans-serif">${escapeXml(song.recipient_name)}</text>
  <text x="360" y="230" font-size="24" fill="rgba(255,210,120,0.9)" text-anchor="middle" font-family="Inter, sans-serif">${escapeXml(occasionLabel)}</text>
  ${lyricsSvg}
  <text x="360" y="1220" font-size="20" fill="rgba(255,255,255,0.5)" text-anchor="middle" font-family="Inter, sans-serif">madesong.com</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

async function createCompositeImage(
  outputPath: string,
  overlayPath: string,
  song: { photo_url?: string }
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
