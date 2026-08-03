import type Stripe from "stripe";
import { prisma } from "./prisma";
import { notifyOrderPaid } from "./notifications";

/**
 * Marks a PENDING order as PAID from a completed Stripe Checkout Session
 * and sends confirmation emails. Safe to call more than once.
 */
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ ok: boolean; reason?: string; orderId?: string }> {
  if (session.status !== "complete" && session.payment_status !== "paid") {
    return { ok: false, reason: "Session not paid" };
  }

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return { ok: false, reason: "Missing orderId metadata" };
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    return { ok: false, reason: "Order not found", orderId };
  }

  if (existing.status !== "PENDING") {
    return { ok: true, reason: "Already fulfilled", orderId };
  }

  const shippingDetails =
    session.shipping_details ||
    (
      session as {
        collected_information?: {
          shipping_details?: Stripe.Checkout.Session.ShippingDetails | null;
        };
      }
    ).collected_information?.shipping_details;

  const shippingAmount =
    session.shipping_cost?.amount_total != null
      ? session.shipping_cost.amount_total / 100
      : existing.shippingCost;

  const shippingRate = session.shipping_cost?.shipping_rate;
  const shippingMethod =
    shippingRate && typeof shippingRate === "object"
      ? shippingRate.display_name || existing.shippingMethod
      : existing.shippingMethod;

  const email =
    session.customer_details?.email ||
    session.customer_email ||
    existing.email;

  const paidTotal =
    session.amount_total != null ? session.amount_total / 100 : existing.total;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      email,
      total: paidTotal,
      shippingCost: shippingAmount,
      shippingMethod: shippingMethod || "Stripe shipping",
      stripeSessionId: session.id,
      stripePaymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      shippingName:
        shippingDetails?.name ||
        session.customer_details?.name ||
        existing.shippingName,
      shippingAddress:
        shippingDetails?.address?.line1 || existing.shippingAddress,
      shippingCity: shippingDetails?.address?.city || existing.shippingCity,
      shippingPostcode:
        shippingDetails?.address?.postal_code || existing.shippingPostcode,
      shippingCountry:
        shippingDetails?.address?.country || existing.shippingCountry,
    },
  });

  await notifyOrderPaid(orderId);
  return { ok: true, orderId };
}
