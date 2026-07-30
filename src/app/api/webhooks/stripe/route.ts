import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notifyOrderPaid } from "@/lib/notifications";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const existing = await prisma.order.findUnique({ where: { id: orderId } });
        if (existing && existing.status === "PENDING") {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              stripePaymentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
              shippingName: session.customer_details?.name || existing.shippingName,
              shippingAddress:
                session.customer_details?.address?.line1 || existing.shippingAddress,
              shippingCity:
                session.customer_details?.address?.city || existing.shippingCity,
              shippingPostcode:
                session.customer_details?.address?.postal_code ||
                existing.shippingPostcode,
              shippingCountry:
                session.customer_details?.address?.country || existing.shippingCountry,
            },
          });

          await notifyOrderPaid(orderId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
