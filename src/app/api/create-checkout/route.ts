import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    return NextResponse.json({ error: "Stripe ist nicht konfiguriert (Env-Var fehlt)" }, { status: 500 });
  }
  const stripe = new Stripe(secretKey);
  const { tier, shareSlug, recipientName } = await req.json();

  const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://madesong.com";

  try {
    // Paket: 5 Songs for €19.99
    if (tier === "paket") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card", "paypal", "klarna"],
        allow_promotion_codes: true,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: 1999,
            product_data: {
              name: "MadeSong Paket — 5 Songs",
              description: "5 personalisierte Songs · Song + Video · Foto als Hintergrund",
            },
          },
        }],
        metadata: { tier: "paket", shareSlug: shareSlug || "" },
        success_url: `${origin}/dashboard?package_success=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/#preise`,
      });
      return NextResponse.json({ url: session.url });
    }

    // Flat: €34.99/month subscription
    if (tier === "flat") {
      // Create or reuse a Stripe price for the flat subscription
      const prices = await stripe.prices.list({
        lookup_keys: ["madesong_flat_monthly"],
        active: true,
      });

      let priceId: string;
      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        const product = await stripe.products.create({
          name: "MadeSong Flat — 20 Songs/Monat",
          description: "Bis zu 20 personalisierte Songs pro Monat · Song + Video · Foto als Hintergrund",
        });
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 3499,
          currency: "eur",
          recurring: { interval: "month" },
          lookup_key: "madesong_flat_monthly",
        });
        priceId = price.id;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        allow_promotion_codes: true,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { tier: "flat", shareSlug: shareSlug || "" },
        success_url: `${origin}/dashboard?package_success=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/#preise`,
      });
      return NextResponse.json({ url: session.url });
    }

    // Single song or song_video
    const isSongVideo = tier === "song_video";
    const price = isSongVideo ? 499 : 399;
    const productName = isSongVideo
      ? `MadeSong für ${recipientName} — Song + Story-Video`
      : `MadeSong für ${recipientName} — Song freischalten`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "paypal", "klarna"],
      allow_promotion_codes: true,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: price,
          product_data: {
            name: productName,
            description: isSongVideo
              ? "MP3-Download · Dauerhafter Teilen-Link · Story-Video als MP4"
              : "MP3-Download · Dauerhafter Teilen-Link",
          },
        },
      }],
      metadata: { shareSlug, tier },
      success_url: `${origin}/?payment_success=1&session_id={CHECKOUT_SESSION_ID}&slug=${shareSlug}&tier=${tier}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Stripe error:", msg);
    return NextResponse.json({ error: `Checkout fehlgeschlagen: ${msg}` }, { status: 500 });
  }
}
