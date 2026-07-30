"use client";

export function OrderStatusSelect({
  orderId,
  status,
  redirectTo = "/admin/orders",
}: {
  orderId: string;
  status: string;
  redirectTo?: string;
}) {
  return (
    <form action={`/api/admin/orders/${orderId}`} method="POST">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => {
          const form = e.target.closest("form");
          if (form) form.requestSubmit();
        }}
        className="text-xs border border-wf-border rounded px-2 py-1 bg-white"
      >
        <option value="PENDING">Pending</option>
        <option value="PAID">Paid</option>
        <option value="PROCESSING">Processing</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="REFUNDED">Refunded</option>
      </select>
    </form>
  );
}
