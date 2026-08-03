import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { FALLBACK_SHIPPING_RATES } from "@/lib/shipping";
import { COUNTRIES } from "@/lib/countries";

function toAbsoluteImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (!base || base.includes("localhost")) return null;
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

/**
 * Stripe Checkout shipping_address_collection only accepts this set.
 * (Excludes sanctions / unsupported codes like CU, IR, KP, SY, etc.)
 */
const STRIPE_SHIPPING_COUNTRY_CODES = new Set([
  "AC","AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS",
  "BT","BV","BW","BY","BZ","CA","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO",
  "CR","CV","CW","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER",
  "ES","ET","FI","FJ","FK","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL",
  "GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HN","HR","HT","HU","ID",
  "IE","IL","IM","IN","IO","IQ","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI",
  "KM","KN","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV",
  "LY","MA","MC","MD","ME","MF","MG","MK","ML","MM","MN","MO","MQ","MR","MS","MT",
  "MU","MV","MW","MX","MY","MZ","NA","NC","NE","NG","NI","NL","NO","NP","NR","NU",
  "NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PY","QA",
  "RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL",
  "SM","SN","SO","SR","SS","ST","SV","SX","SZ","TA","TC","TD","TF","TG","TH","TJ",
  "TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","US","UY","UZ","VA",
  "VC","VE","VG","VN","VU","WF","WS","XK","YE","YT","ZA","ZM","ZW","ZZ",
]);

function allowedShippingCountries(): string[] {
  return COUNTRIES.map((c) => c.code).filter((code) =>
    STRIPE_SHIPPING_COUNTRY_CODES.has(code)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
      return NextResponse.json(
        {
          error:
            "Stripe is misconfigured. Set STRIPE_SECRET_KEY to your secret key (sk_...).",
        },
        { status: 503 }
      );
    }

    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const itemsTotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Provisional order — email/shipping filled from Stripe session on payment
    const order = await prisma.order.create({
      data: {
        email: "pending@checkout.cosyaura.us",
        total: itemsTotal,
        shippingMethod: null,
        shippingCost: 0,
        items: {
          create: items.map(
            (item: { watchId: string; price: number; quantity: number }) => ({
              watchId: item.watchId,
              price: item.price,
              quantity: item.quantity,
            })
          ),
        },
      },
    });

    const lineItems = await Promise.all(
      items.map(
        async (item: { watchId: string; quantity: number; price: number }) => {
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
                description: watch?.reference
                  ? `Ref. ${watch.reference}`
                  : undefined,
                ...(imageUrl ? { images: [imageUrl] } : {}),
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          };
        }
      )
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: lineItems,
      // Full Checkout form: email, shipping address, shipping method, payment
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: allowedShippingCountries() as never[],
      },
      shipping_options: FALLBACK_SHIPPING_RATES.map((rate) => ({
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: {
            amount: Math.round(rate.price * 100),
            currency: "usd",
          },
          display_name: `${rate.name} · ${rate.eta}`,
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 2 },
            maximum: {
              unit: "business_day" as const,
              value: Math.max(rate.deliveryDays || 8, 3),
            },
          },
        },
      })),
      return_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: order.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "Stripe did not return a client secret for embedded checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Checkout failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
