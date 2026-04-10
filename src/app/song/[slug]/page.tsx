import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Music } from "lucide-react";
import SongPlayer from "@/components/SongPlayer";

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: song } = await supabaseAdmin
    .from("songs")
    .select("*")
    .eq("share_slug", slug)
    .single();

  if (!song) return notFound();

  const formatLyrics = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <h3 key={i} className="text-lg font-bold text-purple-700 mt-2 mb-3">{line.replace(/\*\*/g, "")}</h3>;
      }
      if (line.startsWith("[") && line.endsWith("]")) {
        return <p key={i} className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-4 mb-1">{line}</p>;
      }
      if (line === "") return <br key={i} />;
      return <p key={i} className="text-gray-800 leading-relaxed">{line}</p>;
    });
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center px-6 py-12 overflow-hidden">

      {/* Foto als sanfter Hintergrund */}
      {song.photo_url && (
        <>
          <div className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${song.photo_url})` }} />
          <div className="absolute inset-0 bg-white/75 backdrop-blur-md" />
        </>
      )}
      {!song.photo_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50" />
      )}

      {/* Inhalt */}
      <div className="relative z-10 w-full max-w-xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <a href="/" className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-purple-700">MadeSong</span>
          </a>
          <p className="text-sm text-purple-600 font-medium uppercase tracking-widest">Ein persönlicher Song für</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{song.recipient_name} 🎵</h1>
          {song.occasion && <p className="text-gray-500 text-sm mt-1">{song.occasion} · {song.mood}</p>}
        </div>

        {/* Player */}
        <SongPlayer mp3Url={song.mp3_url} />

        {/* Lyrics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 space-y-1 border border-white/50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Songtext</p>
          {formatLyrics(song.lyrics)}
        </div>

        {/* CTA */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
          <p className="text-gray-600 mb-3">Möchtest du auch einen Song verschenken?</p>
          <a href="https://madesong.com"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            ✨ Meinen Song erstellen
          </a>
        </div>
      </div>
    </main>
  );
}
