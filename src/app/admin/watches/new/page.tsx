import { requireAdminPage } from "@/lib/admin";
import { WatchForm } from "@/components/admin/WatchForm";
import { getAllBrands } from "@/lib/watches";

export default async function NewWatchPage() {
  await requireAdminPage();
  const brands = await getAllBrands();

  return (
    <div>
      <h1 className="font-playfair text-3xl mb-8">Add New Watch</h1>
      <WatchForm brands={brands} />
    </div>
  );
}
