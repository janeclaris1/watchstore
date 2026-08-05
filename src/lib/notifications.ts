import { prisma } from "./prisma";
import { formatPrice } from "./utils";
import { resolveTrackingUrl } from "./order-tracking";

const FROM_EMAIL = normalizeFromEmail(
  process.env.EMAIL_FROM || "COSY AURA WATCH STORE <onboarding@resend.dev>"
);
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";
const PLACEHOLDER_CHECKOUT_EMAIL = "pending@checkout.cosyaura.us";

/** Resend rejects `Name<email>` — require `Name <email>`. */
function normalizeFromEmail(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.replace(/([^\s<])</, "$1 <");
}

function extractEmailAddress(value: string): string | null {
  const trimmed = value.trim();
  const bracketMatch = trimmed.match(/<([^>]+)>/);
  if (bracketMatch?.[1]) return bracketMatch[1].trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return trimmed;
  return null;
}

export function getAdminNotificationEmails(): string[] {
  const raw =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "admin@cosyaura.us";

  const emails = raw
    .split(/[,;]/)
    .map((entry) => extractEmailAddress(entry) || entry.trim())
    .filter((entry) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry));

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const email of emails) {
    const lower = email.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    unique.push(email);
  }
  return unique;
}

type OrderWithItems = {
  id: string;
  email: string;
  total: number;
  status: string;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingPostcode: string | null;
  shippingCountry: string | null;
  items: {
    price: number;
    quantity: number;
    watch: { model: string; reference: string; brand: { name: string } };
  }[];
};

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = (Array.isArray(to) ? to : [to])
    .map((entry) => extractEmailAddress(entry) || entry.trim())
    .filter((entry) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry));

  if (recipients.length === 0) {
    return { ok: false, error: "No valid email recipients" };
  }

  if (!apiKey) {
    // Never pretend mail was sent — that previously marked orders as emailed
    // on production when RESEND_API_KEY was missing.
    if (process.env.EMAIL_DEV_LOG === "true") {
      console.log("[email:dev]", { to, subject, html: html.slice(0, 200) });
      return { ok: true };
    }
    console.error("[email] RESEND_API_KEY is not configured");
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipients,
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      console.error("[email] Resend failed:", bodyText);
      return { ok: false, error: bodyText.slice(0, 300) };
    }
    try {
      const parsed = JSON.parse(bodyText) as { id?: string };
      if (parsed.id) {
        console.log("[email] Resend accepted:", parsed.id, "→", recipients.join(", "));
      }
    } catch {
      /* ignore */
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] send failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "send failed",
    };
  }
}

export async function createAdminNotification(input: {
  type: string;
  title: string;
  message: string;
  link?: string;
  orderId?: string;
}) {
  return prisma.adminNotification.create({ data: input });
}

function orderItemsHtml(order: OrderWithItems) {
  return order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${item.watch.brand.name} ${item.watch.model}<br/>
            <span style="color:#666;font-size:12px;">Ref. ${item.watch.reference}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">
            ${formatPrice(item.price)} × ${item.quantity}
          </td>
        </tr>`
    )
    .join("");
}

function emailShell(title: string, body: string) {
  return `<!DOCTYPE html>
<html><body style="font-family:Georgia,serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;">
  <p style="letter-spacing:2px;font-size:14px;color:#B8860B;margin:0 0 8px;">COSY AURA WATCH STORE</p>
  <h1 style="font-size:24px;margin:0 0 16px;">${title}</h1>
  ${body}
  <p style="margin-top:32px;font-size:12px;color:#666;">Questions? Reply to this email or visit ${SITE_URL}/contact</p>
</body></html>`;
}

export async function notifyOrderPaid(
  orderId: string
): Promise<{
  ok: boolean;
  customerOk: boolean;
  adminOk: boolean;
  error?: string;
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { watch: { include: { brand: true } } } },
    },
  });
  if (!order) {
    return { ok: false, customerOk: false, adminOk: false, error: "Order not found" };
  }

  if (
    !order.email ||
    order.email === PLACEHOLDER_CHECKOUT_EMAIL ||
    !order.email.includes("@")
  ) {
    return {
      ok: false,
      customerOk: false,
      adminOk: false,
      error: "Order has no real customer email yet",
    };
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const adminLink = `${SITE_URL}/admin/orders/${order.id}`;
  const adminEmails = getAdminNotificationEmails();

  await createAdminNotification({
    type: "ORDER_PAID",
    title: `New paid order #${shortId}`,
    message: `${order.email} - ${formatPrice(order.total)} · ${order.items.length} item(s)`,
    link: `/admin/orders/${order.id}`,
    orderId: order.id,
  });

  const adminHtml = emailShell(
    `New paid order #${shortId}`,
    `<p>Customer: <strong>${order.email}</strong></p>
     <p>Total: <strong>${formatPrice(order.total)}</strong></p>
     <table style="width:100%;border-collapse:collapse;">${orderItemsHtml(order)}</table>
     <p style="margin-top:20px;"><a href="${adminLink}" style="background:#B8860B;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;">View order</a></p>`
  );

  const customerHtml = emailShell(
    "Thank you for your order",
    `<p>We've received your payment and are preparing your watch for dispatch.</p>
     <p>Order reference: <strong>#${shortId}</strong></p>
     <p>Total: <strong>${formatPrice(order.total)}</strong></p>
     <table style="width:100%;border-collapse:collapse;">${orderItemsHtml(order)}</table>
     <p style="margin-top:16px;">You'll receive another email when your order ships.</p>
     <p style="margin-top:8px;"><a href="${SITE_URL}/track?ref=${shortId}&email=${encodeURIComponent(
       order.email
     )}" style="color:#B8860B;">Track your order</a></p>`
  );

  const customerResult = await sendEmail({
    to: order.email,
    subject: `Order confirmed #${shortId} - COSY AURA WATCH STORE`,
    html: customerHtml,
  });

  let adminResult = await sendEmail({
    to: adminEmails,
    replyTo: order.email,
    subject: `New order #${shortId} - ${formatPrice(order.total)}`,
    html: adminHtml,
  });

  if (!adminResult.ok) {
    console.warn("[email] admin notification failed, retrying once:", adminResult.error);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    adminResult = await sendEmail({
      to: adminEmails,
      replyTo: order.email,
      subject: `New order #${shortId} - ${formatPrice(order.total)}`,
      html: adminHtml,
    });
  }

  if (!customerResult.ok) {
    console.error("[email] customer confirmation failed:", customerResult.error);
    return {
      ok: false,
      customerOk: false,
      adminOk: adminResult.ok,
      error: customerResult.error || "Customer email failed",
    };
  }

  if (!adminResult.ok) {
    console.error(
      "[email] admin notification failed:",
      adminResult.error,
      "recipients:",
      adminEmails.join(", ")
    );
    return {
      ok: false,
      customerOk: true,
      adminOk: false,
      error: adminResult.error || "Admin email failed",
    };
  }

  return { ok: true, customerOk: true, adminOk: true };
}

