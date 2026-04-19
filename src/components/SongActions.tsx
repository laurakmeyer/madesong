"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Share2, Check, Video, Loader2 } from "lucide-react";

type SongActionsProps = {
  mp3Url: string;
  recipientName: string;
  shareSlug: string;
  paidTier: string | null;
  videoUrl: string | null;
};

export default function SongActions({ mp3Url, recipientName, shareSlug, paidTier, videoUrl: initialVideoUrl }: SongActionsProps) {
  const [copied, setCopied] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shareUrl = `https://madesong.com/song/${shareSlug}`;
  const shareText = `🎵 Hör dir diesen personalisierten Song für ${recipientName} an!\n\n🎧 ${shareUrl}`;

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateVideo = async () => {
    setVideoLoading(true);
    setVideoStatus("Video wird erstellt...");

    // Fire-and-forget: start generation, then poll for result
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setVideoStatus("");
        setVideoLoading(false);
        return;
      }
      if (data.error) {
        setVideoStatus(data.error);
        setVideoLoading(false);
        return;
      }
    } catch {
      // Request timed out or failed — start polling
    }

    setVideoStatus("Video wird generiert, bitte warten...");
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareSlug }),
        });
        const data = await res.json();
        if (data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setVideoStatus("");
          setVideoLoading(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // keep polling
      }
      if (attempts > 12) {
        setVideoStatus("Video-Generierung dauert zu lange. Bitte Seite neu laden und erneut versuchen.");
        setVideoLoading(false);
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
    }, 5000);
  };

  return (
    <div className="space-y-4">
      {/* Share Buttons */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Teilen & Download</p>
        <div className="flex flex-wrap gap-3">
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>

          <button onClick={handleCopyLink}
            className="flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
            {copied ? <><Check className="h-4 w-4" /> Kopiert!</> : <><Share2 className="h-4 w-4" /> Link kopieren</>}
          </button>

          <a href={mp3Url} download={`madesong-${recipientName}.mp3`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
            <Download className="h-4 w-4" /> MP3
          </a>
        </div>
      </div>

      {/* Video Section */}
      {paidTier === "song_video" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Story-Video</p>
          {videoUrl ? (
            <div className="space-y-3">
              <video src={videoUrl} controls playsInline className="w-full rounded-xl" />
              <div className="flex flex-wrap gap-3">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href={videoUrl} download={`madesong-${recipientName}.mp4`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
                  <Download className="h-4 w-4" /> Video herunterladen
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button type="button" onClick={generateVideo} disabled={videoLoading}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {videoLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> {videoStatus}</>
                  : <><Video className="h-4 w-4" /> Story-Video erstellen</>}
              </button>
              {videoStatus && !videoLoading && (
                <p className="text-sm text-red-500">{videoStatus}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
