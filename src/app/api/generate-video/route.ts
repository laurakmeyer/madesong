import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync, copyFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import sharp from "sharp";

export const maxDuration = 300;

const fontBoldPath = resolve(process.cwd(), "src/assets/Inter-Bold.ttf");
const fontRegularPath = resolve(process.cwd(), "src/assets/Inter-Regular.ttf");

const SVG_W = 720;
const SVG_H = 1280;
const SCROLL_ZONE_TOP = 280;
const SCROLL_ZONE_BOTTOM = 1180;
const LINE_HEIGHT = 40;
const STRIP_PAD = 24;
const BASELINE_OFFSET = 24;
const MAX_LINE_CHARS = 36;
const FALLBACK_DURATION = 180;

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

function wrapLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];
  const words = line.split(" ");
  const out: string[] = [];
  let current = "";
  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    if (tentative.length > maxChars && current) {
      out.push(current);
      current = word;
    } else {
      current = tentative;
    }
  }
  if (current) out.push(current);
  return out;
}

function getLyricsLines(lyrics: string): string[] {
  const raw = lyrics.split("\n").filter((l) => !l.startsWith("[") && !l.startsWith("**") && l.trim());
  const out: string[] = [];
  for (const line of raw) out.push(...wrapLine(line, MAX_LINE_CHARS));
  return out;
}

function getAudioDuration(ffmpegPath: string, audioPath: string): number {
  let output = "";
  try {
    output = execSync(
      `${ffmpegPath} -i "${audioPath}" -hide_banner 2>&1`,
      { timeout: 15000 }
    ).toString();
  } catch (e: unknown) {
    if (e && typeof e === "object" && "stdout" in e) {
      output = String((e as { stdout: unknown }).stdout);
    }
  }
  const match = output.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!match) return FALLBACK_DURATION;
  return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
}

