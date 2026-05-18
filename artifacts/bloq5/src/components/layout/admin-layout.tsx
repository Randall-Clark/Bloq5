import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Building2, MessageSquare, LogOut, ExternalLink,
  BarChart2, CreditCard, MessageCircle, MapPin, Settings,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const DARK = "#1A1A1A";
const RED  = "#ef4444";

const NAV_SECTIONS = [
  {
    label: "Vue d'ensemble",
    items: [
      { href: "/admin/dashboard",      label: "Dashboard",        icon: LayoutDashboard },
      { href: "/admin/stats",          label: "Statistiques",     icon: BarChart2 },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: "/admin/users",          label: "Utilisateurs",     icon: Users },
      { href: "/admin/properties",     label: "Propriétés",       icon: Building2 },
      { href: "/admin/requests",       label: "Demandes",         icon: MessageSquare },
      { href: "/admin/subscriptions",  label: "Abonnements",      icon: CreditCard },
      { href: "/admin/messages",       label: "Messages",         icon: MessageCircle },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/cities",         label: "Villes",           icon: MapPin },
      { href: "/admin/settings",       label: "Paramètres",       icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: session } = authClient.useSession();

  function isActive(href: string) {
    return location === href || location.startsWith(href + "/");
  }

  async function handleLogout() {
    await authClient.signOut();
    navigate("/sign-in");
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: "#F5F5F5" }}>
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 flex flex-col overflow-hidden" style={{ background: DARK }}>

          {/* Logo */}
          <div className="px-5 py-4 border-b border-white/10">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                BLOQ<span style={{ color: "#F5A623" }}>5</span>
              </span>
              <span
                className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                style={{ background: RED, color: "#fff" }}
              >
                Admin
              </span>
            </Link>
          </div>

          {/* User chip */}
          {session?.user && (
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: RED, color: "#fff" }}>
                  {session.user.name?.charAt(0).toUpperCase() ?? "A"}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{session.user.name}</p>
                  <p className="text-white/40 text-[10px] truncate">{session.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav sections */}
          <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-none">
            {NAV_SECTIONS.map(section => (
              <div key={section.label}>
                <p className="px-3 mb-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={active ? { background: RED, color: "#fff", fontWeight: 700 } : { color: "rgba(255,255,255,0.55)" }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="px-3 py-3 border-t border-white/10 space-y-0.5">
            <a
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              Voir le site
            </a>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = RED; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-screen-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
