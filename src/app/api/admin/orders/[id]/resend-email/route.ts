import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { notifyOrderPaid } from "@/lib/notifications";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "PENDING") {
    return NextResponse.json(
      { error: "Order is still PENDING — wait for payment first" },
      { status: 400 }
    );
  }

  const result = await notifyOrderPaid(order.id);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Email failed" },
      { status: 502 }
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { confirmationEmailedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
