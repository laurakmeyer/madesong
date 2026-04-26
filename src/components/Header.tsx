"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { Music2, LogOut } from "lucide-react";
import MuttertagBanner from "@/components/MuttertagBanner";

export default function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <MuttertagBanner />
    <header className="flex items-center justify-between px-6 md:px-12 py-5 bg-white/90 backdrop-blur-md border-b border-black/6">
      <Link href="/" className="text-2xl font-bold tracking-tight text-[#18120e]">MadeSong</Link>
      <nav className="hidden md:flex items-center gap-8 text-sm text-[#78716c]">
        <a href="/#so-funktionierts" className="hover:text-[#18120e] transition-colors">So funktioniert&apos;s</a>
        <a href="/#preise" className="hover:text-[#18120e] transition-colors">Preise</a>
        <a href="/#faq" className="hover:text-[#18120e] transition-colors">FAQ</a>
      </nav>
      <div className="flex items-center gap-3">
        {!loading && user ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-[#78716c] hover:text-[#18120e] transition-colors">
              <Music2 className="h-4 w-4" /> Meine Songs
            </Link>
            <button onClick={signOut} className="text-sm text-[#a8a29e] hover:text-[#18120e] transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : !loading ? (
          <Link href="/login" className="text-sm font-medium text-[#78716c] hover:text-[#18120e] transition-colors">
            Anmelden
          </Link>
        ) : null}
        <a href="/#erstellen" className="text-sm font-semibold bg-[#d97706] text-white px-5 py-2.5 rounded-full hover:bg-[#b45309] transition-colors">
          Song erstellen →
        </a>
      </div>
    </header>
    </div>
  );
}
