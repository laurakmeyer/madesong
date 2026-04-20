import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { Music2, Download, Share2, Video } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="bg-white text-[#1c1917] min-h-screen">
      <Header />

      <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-[#18120e]">Meine Songs</h1>
          <p className="text-[#78716c] mt-1 text-sm">
            {user.email} · {songs?.length || 0} Songs
          </p>
        </div>

        {!songs || songs.length === 0 ? (
          <div className="text-center py-16 bg-amber-50/50 rounded-2xl border border-amber-100">
            <Music2 className="h-12 w-12 text-[#d97706] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#18120e] mb-2">Noch keine Songs</h2>
            <p className="text-[#78716c] text-sm mb-6">Erstelle deinen ersten personalisierten Song!</p>
            <Link
              href="/#erstellen"
              className="inline-flex items-center gap-2 bg-[#d97706] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#b45309] transition-colors"
            >
              Song erstellen →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex flex-col sm:flex-row gap-4 items-start"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#18120e] text-lg">{song.recipient_name || "Unbenannt"}</h3>
                  <p className="text-sm text-[#78716c]">
                    {song.occasion}{song.age ? ` · ${song.age} Jahre` : ""} · {song.language}
                  </p>
                  {song.lyrics && (
                    <p className="text-xs text-[#a8a29e] mt-2 line-clamp-2">
                      {song.lyrics.split("\n").filter((l: string) => l.trim() && !l.startsWith("[")).slice(0, 2).join(" / ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {song.mp3_url && (
                    <a
                      href={song.mp3_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> MP3
                    </a>
                  )}
                  {song.video_url && (
                    <a
                      href={song.video_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" /> Video
                    </a>
                  )}
                  <Link
                    href={`/song/${song.share_slug}`}
                    className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Ansehen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
