import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const brand = await prisma.brand.findUnique({ where: { id: body.brandId } });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 400 });
  }

  const slug = slugify(`${brand.name}-${body.model}-${body.reference}`);

  const watch = await prisma.watch.create({
    data: {
      brandId: body.brandId,
      model: body.model,
      reference: body.reference,
      slug,
      description: body.description,
      conditionReport: body.conditionReport,
      price: body.price,
      condition: body.condition,
      year: body.year,
      movement: body.movement,
      caseMaterial: body.caseMaterial,
      caseSize: body.caseSize,
      strapMaterial: body.strapMaterial,
      dial: body.dial,
      waterResistance: body.waterResistance,
      gender: body.gender,
      hasBox: body.hasBox,
      hasPapers: body.hasPapers,
      featured: body.featured,
      category: body.category || null,
      images: body.imageUrl
        ? { create: [{ url: body.imageUrl, isPrimary: true, sortOrder: 0 }] }
        : undefined,
    },
  });

  return NextResponse.json(watch);
}
