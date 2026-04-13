"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Music2, RefreshCw, Play, Pause, Download, Share2, Check, Pencil, Wand2, ImagePlus, X, Video } from "lucide-react";

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
  const [videoLoading, setVideoLoading] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
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

  // Video für Stories/WhatsApp generieren
  const generateVideo = async (song: Song, index: number) => {
    if (typeof window === "undefined") return;
    const canvas = document.createElement("canvas");
    if (!("captureStream" in canvas)) {
      alert("Dein Browser unterstützt diese Funktion nicht. Bitte Chrome oder Firefox nutzen.");
      return;
    }
    setVideoLoading(index);
    setVideoProgress(0);

    try {
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d")!;

      // Foto laden falls vorhanden
      let photoImg: HTMLImageElement | null = null;
      if (photoPreview) {
        photoImg = await new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = photoPreview;
        });
      }

      // Audio via Proxy laden (CORS)
      const audioEl = new Audio(`/api/proxy-audio?url=${encodeURIComponent(song.mp3_url)}`);
      audioEl.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        audioEl.addEventListener("canplaythrough", done, { once: true });
        setTimeout(done, 8000);
        audioEl.load();
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audioEl);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      const lyricsLines = (lyrics || "").split("\n").filter((l) => l.trim());
      const MAX_SECONDS = 60;
      let startTime = 0;
      let animFrame: number;

      const wrapText = (text: string, maxWidth: number, fontSize: number) => {
        ctx.font = `${fontSize}px system-ui, sans-serif`;
        if (ctx.measureText(text).width <= maxWidth) return [text];
        const words = text.split(" ");
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth) {
            if (current) lines.push(current);
            current = word;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
        return lines;
      };

      const drawFrame = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;
        const progress = Math.min(elapsed / MAX_SECONDS, 1);
        setVideoProgress(Math.round(progress * 100));

        ctx.clearRect(0, 0, 1080, 1920);

        // Hintergrund
        if (photoImg) {
          ctx.save();
          ctx.filter = "blur(40px)";
          const scale = Math.max(1080 / photoImg.width, 1920 / photoImg.height) * 1.15;
          const w = photoImg.width * scale;
          const h = photoImg.height * scale;
          ctx.drawImage(photoImg, (1080 - w) / 2, (1920 - h) / 2, w, h);
          ctx.restore();
          ctx.fillStyle = "rgba(20, 8, 0, 0.58)";
          ctx.fillRect(0, 0, 1080, 1920);
        } else {
          const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
          grad.addColorStop(0, "#1e180e");
          grad.addColorStop(0.5, "#8a5e2a");
          grad.addColorStop(1, "#3a2c18");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1080, 1920);
        }

        // Pulsierende Ringe
        const pulse = 1 + Math.sin(elapsed * 2.5) * 0.06;
        for (let r = 0; r < 5; r++) {
          ctx.beginPath();
          ctx.arc(540, 430, (100 + r * 65) * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${0.12 - r * 0.02})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Musik-Note pulsiert
        const noteSize = 130 + Math.sin(elapsed * 2.5) * 8;
        ctx.font = `${noteSize}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("🎵", 540, 470);

        // Name
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 24;
        ctx.font = "bold 108px system-ui, sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(form.recipientName, 540, 660);
        ctx.shadowBlur = 0;

        // Anlass
        ctx.font = "52px system-ui, sans-serif";
        ctx.fillStyle = "rgba(220,200,255,0.85)";
        ctx.fillText(form.occasion, 540, 740);

        // Trennlinie
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(180, 790);
        ctx.lineTo(900, 790);
        ctx.stroke();

        // Lyrics (scrollend)
        const lineH = 64;
        const visibleLines = 14;
        const totalScroll = Math.max(0, lyricsLines.length - visibleLines);
        const scrollOffset = Math.floor(progress * totalScroll);

        let y = 870;
        for (let i = 0; i < visibleLines; i++) {
          const lineIdx = scrollOffset + i;
          if (lineIdx >= lyricsLines.length) break;
          const line = lyricsLines[lineIdx];

          if (line.startsWith("**") && line.endsWith("**")) {
            ctx.font = "bold 50px system-ui, sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.98)";
            ctx.fillText(line.replace(/\*\*/g, ""), 540, y);
            y += lineH + 6;
          } else if (line.startsWith("[") && line.endsWith("]")) {
            ctx.font = "bold 36px system-ui, sans-serif";
            ctx.fillStyle = "rgba(180,150,255,0.85)";
            ctx.fillText(line, 540, y);
            y += lineH - 8;
          } else {
            ctx.font = "44px system-ui, sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.88)";
            const wrapped = wrapText(line, 900, 44);
            for (const wl of wrapped) {
              ctx.fillText(wl, 540, y);
              y += lineH;
            }
          }
        }

        // Branding unten
        ctx.font = "40px system-ui, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillText("🎶 madesong.com", 540, 1860);

        if (elapsed < MAX_SECONDS) {
          animFrame = requestAnimationFrame(drawFrame);
        }
      };

      // Recording starten
      const canvasStream = (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(30);
      const combined = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(combined, { mimeType });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        cancelAnimationFrame(animFrame);
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `madesong-${form.recipientName}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setVideoLoading(null);
        setVideoProgress(0);
      };

      audioEl.onended = () => recorder.stop();
      setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, (MAX_SECONDS + 2) * 1000);

      requestAnimationFrame(drawFrame);
      recorder.start(100);
      audioEl.play();

    } catch (err) {
      console.error("Video error:", err);
      setVideoLoading(null);
      setVideoProgress(0);
      setError("Video konnte nicht erstellt werden. Bitte versuche es nochmal.");
    }
  };

  // Audio abspielen / pausieren
  const togglePlay = (index: number, mp3_url: string) => {
    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(mp3_url);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingIndex(null);
      setPlayingIndex(index);
    }
  };

  // Cleanup beim Verlassen
  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

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
    const maxAttempts = 30;
    const params = new URLSearchParams({
      taskId,
      lyrics: lyricsText,
      recipientName: form.recipientName,
      age: form.age,
      occasion: form.occasion,
      language: form.language,
      mood: form.mood,
      ...(photoUrl ? { photoUrl } : {}),
    });
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await fetch(`/api/poll-audio?${params}`);
      const data = await res.json();
      if (data.status === "succeeded") {
        if (data.shareSlug) setShareSlug(data.shareSlug);
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
        const formData = new FormData();
        formData.append("file", photoFile);
        const photoRes = await fetch("/api/upload-photo", { method: "POST", body: formData });
        const photoData = await photoRes.json();
        if (photoData.url) photoUrl = photoData.url;
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
      const audioData = await audioRes.json();
      if (audioData.error) throw new Error(audioData.error);

      // 4. Auf Fertigstellung warten (mit Foto URL)
      const generatedSongs = await pollAudio(audioData.taskId, lyricsData.lyrics, photoUrl);
      setSongs(generatedSongs);
    } catch (err) {
      setError("Ups, da ist etwas schiefgelaufen. Bitte versuche es nochmal.");
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
        return <p key={i} className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-4 mb-1">{line}</p>;
      }
      if (line === "") return <br key={i} />;
      return <p key={i} className="text-[#1c1917] leading-relaxed">{line}</p>;
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
              <Label className="text-zinc-300">Foto <span className="text-[#a8a29e] font-normal">(optional — erscheint als Hintergrund auf der Teilen-Seite)</span></Label>
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
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#d97706]/30 text-sm text-[#78716c] hover:border-[#d97706] hover:text-[#d97706] transition-all">
                  <ImagePlus className="h-4 w-4" />
                  Foto hochladen
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
              Erste 10 Sekunden kostenlos hören — keine Kreditkarte
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
                <Button size="sm" onClick={() => setEditingLyrics(false)}
                  className="bg-[#d97706] hover:bg-[#b45309] text-white text-xs">
                  ✓ Fertig
                </Button>
              </div>
            ) : (
              <div className="relative group">
                <div className="bg-white/80 rounded-xl p-6 space-y-1 border border-[#d97706]/10">
                  {formatLyrics(lyrics)}
                </div>
                <button onClick={() => setEditingLyrics(true)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg p-1.5 shadow-sm border border-gray-200 text-gray-500 hover:text-[#d97706]">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* KI Verfeinern */}
            {!audioLoading && songs.length === 0 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder='z.B. "Mach es kindgerechter" oder "Kein Schwerenöter"'
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
            )}

            {/* Audio Player */}
            {audioLoading && (
              <div className="flex items-center justify-center gap-3 py-4 text-[#d97706]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Musik wird komponiert, das dauert ~1 Minute...</span>
              </div>
            )}

            {songs.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">🎵 {songs.length} Version{songs.length > 1 ? "en" : ""} für dich:</p>
                {songs.map((song, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${playingIndex === i ? "bg-[#fef3c7] border-[#d97706]/40" : "bg-white/4 border-white/8"}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => togglePlay(i, song.mp3_url)}
                        className="w-10 h-10 rounded-full bg-[#d97706] hover:bg-[#b45309] flex items-center justify-center text-white transition-colors">
                        {playingIndex === i ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                      </button>
                      <span className="text-sm font-medium text-[#78716c]">Version {i + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`🎵 Ich habe einen personalisierten Song für ${form.recipientName} erstellt!\n\n${lyrics ? lyrics.replace(/\*\*/g, "").trim() + "\n\n" : ""}🎧 Hier anhören: ${shareSlug ? `https://madesong.com/song/${shareSlug}` : song.mp3_url}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                      {/* Link kopieren */}
                      <button onClick={() => handleShare(song, i)}
                        className="flex items-center gap-1.5 text-xs text-[#d97706] hover:text-[#b45309] font-medium">
                        {copiedIndex === i ? <><Check className="h-3.5 w-3.5" /> Kopiert!</> : <><Share2 className="h-3.5 w-3.5" /> Link</>}
                      </button>
                      {/* Video für Stories */}
                      <button
                        onClick={() => generateVideo(song, i)}
                        disabled={videoLoading !== null}
                        className="flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium disabled:opacity-40"
                        title="Als Video für Instagram/WhatsApp Stories"
                      >
                        {videoLoading === i
                          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {videoProgress}%</>
                          : <><Video className="h-3.5 w-3.5" /> Video</>}
                      </button>
                      {/* Download */}
                      <a href={song.mp3_url} download={`madesong-${i + 1}.mp3`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium">
                        <Download className="h-3.5 w-3.5" /> MP3
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
