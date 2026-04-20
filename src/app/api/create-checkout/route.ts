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

  const isSongVideo = tier === "song_video";
  const price = isSongVideo ? 499 : 399; // in Cent
  const productName = isSongVideo
    ? `MadeSong für ${recipientName} — Song + Story-Video`
    : `MadeSong für ${recipientName} — Song freischalten`;

  const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://madesong.com";

  console.log("Checkout origin:", origin);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
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
        },
      ],
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
