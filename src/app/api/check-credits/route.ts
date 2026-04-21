import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
    return NextResponse.json({ credits: 0, hasPackage: false, hasFlat: false });
  }

  // Check for active paket with remaining credits
  const { data: paket } = await supabaseAdmin
    .from("user_packages")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "paket")
    .eq("active", true)
    .gt("credits_total", 0)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const paketCredits = paket ? paket.credits_total - paket.credits_used : 0;

  // Check for active flat subscription
  const { data: flat } = await supabaseAdmin
    .from("user_packages")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "flat")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const flatCredits = flat ? flat.credits_total - flat.credits_used : 0;
  const now = new Date();
  const flatActive = flat && flat.current_period_end && new Date(flat.current_period_end) > now;

  return NextResponse.json({
    credits: paketCredits + (flatActive ? flatCredits : 0),
    hasPackage: paketCredits > 0,
    hasFlat: !!flatActive && flatCredits > 0,
    paketCredits,
    flatCredits: flatActive ? flatCredits : 0,
  });
}
