import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

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

const ROLE_OPTIONS = [
  { value: "", label: "Tous les rôles" },
  { value: "tenant",  label: "Locataire" },
  { value: "owner",   label: "Propriétaire" },
  { value: "manager", label: "Gestionnaire" },
  { value: "admin",   label: "Admin" },
];

const ROLE_LABELS: Record<string, string> = {
  tenant: "Locataire", owner: "Propriétaire", manager: "Gestionnaire", admin: "Admin",
};
const ROLE_COLORS: Record<string, string> = {
  tenant:  "bg-blue-100 text-blue-800",
  owner:   "bg-amber-100 text-amber-800",
  manager: "bg-purple-100 text-purple-800",
  admin:   "bg-red-100 text-red-800",
};

type UserRow = {
  id: string; name: string; email: string; emailVerified: boolean;
  image: string | null; createdAt: string; role: string | null; companyName: string | null;
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ data: UserRow[]; total: number; totalPages: number }>({
    queryKey: ["admin", "users", page],
    queryFn: () => adminFetch(`/api/admin/users?page=${page}&limit=20`),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminFetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const users = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Utilisateurs</h1>
            <p className="text-gray-500 text-sm">{data?.total ?? "—"} utilisateurs enregistrés</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-xl border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Inscrit le</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">Aucun utilisateur trouvé</td>
                </tr>
              ) : users.map((u) => {
                const role = u.role ?? "tenant";
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                          {u.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[140px]">{u.name}</p>
                          {!u.emailVerified && <p className="text-[10px] text-orange-500">Email non vérifié</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                        {ROLE_LABELS[role] ?? role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]">{u.companyName ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-CA") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {changingRole === u.id ? (
                        <select
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-red-400"
                          defaultValue={role}
                          autoFocus
                          onBlur={() => setChangingRole(null)}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            setChangingRole(null);
                            await roleMutation.mutateAsync({ id: u.id, role: newRole });
                          }}
                        >
                          {ROLE_OPTIONS.filter(o => o.value).map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setChangingRole(u.id)}
                          className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
                        >
                          Changer le rôle
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-xs text-gray-500">Page {page} sur {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
