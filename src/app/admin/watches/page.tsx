import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice, conditionLabel } from "@/lib/utils";
import { DeleteWatchButton } from "@/components/admin/DeleteWatchButton";

export default async function AdminWatchesPage() {
  await requireAdminPage();

  const watches = await prisma.watch.findMany({
    include: { brand: true, images: { take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair text-3xl">Watches</h1>
        <Link href="/admin/watches/new" className="btn-gold">
          Add Watch
        </Link>
      </div>

      <div className="border border-wf-border rounded-lg overflow-hidden bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-wf-light">
            <tr>
              <th className="text-left p-3 font-medium">Brand</th>
              <th className="text-left p-3 font-medium">Model</th>
              <th className="text-left p-3 font-medium">Reference</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Condition</th>
              <th className="text-left p-3 font-medium">Featured</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {watches.map((watch) => (
              <tr key={watch.id} className="border-t border-wf-border">
                <td className="p-3">{watch.brand.name}</td>
                <td className="p-3">{watch.model}</td>
                <td className="p-3 text-wf-gray">{watch.reference}</td>
                <td className="p-3 text-wf-gray">{watch.category || "-"}</td>
                <td className="p-3">{formatPrice(watch.price)}</td>
                <td className="p-3">{conditionLabel(watch.condition)}</td>
                <td className="p-3">{watch.featured ? "Yes" : "No"}</td>
                <td className="p-3 space-x-3">
                  <Link
                    href={`/admin/watches/${watch.id}/edit`}
                    className="text-gold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteWatchButton id={watch.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
