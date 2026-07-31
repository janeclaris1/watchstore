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
    return NextResponse.json({
      ok: true,
      database: meta,
      counts: { watches, brands },
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
