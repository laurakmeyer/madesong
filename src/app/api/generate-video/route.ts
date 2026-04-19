import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { join, resolve } from "path";
import sharp from "sharp";

export const maxDuration = 60;

const fontBoldPath = resolve(process.cwd(), "src/assets/Inter-Bold.ttf");
const fontRegularPath = resolve(process.cwd(), "src/assets/Inter-Regular.ttf");

function escapeDrawtext(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "'\\''").replace(/:/g, "\\:").replace(/;/g, "\\;").replace(/%/g, "%%");
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

  const tmpDir = join("/tmp", `video-${shareSlug}`);
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  try {
    // 1. Download MP3
    const audioRes = await fetch(song.mp3_url);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    const audioPath = join(tmpDir, "audio.mp3");
    writeFileSync(audioPath, audioBuffer);

    // 2. Prepare background image (photo resized to 720x1280)
    const bgPath = join(tmpDir, "bg.png");
    await prepareBackground(bgPath, song.photo_url);

    // 3. Get ffmpeg path
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegPath: string = require("ffmpeg-static");
    try { execSync(`chmod +x "${ffmpegPath}"`, { timeout: 5000 }); } catch {}

    // 4. Copy font files to tmp (ffmpeg needs accessible paths)
    const tmpFontBold = join(tmpDir, "bold.ttf");
    const tmpFontRegular = join(tmpDir, "regular.ttf");
    writeFileSync(tmpFontBold, readFileSync(fontBoldPath));
    writeFileSync(tmpFontRegular, readFileSync(fontRegularPath));

    // 5. Build drawtext filters
    const drawtextFilters = buildDrawtextFilters(song, tmpFontBold, tmpFontRegular);

    const outputPath = join(tmpDir, "output.mp4");

    if (song.bg_video_url) {
      const bgVideoRes = await fetch(song.bg_video_url);
      const bgVideoBuffer = Buffer.from(await bgVideoRes.arrayBuffer());
      const bgVideoPath = join(tmpDir, "bg_video.mp4");
      writeFileSync(bgVideoPath, bgVideoBuffer);

      try {
        execSync(
          `${ffmpegPath} -y -stream_loop -1 -i "${bgVideoPath}" -i "${audioPath}" ` +
          `-filter_complex "[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,` +
          `colorchannelmixer=aa=0.55:ra=0.04:ga=0.02:ba=0.0${drawtextFilters}[v]" ` +
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
      try {
        execSync(
          `${ffmpegPath} -y -loop 1 -i "${bgPath}" -i "${audioPath}" ` +
          `-filter_complex "[0:v]${drawtextFilters.slice(1)}[v]" ` +
          `-map "[v]" -map 1:a ` +
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

    // 8. Cleanup
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

async function prepareBackground(outputPath: string, photoUrl?: string) {
  const W = 720;
  const H = 1280;

  if (photoUrl) {
    const photoRes = await fetch(photoUrl);
    const photoBuffer = Buffer.from(await photoRes.arrayBuffer());
    await sharp(photoBuffer).resize(W, H, { fit: "cover" }).png().toFile(outputPath);
  } else {
    await sharp({
      create: { width: W, height: H, channels: 4, background: { r: 20, g: 10, b: 5, alpha: 1 } },
    }).png().toFile(outputPath);
  }
}

function buildDrawtextFilters(
  song: { recipient_name: string; occasion: string; lyrics: string },
  fontBold: string,
  fontRegular: string,
): string {
  const name = escapeDrawtext(song.recipient_name);
  const occasion = escapeDrawtext(
    song.occasion !== "Einfach so" ? song.occasion : "Ein persönlicher Song"
  );

  const lyricsLines = song.lyrics
    .split("\n")
    .filter((l: string) => !l.startsWith("[") && !l.startsWith("**") && l.trim())
    .slice(0, 18)
    .map((l: string) => escapeDrawtext(l.substring(0, 40)));

  // Dark overlay
  let filters = `,drawbox=c=black@0.55:t=fill`;

  // Name (bold, large)
  filters += `,drawtext=fontfile='${fontBold}':text='${name}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=170`;

  // Occasion
  filters += `,drawtext=fontfile='${fontRegular}':text='${occasion}':fontcolor=#FFD278@0.9:fontsize=24:x=(w-text_w)/2:y=230`;

  // Lyrics lines
  lyricsLines.forEach((line, i) => {
    filters += `,drawtext=fontfile='${fontRegular}':text='${line}':fontcolor=white@0.85:fontsize=20:x=(w-text_w)/2:y=${380 + i * 32}`;
  });

  // Branding
  filters += `,drawtext=fontfile='${fontRegular}':text='madesong.com':fontcolor=white@0.5:fontsize=20:x=(w-text_w)/2:y=1220`;

  return filters;
}
