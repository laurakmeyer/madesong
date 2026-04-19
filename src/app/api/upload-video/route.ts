import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { fileName, contentType } = await req.json();
    if (!fileName) return NextResponse.json({ error: "Kein Dateiname." }, { status: 400 });

    const ext = fileName.split(".").pop() || "mp4";
    const storagePath = `bg-videos/${nanoid()}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from("songs")
      .createSignedUploadUrl(storagePath);

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("songs")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      publicUrl,
      token: data.token,
      path: storagePath,
    });
  } catch (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json({ error: "Upload-URL konnte nicht erstellt werden." }, { status: 500 });
  }
}
