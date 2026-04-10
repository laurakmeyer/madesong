"use client";

import { useState, useRef } from "react";
import { Play, Pause, Download } from "lucide-react";

export default function SongPlayer({ mp3Url }: { mp3Url: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(mp3Url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex items-center justify-between">
      <button onClick={togglePlay}
        className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-colors shadow-md">
        {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
      </button>
      <div className="flex-1 mx-4">
        <div className="h-2 bg-purple-100 rounded-full">
          <div className={`h-2 bg-purple-400 rounded-full transition-all ${playing ? "animate-pulse w-1/2" : "w-0"}`} />
        </div>
      </div>
      <a href={mp3Url} download="madesong.mp3" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium">
        <Download className="h-4 w-4" /> MP3
      </a>
    </div>
  );
}
