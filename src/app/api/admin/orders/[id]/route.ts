import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { notifyOrderStatusChange } from "@/lib/notifications";
import type { OrderStatus } from "@prisma/client";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const contentType = req.headers.get("content-type") || "";
  let status: string | null = null;

  if (contentType.includes("application/json")) {
    const body = await req.json();
    status = body.status;
  } else {
    const formData = await req.formData();
    status = formData.get("status") as string;
  }

  if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: status as OrderStatus },
  });

  if (existing.status !== updated.status) {
    await notifyOrderStatusChange(updated.id, updated.status);
  }

  return NextResponse.json(updated);
}
