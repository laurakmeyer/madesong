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
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="w-full py-6 px-8 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Music className="h-7 w-7 text-purple-600" />
          <span className="text-2xl font-bold text-purple-700">MadeSong</span>
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-8 py-12 space-y-6">
        {/* Titel */}
        <div className="text-center space-y-2">
          <p className="text-sm text-purple-600 font-medium uppercase tracking-widest">Ein persönlicher Song für</p>
          <h1 className="text-4xl font-extrabold text-gray-900">{song.recipient_name} 🎵</h1>
          {song.occasion && <p className="text-gray-500">{song.occasion} · {song.mood}</p>}
        </div>

        {/* Player */}
        <SongPlayer mp3Url={song.mp3_url} />

        {/* Lyrics */}
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Songtext</p>
          {formatLyrics(song.lyrics)}
        </div>

        {/* CTA */}
        <div className="text-center bg-white/80 rounded-2xl shadow-lg p-6">
          <p className="text-gray-600 mb-3">Möchtest du auch einen personalisierten Song erstellen?</p>
          <a href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            ✨ Meinen Song erstellen
          </a>
        </div>
      </div>
    </main>
  );
}
