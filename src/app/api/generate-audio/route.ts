import { NextRequest, NextResponse } from "next/server";

function buildMurekaPrompt(mood: string, age: string, occasion: string): string {
  const ageNum = age ? parseInt(age) : null;
  const isChild = ageNum !== null && ageNum <= 12;

  const moodMap: Record<string, string> = {
    "Fröhlich & mitreißend": "pop, upbeat, cheerful, bright",
    "Warm & zärtlich":       "soft, warm, tender, acoustic",
    "Lustig & verspielt":    "playful, fun, ukulele, bouncy",
    "Ruhig & sanft":         "calm, gentle, lullaby, soft, slow",
  };

  const occasionMap: Record<string, string> = {
    "Schlaflied":   "lullaby, soothing, dreamy",
    "Geburtstag":   "celebratory, joyful",
    "Weihnachten":  "festive, cozy, warm",
    "Jahrestag":    "romantic, heartfelt",
    "Valentinstag": "romantic, sweet",
    "Vatertag":     "warm, appreciative",
    "Muttertag":    "warm, loving",
    "Einfach so":   "feel-good, personal",
  };

  const parts = [
    moodMap[mood] || "pop, upbeat",
    occasionMap[occasion] || "",
    isChild ? "children's song, simple, fun" : "emotional, personal",
    "female vocal",
  ].filter(Boolean);

  return parts.join(", ");
}

export async function POST(req: NextRequest) {
  const { lyrics, mood, age, occasion } = await req.json();

  if (!lyrics) {
    return NextResponse.json({ error: "Keine Lyrics angegeben." }, { status: 400 });
  }

  const prompt = buildMurekaPrompt(mood, age, occasion);

  try {
    const res = await fetch("https://api.mureka.ai/v1/song/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MUREKA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lyrics, prompt, model: "auto" }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Mureka error:", data);
      const msg = res.status === 429 || data?.message?.toLowerCase().includes("concurrent")
        ? "Bitte warte kurz — der vorherige Song wird noch generiert. Versuche es in 30 Sekunden nochmal."
        : `Audio-Generierung fehlgeschlagen: ${data?.message || data?.error || res.status}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ taskId: data.id });
  } catch (error) {
    console.error("Mureka API Error:", error);
    return NextResponse.json({ error: "Verbindung zu Mureka fehlgeschlagen." }, { status: 500 });
  }
}
