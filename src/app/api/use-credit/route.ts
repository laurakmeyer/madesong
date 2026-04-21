import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const { shareSlug, tier } = await req.json();

  if (!shareSlug) {
    return NextResponse.json({ error: "Fehlende Daten." }, { status: 400 });
  }

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

  // Try to use a paket credit first, then flat
  const now = new Date().toISOString();

  // 1. Check paket
  const { data: paket } = await supabaseAdmin
    .from("user_packages")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "paket")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  let usedPackageId: string | null = null;

  if (paket && paket.credits_used < paket.credits_total) {
    const { error } = await supabaseAdmin
      .from("user_packages")
      .update({
        credits_used: paket.credits_used + 1,
        active: paket.credits_used + 1 >= paket.credits_total ? false : true,
      })
      .eq("id", paket.id)
      .eq("credits_used", paket.credits_used); // optimistic lock

    if (!error) usedPackageId = paket.id;
  }

  // 2. If no paket, check flat
  if (!usedPackageId) {
    const { data: flat } = await supabaseAdmin
      .from("user_packages")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "flat")
      .eq("active", true)
      .gt("current_period_end", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (flat && flat.credits_used < flat.credits_total) {
      const { error } = await supabaseAdmin
        .from("user_packages")
        .update({ credits_used: flat.credits_used + 1 })
        .eq("id", flat.id)
        .eq("credits_used", flat.credits_used);

      if (!error) usedPackageId = flat.id;
    }
  }

  if (!usedPackageId) {
    return NextResponse.json({ error: "Keine Credits verfügbar." }, { status: 403 });
  }

  // Mark song as paid
  const paidTier = tier === "song_video" ? "song_video" : "song_video"; // Paket/Flat users always get video
  await supabaseAdmin
    .from("songs")
    .update({ paid_tier: paidTier, user_id: userId })
    .eq("share_slug", shareSlug);

  return NextResponse.json({ success: true, tier: paidTier });
}
