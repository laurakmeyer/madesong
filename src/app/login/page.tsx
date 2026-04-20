"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/components/AuthProvider";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-amber-50 to-white">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8">
          <span className="text-2xl font-bold tracking-tight text-[#18120e]">MadeSong</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-black/5 p-8">
          <h1 className="text-xl font-bold text-[#18120e] text-center mb-6">Anmelden</h1>

          {magicLinkSent ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold text-[#18120e]">E-Mail gesendet!</p>
              <p className="text-sm text-[#78716c]">
                Wir haben dir einen Login-Link an <strong>{email}</strong> geschickt. Klicke auf den Link in der E-Mail um dich anzumelden.
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="text-sm text-[#d97706] hover:underline mt-2"
              >
                Andere E-Mail verwenden
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-medium text-[#18120e] hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Mit Google anmelden
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-[#a8a29e]">oder per E-Mail</span>
                </div>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  placeholder="deine@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#d97706] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#b45309] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Login-Link senden
                </button>
              </form>

              {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#a8a29e] mt-6">
          Kein Account nötig zum Song erstellen.{" "}
          <Link href="/#erstellen" className="text-[#d97706] hover:underline">Direkt loslegen →</Link>
        </p>
      </div>
    </main>
  );
}
