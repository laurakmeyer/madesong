import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { taskId } = await req.json();

  if (!taskId) {
    return NextResponse.json({ error: "Keine taskId angegeben." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.mureka.ai/v1/song/query/${taskId}`, {
      headers: { "Authorization": `Bearer ${process.env.MUREKA_API_KEY}` },
    });

    const data = await res.json();

    if (data.status === "succeeded" && data.choices?.length > 0) {
      const songs = data.choices.map((s: { url: string }) => ({ mp3_url: s.url }));
      return NextResponse.json({ status: "succeeded", songs });
    }

    if (data.status === "failed") {
      return NextResponse.json({ status: "failed" });
    }

    return NextResponse.json({ status: "preparing" });
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json({ status: "preparing" }); // retry statt crash
  }
}
