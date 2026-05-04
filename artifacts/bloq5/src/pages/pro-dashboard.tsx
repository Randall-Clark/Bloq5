import ProLayout from "@/components/layout/pro-layout";
import { useGetDashboardStats, useListPropertyRentalRequests } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Eye, MessageSquare, TrendingUp, CheckCircle, Plus, ChevronRight, Home, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type RentalRequestStatus = "pending" | "in_review" | "awaiting_documents" | "approved" | "rejected";
const STATUS_COLORS: Record<RentalRequestStatus, string> = {
  pending: "bg-orange-100 text-orange-800",
  in_review: "bg-blue-100 text-blue-800",
  awaiting_documents: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
const STATUS_LABELS: Record<RentalRequestStatus, string> = {
  pending: "En attente",
  in_review: "En examen",
  awaiting_documents: "Docs requis",
  approved: "Approuvée",
  rejected: "Refusée",
};
const PIE_COLORS = ["#F5A623", "#22c55e", "#ef4444"];

export default function ProDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentRequests, isLoading: requestsLoading } = useListPropertyRentalRequests(0);

  const trendData = [
    { name: 'Lun', vues: 42, demandes: 3 },
    { name: 'Mar', vues: 35, demandes: 2 },
    { name: 'Mer', vues: 61, demandes: 5 },
    { name: 'Jeu', vues: 48, demandes: 4 },
    { name: 'Ven', vues: 74, demandes: 7 },
    { name: 'Sam', vues: 88, demandes: 6 },
    { name: 'Dim', vues: 95, demandes: 8 },
  ];

  const pieData = [
    { name: "En attente", value: stats?.activeRequests ?? 0 },
    { name: "Approuvées", value: stats?.approvedRequests ?? 0 },
    { name: "Refusées", value: Math.max(0, (stats?.totalRequests ?? 0) - (stats?.activeRequests ?? 0) - (stats?.approvedRequests ?? 0)) },
  ];

  const kpis = [
    { title: "Propriétés", value: stats?.totalProperties ?? 0, sub: `${stats?.propertiesAvailable ?? 0} disponibles`, icon: Building2, accent: "#1a237e", bg: "bg-blue-50" },
    { title: "Vues totales", value: stats?.totalViews ?? 0, sub: "sur toutes les annonces", icon: Eye, accent: "#0ea5e9", bg: "bg-sky-50" },
    { title: "Demandes actives", value: stats?.activeRequests ?? 0, sub: `${stats?.totalRequests ?? 0} au total`, icon: MessageSquare, accent: "#F5A623", bg: "bg-orange-50" },
    { title: "Revenu mensuel", value: `${(stats?.estimatedRevenue ?? 0).toLocaleString("fr-CA")} $`, sub: `${stats?.propertiesRented ?? 0} biens loués`, icon: TrendingUp, accent: "#22c55e", bg: "bg-green-50" },
    { title: "Taux d'occupation", value: `${stats?.occupancyRate ?? 0} %`, sub: stats?.totalProperties ? `${stats.propertiesRented ?? 0}/${stats.totalProperties}` : "—", icon: CheckCircle, accent: "#a855f7", bg: "bg-purple-50" },
  ];

  return (
    <ProLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">Dashboard propriétaire</h1>
          <p className="text-gray-500">Vue d'ensemble de votre portefeuille immobilier.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/pro/requests">
            <Button variant="outline" className="rounded-xl border-gray-300 gap-2 text-sm">
              <MessageSquare className="h-4 w-4" /> Demandes
            </Button>
          </Link>
          <Link href="/pro/properties/new">
            <Button className="rounded-xl bg-[#F5A623] hover:bg-[#e09520] text-white gap-2 font-bold text-sm">
              <Plus className="h-4 w-4" /> Ajouter un bien
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <Card key={i} className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className={`inline-flex p-2.5 rounded-xl ${kpi.bg} mb-3`}>
                  <kpi.icon className="h-5 w-5" style={{ color: kpi.accent }} />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{kpi.value}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{kpi.title}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="rounded-xl border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1a237e]">Trafic et demandes — 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 16, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="vues" name="Vues" stroke="#1a237e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="demandes" name="Demandes" stroke="#F5A623" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1a237e]">Répartition des demandes</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] flex flex-col items-center justify-center">
            {(stats?.totalRequests ?? 0) === 0 ? (
              <div className="text-center text-gray-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Aucune demande reçue</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-3 flex-wrap justify-center mt-1">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-xs text-gray-500">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent requests */}
      <Card className="rounded-xl border-gray-200 shadow-sm mb-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-[#1a237e]">Dernières demandes reçues</CardTitle>
          <Link href="/pro/requests">
            <Button variant="ghost" size="sm" className="text-[#F5A623] hover:text-[#e09520] gap-1 text-xs font-semibold">
              Voir tout <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {requestsLoading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
          ) : !recentRequests || recentRequests.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune demande reçue pour l'instant</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentRequests.slice(0, 5).map((req) => (
                <Link key={req.id} href={`/pro/requests/${req.id}`}>
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-[#1a237e]/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#1a237e]">{(req.applicantName || "?").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{req.applicantName}</p>
                      <p className="text-xs text-gray-500 truncate">{req.propertyTitle}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`${STATUS_COLORS[req.status as RentalRequestStatus]} rounded-full border-0 text-xs`}>
                        {STATUS_LABELS[req.status as RentalRequestStatus]}
                      </Badge>
                      <span className="text-xs text-gray-400">{format(new Date(req.createdAt), "dd MMM", { locale: fr })}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#F5A623] transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Plus,         label: "Publier un nouveau bien",  sub: "Créer une annonce",       href: "/pro/properties/new", color: "text-[#F5A623]", bg: "bg-orange-50" },
          { icon: Home,         label: "Mes propriétés",           sub: "Gérer le portefeuille",    href: "/pro/properties",     color: "text-[#1a237e]", bg: "bg-blue-50" },
          { icon: MessageSquare,label: "Toutes les demandes",      sub: "Traiter les candidatures", href: "/pro/requests",        color: "text-purple-600",bg: "bg-purple-50" },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <Card className="rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${action.bg} shrink-0`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-[#1a237e] transition-colors text-sm truncate">{action.label}</p>
                  <p className="text-xs text-gray-400">{action.sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-[#F5A623] transition-colors shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </ProLayout>
  );
}