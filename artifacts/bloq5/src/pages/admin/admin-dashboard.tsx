import AdminLayout from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, MessageSquare, CreditCard, Home, CheckCircle, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function adminFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const ROLE_LABELS: Record<string, string> = {
  tenant: "Locataire", owner: "Propriétaire", manager: "Gestionnaire", admin: "Admin",
};
const ROLE_COLORS: Record<string, string> = {
  tenant: "bg-blue-100 text-blue-800",
  owner:  "bg-amber-100 text-amber-800",
  manager:"bg-purple-100 text-purple-800",
  admin:  "bg-red-100 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", in_review: "En examen", awaiting_documents: "Docs requis",
  approved: "Approuvée", rejected: "Refusée",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-800", in_review: "bg-blue-100 text-blue-800",
  awaiting_documents: "bg-purple-100 text-purple-800", approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

type Stats = {
  totalUsers: number; totalProperties: number; totalRequests: number;
  activeSubscriptions: number; propertiesAvailable: number;
  propertiesRented: number; pendingRequests: number;
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminFetch("/api/admin/stats"),
  });
  const { data: recentUsers, isLoading: usersLoading } = useQuery<{ data: any[] }>({
    queryKey: ["admin", "users", "recent"],
    queryFn: () => adminFetch("/api/admin/users?limit=5"),
  });
  const { data: recentRequests, isLoading: requestsLoading } = useQuery<{ data: any[] }>({
    queryKey: ["admin", "requests", "recent"],
    queryFn: () => adminFetch("/api/admin/requests?limit=5"),
  });

  const kpis = [
    { title: "Utilisateurs",        value: stats?.totalUsers          ?? 0, icon: Users,        bg: "bg-blue-50",   accent: "#3b82f6" },
    { title: "Propriétés",          value: stats?.totalProperties     ?? 0, icon: Building2,    bg: "bg-amber-50",  accent: "#F5A623" },
    { title: "Demandes totales",     value: stats?.totalRequests       ?? 0, icon: MessageSquare,bg: "bg-purple-50", accent: "#a855f7" },
    { title: "Abonnements actifs",   value: stats?.activeSubscriptions ?? 0, icon: CreditCard,   bg: "bg-green-50",  accent: "#22c55e" },
    { title: "Biens disponibles",    value: stats?.propertiesAvailable ?? 0, icon: Home,         bg: "bg-sky-50",    accent: "#0ea5e9" },
    { title: "Biens loués",          value: stats?.propertiesRented    ?? 0, icon: CheckCircle,  bg: "bg-emerald-50",accent: "#10b981" },
    { title: "Demandes en attente",  value: stats?.pendingRequests     ?? 0, icon: Clock,        bg: "bg-orange-50", accent: "#f97316" },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord Admin</h1>
          <p className="text-gray-500 text-sm">Vue d'ensemble de la plateforme BLOQ5</p>
        </div>
      </div>

      {/* KPI Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <Card key={i} className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-xl ${kpi.bg} mb-2`}>
                  <kpi.icon className="h-4 w-4" style={{ color: kpi.accent }} />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{kpi.value.toLocaleString("fr-CA")}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5 leading-tight">{kpi.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Two tables side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900">Derniers utilisateurs inscrits</CardTitle>
            <Link href="/admin/users">
              <button className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                Voir tout <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {usersLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : (recentUsers?.data ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucun utilisateur</p>
            ) : (
              <div className="space-y-2">
                {(recentUsers?.data ?? []).map((u: any) => (
                  <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {u.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role ?? "tenant"]}`}>
                      {ROLE_LABELS[u.role ?? "tenant"]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900">Dernières demandes de location</CardTitle>
            <Link href="/admin/requests">
              <button className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                Voir tout <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {requestsLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : (recentRequests?.data ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucune demande</p>
            ) : (
              <div className="space-y-2">
                {(recentRequests?.data ?? []).map((r: any) => (
                  <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.propertyTitle ?? "Propriété inconnue"}</p>
                      <p className="text-xs text-gray-400 truncate">{r.applicantName} · {r.propertyCity}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
