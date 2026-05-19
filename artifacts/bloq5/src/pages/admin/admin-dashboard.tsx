import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Settings, MoreHorizontal, Plus,
  Zap, CheckSquare, BarChart2, Home, Users, FileText, Mail,
  Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
async function adminFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/* ─── TYPES ─────────────────────────────────────────────────── */
type Stats = {
  totalUsers: number; totalProperties: number; totalRequests: number;
  activeSubscriptions: number; propertiesAvailable: number; propertiesRented: number;
  pendingRequests: number;
};
type RentalRequest = {
  id: number; applicantName: string; applicantEmail: string;
  propertyTitle: string; propertyCity: string; status: string; createdAt: string;
};
type AdminUser = {
  id: string; name: string; email: string; role: string; createdAt: string;
};

/* ─── HELPERS ───────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return "il y a quelques secondes";
  if (diff < 3600)  return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

const STATUS_LABELS: Record<string, string> = {
  pending:  "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: "#EBF3FF", text: "#1d4ed8" },
  approved: { bg: "#E8F5E9", text: "#2E7D32" },
  rejected: { bg: "#FEE2E2", text: "#DC2626" },
};

/* ─── CALENDAR ──────────────────────────────────────────────── */
const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function WeekView({ current }: { current: Date }) {
  const start = startOfWeek(current, { weekStartsOn: 1 });
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "40px repeat(7, 1fr)", borderBottom: "1px solid #F0F0F0" }}>
        <div />
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(start); d.setDate(start.getDate() + i);
          const isToday = isSameDay(d, new Date());
          return (
            <div key={i} style={{ textAlign: "center", padding: "6px 4px", fontSize: 11, fontWeight: 600, color: isToday ? "#1d4ed8" : "#888" }}>
              {WEEK_DAYS[i]}<br />
              <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", background: isToday ? "#EBF3FF" : "none", alignItems: "center", justifyContent: "center", fontSize: 12, color: isToday ? "#1d4ed8" : "#1A1A1A", fontWeight: isToday ? 700 : 500 }}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      {hours.map(h => (
        <div key={h} style={{ display: "grid", gridTemplateColumns: "40px repeat(7, 1fr)", borderBottom: "1px solid #F8F8F8", minHeight: 40 }}>
          <div style={{ fontSize: 10, color: "#AAA", paddingTop: 4, paddingLeft: 4, textAlign: "right", paddingRight: 6 }}>{h}h</div>
          {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ borderLeft: "1px solid #F0F0F0" }} />)}
        </div>
      ))}
    </div>
  );
}

