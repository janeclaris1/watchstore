import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email, shipping } = body;

    if (!items?.length || !email) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: watch ? `${watch.brand.name} ${watch.model}` : "Watch",
              images: watch?.images[0]?.url ? [watch.images[0].url] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      })
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
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
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
