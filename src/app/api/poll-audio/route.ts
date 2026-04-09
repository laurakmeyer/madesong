import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Keine taskId angegeben." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.mureka.ai/v1/song/query/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${process.env.MUREKA_API_KEY}`,
      },
    });

    const data = await res.json();

    if (data.status === "succeeded" && data.songs?.length > 0) {
      return NextResponse.json({
        status: "succeeded",
        songs: data.songs.map((s: { mp3_url: string; cover: string; title: string }) => ({
          mp3_url: s.mp3_url,
          cover: s.cover,
          title: s.title,
        })),
      });
    }

    if (data.status === "failed") {
      return NextResponse.json({ status: "failed", error: "Song-Generierung fehlgeschlagen." });
    }

    // Noch in Bearbeitung
    return NextResponse.json({ status: "preparing" });
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json({ error: "Fehler beim Abrufen des Status." }, { status: 500 });
  }
}