function MonthView({ current }: { current: Date }) {
  const today     = new Date();
  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const start      = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end        = endOfWeek(monthEnd,     { weekStartsOn: 1 });
  const days       = eachDayOfInterval({ start, end });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #F0F0F0" }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#888", padding: "6px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", flex: 1 }}>
        {days.map(day => {
          const isToday = isSameDay(day, today);
          const inMonth = isSameMonth(day, current);
          const dayNum  = day.getDate();
          return (
            <div key={day.toISOString()} style={{
              minHeight: 60, borderBottom: "1px solid #F0F0F0", borderRight: "1px solid #F0F0F0",
              background: isToday ? "#EBF3FF" : "#fff", padding: "4px 4px 2px", cursor: "pointer",
            }}
              onMouseEnter={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = "#F9F9F9"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isToday ? "#EBF3FF" : "#fff"; }}
            >
              <div style={{ textAlign: "right", fontSize: 12, color: isToday ? "#1d4ed8" : inMonth ? "#1A1A1A" : "#CCCCCC", fontWeight: isToday ? 700 : 400 }}>
                {dayNum}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarWidget() {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const VIEW_LABELS = { month: "Mois", week: "Semaine", day: "Jour" } as const;

  return (
    <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE", flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A", flex: 1 }}>Calendrier</span>
        <button style={{ background: "#E8F5E9", color: "#2E7D32", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#2E7D32"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#E8F5E9"; (e.currentTarget as HTMLElement).style.color = "#2E7D32"; }}>
          <Plus style={{ width: 12, height: 12 }} /> Ajouter un événement
        </button>
        <IconBtn><Settings style={{ width: 14, height: 14 }} /></IconBtn>
        <IconBtn><MoreHorizontal style={{ width: 14, height: 14 }} /></IconBtn>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid #EEEEEE", flexShrink: 0 }}>
        <NavBtn onClick={() => setCurrent(d => subMonths(d, 1))}><ChevronLeft style={{ width: 14, height: 14 }} /></NavBtn>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", flex: 1, textAlign: "center", textTransform: "capitalize" }}>
          {format(current, "MMMM yyyy", { locale: fr })}
        </span>
        <NavBtn onClick={() => setCurrent(d => addMonths(d, 1))}><ChevronRight style={{ width: 14, height: 14 }} /></NavBtn>
        <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: "1px solid #E0E0E0", marginLeft: 8 }}>
          {(["month", "week", "day"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "5px 12px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              background: view === v ? "#1d4ed8" : "#fff", color: view === v ? "#fff" : "#888",
            }}>
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {view === "month" && <MonthView current={current} />}
        {view === "week"  && <WeekView  current={current} />}
        {view === "day"   && <div style={{ padding: 16, color: "#888", fontSize: 13, textAlign: "center" }}>Aucun événement aujourd'hui.</div>}
      </div>
    </Card>
  );
}

/* ─── CARD helpers ──────────────────────────────────────────── */
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #EEEEEE", ...style }}>{children}</div>;
}
function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#F5F5F5")}
      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
      {children}
    </button>
  );
}
function NavBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #E0E0E0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1d4ed8"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#1d4ed8"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#555"; (e.currentTarget as HTMLElement).style.borderColor = "#E0E0E0"; }}>
      {children}
    </button>
  );
}

/* ─── SUMMARY BADGE ─────────────────────────────────────────── */
function Badge({ value }: { value: number | null }) {
  if (value === null) return <div style={{ width: 22, height: 22, borderRadius: 6, background: "#F0F0F0", flexShrink: 0 }} />;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 22, height: 22, borderRadius: 6, background: "#1d4ed8",
      color: "#fff", fontWeight: 700, fontSize: 11, padding: "0 5px", flexShrink: 0,
    }}>
      {value > 999 ? "999+" : value}
    </span>
  );
}

