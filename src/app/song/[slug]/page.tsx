import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Music } from "lucide-react";
import SongPlayer from "@/components/SongPlayer";
import SongActions from "@/components/SongActions";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: song } = await supabaseAdmin
    .from("songs")
    .select("recipient_name, occasion, mood, photo_url")
    .eq("share_slug", slug)
    .single();

  if (!song) {
    return { title: "Song nicht gefunden — MadeSong" };
  }

  const title = `Ein Song für ${song.recipient_name} 🎵`;
  const occasionPart = song.occasion && song.occasion !== "Einfach so" ? song.occasion : null;
  const description = [occasionPart, song.mood].filter(Boolean).join(" · ") || "Ein persönlicher Song von MadeSong";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: song.photo_url ? [{ url: song.photo_url }] : undefined,
    },
    twitter: {
      card: song.photo_url ? "summary_large_image" : "summary",
      title,
      description,
      images: song.photo_url ? [song.photo_url] : undefined,
    },
  };
}

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
        return <h3 key={i} className="text-lg font-bold text-[#d97706] mt-2 mb-3">{line.replace(/\*\*/g, "")}</h3>;
      }
      if (line.startsWith("[") && line.endsWith("]")) {
        return <p key={i} className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-4 mb-1">{line}</p>;
      }
      if (line === "") return <br key={i} />;
      return <p key={i} className="text-gray-800 leading-relaxed">{line}</p>;
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fdf8f2] via-[#f5ede0] to-[#ede0cc] flex flex-col items-center px-6 py-12">

      <div className="w-full max-w-xl space-y-6">

        {/* Logo */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-2">
            <Music className="h-5 w-5 text-[#d97706]" />
            <span className="text-lg font-bold text-[#1c1917]">MadeSong</span>
          </a>
        </div>

        {/* Foto */}
        {song.photo_url && (
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl" style={{aspectRatio: "4/3"}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={song.photo_url} alt="Foto" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-xs text-white/70 font-medium uppercase tracking-widest mb-1">Ein persönlicher Song für</p>
              <h1 className="text-3xl font-extrabold text-white">{song.recipient_name} 🎵</h1>
              {song.occasion && song.occasion !== "Einfach so" && <p className="text-white/70 text-sm mt-1">{song.occasion}</p>}
            </div>
          </div>
        )}

        {/* Kein Foto: Text-Header */}
        {!song.photo_url && (
          <div className="text-center">
            <p className="text-sm text-[#d97706] font-medium uppercase tracking-widest">Ein persönlicher Song für</p>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{song.recipient_name} 🎵</h1>
            {song.occasion && <p className="text-gray-500 text-sm mt-1">{song.occasion} · {song.mood}</p>}
          </div>
        )}

        {/* Player */}
        <SongPlayer mp3Url={song.mp3_url} />

        {/* Sharing & Video */}
        {song.paid_tier && (
          <SongActions
            mp3Url={song.mp3_url}
            recipientName={song.recipient_name}
            shareSlug={song.share_slug}
            paidTier={song.paid_tier}
            videoUrl={song.video_url || null}
          />
        )}

        {/* Lyrics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 space-y-1 border border-white/50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Songtext</p>
          {formatLyrics(song.lyrics)}
        </div>

        {/* CTA */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
          <p className="text-gray-600 mb-3">Möchtest du auch einen Song verschenken?</p>
          <a href="https://madesong.com"
            className="inline-block bg-[#d97706] hover:bg-[#b45309] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            ✨ Meinen Song erstellen
          </a>
        </div>
      </div>
    </main>
  );
}
