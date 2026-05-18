import AdminLayout from "@/components/layout/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
async function adminFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

type CityRow = { name: string; property_count: number; is_active: boolean };

export default function AdminCitiesPage() {
  const qc = useQueryClient();

  const { data: cities, isLoading } = useQuery<CityRow[]>({
    queryKey: ["admin", "cities"],
    queryFn: () => adminFetch("/api/admin/cities"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ name, isActive }: { name: string; isActive: boolean }) =>
      adminFetch("/api/admin/cities", { method: "PATCH", body: JSON.stringify({ name, isActive }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cities"] }),
  });

  const activeCities   = (cities ?? []).filter(c => c.is_active).length;
  const inactiveCities = (cities ?? []).filter(c => !c.is_active).length;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Villes & régions</h1>
            <p className="text-gray-500 text-sm">{cities?.length ?? "—"} villes · {activeCities} actives · {inactiveCities} masquées</p>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800">
          <strong>Note :</strong> Les villes actives apparaissent dans le sélecteur de localisation du site. Désactiver une ville masque ses propriétés du filtre géographique mais ne supprime pas les annonces.
        </p>
      </div>

      <Card className="rounded-xl border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ville</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Annonces</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }).map((__, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 rounded" /></td>)}</tr>
                ))
              ) : (cities ?? []).length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">Aucune ville trouvée</td></tr>
              ) : (cities ?? []).map(city => (
                <tr key={city.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-900">{city.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-700">{city.property_count}</span>
                    <span className="text-xs text-gray-400 ml-1">annonce{city.property_count > 1 ? "s" : ""}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${city.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                      {city.is_active ? "Active" : "Masquée"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate({ name: city.name, isActive: !city.is_active })}
                      disabled={toggleMutation.isPending}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${city.is_active ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${city.is_active ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
