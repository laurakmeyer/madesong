"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase-browser";
import { Loader2, Check, LogIn } from "lucide-react";

export default function ClaimSongBanner({ shareSlug, hasUserId }: { shareSlug: string; hasUserId: boolean }) {
  const { user, loading: authLoading } = useAuth();
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  // Don't show if already assigned to a user or still loading auth
  if (authLoading || hasUserId) return null;

  // User is logged in but song not yet claimed — auto-claim
  if (user && !claimed && !claiming) {
    setClaiming(true);
    fetch("/api/claim-song", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareSlug }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setClaimed(true);
        setClaiming(false);
      })
      .catch(() => setClaiming(false));
  }

  if (claimed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-green-800">Song in deinem Account gespeichert!</p>
        <a href="/dashboard" className="text-sm text-green-600 hover:underline mt-1 inline-block">
          Zu meinen Songs →
        </a>
      </div>
    );
  }

  if (user && claiming) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#d97706] mx-auto mb-2" />
        <p className="text-sm text-[#78716c]">Song wird gespeichert...</p>
      </div>
    );
  }

  // Not logged in — show sign-up prompt
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/song/${shareSlug}` },
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSendingLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/song/${shareSlug}` },
    });
    if (!error) setMagicLinkSent(true);
    setSendingLink(false);
  };

  if (magicLinkSent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold text-green-800">Login-Link gesendet!</p>
        <p className="text-xs text-green-600 mt-1">
          Klicke auf den Link in der E-Mail — dein Song wird dann automatisch gespeichert.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center space-y-4">
      <div>
        <p className="font-semibold text-[#18120e]">Song in deinem Account speichern?</p>
        <p className="text-sm text-[#78716c] mt-1">So findest du deinen Song jederzeit wieder.</p>
      </div>

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
        Mit Google speichern
      </button>

      {!showEmailInput ? (
        <button
          onClick={() => setShowEmailInput(true)}
          className="text-sm text-[#d97706] hover:underline"
        >
          oder per E-Mail
        </button>
      ) : (
        <form onSubmit={handleMagicLink} className="flex gap-2">
          <input
            type="email"
            placeholder="deine@email.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]"
          />
          <button
            type="submit"
            disabled={sendingLink}
            className="bg-[#d97706] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#b45309] disabled:opacity-50"
          >
            {sendingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  );
}
