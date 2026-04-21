"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

export default function DashboardPackageSuccess() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const packageSuccess = searchParams.get("package_success");
    if (!sessionId || !packageSuccess) return;

    setStatus("verifying");
    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paid) {
          setStatus("success");
          window.history.replaceState({}, "", "/dashboard");
          setTimeout(() => window.location.reload(), 2000);
          return;
        }
        if (data.fulfillmentError) {
          setErrorMessage(`${data.message || "Freischaltung fehlgeschlagen."} Referenz: ${data.sessionId || sessionId}`);
        }
        setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "idle") return null;

  if (status === "verifying") {
    return (
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#d97706]" />
        <p className="text-sm text-[#78716c]">Zahlung wird überprüft...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
        <Check className="h-5 w-5 text-green-600" />
        <p className="text-sm font-semibold text-green-800">Zahlung erfolgreich! Deine Credits sind jetzt verfügbar.</p>
      </div>
    );
  }

  if (status === "error" && errorMessage) {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5">
        <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
      </div>
    );
  }

  return null;
}
