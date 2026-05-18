import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Settings, MoreHorizontal, Plus,
  Zap, CheckSquare, BarChart2, Home, Users, FileText, Mail,
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

type Stats = {
  totalUsers: number; totalProperties: number; totalRequests: number;
  activeSubscriptions: number; propertiesAvailable: number; propertiesRented: number;
  pendingRequests: number;
};
type RecentUser    = { id: string; name: string; email: string; role: string; createdAt: string };
type RecentRequest = { id: number; applicantName: string; propertyTitle: string; status: string; createdAt: string };

/* ─── CALENDAR ──────────────────────────────────────────────── */
const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type CalEvent = { day: number; label: string; color: string; text: string };
const EVENTS: CalEvent[] = [
  { day: 3,  label: "Visite – App. 3B",     color: "#FFF3E0", text: "#E65100" },
  { day: 8,  label: "Signature bail",        color: "#E8F5E9", text: "#2E7D32" },
  { day: 12, label: "Appel propriétaire",    color: "#E3F2FD", text: "#1565C0" },
  { day: 18, label: "Visite – App. 3B",     color: "#FFF3E0", text: "#E65100" },
  { day: 22, label: "Signature bail",        color: "#E8F5E9", text: "#2E7D32" },
  { day: 27, label: "Appel propriétaire",    color: "#E3F2FD", text: "#1565C0" },
];

function WeekView({ current }: { current: Date }) {
  const start = startOfWeek(current, { weekStartsOn: 1 });
  const hours  = Array.from({ length: 13 }, (_, i) => i + 8);
  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "40px repeat(7, 1fr)", borderBottom: "1px solid #F0F0F0" }}>
        <div />
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(start); d.setDate(start.getDate() + i);
          const isToday = isSameDay(d, new Date());
          return (
            <div key={i} style={{ textAlign: "center", padding: "6px 4px", fontSize: 11, fontWeight: 600, color: isToday ? "#1565C0" : "#888" }}>
              {WEEK_DAYS[i]}<br />
              <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", background: isToday ? "#EBF3FF" : "none", alignItems: "center", justifyContent: "center", fontSize: 12, color: isToday ? "#1565C0" : "#1A1A1A", fontWeight: isToday ? 700 : 500 }}>
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
          const isToday  = isSameDay(day, today);
          const inMonth  = isSameMonth(day, current);
          const dayNum   = day.getDate();
          const evts     = inMonth ? EVENTS.filter(e => e.day === dayNum) : [];
          return (
            <div key={day.toISOString()} style={{
              minHeight: 60, borderBottom: "1px solid #F0F0F0", borderRight: "1px solid #F0F0F0",
              background: isToday ? "#EBF3FF" : "#fff",
              padding: "4px 4px 2px",
              cursor: "pointer",
            }}
              onMouseEnter={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = "#F9F9F9"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isToday ? "#EBF3FF" : "#fff"; }}
            >
              <div style={{ textAlign: "right", fontSize: 12, color: isToday ? "#1565C0" : inMonth ? "#1A1A1A" : "#CCCCCC", fontWeight: isToday ? 700 : 400, marginBottom: 2 }}>
                {dayNum}
              </div>
              {evts.map((ev, ei) => (
                <div key={ei} style={{ background: ev.color, color: ev.text, fontSize: 10, borderRadius: 4, padding: "1px 4px", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ev.label}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarWidget() {
  const [current, setCurrent] = useState(new Date());
  const [view, setView]       = useState<"month" | "week" | "day">("month");
  const VIEW_LABELS = { month: "Mois", week: "Semaine", day: "Jour" } as const;

  return (
    <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
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

      {/* Nav */}
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
              background: view === v ? "#F5A623" : "#fff", color: view === v ? "#fff" : "#888",
            }}>
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {view === "month" && <MonthView current={current} />}
        {view === "week"  && <WeekView  current={current} />}
        {view === "day"   && (
          <div style={{ padding: 16, color: "#888", fontSize: 13, textAlign: "center" }}>
            Aucun événement aujourd'hui.
          </div>
        )}
      </div>
    </Card>
  );
}

/* ─── CARD helpers ──────────────────────────────────────────── */
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #EEEEEE", ...style }}>
      {children}
    </div>
  );
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
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F5A623"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#F5A623"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#555"; (e.currentTarget as HTMLElement).style.borderColor = "#E0E0E0"; }}>
      {children}
    </button>
  );
}

