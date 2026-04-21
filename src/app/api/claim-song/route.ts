import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const { shareSlug } = await req.json();

  if (!shareSlug) {
    return NextResponse.json({ error: "Fehlende Daten." }, { status: 400 });
  }

  // Get authenticated user
  let userId: string | null = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch {}

  if (!userId) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  // Only claim songs that don't have a user_id yet
  const { error } = await supabaseAdmin
    .from("songs")
    .update({ user_id: userId })
    .eq("share_slug", shareSlug)
    .is("user_id", null);

  if (error) {
    console.error("Claim song error:", error);
    return NextResponse.json({ error: "Song konnte nicht zugewiesen werden." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
