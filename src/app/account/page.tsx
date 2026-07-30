import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-playfair text-3xl mb-2">My Account</h1>
      <p className="text-wf-gray mb-8">
        Manage your profile, orders, and saved watches.
      </p>

      {session?.user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="border border-wf-border rounded-lg p-6 bg-white">
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

          <section className="border border-wf-border rounded-lg p-6 bg-white">
            <h2 className="font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-3">
              {isAdmin && (
                <Link href="/admin" className="btn-gold w-full text-center block text-sm">
                  Open Admin Panel
                </Link>
              )}
              <Link href="/wishlist" className="btn-outline w-full text-center block text-sm">
                View Wishlist
              </Link>
              <Link href="/cart" className="btn-outline w-full text-center block text-sm">
                View Cart
              </Link>
              <Link
                href="/watches"
                className={`${isAdmin ? "btn-outline" : "btn-gold"} w-full text-center block text-sm`}
              >
                Continue Shopping
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <div className="border border-wf-border rounded-lg p-6 bg-white">
          <p className="text-wf-gray mb-6">
            You are not signed in yet. Sign in to access your account details.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/login" className="btn-gold">
              Admin Sign In
            </Link>
            <Link href="/watches" className="btn-outline">
              Browse Watches
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
