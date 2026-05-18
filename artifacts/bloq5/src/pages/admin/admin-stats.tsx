import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, Users, Building2, MessageSquare, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
async function adminFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const PERIOD_OPTIONS = [
  { value: 7,  label: "7 jours" },
  { value: 14, label: "14 jours" },
  { value: 30, label: "30 jours" },
  { value: 90, label: "90 jours" },
];

const PLAN_COLORS: Record<string, string> = {
  free:       "#9CA3AF",
  starter:    "#60A5FA",
  pro:        "#F5A623",
  enterprise: "#A78BFA",
};
const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit", starter: "Starter", pro: "Pro", enterprise: "Entreprise",
};

type TimelineRow = { day: string; users: number; properties: number; requests: number };
type Stats = { totalUsers: number; totalProperties: number; totalRequests: number; activeSubscriptions: number };
type SubRow = { planId: string };

export default function AdminStatsPage() {
  const [days, setDays] = useState(30);

  const { data: timeline, isLoading: tlLoading } = useQuery<{ data: TimelineRow[] }>({
    queryKey: ["admin", "stats", "timeline", days],
    queryFn: () => adminFetch(`/api/admin/stats/timeline?days=${days}`),
  });
  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminFetch("/api/admin/stats"),
  });
  const { data: subsData } = useQuery<{ data: SubRow[] }>({
    queryKey: ["admin", "subscriptions", "all"],
    queryFn: () => adminFetch("/api/admin/subscriptions?limit=200"),
  });

  const chartData = (timeline?.data ?? []).map(row => ({
    ...row,
    label: format(parseISO(row.day), "d MMM", { locale: fr }),
  }));

  /* Plan distribution pie */
  const planCounts: Record<string, number> = {};
  (subsData?.data ?? []).forEach(s => {
    planCounts[s.planId] = (planCounts[s.planId] ?? 0) + 1;
  });
  const pieData = Object.entries(planCounts).map(([plan, count]) => ({
    name: PLAN_LABELS[plan] ?? plan, value: count, color: PLAN_COLORS[plan] ?? "#9CA3AF",
  }));

  const kpis = [
    { icon: Users,        label: "Utilisateurs",   value: stats?.totalUsers      ?? 0, color: "#3b82f6" },
    { icon: Building2,    label: "Propriétés",      value: stats?.totalProperties ?? 0, color: "#F5A623" },
    { icon: MessageSquare,label: "Demandes",        value: stats?.totalRequests   ?? 0, color: "#a855f7" },
    { icon: TrendingUp,   label: "Abonnés actifs",  value: stats?.activeSubscriptions ?? 0, color: "#22c55e" },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Statistiques avancées</h1>
            <p className="text-gray-500 text-sm">Évolution de la plateforme dans le temps</p>
          </div>
        </div>
        {/* Period selector */}
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={days === opt.value
                ? { background: "#1A1A1A", color: "#fff" }
                : { background: "#f5f5f5", color: "#6b7280" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => (
          <Card key={i} className="rounded-xl border-gray-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.color + "18" }}>
                <k.icon className="h-4 w-4" style={{ color: k.color }} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{k.value.toLocaleString("fr-CA")}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Area chart */}
      <Card className="rounded-xl border-gray-200 shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-gray-900">
            Activité sur les {days} derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {tlLoading ? (
            <Skeleton className="w-full h-full rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gUsers"      x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gProps"      x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#F5A623" stopOpacity={0.3}/><stop offset="95%" stopColor="#F5A623" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gRequests"   x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} interval="preserveStartEnd" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="users"      name="Utilisateurs"  stroke="#3b82f6" fill="url(#gUsers)"    strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="properties" name="Propriétés"    stroke="#F5A623" fill="url(#gProps)"    strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="requests"   name="Demandes"      stroke="#a855f7" fill="url(#gRequests)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pie — plan distribution */}
      <Card className="rounded-xl border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-gray-900">Répartition des abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucun abonnement</p>
          ) : (
            <div className="flex items-center gap-8 h-[200px]">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: entry.color }} />
                    <span className="text-sm text-gray-700 font-medium">{entry.name}</span>
                    <span className="text-sm font-bold text-gray-900 ml-auto pl-4">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
