import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ paid: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const tier = session.metadata?.tier || "song";
    const shareSlug = session.metadata?.shareSlug || null;
    return NextResponse.json({ paid, tier, shareSlug });
  } catch {
    return NextResponse.json({ paid: false });
  }
}
