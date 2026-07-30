import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { WatchForm } from "@/components/admin/WatchForm";
import { getAllBrands } from "@/lib/watches";

interface PageProps {
  params: { id: string };
}

export default async function EditWatchPage({ params }: PageProps) {
  await requireAdminPage();

  const [watch, brands] = await Promise.all([
    prisma.watch.findUnique({
      where: { id: params.id },
      include: { images: true },
    }),
    getAllBrands(),
  ]);

  if (!watch) notFound();

  return (
    <div>
      <h1 className="font-playfair text-3xl mb-8">Edit Watch</h1>
      <WatchForm brands={brands} watch={watch} />
    </div>
  );
}
