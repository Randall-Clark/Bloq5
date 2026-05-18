import AdminLayout from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Settings, MoreHorizontal, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
async function adminFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

type Stats = {
  totalUsers: number; totalProperties: number; totalRequests: number;
  activeSubscriptions: number; propertiesAvailable: number; propertiesRented: number;
  pendingRequests: number;
};
type SummaryRow = { label: string; value: number | null; highlight?: boolean };

/* ── Mini calendar ─────────────────────────────────────────── */
const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function MiniCalendar() {
  const [current, setCurrent] = useState(new Date());
  const [view, setView]       = useState<"month" | "week" | "day">("month");
  const today = new Date();

  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end   = endOfWeek(monthEnd,     { weekStartsOn: 1 });
  const days  = eachDayOfInterval({ start, end });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCurrent(d => subMonths(d, 1))} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
          </button>
          <span className="text-xs font-semibold text-gray-900 capitalize">
            {format(current, "MMMM yyyy", { locale: fr })}
          </span>
          <button onClick={() => setCurrent(d => addMonths(d, 1))} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
        <div className="flex rounded border border-gray-200 overflow-hidden text-[10px]">
          {(["month","week","day"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-2 py-0.5 font-semibold transition-colors"
              style={view === v ? { background: "#1d4ed8", color: "#fff" } : { background: "#fff", color: "#6b7280" }}>
              {v === "month" ? "Mois" : v === "week" ? "Sem." : "Jour"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map(d => (
          <div key={d} className="text-center text-[9px] font-semibold text-gray-400 py-0.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px flex-1">
        {days.map(day => {
          const isToday  = isSameDay(day, today);
          const inMonth  = isSameMonth(day, current);
          return (
            <button key={day.toISOString()}
              className="flex items-center justify-center rounded transition-colors text-[11px] font-medium aspect-square"
              style={isToday
                ? { background: "#1d4ed8", color: "#fff" }
                : inMonth ? { color: "#374151" } : { color: "#d1d5db" }}
              onMouseEnter={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
              onMouseLeave={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = ""; }}>
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Badge ─────────────────────────────────────────────────── */
function MetricBadge({ value, color = "#22c55e" }: { value: number | null; color?: string }) {
  if (value === null) return <div className="w-8 h-5 rounded bg-gray-100 animate-pulse shrink-0" />;
  return (
    <span className="inline-flex items-center justify-center min-w-[24px] h-5 rounded text-[10px] font-bold text-white px-1.5 shrink-0"
      style={{ background: color }}>
      {value > 999 ? "999+" : value}
    </span>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */
type RecentUser    = { id: string; name: string; email: string; role: string; createdAt: string };
type RecentRequest = { id: number; applicantName: string; propertyTitle: string; status: string; createdAt: string };

export default function AdminDashboardPage() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminFetch("/api/admin/stats"),
  });
  const { data: usersData } = useQuery<{ data: RecentUser[] }>({
    queryKey: ["admin", "users", 1],
    queryFn: () => adminFetch("/api/admin/users?page=1&limit=5"),
  });
  const { data: requestsData } = useQuery<{ data: RecentRequest[] }>({
    queryKey: ["admin", "requests", 1, ""],
    queryFn: () => adminFetch("/api/admin/requests?page=1&limit=5"),
  });

  const s = stats;

  const leftSummary: SummaryRow[] = [
    { label: "Messages non lus",       value: s ? 0 : null,                   highlight: false },
    { label: "Emails programmés",       value: s ? 0 : null,                   highlight: false },
    { label: "Notifications",          value: s ? 0 : null,                   highlight: false },
    { label: "Contacts (utilisateurs)", value: s?.totalUsers ?? null,          highlight: true },
    { label: "Rendez-vous",            value: s ? 0 : null,                   highlight: false },
    { label: "Tâches incomplètes",     value: s ? 0 : null,                   highlight: false },
    { label: "Tâches complètes",       value: s ? 0 : null,                   highlight: false },
    { label: "Objectifs non atteints", value: s ? 0 : null,                   highlight: false },
    { label: "Objectifs atteints",     value: s ? 0 : null,                   highlight: false },
    { label: "Campagnes actives",      value: s ? 0 : null,                   highlight: false },
  ];
  const rightSummary: SummaryRow[] = [
    { label: "Annonces actives",        value: s?.propertiesAvailable ?? null, highlight: true },
    { label: "Propriétés louées",       value: s?.propertiesRented ?? null,    highlight: true },
    { label: "Baux en cours",           value: s ? 0 : null,                   highlight: false },
    { label: "Demandes en attente",     value: s?.pendingRequests ?? null,     highlight: true },
    { label: "Référrals sortants",      value: s ? 0 : null,                   highlight: false },
    { label: "Référrals entrants",      value: s ? 0 : null,                   highlight: false },
    { label: "Leads reçus",            value: s ? 0 : null,                   highlight: false },
    { label: "Abonnements actifs",      value: s?.activeSubscriptions ?? null, highlight: true },
    { label: "Demandes totales",        value: s?.totalRequests ?? null,       highlight: true },
    { label: "Propriétés totales",      value: s?.totalProperties ?? null,     highlight: true },
  ];

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800",
  };
  const STATUS_LABELS: Record<string, string> = {
    pending: "En attente", approved: "Approuvé", rejected: "Refusé",
  };
  const ROLE_LABELS: Record<string, string> = {
    tenant: "Locataire", owner: "Propriétaire", manager: "Gestionnaire", admin: "Admin",
  };

  return (
    <AdminLayout>
      {/* Row 1: Summary + Calendar */}
      <div className="flex gap-4 mb-4">
        {/* Summary */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
            <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-sm border-2 border-blue-500" />
            </div>
            <span className="text-sm font-bold text-gray-900">Résumé</span>
            <div className="ml-auto flex items-center gap-0.5">
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><Settings className="h-3.5 w-3.5" /></button>
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><MoreHorizontal className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="px-4 py-2 grid grid-cols-2 gap-x-8">
            {leftSummary.map((row, i) => {
              const right = rightSummary[i];
              return (
                <div key={i} className="contents">
                  <div className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <MetricBadge value={row.value} color={row.highlight ? "#22c55e" : "#9ca3af"} />
                    <span className={`text-xs truncate ${row.highlight ? "text-blue-600 font-semibold cursor-pointer hover:underline" : "text-gray-600"}`}>
                      {row.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <MetricBadge value={right?.value ?? null} color={right?.highlight ? "#22c55e" : "#9ca3af"} />
                    <span className={`text-xs truncate ${right?.highlight ? "text-blue-600 font-semibold cursor-pointer hover:underline" : "text-gray-600"}`}>
                      {right?.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="w-[300px] shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hidden lg:flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
            <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-sm border-2 border-indigo-500" />
            </div>
            <span className="text-sm font-bold text-gray-900">Calendrier</span>
            <div className="ml-auto flex items-center gap-1">
              <button className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors">
                <Plus className="h-2.5 w-2.5" />Ajouter
              </button>
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><Settings className="h-3.5 w-3.5" /></button>
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><MoreHorizontal className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="flex-1 px-4 py-3 flex flex-col">
            <MiniCalendar />
          </div>
        </div>
      </div>

      {/* Row 2: Recent users + Recent requests */}
      <div className="flex gap-4">
        {/* Recent users */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
          <div className="flex items-center px-4 py-2.5 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-900">Derniers contacts</span>
            <a href="/admin/users" className="ml-auto text-xs font-semibold text-blue-600 hover:underline">Voir tout →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {!usersData
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1"><Skeleton className="h-3 w-28 rounded" /><Skeleton className="h-2.5 w-36 rounded" /></div>
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                ))
              : (usersData.data ?? []).map(user => (
                  <div key={user.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: "#1d4ed8" }}>
                      {user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                      {ROLE_LABELS[user.role ?? "tenant"] ?? user.role ?? "—"}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* Recent requests */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
          <div className="flex items-center px-4 py-2.5 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-900">Dernières demandes</span>
            <a href="/admin/requests" className="ml-auto text-xs font-semibold text-blue-600 hover:underline">Voir tout →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {!requestsData
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <div className="flex-1 space-y-1"><Skeleton className="h-3 w-32 rounded" /><Skeleton className="h-2.5 w-44 rounded" /></div>
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                ))
              : (requestsData.data ?? []).map(req => (
                  <div key={req.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{req.applicantName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{req.propertyTitle ?? `Demande #${req.id}`}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[req.status] ?? req.status}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
