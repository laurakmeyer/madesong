"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Music2, RefreshCw, Play, Pause, Download, Share2, Check, Pencil, Wand2, ImagePlus, X, Video } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const OCCASIONS = ["Geburtstag", "Schlaflied", "Liebeslied", "Jahrestag", "Valentinstag", "Muttertag", "Vatertag", "Weihnachten", "Einfach so"];
const LANGUAGES = ["Deutsch", "English"];
const MOODS = ["Fröhlich & mitreißend", "Warm & zärtlich", "Lustig & verspielt", "Ruhig & sanft"];

type Song = { mp3_url: string; cover: string; title: string };

export default function SongForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [editingLyrics, setEditingLyrics] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [bgVideoFile, setBgVideoFile] = useState<File | null>(null);
  const [bgVideoPreview, setBgVideoPreview] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState<number | null>(null);
  const [videoStatus, setVideoStatus] = useState<string>("");
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paidTier, setPaidTier] = useState<"song" | "song_video">("song");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const initialOccasion = searchParams.get("anlass") ?? "Geburtstag";
  const [form, setForm] = useState({
    recipientName: "",
    age: "",
    occasion: OCCASIONS.includes(initialOccasion) ? initialOccasion : "Geburtstag",
    language: "Deutsch",
    mood: "Fröhlich & mitreißend",
    favoriteThing: "",
    favoriteAnimal: "",
    details: "",
  });

  const isChild = form.age !== "" && parseInt(form.age) <= 12;

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1920;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        }, "image/jpeg", 0.82);
      };
      img.src = URL.createObjectURL(file);
    });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const compressed = file.size > 1.5 * 1024 * 1024 ? await compressImage(file) : file;
    setPhotoFile(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setError("Video ist zu groß (max. 50 MB). Bitte ein kürzeres Video wählen.");
      e.target.value = "";
      return;
    }
    setBgVideoFile(file);
    setBgVideoPreview(URL.createObjectURL(file));
  };

  // Lyrics verfeinern
  const handleRefine = async () => {
    if (!refineInput.trim() || !lyrics) return;
    setRefining(true);
    try {
      const res = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, refinement: refineInput, existingLyrics: lyrics }),
      });
      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
        setRefineInput("");
        setSongs([]);
        setShareSlug(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefining(false);
    }
  };

  // Nach Lyrics-Bearbeitung: Audio neu generieren falls Songs bereits vorhanden
  const handleLyricsEditDone = async () => {
    setEditingLyrics(false);
    if (!lyrics || songs.length === 0) return;

    // Moderations-Check für manuell bearbeiteten Text
    const modRes = await fetch("/api/moderate-lyrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics }),
    });
    const modData = await modRes.json();
    if (!modData.ok) {
      setError(`Dieser Text kann leider nicht verwendet werden: ${modData.reason || "Unangemessener Inhalt"}`);
      return;
    }

    setAudioLoading(true);
    setSongs([]);
    setShareSlug(null);
    setError(null);
    try {
      const audioRes = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics, mood: form.mood, age: form.age, occasion: form.occasion }),
      });
      const audioData = await audioRes.json();
      if (audioData.error) throw new Error(audioData.error);
      const generatedSongs = await pollAudio(audioData.taskId, lyrics, currentPhotoUrl);
      setSongs(generatedSongs);
    } catch (err) {
      console.error(err);
      setError("Audio-Generierung fehlgeschlagen. Bitte versuche es nochmal.");
    } finally {
      setAudioLoading(false);
    }
  };

  // Hilfsfunktion: Canvas-Frame als PNG-Bytes exportieren
  const canvasToPng = (canvas: HTMLCanvasElement): Promise<Uint8Array> =>
    new Promise((resolve) => {
      canvas.toBlob((blob) => {
        blob!.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, "image/png");
    });

  // Hintergrund + Text auf Canvas zeichnen (ohne Wellenform)
  const drawBackground = async (
    ctx: CanvasRenderingContext2D,
    photoSrc: string | null
  ) => {
    if (photoSrc) {
      const img = await new Promise<HTMLImageElement>((resolve) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.src = photoSrc;
      });
      const scale = Math.max(1080 / img.width, 1920 / img.height) * 1.05;
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (1080 - w) / 2, (1920 - h) / 2, w, h);
      ctx.fillStyle = "rgba(10, 4, 0, 0.65)";
      ctx.fillRect(0, 0, 1080, 1920);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, "#1e180e");
      grad.addColorStop(0.5, "#8a5e2a");
      grad.addColorStop(1, "#3a2c18");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // Dekorative Ringe
    for (let r = 0; r < 5; r++) {
      ctx.beginPath();
      ctx.arc(540, 430, 100 + r * 65, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.12 - r * 0.02})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Musik-Note
    ctx.font = "140px serif";
    ctx.textAlign = "center";
    ctx.fillText("🎵", 540, 480);

    // Name
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 28;
    ctx.font = "bold 110px system-ui, sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(form.recipientName, 540, 670);
    ctx.shadowBlur = 0;

    // Anlass
    const occasionLabel = form.occasion !== "Einfach so" ? form.occasion : "Ein persönlicher Song";
    ctx.font = "54px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 210, 120, 0.9)";
    ctx.fillText(occasionLabel, 540, 755);

    // Trennlinie
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(180, 810);
    ctx.lineTo(900, 810);
    ctx.stroke();

    // Branding
    ctx.font = "38px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("madesong.com", 540, 1870);
  };

  // Wellenform-Balken zeichnen (t = 0..1, Animationsposition im Loop)
  const drawWaveform = (ctx: CanvasRenderingContext2D, t: number) => {
    const barCount = 24;
    const barWidth = 18;
    const gap = 8;
    const maxH = 140;
    const totalW = barCount * (barWidth + gap) - gap;
    const startX = 540 - totalW / 2;
    const baseY = 1820;

    for (let i = 0; i < barCount; i++) {
      const phase = (i / barCount) * Math.PI * 4;
      const speed = 1 + (i % 5) * 0.2;
      const h = maxH * (0.25 + 0.75 * Math.abs(Math.sin(t * Math.PI * 2 * speed + phase)));
      const x = startX + i * (barWidth + gap);
      const alpha = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 2 * speed + phase));
      ctx.fillStyle = `rgba(255, 200, 80, ${alpha})`;
      ctx.fillRect(x, baseY - h, barWidth, h);
    }
  };

  // Scrollende Lyrics zeichnen (t = 0..1, Position im Song)
  const drawScrollingLyrics = (ctx: CanvasRenderingContext2D, t: number) => {
    const allLines = (lyrics || "").split("\n").filter((l) => l.trim());
    if (allLines.length === 0) return;

    const visibleLines = 12;
    const totalScroll = Math.max(0, allLines.length - visibleLines);
    const scrollOffset = Math.floor(t * totalScroll);

    let y = 870;
    for (let i = 0; i < visibleLines; i++) {
      const lineIdx = scrollOffset + i;
      if (lineIdx >= allLines.length || y > 1790) break;
      const line = allLines[lineIdx];
      const isActive = i === Math.floor(visibleLines / 3); // aktive Zeile hervorheben

      if (line.startsWith("**") && line.endsWith("**")) {
        ctx.font = `bold 48px system-ui, sans-serif`;
        ctx.fillStyle = isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.75)";
        ctx.fillText(line.replace(/\*\*/g, ""), 540, y);
        y += 72;
      } else if (line.startsWith("[") && line.endsWith("]")) {
        ctx.font = "bold 34px system-ui, sans-serif";
        ctx.fillStyle = "rgba(255, 200, 80, 0.85)";
        ctx.fillText(line, 540, y);
        y += 52;
      } else {
        ctx.font = isActive ? "bold 44px system-ui, sans-serif" : "42px system-ui, sans-serif";
        ctx.fillStyle = isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)";
        const words = line.split(" ");
        let current = "";
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          ctx.font = isActive ? "bold 44px system-ui, sans-serif" : "42px system-ui, sans-serif";
          if (ctx.measureText(test).width > 920 && current) {
            ctx.fillText(current, 540, y);
            y += 58;
            current = word;
          } else { current = test; }
        }
        if (current) { ctx.fillText(current, 540, y); y += 58; }
      }
    }
  };

  // Frames für Foto-Modus: 1fps, scrollende Lyrics + animierte Wellenform
  const renderAnimatedFrames = async (photoSrc: string | null): Promise<Uint8Array[]> => {
    const totalFrames = 75; // 75 Sekunden Puffer, -shortest schneidet bei Audio-Ende ab
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    // Statischen Hintergrund einmalig rendern und cachen
    await drawBackground(ctx, photoSrc);
    const bgData = ctx.getImageData(0, 0, 1080, 1920);

    const frames: Uint8Array[] = [];
    for (let f = 0; f < totalFrames; f++) {
      ctx.putImageData(bgData, 0, 0);
      drawScrollingLyrics(ctx, f / totalFrames);
      drawWaveform(ctx, (f % 30) / 30); // Wellenform-Animation cycled durch 30 Positionen
      frames.push(await canvasToPng(canvas));
    }
    return frames;
  };

  // Text-Overlay PNG für Video-Hintergrund (transparenter Hintergrund)
  const renderOverlayPng = async (): Promise<Uint8Array> => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 1080, 1920);

    // Dunkles Overlay
    ctx.fillStyle = "rgba(10, 4, 0, 0.55)";
    ctx.fillRect(0, 0, 1080, 1920);

    // Name
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 30;
    ctx.font = "bold 110px system-ui, sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(form.recipientName, 540, 300);
    ctx.shadowBlur = 0;

    // Anlass
    const occasionLabel = form.occasion !== "Einfach so" ? form.occasion : "Ein persönlicher Song";
    ctx.font = "54px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 210, 120, 0.9)";
    ctx.fillText(occasionLabel, 540, 380);

    // Branding
    ctx.font = "40px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("madesong.com", 540, 1870);

    return canvasToPng(canvas);
  };

  // Video mit FFmpeg WASM generieren
  const generateVideo = async (song: Song, index: number) => {
    if (typeof window === "undefined") return;
    setVideoLoading(index);
    setVideoStatus("FFmpeg wird geladen...");

    try {
      if (!ffmpegRef.current) {
        const ff = new FFmpeg();
        await ff.load({ coreURL: "/ffmpeg/ffmpeg-core.js", wasmURL: "/ffmpeg/ffmpeg-core.wasm" });
        ffmpegRef.current = ff;
      }
      const ff = ffmpegRef.current;

      setVideoStatus("Audio wird geladen...");
      const audioData = await fetchFile(`/api/proxy-audio?url=${encodeURIComponent(song.mp3_url)}`);
      await ff.writeFile("audio.mp3", audioData);

      ff.on("progress", ({ progress }) => {
        const pct = Math.round(Math.min(progress, 1) * 100);
        setVideoStatus(`Video wird erstellt... ${pct}%`);
      });

      if (bgVideoFile && bgVideoPreview) {
        // ── Pfad B: Eigenes Video als Hintergrund ──
        setVideoStatus("Video wird vorbereitet...");
        const videoData = await fetchFile(bgVideoPreview);
        await ff.writeFile("bg_video.mp4", videoData);

        const overlayData = await renderOverlayPng();
        await ff.writeFile("overlay.png", overlayData);

        setVideoStatus("Video wird erstellt...");
        await ff.exec([
          "-stream_loop", "-1", "-i", "bg_video.mp4",
          "-i", "audio.mp3",
          "-i", "overlay.png",
          "-filter_complex",
          "[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[bg];[2:v]scale=720:1280[ov];[bg][ov]overlay=0:0[v]",
          "-map", "[v]", "-map", "1:a",
          "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28", "-pix_fmt", "yuv420p",
          "-c:a", "aac", "-b:a", "128k",
          "-shortest", "-movflags", "+faststart",
          "output.mp4",
        ]);

        await ff.deleteFile("bg_video.mp4");
        await ff.deleteFile("overlay.png");
      } else {
        // ── Pfad A: Foto mit animierter Wellenform ──
        setVideoStatus("Frames werden gerendert...");
        const frames = await renderAnimatedFrames(photoPreview);

        for (let f = 0; f < frames.length; f++) {
          await ff.writeFile(`frame${f.toString().padStart(4, "0")}.png`, frames[f]);
        }

        setVideoStatus("Video wird erstellt...");
        await ff.exec([
          "-framerate", "1",
          "-i", "frame%04d.png",
          "-i", "audio.mp3",
          "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
          "-vf", "scale=720:1280",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac", "-b:a", "128k",
          "-shortest", "-movflags", "+faststart",
          "output.mp4",
        ]);

        for (let f = 0; f < frames.length; f++) {
          await ff.deleteFile(`frame${f.toString().padStart(4, "0")}.png`);
        }
      }

      setVideoStatus("Fertig! Download startet...");
      const data = await ff.readFile("output.mp4");
      const raw = data as Uint8Array;
      const blob = new Blob([new Uint8Array(raw).buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `madesong-${form.recipientName}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await ff.deleteFile("audio.mp3");
      await ff.deleteFile("output.mp4");
    } catch (err) {
      console.error("Video error:", err);
      setError("Video konnte nicht erstellt werden. Bitte versuche es nochmal.");
    } finally {
      setVideoLoading(null);
      setVideoStatus("");
    }
  };

  // Audio abspielen / pausieren (30-Sek-Preview wenn nicht bezahlt)
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const togglePlay = (index: number, mp3_url: string) => {
    if (playingIndex === index) {
      audioRef.current?.pause();
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      setPlayingIndex(null);
    } else {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (!audioRef.current || currentUrlRef.current !== mp3_url) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(mp3_url);
        currentUrlRef.current = mp3_url;
      }
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingIndex(null);
      if (!paid) {
        const remaining = Math.max(0, 30 - audioRef.current.currentTime) * 1000;
        previewTimerRef.current = setTimeout(() => {
          audioRef.current?.pause();
          setPlayingIndex(null);
        }, remaining);
      }
      setPlayingIndex(index);
    }
  };

  // Cleanup beim Verlassen
  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  // Nach Stripe-Zahlung: URL-Parameter prüfen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const slug = params.get("slug");
    if (!sessionId) return;
    setCheckingPayment(true);
    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paid && slug) {
          window.location.href = `/song/${slug}`;
          return;
        }
        setCheckingPayment(false);
      })
      .catch(() => setCheckingPayment(false));
  }, []);

  const handleCheckout = async (tier: "song" | "song_video") => {
    if (!shareSlug) return;
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, shareSlug, recipientName: form.recipientName }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  // Song teilen
  const handleShare = async (song: Song, index: number) => {
    const shareText = `🎵 Ich habe einen personalisierten Song für ${form.recipientName} erstellt!\n\n`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Song für ${form.recipientName}`, text: shareText, url: song.mp3_url });
      } catch {
        // Abgebrochen vom User
      }
    } else {
      // Fallback: Link in Zwischenablage kopieren
      await navigator.clipboard.writeText(song.mp3_url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  // Mureka polling
  const pollAudio = async (taskId: string, lyricsText: string, photoUrl?: string | null) => {
    const maxAttempts = 40;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await fetch("/api/poll-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json().catch(() => ({ status: "preparing" }));
      if (data.status === "succeeded" && data.songs?.length > 0) {
        // Song-Metadaten einmalig in Supabase speichern
        const saveRes = await fetch("/api/save-song", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mp3Url: data.songs[0].mp3_url,
            lyrics: lyricsText,
            recipientName: form.recipientName,
            age: form.age,
            occasion: form.occasion,
            language: form.language,
            mood: form.mood,
            photoUrl: photoUrl || null,
          }),
        });
        const saveData = await saveRes.json().catch(() => ({}));
        if (saveData.shareSlug) setShareSlug(saveData.shareSlug);
        return data.songs as Song[];
      }
      if (data.status === "failed") throw new Error("Song-Generierung fehlgeschlagen.");
    }
    throw new Error("Timeout — bitte versuche es nochmal.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLyrics(null);
    setSongs([]);
    setError(null);
    setPlayingIndex(null);
    setPaid(false);
    setShareSlug(null);

    try {
      // 1. Songtext generieren
      const lyricsRes = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const lyricsData = await lyricsRes.json();
      if (lyricsData.error) throw new Error(lyricsData.error);
      setLyrics(lyricsData.lyrics);
      setLoading(false);

      // 2. Foto hochladen (falls vorhanden)
      let photoUrl = null;
      if (photoFile) {
        try {
          const formData = new FormData();
          formData.append("file", photoFile);
          const photoRes = await fetch("/api/upload-photo", { method: "POST", body: formData });
          if (photoRes.ok) {
            const photoText = await photoRes.text();
            const photoData = JSON.parse(photoText);
            if (photoData.url) { photoUrl = photoData.url; setCurrentPhotoUrl(photoData.url); }
          } else {
            console.warn("Foto-Upload fehlgeschlagen, weiter ohne Foto");
          }
        } catch (uploadErr) {
          console.warn("Foto-Upload Fehler:", uploadErr);
          // Weiter ohne Foto — Song-Generierung soll nicht blockiert werden
        }
      }

      // 3. Audio generieren
      setAudioLoading(true);
      const audioRes = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lyrics: lyricsData.lyrics,
          mood: form.mood,
          age: form.age,
          occasion: form.occasion,
        }),
      });
      const audioText = await audioRes.text();
      let audioData: { taskId?: string; error?: string };
      try {
        audioData = JSON.parse(audioText);
      } catch {
        throw new Error(`HTTP ${audioRes.status} von /api/generate-audio: ${audioText.slice(0, 120)}`);
      }
      if (audioData.error) throw new Error(audioData.error);

      // 4. Auf Fertigstellung warten (mit Foto URL)
      const generatedSongs = await pollAudio(audioData.taskId!, lyricsData.lyrics, photoUrl);
      setSongs(generatedSongs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ups, da ist etwas schiefgelaufen. Bitte versuche es nochmal.";
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
      setAudioLoading(false);
    }
  };

  const formatLyrics = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <h3 key={i} className="text-lg font-bold text-[#fbbf24] mt-2 mb-3">{line.replace(/\*\*/g, "")}</h3>;
      }
      if (line.startsWith("[") && line.endsWith("]")) {
        return <p key={i} style={{color:"#78716c"}} className="text-xs font-semibold uppercase tracking-widest mt-4 mb-1">{line}</p>;
      }
      if (line === "") return <br key={i} />;
      return <p key={i} style={{color:"#1c1917"}} className="font-medium leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-2xl border border-[#d97706]/20 bg-[#fdf8f0]">
        <CardHeader className="text-center pb-2">
          <CardDescription className="text-[#78716c]">Füll die Details aus und wir zaubern etwas Besonderes ✨</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name + Alter */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="recipientName" className="text-[#78716c]">Für wen ist dieser Song?</Label>
                <Input id="recipientName" placeholder="z.B. Emma, Oma, Max..."
                  className="bg-white border-[#d97706]/20 text-[#18120e] placeholder:text-[#a8a29e] focus:border-[#d97706]"
                  value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-[#78716c]">Alter</Label>
                <Input id="age" type="number" min="1" max="99" placeholder="z.B. 5"
                  className="bg-white border-[#d97706]/20 text-[#18120e] placeholder:text-[#a8a29e] focus:border-[#d97706]"
                  value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </div>
            </div>

            {/* Kindspezifische Felder */}
            {isChild && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#d97706]/10 rounded-xl border border-[#d97706]/20">
                <div className="col-span-2 text-sm font-medium text-[#fbbf24] mb-1">
                  🧒 Erzähl uns mehr über {form.recipientName || "das Kind"}!
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="favoriteAnimal" className="text-[#78716c]">Lieblingstier</Label>
                  <Input id="favoriteAnimal" placeholder="z.B. Einhorn, Hund, Dino..."
                    className="bg-white border-[#d97706]/20 text-[#18120e] placeholder:text-[#a8a29e] focus:border-[#d97706]"
                    value={form.favoriteAnimal} onChange={(e) => setForm({ ...form, favoriteAnimal: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="favoriteThing" className="text-[#78716c]">Lieblingsding</Label>
                  <Input id="favoriteThing" placeholder="z.B. Fußball, Malen, Lego..."
                    className="bg-white border-[#d97706]/20 text-[#18120e] placeholder:text-[#a8a29e] focus:border-[#d97706]"
                    value={form.favoriteThing} onChange={(e) => setForm({ ...form, favoriteThing: e.target.value })} />
                </div>
              </div>
            )}

            {/* Foto Upload */}
            <div className="space-y-1.5">
              <Label className="text-[#78716c]">Foto <span className="text-[#a8a29e] font-normal">(optional — Hintergrund auf der Teilen-Seite &amp; im Story-Video)</span></Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              {photoPreview ? (
                <div className="relative inline-block">
                  <img src={photoPreview} alt="Vorschau" className="h-20 w-20 rounded-xl object-cover border border-[#d97706]/30" />
                  <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow border border-gray-200 text-gray-500 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#d97706]/60 text-sm text-[#d97706] hover:bg-amber-50 hover:border-[#d97706] transition-all">
                  <ImagePlus className="h-4 w-4" />
                  Foto hochladen
                </button>
              )}

              {/* Video Upload — für Story-Video Hintergrund */}
              <Label className="text-[#78716c] mt-3 block">Video <span className="text-[#a8a29e] font-normal">(optional — als Hintergrund im Story-Video für Instagram &amp; WhatsApp Status)</span></Label>
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              {bgVideoPreview ? (
                <div className="relative inline-block">
                  <video src={bgVideoPreview} className="h-20 w-28 rounded-xl object-cover border border-[#d97706]/30" muted playsInline />
                  <button type="button" onClick={() => { setBgVideoFile(null); setBgVideoPreview(null); }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow border border-gray-200 text-gray-500 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#d97706]/60 text-sm text-[#d97706] hover:bg-amber-50 hover:border-[#d97706] transition-all">
                  <Video className="h-4 w-4" />
                  Video hochladen
                </button>
              )}
            </div>

            {/* Anlass */}
            <div className="space-y-1.5">
              <Label className="text-[#78716c]">Anlass</Label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button key={o} type="button" onClick={() => setForm({ ...form, occasion: o })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.occasion === o ? "bg-[#d97706] text-white border-[#d97706]" : "border-[#78716c]/20 text-[#78716c] hover:border-[#d97706] hover:text-white"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Sprache */}
            <div className="space-y-1.5">
              <Label className="text-[#78716c]">Sprache</Label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} type="button" onClick={() => setForm({ ...form, language: l })}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${form.language === l ? "bg-[#d97706] text-white border-[#d97706]" : "border-[#78716c]/20 text-[#78716c] hover:border-[#d97706] hover:text-white"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Stimmung */}
            <div className="space-y-1.5">
              <Label className="text-[#78716c]">Stimmung</Label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button key={m} type="button" onClick={() => setForm({ ...form, mood: m })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.mood === m ? "bg-[#d97706] text-white border-[#d97706]" : "border-[#78716c]/20 text-[#78716c] hover:border-[#d97706] hover:text-white"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Persönliche Details */}
            <div className="space-y-1.5">
              <Label htmlFor="details" className="text-zinc-300">
                {isChild ? `Noch mehr über ${form.recipientName || "das Kind"}` : "Persönliche Details"}
                {" "}<span className="text-[#a8a29e] font-normal">(optional)</span>
              </Label>
              <Textarea id="details"
                className="bg-white border-[#d97706]/20 text-[#18120e] placeholder:text-[#a8a29e] focus:border-[#d97706] resize-none"
                placeholder={isChild
                  ? `z.B. ${form.recipientName || "sie/er"} liebt Spaghetti, hat einen Bruder namens Luca, geht gerne in den Park...`
                  : "z.B. wir kennen uns seit 10 Jahren, liebt Reisen, arbeitet als Lehrerin..."}
                value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} rows={3} />
            </div>

            {/* Button */}
            <Button type="submit" disabled={loading || audioLoading || !form.recipientName}
              className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-semibold py-6 text-base rounded-xl">
              {loading
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Songtext wird geschrieben...</>
                : audioLoading
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Musik wird komponiert (~1 Min)...</>
                : <><Sparkles className="mr-2 h-5 w-5" /> Meinen Song erstellen</>}
            </Button>

            <p className="text-center text-xs text-gray-400">
              Erste 30 Sekunden kostenlos hören — keine Kreditkarte
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Fehler */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">{error}</div>
      )}

      {/* Songtext */}
      {lyrics && (
        <>
        <Card className="shadow-2xl border border-[#d97706]/20 bg-[#fdf8f0]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music2 className="h-5 w-5 text-[#d97706]" />
                <CardTitle className="text-lg font-bold text-[#18120e]">
                  {audioLoading ? "Songtext fertig — Musik wird erstellt... 🎼" : "Dein Song ist fertig! 🎉"}
                </CardTitle>
              </div>
              {!audioLoading && (
                <Button variant="ghost" size="sm" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                  className="text-[#d97706] hover:text-[#b45309] text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" /> Neu
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lyrics - editierbar oder anzeige */}
            {editingLyrics ? (
              <div className="space-y-2">
                <textarea
                  className="w-full bg-white rounded-xl p-6 text-[#18120e] text-sm leading-relaxed border border-[#d97706]/20 focus:outline-none focus:border-[#d97706] min-h-64 resize-none"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                />
                <Button size="sm" onClick={handleLyricsEditDone}
                  className="bg-[#d97706] hover:bg-[#b45309] text-white text-xs">
                  ✓ Fertig {songs.length > 0 && <span className="ml-1 opacity-70">— Song neu erstellen</span>}
                </Button>
              </div>
            ) : (
              <div className="relative group">
                <div className="bg-white rounded-xl p-6 space-y-1 border border-[#d97706]/10">
                  {formatLyrics(lyrics)}
                </div>
                <button onClick={() => setEditingLyrics(true)}
                  className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white rounded-lg p-1.5 shadow-sm border border-gray-200 text-gray-500 hover:text-[#d97706]">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* KI Verfeinern */}
            {!audioLoading && songs.length === 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[#78716c]">✨ Text per KI anpassen — einfach eintippen was du ändern möchtest:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder='z.B. "Mach es fröhlicher" oder "Füge ihren Hund Max ein"'
                    value={refineInput}
                    onChange={(e) => setRefineInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                    className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-400"
                  />
                  <Button size="sm" onClick={handleRefine} disabled={refining || !refineInput.trim()}
                    className="bg-[#d97706] hover:bg-[#b45309] text-white shrink-0">
                    {refining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {audioLoading && (
              <div className="flex items-center justify-center gap-3 py-4 text-[#d97706]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Musik wird komponiert, das dauert ~1 Minute...</span>
              </div>
            )}

            {songs.length > 0 && (
              <div className="space-y-4">
                {checkingPayment && (
                  <div className="flex items-center gap-2 text-sm text-[#d97706]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Zahlung wird geprüft...
                  </div>
                )}

                <p className="text-sm font-medium text-gray-700">🎵 {songs.length} Version{songs.length > 1 ? "en" : ""} für dich:</p>
                {songs.map((song, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${playingIndex === i ? "bg-[#fef3c7] border-[#d97706]/40" : "bg-white/4 border-white/8"}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => togglePlay(i, song.mp3_url)}
                        className="w-10 h-10 rounded-full bg-[#d97706] hover:bg-[#b45309] flex items-center justify-center text-white transition-colors">
                        {playingIndex === i ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                      </button>
                      <span className="text-sm font-medium text-[#78716c]">
                        Version {i + 1}
                        {!paid && <span className="ml-1 text-[10px] text-[#a8a29e]">(30 Sek. Vorschau)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {paid ? (
                        <>
                          {/* WhatsApp — freigeschaltet */}
                          <a href={`https://wa.me/?text=${encodeURIComponent(`🎵 Ich habe einen personalisierten Song für ${form.recipientName} erstellt!\n\n🎧 Hier anhören: https://madesong.com/song/${shareSlug}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                          </a>
                          <button onClick={() => handleShare(song, i)}
                            className="flex items-center gap-1.5 text-xs text-[#d97706] hover:text-[#b45309] font-medium">
                            {copiedIndex === i ? <><Check className="h-3.5 w-3.5" /> Kopiert!</> : <><Share2 className="h-3.5 w-3.5" /> Link</>}
                          </button>
                          {paidTier === "song_video" && (
                            <button onClick={() => generateVideo(song, i)} disabled={videoLoading !== null}
                              className="flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium disabled:opacity-40">
                              {videoLoading === i
                                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {videoStatus || "Lädt..."}</>
                                : <><Video className="h-3.5 w-3.5" /> Video</>}
                            </button>
                          )}
                          <a href={song.mp3_url} download={`madesong-${form.recipientName}.mp3`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium">
                            <Download className="h-3.5 w-3.5" /> MP3
                          </a>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">🔒 Freischalten zum Teilen & Download</span>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Wall — außerhalb der Card, damit overflow-hidden nicht greift */}
        {!paid && shareSlug && songs.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-[#d97706]/20 space-y-3">
            <p className="text-sm font-semibold text-[#18120e]">🎁 Song gefällt dir? Jetzt freischalten:</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleCheckout("song")}
                className="flex flex-col items-center gap-1 bg-white border border-[#d97706]/30 rounded-xl p-4 hover:border-[#d97706] hover:shadow-md transition-all cursor-pointer">
                <span className="text-lg font-black text-[#18120e]">€3,99</span>
                <span className="text-xs text-[#78716c] text-center">Song · MP3 · Teilen-Link</span>
              </button>
              <div className="relative">
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">Empfohlen</span>
                <button type="button" onClick={() => handleCheckout("song_video")}
                  className="w-full flex flex-col items-center gap-1 bg-[#d97706] rounded-xl p-4 hover:bg-[#b45309] transition-all cursor-pointer">
                  <span className="text-lg font-black text-white">€4,99</span>
                  <span className="text-xs text-white/80 text-center">Song + Story-Video</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-[#a8a29e] text-center">Kreditkarte · PayPal · Apple Pay · Einmalig · Sicher</p>
          </div>
        )}
        </>
      )}
    </div>
  );
}
