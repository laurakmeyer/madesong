import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";

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

    // Get user ID from cookies
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

    if (paid && tier === "paket" && userId) {
      // Check if this session was already processed
      const { data: existing } = await supabaseAdmin
        .from("user_packages")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "paket")
        .gte("created_at", new Date(Date.now() - 60000).toISOString())
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabaseAdmin.from("user_packages").insert({
          user_id: userId,
          type: "paket",
          credits_total: 5,
          credits_used: 0,
          active: true,
        });
      }

      return NextResponse.json({ paid: true, tier: "paket", redirect: "/dashboard" });
    }

    if (paid && tier === "flat" && userId) {
      // Get subscription details
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as { current_period_end: number };

      const { data: existing } = await supabaseAdmin
        .from("user_packages")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "flat")
        .eq("stripe_subscription_id", subscriptionId)
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabaseAdmin.from("user_packages").insert({
          user_id: userId,
          type: "flat",
          credits_total: 20,
          credits_used: 0,
          active: true,
          stripe_subscription_id: subscriptionId,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
      }

      return NextResponse.json({ paid: true, tier: "flat", redirect: "/dashboard" });
    }

    // Single song payment
    if (paid && shareSlug) {
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
