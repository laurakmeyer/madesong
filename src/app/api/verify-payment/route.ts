import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ paid: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const tier = session.metadata?.tier || "song";
    const shareSlug = session.metadata?.shareSlug || null;

    if (paid && shareSlug) {
      const { supabaseAdmin } = await import("@/lib/supabase");
      await supabaseAdmin
        .from("songs")
        .update({ paid_tier: tier })
        .eq("share_slug", shareSlug);
    }

    return NextResponse.json({ paid, tier, shareSlug });
  } catch {
    return NextResponse.json({ paid: false });
  }
}
