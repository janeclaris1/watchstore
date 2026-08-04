import Image from "next/image";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice, conditionLabel } from "@/lib/utils";
import { DeleteWatchButton } from "@/components/admin/DeleteWatchButton";

export default async function AdminWatchesPage() {
  await requireAdminPage();

  const watches = await prisma.watch.findMany({
    include: {
      brand: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
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
        <table className="w-full text-sm min-w-[880px]">
          <thead className="bg-wf-light">
            <tr>
              <th className="text-left p-3 font-medium w-16">Image</th>
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
            {watches.map((watch) => {
              const image = watch.images[0];
              return (
                <tr key={watch.id} className="border-t border-wf-border">
                  <td className="p-2 pl-3">
                    <Link
                      href={`/admin/watches/${watch.id}/edit`}
                      className="relative block w-14 h-14 bg-wf-light overflow-hidden border border-wf-border"
                    >
                      {image ? (
                        <Image
                          src={image.url}
                          alt={
                            image.alt ||
                            `${watch.brand.name} ${watch.model}`
                          }
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-wf-gray">
                          No image
                        </span>
                      )}
                    </Link>
                  </td>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
