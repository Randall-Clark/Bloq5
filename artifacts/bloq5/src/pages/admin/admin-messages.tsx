import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

type ConvRow = {
  request_id: number; applicant_name: string; applicant_email: string;
  property_title: string | null; property_city: string | null;
  message_count: number; last_message_at: string; last_message: string | null;
};

export default function AdminMessagesPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: ConvRow[]; total: number; totalPages: number }>({
    queryKey: ["admin", "conversations", page],
    queryFn: () => adminFetch(`/api/admin/conversations?page=${page}&limit=20`),
  });

  const deleteMutation = useMutation({
    mutationFn: (requestId: number) => adminFetch(`/api/admin/conversations/${requestId}`, { method: "DELETE" }),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries({ queryKey: ["admin", "conversations"] }); },
  });

  const convs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
<>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-sky-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Messages</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? "—"} conversations actives</p>
        </div>
      </div>

      <Card className="rounded-xl border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Propriété", "Candidat", "Dernier message", "Messages", "Dernière activité", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 rounded" /></td>)}</tr>
                ))
              ) : convs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <MessageCircle className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Aucun message actif — les messages expirent après 24h</p>
                  </td>
                </tr>
              ) : convs.map(c => (
                <tr key={c.request_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[160px]">{c.property_title ?? "—"}</p>
                    <p className="text-xs text-gray-400">{c.property_city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[120px]">{c.applicant_name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{c.applicant_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px]">
                    {c.last_message
                      ? <span title={c.last_message}>{c.last_message.length > 70 ? c.last_message.slice(0, 70) + "…" : c.last_message}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                      {c.message_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {c.last_message_at
                      ? format(new Date(c.last_message_at), "d MMM, HH:mm", { locale: fr })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(c.request_id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-300 hover:text-red-500"
                      title="Supprimer la conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-xs text-gray-500">Page {page} sur {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Supprimer cette conversation ?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Tous les messages de cette conversation seront supprimés définitivement.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {deleteMutation.isPending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
</>
  );
}
