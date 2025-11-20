"use client";

import { useEffect, useState } from "react";

interface Centre {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan_tier: string | null;
}

interface CentreSelectorProps {
  value: string | null;
  onChange: (centreId: string | null) => void;
}

export default function CentreSelector({ value, onChange }: CentreSelectorProps) {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/centres");
        if (!res.ok) throw new Error("Failed to load centres");
        const data = await res.json();
        setCentres(data.centres || []);
        // If no selection yet, try localStorage
        const last = localStorage.getItem("edusitepro_last_centre_id");
        if (!value && last && data.centres?.some((c: Centre) => c.id === last)) {
          onChange(last);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [onChange, value]);


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value || null;
    onChange(id);
    if (id) {
      localStorage.setItem("edusitepro_last_centre_id", id);
    } else {
      localStorage.removeItem("edusitepro_last_centre_id");
    }
  };

  if (loading) return <div className="p-2 text-xs text-stone-500">Loading centres…</div>;
  if (error) return <div className="p-2 text-xs text-red-600">{error}</div>;

  return (
    <div className="p-2">
      <label className="mb-1 block text-xs font-medium text-stone-600">Centre</label>
      <select
        value={value || ""}
        onChange={handleChange}
        className="w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
      >
        <option value="">Select a centre…</option>
        {centres.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.slug})
          </option>
        ))}
      </select>
    </div>
  );
}
