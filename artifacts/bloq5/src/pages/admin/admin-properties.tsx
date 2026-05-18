import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Building2, Star, Trash2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const YELLOW = "#F5A623";

async function adminFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "available", label: "Disponible" },
  { value: "rented",    label: "Loué" },
  { value: "reserved",  label: "Réservé" },
];
const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  rented:    "bg-gray-100 text-gray-600",
  reserved:  "bg-blue-100 text-blue-800",
};
const STATUS_LABELS: Record<string, string> = {
  available: "Disponible", rented: "Loué", reserved: "Réservé",
};
const TYPE_LABELS: Record<string, string> = {
  house: "Maison", apartment: "Appartement", "co-living": "Colocation",
  commercial: "Commercial", office: "Bureau",
};

type PropertyRow = {
  id: number; title: string; type: string; city: string; price: string;
  status: string; isFeatured: boolean; createdAt: string;
  ownerName: string | null; ownerEmail: string | null;
};

export default function AdminPropertiesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: PropertyRow[]; total: number; totalPages: number }>({
    queryKey: ["admin", "properties", page, statusFilter],
    queryFn: () => adminFetch(`/api/admin/properties?page=${page}&limit=20${statusFilter ? `&status=${statusFilter}` : ""}`),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: number; isFeatured: boolean }) =>
      adminFetch(`/api/admin/properties/${id}`, { method: "PATCH", body: JSON.stringify({ isFeatured }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "properties"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminFetch(`/api/admin/properties/${id}`, { method: "DELETE" }),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries({ queryKey: ["admin", "properties"] }); },
  });

  const properties = data?.data ?? [];
  const totalPages  = data?.totalPages ?? 1;

  return (
<>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Propriétés</h1>
            <p className="text-gray-500 text-sm">{data?.total ?? "—"} annonces publiées</p>
          </div>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-400"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card className="rounded-xl border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Annonce</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Propriétaire</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Publié le</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-5 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Aucune propriété trouvée</td>
                </tr>
              ) : properties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate max-w-[180px]">{p.title}</p>
                      {p.isFeatured && <Star className="h-3.5 w-3.5 shrink-0" style={{ color: YELLOW, fill: YELLOW }} />}
                    </div>
                    <p className="text-xs text-gray-400">{p.city}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[p.type] ?? p.type}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {Number(p.price).toLocaleString("fr-CA")} $/mo
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[140px] text-xs">{p.ownerName ?? <span className="text-gray-300">BLOQ5</span>}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("fr-CA") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* View link */}
                      <Link href={`/properties/${p.id}`}>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700" title="Voir l'annonce">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </Link>
                      {/* Feature toggle */}
                      <button
                        onClick={() => featureMutation.mutate({ id: p.id, isFeatured: !p.isFeatured })}
                        className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                        title={p.isFeatured ? "Retirer de la une" : "Mettre à la une"}
                      >
                        <Star
                          className="h-4 w-4"
                          style={p.isFeatured ? { color: YELLOW, fill: YELLOW } : { color: "#d1d5db" }}
                        />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-300 hover:text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-xs text-gray-500">Page {page} sur {totalPages} · {data?.total} annonces</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Supprimer cette annonce ?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Cette action est irréversible. Toutes les données associées seront perdues.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
</>
  );
}
