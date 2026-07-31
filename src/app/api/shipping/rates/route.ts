import { NextResponse } from "next/server";
import { fetchLiveShippingRates } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, email } = body || {};

    if (!address?.street1 || !address?.city || !address?.postcode || !address?.country) {
      return NextResponse.json(
        { error: "Shipping address is required to quote rates" },
        { status: 400 }
      );
    }

    const result = await fetchLiveShippingRates({
      name: address.name,
      street1: address.street1,
      street2: address.street2,
      city: address.city,
      state: address.state,
      zip: address.postcode,
      country: address.country,
      phone: address.phone,
      email,
    });

    return NextResponse.json({
      rates: result.rates,
      source: result.source,
      warning: result.source === "fallback" ? result.error : undefined,
    });
  } catch (error) {
    console.error("[api/shipping/rates]", error);
    return NextResponse.json({ error: "Failed to fetch shipping rates" }, { status: 500 });
  }
}
