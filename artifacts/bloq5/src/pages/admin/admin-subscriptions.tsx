import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

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

const PLAN_OPTIONS = ["free", "starter", "pro", "enterprise"];
const PLAN_LABELS: Record<string, string> = { free: "Gratuit", starter: "Starter", pro: "Pro", enterprise: "Entreprise" };
const PLAN_COLORS: Record<string, string> = {
  free:       "bg-gray-100 text-gray-600",
  starter:    "bg-blue-100 text-blue-800",
  pro:        "bg-amber-100 text-amber-800",
  enterprise: "bg-purple-100 text-purple-800",
};
const STATUS_LABELS: Record<string, string> = { active: "Actif", cancelled: "Annulé", past_due: "En retard", trialing: "Essai" };
const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  past_due:  "bg-orange-100 text-orange-800",
  trialing:  "bg-blue-100 text-blue-800",
};

type SubRow = {
  id: number; ownerId: string; planId: string; status: string;
  currentPeriodEnd: string | null; propertiesUsed: number; managersUsed: number;
  createdAt: string; userName: string | null; userEmail: string | null;
};

export default function AdminSubscriptionsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ id: number; field: "plan" | "status" } | null>(null);

  const { data, isLoading } = useQuery<{ data: SubRow[]; total: number; totalPages: number }>({
    queryKey: ["admin", "subscriptions", page],
    queryFn: () => adminFetch(`/api/admin/subscriptions?page=${page}&limit=20`),
  });

  const mutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) =>
      adminFetch(`/api/admin/subscriptions/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "subscriptions"] }); },
  });

  const subs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Abonnements</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? "—"} abonnements enregistrés</p>
        </div>
      </div>

      <Card className="rounded-xl border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Propriétaire", "Plan", "Statut", "Biens utilisés", "Gestionnaires", "Fin de période", "Inscrit le"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 rounded" /></td>)}</tr>
                ))
              ) : subs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Aucun abonnement</td></tr>
              ) : subs.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[140px]">{s.userName ?? "—"}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[140px]">{s.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    {editing?.id === s.id && editing.field === "plan" ? (
                      <select
                        defaultValue={s.planId}
                        autoFocus
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                        onBlur={() => setEditing(null)}
                        onChange={e => mutation.mutate({ id: s.id, body: { planId: e.target.value } })}
                      >
                        {PLAN_OPTIONS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setEditing({ id: s.id, field: "plan" })}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 ${PLAN_COLORS[s.planId] ?? "bg-gray-100 text-gray-600"}`}>
                          {PLAN_LABELS[s.planId] ?? s.planId}
                        </span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing?.id === s.id && editing.field === "status" ? (
                      <select
                        defaultValue={s.status}
                        autoFocus
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                        onBlur={() => setEditing(null)}
                        onChange={e => mutation.mutate({ id: s.id, body: { status: e.target.value } })}
                      >
                        {["active","cancelled","past_due","trialing"].map(st => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setEditing({ id: s.id, field: "status" })}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-center">{s.propertiesUsed}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{s.managersUsed}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("fr-CA") : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString("fr-CA") : "—"}
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
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
            </div>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
