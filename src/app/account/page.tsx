import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { SignOutButton } from "@/components/account/SignOutButton";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const orders =
    session?.user?.email
      ? await prisma.order.findMany({
          where: {
            OR: [
              { userId: session.user.id },
              { email: session.user.email },
            ],
            status: { not: "PENDING" },
          },
          include: {
            items: {
              include: {
                watch: { include: { brand: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-playfair text-3xl mb-2">My Account</h1>
      <p className="text-wf-gray mb-8">
        Manage your profile, orders, and saved watches.
      </p>

      {session?.user ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="border border-wf-border p-6 bg-white">
              <h2 className="font-semibold mb-3">Profile</h2>
              <p className="text-sm text-wf-gray mb-1">Name</p>
              <p className="mb-3">{session.user.name || "Not set"}</p>
              <p className="text-sm text-wf-gray mb-1">Email</p>
              <p>{session.user.email}</p>
              {isAdmin && (
                <p className="mt-4 text-xs uppercase tracking-wider text-gold">
                  Administrator
                </p>
              )}
            </section>

            <section className="border border-wf-border p-6 bg-white">
              <h2 className="font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-3">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="btn-gold w-full text-center block text-sm"
                  >
                    Open Admin Panel
                  </Link>
                )}
                <Link
                  href="/wishlist"
                  className="btn-outline w-full text-center block text-sm"
                >
                  View Wishlist
                </Link>
                <Link
                  href="/watches"
                  className="btn-outline w-full text-center block text-sm"
                >
                  Continue Shopping
                </Link>
                <SignOutButton />
              </div>
            </section>
          </div>

          <section className="border border-wf-border p-6 bg-white">
            <h2 className="font-semibold mb-4">Order history</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-wf-gray">
                No orders yet.{" "}
                <Link href="/watches" className="text-gold hover:underline">
                  Browse watches
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-wf-border">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-wf-gray">
                        {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                        {order.items
                          .map(
                            (item) =>
                              `${item.watch.brand.name} ${item.watch.model}`
                          )
                          .join(", ")}
                      </p>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p>{formatPrice(order.total)}</p>
                      <p className="text-wf-gray">{order.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="border border-wf-border p-6 bg-white max-w-lg">
          <p className="text-wf-gray mb-6">
            Sign in or create an account to view your profile and order history.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/account/login" className="btn-gold">
              Sign in
            </Link>
            <Link href="/account/register" className="btn-outline">
              Create account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
