import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/fulfill-order";

/**
 * Backup to Stripe webhooks: verify a Checkout Session after redirect
 * and fulfill the order (mark PAID + send emails) if needed.
 */
export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const body = await req.json();
    const sessionId = String(body.sessionId || "").trim();
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["shipping_cost.shipping_rate", "payment_intent"],
    });

    const result = await fulfillCheckoutSession(session);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[checkout/fulfill]", error);
    const message =
      error instanceof Error ? error.message : "Fulfillment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