/* ─── SUMMARY WIDGET — real stats ───────────────────────────── */
function SummaryWidget({ s }: { s: Stats | undefined }) {
  const loading = s === undefined;
  const n = (v: number | undefined) => (loading ? null : (v ?? 0));

  const left = [
    { label: "Messages non lus",            value: n(0) },
    { label: "Emails programmés",            value: n(0) },
    { label: "Notifications",               value: n(0) },
    { label: "Contacts",                    value: n(s?.totalUsers), highlight: true },
    { label: "Rendez-vous",                 value: n(0) },
    { label: "Tâches incomplètes",          value: n(0) },
    { label: "Tâches complètes",            value: n(0) },
    { label: "Objectifs non atteints",      value: n(0) },
    { label: "Objectifs atteints",          value: n(0) },
    { label: "Campagnes email programmées", value: n(0) },
    { label: "Emails envoyés via campagnes",value: n(0) },
    { label: "Transactions ouvertes",       value: n(s?.pendingRequests), highlight: true },
    { label: "Transactions fermées",        value: n(0) },
    { label: "Abonnements actifs",          value: n(s?.activeSubscriptions), highlight: true },
  ];
  const right = [
    { label: "Propriétés totales",          value: n(s?.totalProperties), highlight: true },
    { label: "Propriétés disponibles",      value: n(s?.propertiesAvailable), highlight: true },
    { label: "Propriétés louées",           value: n(s?.propertiesRented), highlight: true },
    { label: "Baux en cours",               value: n(0) },
    { label: "Offres en cours",             value: n(0) },
    { label: "Références sortantes",        value: n(0) },
    { label: "Références reçues",           value: n(0) },
    { label: "Leads reçus",                value: n(0) },
    { label: "Visiteurs du site",           value: n(0) },
    { label: "Favoris sauvegardés",         value: n(0) },
    { label: "Recherches sauvegardées",     value: n(0) },
    { label: "Demandes d'information",      value: n(0) },
    { label: "Demandes de visite",          value: n(s?.totalRequests), highlight: true },
    { label: "Demandes d'offre",            value: n(0) },
  ];
  const maxRows = Math.max(left.length, right.length);

  return (
    <Card style={{ flex: 1, minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE" }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, background: "#EBF3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, border: "2px solid #1d4ed8" }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>Résumé</span>
        <div style={{ flex: 1 }} />
        <IconBtn><Settings style={{ width: 14, height: 14 }} /></IconBtn>
        <IconBtn><MoreHorizontal style={{ width: 14, height: 14 }} /></IconBtn>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 16px" }}>
          {Array.from({ length: maxRows }, (_, i) => {
            const lRow = left[i] as { label: string; value: number | null; highlight?: boolean } | undefined;
            const rRow = right[i] as { label: string; value: number | null; highlight?: boolean } | undefined;
            return [
              lRow ? (
                <div key={`l${i}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #FAFAFA" }}>
                  <Badge value={lRow.value} />
                  <span style={{ fontSize: 12, color: lRow.highlight ? "#1d4ed8" : "#555", fontWeight: lRow.highlight ? 500 : 400, cursor: lRow.highlight ? "pointer" : "default" }}
                    onMouseEnter={e => { if (lRow.highlight) (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}>
                    {lRow.label}
                  </span>
                </div>
              ) : <div key={`le${i}`} />,
              rRow ? (
                <div key={`r${i}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0 5px 12px", borderBottom: "1px solid #FAFAFA" }}>
                  <Badge value={rRow.value} />
                  <span style={{ fontSize: 12, color: rRow.highlight ? "#1d4ed8" : "#555", fontWeight: rRow.highlight ? 500 : 400, cursor: rRow.highlight ? "pointer" : "default" }}
                    onMouseEnter={e => { if (rRow.highlight) (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}>
                    {rRow.label}
                  </span>
                </div>
              ) : <div key={`re${i}`} />,
            ];
          }).flat()}
        </div>
      </div>
    </Card>
  );
}

/* ─── ACTIVITY CARD — real requests + users ─────────────────── */
function ActivityCard() {
  const { data: requestsData, isLoading: loadingReq } = useQuery<{ data: RentalRequest[] }>({
    queryKey: ["admin", "activity-requests"],
    queryFn: () => adminFetch("/api/admin/requests?limit=5&page=1"),
  });
  const { data: usersData, isLoading: loadingUsers } = useQuery<{ data: AdminUser[] }>({
    queryKey: ["admin", "activity-users"],
    queryFn: () => adminFetch("/api/admin/users?limit=3&page=1"),
  });

  const loading = loadingReq || loadingUsers;

  type ActivityItem = { key: string; initials: string; text: string; time: string; color: string };
  const items: ActivityItem[] = [];

  if (requestsData?.data) {
    for (const r of requestsData.data) {
      const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending;
      items.push({
        key:      `req-${r.id}`,
        initials: (r.applicantName || "?").charAt(0).toUpperCase(),
        text:     `${r.applicantName} — demande pour « ${r.propertyTitle ?? "propriété"} » (${STATUS_LABELS[r.status] ?? r.status})`,
        time:     timeAgo(r.createdAt),
        color:    sc.text,
      });
    }
  }
  if (usersData?.data) {
    for (const u of usersData.data) {
      items.push({
        key:      `usr-${u.id}`,
        initials: (u.name || "?").charAt(0).toUpperCase(),
        text:     `Nouvel utilisateur : ${u.name} (${u.email})`,
        time:     timeAgo(u.createdAt),
        color:    "#6b7280",
      });
    }
  }
  items.sort((a, b) => 0); // preserve order already sorted by server (desc)

  return (
    <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE" }}>
        <Zap style={{ width: 16, height: 16, color: "#1d4ed8" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Activité récente</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && (
          <div style={{ padding: "20px 16px", color: "#AAA", fontSize: 13, textAlign: "center" }}>Chargement…</div>
        )}
        {!loading && items.length === 0 && (
          <div style={{ padding: "20px 16px", color: "#AAA", fontSize: 13, textAlign: "center" }}>Aucune activité récente.</div>
        )}
        {items.map(a => (
          <div key={a.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", borderBottom: "1px solid #FAFAFA" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>{a.initials}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, color: "#1A1A1A", margin: 0, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.text}</p>
              <p style={{ fontSize: 11, color: "#AAA", margin: "2px 0 0" }}>{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── TASKS CARD — pending requests from DB ─────────────────── */
function TasksCard() {
  const { data, isLoading } = useQuery<{ data: RentalRequest[]; total: number }>({
    queryKey: ["admin", "pending-requests"],
    queryFn: () => adminFetch("/api/admin/requests?status=pending&limit=8&page=1"),
  });

  const requests = data?.data ?? [];

  return (
    <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE" }}>
        <CheckSquare style={{ width: 16, height: 16, color: "#1d4ed8" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A", flex: 1 }}>Demandes en attente</span>
        {!isLoading && (
          <span style={{ background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 11, borderRadius: 10, padding: "2px 8px" }}>
            {data?.total ?? 0}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {isLoading && (
          <div style={{ padding: "20px 16px", color: "#AAA", fontSize: 13, textAlign: "center" }}>Chargement…</div>
        )}
        {!isLoading && requests.length === 0 && (
          <div style={{ padding: "20px 16px", color: "#AAA", fontSize: 13, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <CheckCircle2 style={{ width: 32, height: 32, color: "#2E7D32" }} />
            Aucune demande en attente.
          </div>
        )}
        {requests.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", borderBottom: "1px solid #FAFAFA" }}>
            <Clock style={{ width: 14, height: 14, color: "#1d4ed8", flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, color: "#1A1A1A", margin: 0, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.applicantName}
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.propertyTitle ?? "Propriété"}{r.propertyCity ? ` — ${r.propertyCity}` : ""}
              </p>
            </div>
            <span style={{ fontSize: 10, color: "#AAA", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(r.createdAt)}</span>
          </div>
        ))}
      </div>
      {!isLoading && (data?.total ?? 0) > 8 && (
        <div style={{ padding: "8px 16px", borderTop: "1px solid #EEEEEE" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#1d4ed8", fontSize: 12, fontWeight: 600, padding: 0 }}>
            Voir toutes les demandes ({data?.total})
          </button>
        </div>
      )}
    </Card>
  );
}

/* ─── QUICK STATS ───────────────────────────────────────────── */
function StatsCard({ s }: { s: Stats | undefined }) {
  const metrics = [
    { icon: Home,     label: "Propriétés disponibles", value: s?.propertiesAvailable ?? null, color: "#1d4ed8" },
    { icon: Users,    label: "Contacts",                value: s?.totalUsers ?? null,          color: "#2E7D32" },
    { icon: FileText, label: "Demandes en attente",     value: s?.pendingRequests ?? null,     color: "#6b7280" },
    { icon: Mail,     label: "Abonnements actifs",      value: s?.activeSubscriptions ?? null, color: "#1d4ed8" },
  ];
  return (
    <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE" }}>
        <BarChart2 style={{ width: 16, height: 16, color: "#1d4ed8" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Statistiques rapides</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#F0F0F0" }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: "#fff", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <m.icon style={{ width: 18, height: 18, color: m.color }} />
            <span style={{ fontSize: 28, fontWeight: 800, color: m.color, lineHeight: 1 }}>
              {m.value === null ? "…" : m.value}
            </span>
            <span style={{ fontSize: 12, color: "#888" }}>{m.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── DASHBOARD ─────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminFetch("/api/admin/stats"),
  });

  return (
    <>
      {/* Row 1: Summary + Calendar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, minHeight: 440 }}>
        <SummaryWidget s={stats} />
        <CalendarWidget />
      </div>

      {/* Row 2: Activity + Pending Requests + Stats */}
      <div style={{ display: "flex", gap: 16, minHeight: 280 }}>
        <ActivityCard />
        <TasksCard />
        <StatsCard s={stats} />
      </div>
    </>
  );
}
