import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Kein Video." }, { status: 400 });

    const ext = file.name.split(".").pop() || "mp4";
    const fileName = `bg-videos/${nanoid()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from("songs")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("songs")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json({ error: "Video-Upload fehlgeschlagen." }, { status: 500 });
  }
}
