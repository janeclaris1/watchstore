import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function toAbsoluteImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (!base || base.includes("localhost")) return null;
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email, shipping } = body;

    if (!items?.length || !email) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
      console.error(
        "Checkout error: STRIPE_SECRET_KEY must be a secret key starting with sk_test_ or sk_live_"
      );
      return NextResponse.json(
        {
          error:
            "Stripe is misconfigured. Set STRIPE_SECRET_KEY to your secret key (sk_...).",
        },
        { status: 503 }
      );
    }

    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        email,
        total,
        shippingName: shipping?.name,
        shippingAddress: shipping?.address,
        shippingCity: shipping?.city,
        shippingPostcode: shipping?.postcode,
        shippingCountry: shipping?.country,
        items: {
          create: items.map((item: { watchId: string; price: number; quantity: number }) => ({
            watchId: item.watchId,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const lineItems = await Promise.all(
      items.map(async (item: { watchId: string; quantity: number; price: number }) => {
        const watch = await prisma.watch.findUnique({
          where: { id: item.watchId },
          include: { brand: true, images: true },
        });
        const imageUrl = toAbsoluteImageUrl(watch?.images[0]?.url);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: watch ? `${watch.brand.name} ${watch.model}` : "Watch",
              ...(imageUrl ? { images: [imageUrl] } : {}),
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      })
    );

    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: email,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Checkout failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
