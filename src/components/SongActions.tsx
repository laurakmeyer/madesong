"use client";

import { useState, useRef } from "react";
import { Download, Share2, Check, Video, Loader2 } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

type SongActionsProps = {
  mp3Url: string;
  recipientName: string;
  occasion: string;
  lyrics: string;
  photoUrl: string | null;
  shareSlug: string;
  paidTier: string | null;
};

export default function SongActions({ mp3Url, recipientName, occasion, lyrics, photoUrl, shareSlug, paidTier }: SongActionsProps) {
  const [copied, setCopied] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const shareUrl = `https://madesong.com/song/${shareSlug}`;
  const shareText = `🎵 Hör dir diesen personalisierten Song für ${recipientName} an!\n\n🎧 ${shareUrl}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canvasToPng = (canvas: HTMLCanvasElement): Promise<Uint8Array> =>
    new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.readAsArrayBuffer(blob!);
      }, "image/png");
    });

  const renderOverlayPng = async (): Promise<Uint8Array> => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 720, 1280);

    ctx.fillStyle = "rgba(10, 4, 0, 0.55)";
    ctx.fillRect(0, 0, 720, 1280);

    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 30;
    ctx.font = "bold 64px system-ui, sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(recipientName, 360, 200);
    ctx.shadowBlur = 0;

    const occasionLabel = occasion !== "Einfach so" ? occasion : "Ein persönlicher Song";
    ctx.font = "32px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 210, 120, 0.9)";
    ctx.fillText(occasionLabel, 360, 260);

    // Lyrics
    const lines = lyrics.split("\n").filter(l => !l.startsWith("[") && !l.startsWith("**") && l.trim());
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const startY = 400;
    lines.slice(0, 16).forEach((line, i) => {
      ctx.fillText(line, 360, startY + i * 36);
    });

    ctx.font = "28px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("madesong.com", 360, 1230);

    return canvasToPng(canvas);
  };

  const generateVideo = async () => {
    if (typeof window === "undefined") return;
    setVideoLoading(true);
    setVideoStatus("FFmpeg wird geladen...");

    try {
      if (!ffmpegRef.current) {
        const ff = new FFmpeg();
        ff.on("progress", ({ progress }) => {
          const pct = Math.round(Math.min(progress, 1) * 100);
          setVideoStatus(`Video wird erstellt... ${pct}%`);
        });
        await ff.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm",
        });
        ffmpegRef.current = ff;
      }
      const ff = ffmpegRef.current;

      setVideoStatus("Audio wird geladen...");
      const audioData = await fetchFile(mp3Url);
      await ff.writeFile("audio.mp3", audioData);

      const overlayData = await renderOverlayPng();
      await ff.writeFile("overlay.png", overlayData);

      if (photoUrl) {
        setVideoStatus("Foto wird geladen...");
        const photoData = await fetchFile(photoUrl);
        await ff.writeFile("photo.jpg", photoData);

        setVideoStatus("Video wird erstellt...");
        await ff.exec([
          "-loop", "1", "-i", "photo.jpg",
          "-i", "audio.mp3",
          "-i", "overlay.png",
          "-filter_complex", "[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[bg];[bg][2:v]overlay=0:0[out]",
          "-map", "[out]", "-map", "1:a",
          "-c:v", "libx264", "-tune", "stillimage", "-c:a", "aac",
          "-b:a", "192k", "-pix_fmt", "yuv420p",
          "-t", "60", "-shortest",
          "-movflags", "+faststart",
          "output.mp4"
        ]);
      } else {
        setVideoStatus("Video wird erstellt...");
        await ff.exec([
          "-loop", "1", "-i", "overlay.png",
          "-i", "audio.mp3",
          "-c:v", "libx264", "-tune", "stillimage", "-c:a", "aac",
          "-b:a", "192k", "-pix_fmt", "yuv420p",
          "-t", "60", "-shortest",
          "-movflags", "+faststart",
          "output.mp4"
        ]);
      }

      const data = await ff.readFile("output.mp4");
      const blob = new Blob([data as unknown as BlobPart], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setVideoStatus("");
    } catch (err) {
      console.error("Video error:", err);
      setVideoStatus("Video konnte nicht erstellt werden.");
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Share Buttons */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Teilen & Download</p>
        <div className="flex flex-wrap gap-3">
          {/* WhatsApp */}
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>

          {/* Link kopieren */}
          <button onClick={handleCopyLink}
            className="flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
            {copied ? <><Check className="h-4 w-4" /> Kopiert!</> : <><Share2 className="h-4 w-4" /> Link kopieren</>}
          </button>

          {/* MP3 Download */}
          <a href={mp3Url} download={`madesong-${recipientName}.mp3`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
            <Download className="h-4 w-4" /> MP3
          </a>
        </div>
      </div>

      {/* Video Section - nur auf Desktop, da FFmpeg WASM auf Mobile nicht funktioniert */}
      {paidTier === "song_video" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Story-Video</p>
          {videoUrl ? (
            <div className="space-y-3">
              <video src={videoUrl} controls className="w-full rounded-xl" />
              <a href={videoUrl} download={`madesong-${recipientName}.mp4`}
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
                <Download className="h-4 w-4" /> Video herunterladen
              </a>
            </div>
          ) : (
            <>
              <button onClick={generateVideo} disabled={videoLoading}
                className="hidden md:flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {videoLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> {videoStatus}</>
                  : <><Video className="h-4 w-4" /> Story-Video erstellen</>}
              </button>
              <p className="md:hidden text-sm text-[#78716c]">
                <Video className="h-4 w-4 inline mr-1.5" />
                Öffne diesen Link auf einem Computer, um dein Story-Video zu erstellen.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
