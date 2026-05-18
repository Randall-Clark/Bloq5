import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function adminFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const STATUS_TABS = [
  { value: "",                   label: "Toutes" },
  { value: "pending",            label: "En attente" },
  { value: "in_review",          label: "En examen" },
  { value: "awaiting_documents", label: "Docs requis" },
  { value: "approved",           label: "Approuvées" },
  { value: "rejected",           label: "Refusées" },
];

const STATUS_COLORS: Record<string, string> = {
  pending:             "bg-orange-100 text-orange-800",
  in_review:           "bg-blue-100 text-blue-800",
  awaiting_documents:  "bg-purple-100 text-purple-800",
  approved:            "bg-green-100 text-green-800",
  rejected:            "bg-red-100 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  pending:             "En attente",
  in_review:           "En examen",
  awaiting_documents:  "Docs requis",
  approved:            "Approuvée",
  rejected:            "Refusée",
};

type RequestRow = {
  id: number; propertyId: number; userId: string; status: string;
  applicantName: string; applicantEmail: string; message: string | null;
  createdAt: string; propertyTitle: string | null; propertyCity: string | null;
};

export default function AdminRequestsPage() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery<{ data: RequestRow[]; total: number; totalPages: number }>({
    queryKey: ["admin", "requests", page, status],
    queryFn: () => adminFetch(`/api/admin/requests?page=${page}&limit=20${status ? `&status=${status}` : ""}`),
  });

  const requests   = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
<>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Demandes de location</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? "—"} demandes au total</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={
              status === tab.value
                ? { background: "#1A1A1A", color: "#fff" }
                : { background: "#f5f5f5", color: "#6b7280" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-xl border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Propriété</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-5 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">Aucune demande trouvée</td>
                </tr>
              ) : requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[160px]">{r.propertyTitle ?? "—"}</p>
                    <p className="text-xs text-gray-400">{r.propertyCity ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[120px]">{r.applicantName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[160px]">{r.applicantEmail}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">
                    {r.message ? (
                      <span title={r.message}>{r.message.length > 60 ? r.message.slice(0, 60) + "…" : r.message}</span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-CA") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-xs text-gray-500">Page {page} sur {totalPages} · {data?.total} demandes</p>
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
</>
  );
}
