"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download } from "lucide-react";

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

export default function SongPlayer({ mp3Url }: { mp3Url: string }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(mp3Url);
    audioRef.current = audio;
    audio.onended = () => { setPlaying(false); setCurrentTime(0); };
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    return () => { audio.pause(); };
  }, [mp3Url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex items-center justify-between">
      <button onClick={togglePlay}
        className="w-14 h-14 rounded-full bg-[#d97706] hover:bg-[#b45309] flex items-center justify-center text-white transition-colors shadow-md shrink-0">
        {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
      </button>
      <div className="flex-1 mx-4 min-w-0">
        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
          <div className="h-2 bg-amber-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1.5 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <a href={mp3Url} download="madesong.mp3" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-[#d97706] hover:text-[#b45309] font-medium shrink-0">
        <Download className="h-4 w-4" /> MP3
      </a>
    </div>
  );
}