export async function notifyOrderStatusChange(
  orderId: string,
  status: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { watch: { include: { brand: true } } } },
    },
  });
  if (!order) return;

  const shortId = order.id.slice(0, 8).toUpperCase();
  const messages: Record<string, { subject: string; body: string }> = {
    PROCESSING: {
      subject: `Order #${shortId} is being prepared`,
      body: `<p>Your order is now being prepared for dispatch.</p>`,
    },
    SHIPPED: {
      subject: `Order #${shortId} has shipped`,
      body: `<p>Great news - your watch is on its way.</p>
        ${
          order.trackingNumber
            ? `<p>Tracking number: <strong>${order.trackingNumber}</strong>${
                order.carrier ? ` (${order.carrier})` : ""
              }</p>`
            : ""
        }
        ${
          resolveTrackingUrl(order)
            ? `<p><a href="${resolveTrackingUrl(order)}" style="color:#B8860B;">Track with carrier</a></p>`
            : ""
        }
        <p><a href="${SITE_URL}/track?ref=${shortId}&email=${encodeURIComponent(
          order.email
        )}" style="color:#B8860B;">View order status</a></p>`,
    },
    DELIVERED: {
      subject: `Order #${shortId} delivered`,
      body: `<p>Your order has been marked as delivered. We hope you enjoy your new timepiece.</p>`,
    },
    CANCELLED: {
      subject: `Order #${shortId} cancelled`,
      body: `<p>Your order has been cancelled. If you did not request this, please contact us.</p>`,
    },
    REFUNDED: {
      subject: `Refund for order #${shortId}`,
      body: `<p>A refund has been processed for your order. Funds typically appear within 5–10 business days.</p>`,
    },
  };

  const content = messages[status];
  if (!content) return;

  await sendEmail({
    to: order.email,
    subject: content.subject,
    html: emailShell(
      content.subject,
      `${content.body}
       <p>Order total: <strong>${formatPrice(order.total)}</strong></p>
       <table style="width:100%;border-collapse:collapse;">${orderItemsHtml(order)}</table>`
    ),
  });
}

export async function notifyContactEnquiry(enquiry: {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await createAdminNotification({
    type: "CONTACT",
    title: `Contact: ${enquiry.subject}`,
    message: `${enquiry.name} (${enquiry.email})`,
    link: `/admin/enquiries`,
  });

  await sendEmail({
    to: getAdminNotificationEmails(),
    subject: `[Contact] ${enquiry.subject}`,
    html: emailShell(
      "New contact enquiry",
      `<p><strong>${enquiry.name}</strong> &lt;${enquiry.email}&gt;</p>
       <p>${enquiry.message.replace(/\n/g, "<br/>")}</p>
       <p><a href="${SITE_URL}/admin/enquiries">View enquiries</a></p>`
    ),
  });
}
