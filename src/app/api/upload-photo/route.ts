import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Kein Foto." }, { status: 400 });

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${nanoid()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from("song-images")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("song-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Foto-Upload fehlgeschlagen." }, { status: 500 });
  }
}