/* ─── SUMMARY BADGE ─────────────────────────────────────────── */
function Badge({ value }: { value: number | null }) {
  if (value === null) return <div style={{ width: 22, height: 22, borderRadius: 6, background: "#F0F0F0", animation: "pulse 1.5s infinite", flexShrink: 0 }} />;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 22, height: 22, borderRadius: 6, background: "#F5A623",
      color: "#fff", fontWeight: 700, fontSize: 11, padding: "0 5px", flexShrink: 0,
      transition: "transform 0.15s",
      cursor: "pointer",
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
      {value > 999 ? "999+" : value}
    </span>
  );
}

/* ─── SUMMARY WIDGET ────────────────────────────────────────── */
type SRow = { label: string; value: number | null; highlight?: boolean };

function SummaryWidget({ s }: { s: Stats | undefined }) {
  const left: SRow[] = [
    { label: "Messages non lus",            value: s ? 0  : null, highlight: true },
    { label: "Emails programmés",            value: s ? 0  : null, highlight: true },
    { label: "Notifications",               value: s ? 0  : null, highlight: true },
    { label: "Contacts",                    value: s?.totalUsers ?? null, highlight: true },
    { label: "Rendez-vous",                 value: s ? 0  : null, highlight: true },
    { label: "Tâches incomplètes",          value: s ? 0  : null, highlight: true },
    { label: "Tâches complètes",            value: s ? 0  : null, highlight: true },
    { label: "Objectifs non atteints",      value: s ? 0  : null, highlight: true },
    { label: "Objectifs atteints",          value: s ? 0  : null, highlight: false },
    { label: "Campagnes email programmées", value: s ? 0  : null, highlight: false },
    { label: "Emails envoyés via campagnes",value: s ? 0  : null, highlight: false },
    { label: "Transactions ouvertes",       value: s?.pendingRequests ?? null, highlight: false },
    { label: "Transactions fermées",        value: s ? 0  : null, highlight: false },
    { label: "Côtés acheteur",              value: s ? 0  : null, highlight: false },
  ];
  const right: SRow[] = [
    { label: "Côtés annonce",              value: s ? 0  : null },
    { label: "Annonces actives à vendre",  value: s ? 0  : null },
    { label: "Annonces actives à louer",   value: s?.propertiesAvailable ?? null },
    { label: "Baux en cours",              value: s ? 0  : null },
    { label: "Offres en cours",            value: s ? 0  : null },
    { label: "Références sortantes",       value: s ? 0  : null },
    { label: "Références reçues",          value: s ? 0  : null },
    { label: "Leads reçus",               value: s ? 0  : null },
    { label: "Visiteurs du site",          value: s ? 0  : null },
    { label: "Favoris sauvegardés",        value: s ? 0  : null },
    { label: "Recherches sauvegardées",    value: s ? 0  : null },
    { label: "Demandes d'information",     value: s ? 0  : null },
    { label: "Demandes de visite",         value: s?.totalRequests ?? null },
    { label: "Demandes d'offre",           value: s ? 0  : null },
  ];
  const maxRows = Math.max(left.length, right.length);

  return (
    <Card style={{ flex: 1, minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE" }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, border: "2px solid #F5A623" }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>Résumé</span>
        <div style={{ flex: 1 }} />
        <IconBtn><Settings style={{ width: 14, height: 14 }} /></IconBtn>
        <IconBtn><MoreHorizontal style={{ width: 14, height: 14 }} /></IconBtn>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 16px" }}>
          {Array.from({ length: maxRows }, (_, i) => {
            const lRow = left[i];
            const rRow = right[i];
            return [
              lRow ? (
                <div key={`l${i}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #FAFAFA" }}>
                  <Badge value={lRow.value} />
                  <span style={{ fontSize: 12, color: lRow.highlight ? "#F5A623" : "#555", cursor: lRow.highlight ? "pointer" : "default", fontWeight: lRow.highlight ? 500 : 400, truncate: "ellipsis" as any }}
                    onMouseEnter={e => { if (lRow.highlight) (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}>
                    {lRow.label}
                  </span>
                </div>
              ) : <div key={`le${i}`} />,
              rRow ? (
                <div key={`r${i}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0 5px 12px", borderBottom: "1px solid #FAFAFA" }}>
                  <Badge value={rRow.value} />
                  <span style={{ fontSize: 12, color: "#555" }}>{rRow.label}</span>
                </div>
              ) : <div key={`re${i}`} />,
            ];
          }).flat()}
        </div>
      </div>
    </Card>
  );
}

/* ─── RECENT ACTIVITY ───────────────────────────────────────── */
const ACTIVITIES = [
  { name: "Marie Tremblay", text: "a soumis une candidature — 102 Rue Ste-Catherine", time: "il y a 5 min" },
  { name: "Jean Bouchard",  text: "Nouveau message de Jean Bouchard",                   time: "il y a 23 min" },
  { name: "Bail signé",     text: "Bail signé — App. 7, Laval",                         time: "il y a 1h" },
  { name: "Visite",         text: "Visite confirmée — Plateau Mont-Royal",               time: "il y a 2h" },
  { name: "Lead",           text: "Nouveau lead entrant — Kijiji",                      time: "il y a 3h" },
];

function ActivityCard() {
  return (
    <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE" }}>
        <Zap style={{ width: 16, height: 16, color: "#F5A623" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Activité récente</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {ACTIVITIES.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", borderBottom: "1px solid #FAFAFA" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F5A623", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>{a.name.charAt(0)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, color: "#1A1A1A", margin: 0, lineHeight: 1.4 }}>{a.text}</p>
              <p style={{ fontSize: 11, color: "#AAA", margin: "2px 0 0" }}>{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── TASKS ─────────────────────────────────────────────────── */
const INITIAL_TASKS = [
  { text: "Suivre dossier Marie Tremblay",   due: "Auj. 17h",   done: false },
  { text: "Mettre à jour annonce Plateau",    due: "Demain",      done: false },
  { text: "Appeler propriétaire Laval",       due: "20 mai",      done: true  },
  { text: "Envoyer contrat bail App. 7",      due: "22 mai",      done: false },
  { text: "Vérifier paiement loyer juin",     due: "1 juin",      done: false },
];

function TasksCard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  return (
    <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE" }}>
        <CheckSquare style={{ width: 16, height: 16, color: "#F5A623" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A", flex: 1 }}>Tâches à faire</span>
        <span style={{ background: "#F5A623", color: "#fff", fontWeight: 700, fontSize: 11, borderRadius: 10, padding: "2px 8px" }}>
          {tasks.filter(t => !t.done).length}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tasks.map((task, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid #FAFAFA" }}>
            <button
              onClick={() => setTasks(ts => ts.map((t, j) => j === i ? { ...t, done: !t.done } : t))}
              style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${task.done ? "#F5A623" : "#F5A623"}`, background: task.done ? "#F5A623" : "#fff", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {task.done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
            </button>
            <span style={{ fontSize: 13, color: task.done ? "#AAA" : "#1A1A1A", textDecoration: task.done ? "line-through" : "none", flex: 1 }}>
              {task.text}
            </span>
            <span style={{ fontSize: 11, color: "#AAA", whiteSpace: "nowrap" }}>{task.due}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "8px 16px", borderTop: "1px solid #EEEEEE" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#F5A623", fontSize: 12, fontWeight: 600, padding: 0 }}>
          + Ajouter une tâche
        </button>
      </div>
    </Card>
  );
}

/* ─── QUICK STATS ───────────────────────────────────────────── */
function StatsCard({ s }: { s: Stats | undefined }) {
  const metrics = [
    { icon: Home,      label: "Propriétés actives",    value: s?.propertiesAvailable ?? null, color: "#F5A623" },
    { icon: Users,     label: "Contacts",               value: s?.totalUsers ?? null,          color: "#1565C0" },
    { icon: FileText,  label: "Transactions en cours",  value: s?.pendingRequests ?? null,     color: "#2E7D32" },
    { icon: Mail,      label: "Messages non lus",       value: null,                           color: "#E53935" },
  ];
  return (
    <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 10px", borderBottom: "1px solid #EEEEEE" }}>
        <BarChart2 style={{ width: 16, height: 16, color: "#F5A623" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Statistiques rapides</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#F0F0F0" }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: "#fff", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <m.icon style={{ width: 18, height: 18, color: m.color }} />
            <span style={{ fontSize: 28, fontWeight: 800, color: m.color, lineHeight: 1 }}>
              {m.value === null ? "—" : m.value}
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

      {/* Row 2: Activity + Tasks + Stats */}
      <div style={{ display: "flex", gap: 16, minHeight: 280 }}>
        <ActivityCard />
        <TasksCard />
        <StatsCard s={stats} />
      </div>
</>
  );
}
