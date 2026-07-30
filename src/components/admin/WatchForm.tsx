"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface WatchFormProps {
  brands: Brand[];
  watch?: {
    id: string;
    brandId: string;
    model: string;
    reference: string;
    slug: string;
    description: string;
    conditionReport: string | null;
    price: number;
    condition: string;
    year: number | null;
    movement: string;
    caseMaterial: string;
    caseSize: string | null;
    strapMaterial: string;
    dial: string | null;
    waterResistance: string | null;
    gender: string;
    hasBox: boolean;
    hasPapers: boolean;
    featured: boolean;
    category: string | null;
    images: { url: string }[];
  };
}

const CATEGORIES = ["Sport Watches", "Dress Watches", "Dive Watches"];

export function WatchForm({ brands, watch }: WatchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    brandId: watch?.brandId || brands[0]?.id || "",
    model: watch?.model || "",
    reference: watch?.reference || "",
    description: watch?.description || "",
    conditionReport: watch?.conditionReport || "",
    price: watch?.price || 0,
    condition: watch?.condition || "UNWORN",
    year: watch?.year || new Date().getFullYear(),
    movement: watch?.movement || "AUTOMATIC",
    caseMaterial: watch?.caseMaterial || "STEEL",
    caseSize: watch?.caseSize || "",
    strapMaterial: watch?.strapMaterial || "METAL",
    dial: watch?.dial || "",
    waterResistance: watch?.waterResistance || "",
    gender: watch?.gender || "UNISEX",
    hasBox: watch?.hasBox || false,
    hasPapers: watch?.hasPapers || false,
    featured: watch?.featured || false,
    category: watch?.category || "Sport Watches",
    imageUrl: watch?.images[0]?.url || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url = watch ? `/api/admin/watches/${watch.id}` : "/api/admin/watches";
    const method = watch ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin/watches");
      router.refresh();
    } else {
      alert("Failed to save watch");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!watch) return;
    if (!confirm("Delete this watch permanently?")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/watches/${watch.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/watches");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Delete failed");
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-wf-border rounded text-sm focus:outline-none focus:border-gold bg-white";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-wf-border rounded-lg p-6 max-w-2xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Brand</label>
          <select
            value={form.brandId}
            onChange={(e) => setForm({ ...form, brandId: e.target.value })}
            className={inputClass}
            required
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Model</label>
          <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputClass} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Reference</label>
          <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Price ($)</label>
          <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className={inputClass}
          >
            <option value="MENS">Men&apos;s</option>
            <option value="WOMENS">Women&apos;s</option>
            <option value="UNISEX">Unisex</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={4} required />
      </div>

      <div>
        <label className={labelClass}>Condition Report</label>
        <textarea value={form.conditionReport} onChange={(e) => setForm({ ...form, conditionReport: e.target.value })} className={inputClass} rows={3} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Condition</label>
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputClass}>
            <option value="UNWORN">New</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Movement</label>
          <select value={form.movement} onChange={(e) => setForm({ ...form, movement: e.target.value })} className={inputClass}>
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
            <option value="QUARTZ">Quartz</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Case Material</label>
          <select value={form.caseMaterial} onChange={(e) => setForm({ ...form, caseMaterial: e.target.value })} className={inputClass}>
            <option value="STEEL">Steel</option>
            <option value="GOLD">Gold</option>
            <option value="PLATINUM">Platinum</option>
            <option value="TWO_TONE">Two-Tone</option>
            <option value="TITANIUM">Titanium</option>
            <option value="CERAMIC">Ceramic</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Case Size</label>
          <input value={form.caseSize} onChange={(e) => setForm({ ...form, caseSize: e.target.value })} className={inputClass} placeholder="41mm" />
        </div>
        <div>
          <label className={labelClass}>Strap Material</label>
          <select value={form.strapMaterial} onChange={(e) => setForm({ ...form, strapMaterial: e.target.value })} className={inputClass}>
            <option value="METAL">Metal</option>
            <option value="LEATHER">Leather</option>
            <option value="RUBBER">Rubber</option>
            <option value="FABRIC">Fabric</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Dial</label>
          <input value={form.dial} onChange={(e) => setForm({ ...form, dial: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Water Resistance</label>
          <input value={form.waterResistance} onChange={(e) => setForm({ ...form, waterResistance: e.target.value })} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Image URL</label>
        <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputClass} placeholder="/images/watches/..." />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.hasBox} onChange={(e) => setForm({ ...form, hasBox: e.target.checked })} className="rounded text-gold" />
          Has Box
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.hasPapers} onChange={(e) => setForm({ ...form, hasPapers: e.target.checked })} className="rounded text-gold" />
          Has Papers
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded text-gold" />
          Featured
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-gold disabled:opacity-50">
          {loading ? "Saving..." : watch ? "Update Watch" : "Create Watch"}
        </button>
        {watch && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-outline text-red-600 border-red-200 hover:border-red-500 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Watch"}
          </button>
        )}
      </div>
    </form>
  );
}
