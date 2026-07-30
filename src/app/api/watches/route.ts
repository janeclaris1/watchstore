import { NextResponse } from "next/server";
import { getWatches, parseWatchListFilters } from "@/lib/watches";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean);

  if (ids?.length) {
    const watches = await prisma.watch.findMany({
      where: { id: { in: ids } },
      include: { brand: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    return NextResponse.json({ watches });
  }

  const filters = parseWatchListFilters(searchParams);
  const result = await getWatches(filters);

  return NextResponse.json(result);
}
