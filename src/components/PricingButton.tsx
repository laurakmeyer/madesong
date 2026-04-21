"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

export default function PricingButton({
  tier,
  className,
  children,
}: {
  tier: "song" | "song_video" | "paket" | "flat";
  className: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    // Single songs go to #erstellen
    if (tier === "song" || tier === "song_video") {
      window.location.href = "#erstellen";
      return;
    }

    // Paket and Flat require login
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : children}
    </button>
  );
}
