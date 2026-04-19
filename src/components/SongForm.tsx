"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Music2, RefreshCw, Play, Pause, Download, Share2, Check, Pencil, Wand2, ImagePlus, X, Video } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

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
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);
  const [selectingSong, setSelectingSound] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [editingLyrics, setEditingLyrics] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [bgVideoFile, setBgVideoFile] = useState<File | null>(null);
  const [bgVideoPreview, setBgVideoPreview] = useState<string | null>(null);
  const [videoPreviewFailed, setVideoPreviewFailed] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [videoUploadStatus, setVideoUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [paid, setPaid] = useState(false);
  const [paidTier, setPaidTier] = useState<"song" | "song_video">("song");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
    const previewUrl = URL.createObjectURL(file);
    const checkUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(checkUrl);
      if (video.duration > 30) {
        setError("Video ist zu lang (max. 30 Sekunden).");
        URL.revokeObjectURL(previewUrl);
        e.target.value = "";
        return;
      }
      setBgVideoFile(file);
      setBgVideoPreview(previewUrl);
      setVideoPreviewFailed(false);
      setCurrentVideoUrl(null);
      setVideoUploadStatus("idle");
    };
    video.onerror = () => {
      URL.revokeObjectURL(checkUrl);
      setBgVideoFile(file);
      setBgVideoPreview(previewUrl);
      setVideoPreviewFailed(false);
      setCurrentVideoUrl(null);
      setVideoUploadStatus("idle");
    };
    video.src = checkUrl;
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
    setSelectedSongIndex(null);
    setCurrentPhotoUrl(null);
    setCurrentVideoUrl(null);
    setError(null);
    try {
      const audioRes = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics, mood: form.mood, age: form.age, occasion: form.occasion }),
      });
      const audioData = await audioRes.json();
      if (audioData.error) throw new Error(audioData.error);
      const generatedSongs = await pollAudio(audioData.taskId);
      setSongs(generatedSongs);
    } catch (err) {
      console.error(err);
      setError("Audio-Generierung fehlgeschlagen. Bitte versuche es nochmal.");
    } finally {
      setAudioLoading(false);
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

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const handleCheckout = async (tier: "song" | "song_video") => {
    if (!shareSlug) {
      setError("Song konnte nicht gespeichert werden. Bitte erstelle den Song nochmal.");
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, shareSlug, recipientName: form.recipientName }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Checkout konnte nicht gestartet werden.");
        setCheckoutLoading(false);
      }
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte versuche es nochmal.");
      setCheckoutLoading(false);
    }
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
  const pollAudio = async (taskId: string) => {
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
        return data.songs as Song[];
      }
      if (data.status === "failed") throw new Error("Song-Generierung fehlgeschlagen.");
    }
    throw new Error("Timeout — bitte versuche es nochmal.");
  };

  const selectSong = async (index: number) => {
    setSelectedSongIndex(index);
    setSelectingSound(true);
    const song = songs[index];
    if (!song) return;

    const saveRes = await fetch("/api/save-song", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mp3Url: song.mp3_url,
        lyrics,
        recipientName: form.recipientName,
        age: form.age,
        occasion: form.occasion,
        language: form.language,
        mood: form.mood,
        photoUrl: currentPhotoUrl || null,
        bgVideoUrl: currentVideoUrl || null,
      }),
    });
    const saveData = await saveRes.json().catch(() => ({}));
    if (saveData.shareSlug) setShareSlug(saveData.shareSlug);
    setSelectingSound(false);
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

      // 2. Foto + Video im Hintergrund hochladen (parallel zum Audio)
      if (photoFile && !currentPhotoUrl) {
        fetch("/api/upload-photo", { method: "POST", body: (() => { const fd = new FormData(); fd.append("file", photoFile); return fd; })() })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.url) setCurrentPhotoUrl(d.url); })
          .catch(() => {});
      }
      if (bgVideoFile && !currentVideoUrl) {
        setVideoUploadStatus("uploading");
        (async () => {
          try {
            const res = await fetch("/api/upload-video", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileName: bgVideoFile.name, contentType: bgVideoFile.type }),
            });
            const { token, path, publicUrl } = await res.json();
            if (!token || !path) { console.error("No upload token received"); setVideoUploadStatus("error"); return; }

            const { error: uploadError } = await supabase.storage
              .from("songs")
              .uploadToSignedUrl(path, token, bgVideoFile, {
                contentType: bgVideoFile.type || "video/mp4",
              });
            if (uploadError) {
              console.error("Video upload failed:", uploadError.message);
              setVideoUploadStatus("error");
            } else {
              setCurrentVideoUrl(publicUrl);
              setVideoUploadStatus("done");
            }
          } catch (e) {
            console.error("Video upload error:", e);
            setVideoUploadStatus("error");
          }
        })();
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
      const generatedSongs = await pollAudio(audioData.taskId!);
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

              {/* Video Upload */}
              <Label className="text-[#78716c] mt-3 block">Video <span className="text-[#a8a29e] font-normal">(optional — max. 30 Sek., als Hintergrund im Story-Video)</span></Label>
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              {bgVideoPreview ? (
                <div className="relative inline-block">
                  {videoPreviewFailed ? (
                    <div className="h-20 w-28 rounded-xl border border-[#d97706]/30 bg-amber-50 flex flex-col items-center justify-center gap-1">
                      <Video className="h-6 w-6 text-[#d97706]" />
                      <span className="text-[10px] text-[#d97706] font-medium truncate max-w-[100px]">{bgVideoFile?.name}</span>
                    </div>
                  ) : (
                    <video
                      src={bgVideoPreview}
                      className="h-20 w-28 rounded-xl object-cover border border-[#d97706]/30"
                      muted
                      playsInline
                      onError={() => setVideoPreviewFailed(true)}
                    />
                  )}
                  <button type="button" onClick={() => { setBgVideoFile(null); setBgVideoPreview(null); setCurrentVideoUrl(null); setVideoUploadStatus("idle"); setVideoPreviewFailed(false); }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow border border-gray-200 text-gray-500 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {videoUploadStatus === "uploading" && <p className="text-xs text-amber-600 mt-1">Video wird hochgeladen...</p>}
                  {videoUploadStatus === "done" && <p className="text-xs text-green-600 mt-1">Hochgeladen!</p>}
                  {videoUploadStatus === "error" && <p className="text-xs text-red-500 mt-1">Upload fehlgeschlagen</p>}
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
              <div className="bg-white rounded-xl p-6 space-y-1 border border-[#d97706]/10 relative">
                <button onClick={() => setEditingLyrics(true)}
                  className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-[#d97706] hover:text-[#b45309] font-medium transition-colors bg-amber-50 rounded-lg px-2.5 py-1.5 border border-[#d97706]/20">
                  <Pencil className="h-3 w-3" /> Lyrics bearbeiten
                </button>
                {formatLyrics(lyrics)}
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
                          <a href={song.mp3_url} download={`madesong-${form.recipientName}.mp3`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium">
                            <Download className="h-3.5 w-3.5" /> MP3
                          </a>
                        </>
                      ) : selectedSongIndex === i ? (
                        selectingSong ? (
                          <span className="flex items-center gap-1.5 text-xs text-[#d97706] font-semibold"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Wird gespeichert...</span>
                        ) : (
                          <span className="text-xs text-[#d97706] font-semibold">✓ Ausgewählt</span>
                        )
                      ) : (
                        <button type="button" onClick={() => selectSong(i)} disabled={selectingSong}
                          className="text-xs font-semibold text-white bg-[#d97706] hover:bg-[#b45309] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          Diesen Song wählen
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Wall — außerhalb der Card, damit overflow-hidden nicht greift */}
        {!paid && shareSlug && selectedSongIndex !== null && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-[#d97706]/20 space-y-3">
            <p className="text-sm font-semibold text-[#18120e]">🎁 Song gefällt dir? Jetzt freischalten:</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" disabled={checkoutLoading} onClick={() => handleCheckout("song")}
                className="flex flex-col items-center gap-1 bg-white border border-[#d97706]/30 rounded-xl p-4 hover:border-[#d97706] hover:shadow-md transition-all cursor-pointer disabled:opacity-50">
                <span className="text-lg font-black text-[#18120e]">{checkoutLoading ? "..." : "€3,99"}</span>
                <span className="text-xs text-[#78716c] text-center">Song · MP3 · Teilen-Link</span>
              </button>
              <div className="relative">
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">Empfohlen</span>
                <button type="button" disabled={checkoutLoading} onClick={() => handleCheckout("song_video")}
                  className="w-full flex flex-col items-center gap-1 bg-[#d97706] rounded-xl p-4 hover:bg-[#b45309] transition-all cursor-pointer disabled:opacity-50">
                  <span className="text-lg font-black text-white">{checkoutLoading ? "..." : "€4,99"}</span>
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
