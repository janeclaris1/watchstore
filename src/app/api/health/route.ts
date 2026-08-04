import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL || "";
  const meta = {
    provider: url.startsWith("mongodb")
      ? "mongodb"
      : url.startsWith("postgres")
        ? "postgres"
        : url
          ? "other"
          : "missing",
    hasWatchstoreDb: url.includes("/watchstore") || url.includes("/neondb"),
    host: (() => {
      try {
        return new URL(
          url.replace(/^mongodb\+srv/, "https").replace(/^mongodb:/, "http:")
        ).host;
      } catch {
        return null;
      }
    })(),
  };

  try {
    const [watches, brands] = await Promise.all([
      prisma.watch.count(),
      prisma.brand.count(),
    ]);

    const from = (process.env.EMAIL_FROM || "").trim();
    const fromOk = /^.+\s<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/.test(from);

    return NextResponse.json({
      ok: true,
      database: meta,
      counts: { watches, brands },
      email: {
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
        fromConfigured: Boolean(from),
        fromFormatOk: from ? fromOk : false,
        adminNotificationConfigured: Boolean(
          process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL
        ),
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || null,
      },
      stripe: {
        secretConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_")),
        webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        publishableConfigured: Boolean(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_")
        ),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[health] database error:", message);
    return NextResponse.json(
      {
        ok: false,
        database: meta,
        error: message.slice(0, 300),
      },
      { status: 503 }
    );
  }
}