async function createBackOverlay(outputPath: string) {
  const svg = `<svg width="${SVG_W}" height="${SVG_H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${SCROLL_ZONE_TOP}" width="${SVG_W}" height="${SCROLL_ZONE_BOTTOM - SCROLL_ZONE_TOP}" fill="rgba(10,4,0,0.55)"/>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

async function createFrontOverlay(outputPath: string, song: { recipient_name: string; occasion: string }) {
  const occasionLabel = song.occasion !== "Einfach so" ? song.occasion : "Ein persönlicher Song";
  const svg = `<svg width="${SVG_W}" height="${SVG_H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${SVG_W}" height="${SCROLL_ZONE_TOP}" fill="rgba(10,4,0,0.55)"/>
  <rect x="0" y="${SCROLL_ZONE_BOTTOM}" width="${SVG_W}" height="${SVG_H - SCROLL_ZONE_BOTTOM}" fill="rgba(10,4,0,0.55)"/>
  <text x="360" y="180" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Inter, sans-serif">${escapeXml(song.recipient_name)}</text>
  <text x="360" y="230" font-size="24" fill="rgba(255,210,120,0.9)" text-anchor="middle" font-family="Inter, sans-serif">${escapeXml(occasionLabel)}</text>
  <text x="360" y="1220" font-size="20" fill="rgba(255,255,255,0.5)" text-anchor="middle" font-family="Inter, sans-serif">madesong.com</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

async function createLyricsStrip(outputPath: string, lines: string[], stripHeight: number) {
  const content = lines
    .map((line, i) =>
      `<text x="360" y="${STRIP_PAD + BASELINE_OFFSET + i * LINE_HEIGHT}" font-size="22" fill="rgba(255,255,255,0.92)" text-anchor="middle" font-family="Inter, sans-serif">${escapeXml(line)}</text>`
    )
    .join("\n");
  const svg = `<svg width="${SVG_W}" height="${stripHeight}" xmlns="http://www.w3.org/2000/svg">
  ${content}
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

async function createBaseLayer(outputPath: string, backOverlayPath: string, song: { photo_url?: string }) {
  const overlayBuffer = readFileSync(backOverlayPath);
  if (song.photo_url) {
    const photoRes = await fetch(song.photo_url);
    const photoBuffer = Buffer.from(await photoRes.arrayBuffer());
    await sharp(photoBuffer)
      .resize(SVG_W, SVG_H, { fit: "cover" })
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png()
      .toFile(outputPath);
  } else {
    await sharp({
      create: { width: SVG_W, height: SVG_H, channels: 4, background: { r: 20, g: 10, b: 5, alpha: 1 } },
    })
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png()
      .toFile(outputPath);
  }
}

function buildScrollYExpr(
  lineCount: number,
  stripHeight: number,
  duration: number,
  scale: number
): string {
  const zoneHeight = SCROLL_ZONE_BOTTOM - SCROLL_ZONE_TOP;
  if (stripHeight <= zoneHeight || lineCount <= 1) {
    const y = SCROLL_ZONE_TOP + (zoneHeight - stripHeight) / 2;
    return `${(y * scale).toFixed(2)}`;
  }
  const firstBaseline = STRIP_PAD + BASELINE_OFFSET;
  const targetScreenY = SCROLL_ZONE_TOP + 48;
  const yStart = targetScreenY - firstBaseline;
  const distance = (lineCount - 1) * LINE_HEIGHT;
  const speed = distance / duration;
  return `${(yStart * scale).toFixed(2)}-t*${(speed * scale).toFixed(4)}`;
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

  setupFonts();

  const tmpDir = join("/tmp", `video-${shareSlug}`);
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  try {
    // 1. Download MP3
    const audioRes = await fetch(song.mp3_url);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    const audioPath = join(tmpDir, "audio.mp3");
    writeFileSync(audioPath, audioBuffer);

    // 2. ffmpeg binary
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegPath: string = require("ffmpeg-static");
    try { execSync(`chmod +x "${ffmpegPath}"`, { timeout: 5000 }); } catch {}

    // 3. Audio duration drives scroll speed
    const duration = getAudioDuration(ffmpegPath, audioPath);

    // 4. Lyrics → wrapped lines → strip dimensions
    const lyricsLines = getLyricsLines(song.lyrics);
    const stripHeight = Math.max(STRIP_PAD * 2 + LINE_HEIGHT, STRIP_PAD * 2 + lyricsLines.length * LINE_HEIGHT);

    // 5. Render overlays
    const backOverlayPath = join(tmpDir, "back.png");
    const frontOverlayPath = join(tmpDir, "front.png");
    const lyricsStripPath = join(tmpDir, "lyrics.png");
    await createBackOverlay(backOverlayPath);
    await createFrontOverlay(frontOverlayPath, song);
    await createLyricsStrip(lyricsStripPath, lyricsLines, stripHeight);

    const outputPath = join(tmpDir, "output.mp4");
    const isBgVideo = !!song.bg_video_url;
    const outW = isBgVideo ? 540 : 720;
    const outH = isBgVideo ? 960 : 1280;
    const scale = outW / SVG_W;

    const scrollYExpr = buildScrollYExpr(lyricsLines.length, stripHeight, duration, scale);

    if (isBgVideo) {
      const bgVideoRes = await fetch(song.bg_video_url);
      const bgVideoBuffer = Buffer.from(await bgVideoRes.arrayBuffer());
      const bgVideoPath = join(tmpDir, "bg_video.mp4");
      writeFileSync(bgVideoPath, bgVideoBuffer);

      try {
        const smallBgPath = join(tmpDir, "bg_small.mp4");
        execSync(
          `${ffmpegPath} -y -i "${bgVideoPath}" -an ` +
          `-vf "scale=${outW}:${outH}:force_original_aspect_ratio=increase,crop=${outW}:${outH}" ` +
          `-c:v libx264 -preset ultrafast -crf 30 -pix_fmt yuv420p -r 20 "${smallBgPath}"`,
          { timeout: 60000, stdio: "pipe" }
        );

        execSync(
          `${ffmpegPath} -y -stream_loop -1 -i "${smallBgPath}" -i "${audioPath}" ` +
          `-i "${backOverlayPath}" -i "${lyricsStripPath}" -i "${frontOverlayPath}" ` +
          `-filter_complex "` +
            `[2:v]scale=${outW}:${outH}[back];` +
            `[3:v]scale=${outW}:-1[lyrics];` +
            `[4:v]scale=${outW}:${outH}[front];` +
            `[0:v][back]overlay=0:0[a];` +
            `[a][lyrics]overlay=0:${scrollYExpr}[b];` +
            `[b][front]overlay=0:0[v]" ` +
          `-map "[v]" -map 1:a -c:v libx264 -preset ultrafast -crf 30 -pix_fmt yuv420p ` +
          `-c:a aac -b:a 128k -shortest -movflags +faststart "${outputPath}"`,
          { timeout: 220000, stdio: "pipe" }
        );
      } catch (ffErr: unknown) {
        const stderr = ffErr instanceof Error && "stderr" in ffErr ? String((ffErr as { stderr: unknown }).stderr) : "";
        console.error("FFmpeg stderr:", stderr);
        throw new Error(`FFmpeg failed: ${stderr.slice(-500)}`);
      }
    } else {
      const basePath = join(tmpDir, "base.png");
      await createBaseLayer(basePath, backOverlayPath, song);

      try {
        execSync(
          `${ffmpegPath} -y -loop 1 -r 24 -i "${basePath}" -i "${audioPath}" ` +
          `-i "${lyricsStripPath}" -i "${frontOverlayPath}" ` +
          `-filter_complex "` +
            `[2:v]scale=${outW}:-1[lyrics];` +
            `[3:v]scale=${outW}:${outH}[front];` +
            `[0:v][lyrics]overlay=0:${scrollYExpr}[b];` +
            `[b][front]overlay=0:0[v]" ` +
          `-map "[v]" -map 1:a -c:v libx264 -preset ultrafast -crf 28 ` +
          `-c:a aac -b:a 128k -pix_fmt yuv420p -shortest -movflags +faststart "${outputPath}"`,
          { timeout: 280000, stdio: "pipe" }
        );
      } catch (ffErr: unknown) {
        const stderr = ffErr instanceof Error && "stderr" in ffErr ? String((ffErr as { stderr: unknown }).stderr) : "";
        console.error("FFmpeg stderr:", stderr);
        throw new Error(`FFmpeg failed: ${stderr.slice(-500)}`);
      }
    }

    // 6. Upload to Supabase
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

    await supabaseAdmin
      .from("songs")
      .update({ video_url: publicUrl.publicUrl })
      .eq("share_slug", shareSlug);

    try {
      const files = readdirSync(tmpDir);
      for (const f of files) { try { unlinkSync(join(tmpDir, f)); } catch {} }
    } catch {}

    return NextResponse.json({ videoUrl: publicUrl.publicUrl, status: "ready" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error("Video generation error:", msg);
    return NextResponse.json({ error: `Video-Generierung fehlgeschlagen: ${msg}` }, { status: 500 });
  }
}
