import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();

  const watch = await prisma.watch.update({
    where: { id: params.id },
    data: {
      brandId: body.brandId,
      model: body.model,
      reference: body.reference,
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
    },
  });

  if (body.imageUrl) {
    await prisma.watchImage.deleteMany({ where: { watchId: params.id } });
    await prisma.watchImage.create({
      data: { watchId: params.id, url: body.imageUrl, isPrimary: true, sortOrder: 0 },
    });
  }

  return NextResponse.json(watch);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const orderItems = await prisma.orderItem.count({ where: { watchId: params.id } });
  if (orderItems > 0) {
    return NextResponse.json(
      { error: "Cannot delete a watch that appears in orders" },
      { status: 400 }
    );
  }

  await prisma.watch.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
