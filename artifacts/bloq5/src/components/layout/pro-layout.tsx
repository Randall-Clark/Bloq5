import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Building2, MessageSquare, Users, CreditCard, LogOut, UserCircle, ExternalLink } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const YELLOW = "#F5A623";
const DARK   = "#1A1A1A";

const NAV_ITEMS = [
  { href: "/pro/dashboard",    label: "Dashboard",      icon: LayoutDashboard },
  { href: "/pro/properties",   label: "Propriétés",     icon: Building2 },
  { href: "/pro/requests",     label: "Demandes",       icon: MessageSquare },
  { href: "/pro/managers",     label: "Gestionnaires",  icon: Users },
  { href: "/pro/subscription", label: "Abonnement",     icon: CreditCard },
  { href: "/pro/profile",      label: "Profil Pro",     icon: UserCircle },
];

export default function ProLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  function isActive(href: string) {
    return location === href || (location.startsWith(href) && href !== "/pro");
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#F5F5F5" }}>

      {/* ── Sidebar + content row ── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar — height driven by the row, stops above footer */}
        <aside className="w-64 shrink-0 flex flex-col" style={{ background: DARK }}>

          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/10">
            <Link href="/pro/dashboard" className="inline-flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                BLOQ<span style={{ color: YELLOW }}>5</span>
              </span>
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                style={{ background: YELLOW, color: DARK }}
              >
                Pro
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={
                    active
                      ? { background: YELLOW, color: DARK, fontWeight: 700 }
                      : { color: "rgba(255,255,255,0.6)" }
                  }
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="px-3 pt-4 pb-0 space-y-0.5">
            <Link
              href="/"
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              Vue client
            </Link>
            <button
              onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Déconnexion
            </button>
          </div>
          <div className="mx-3 mt-4 border-t border-white/10" />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer — spans full width below sidebar + content */}
      <footer style={{ background: DARK }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-base font-black tracking-tight text-white">
              BLOQ<span style={{ color: YELLOW }}>5</span>
              <span
                className="ml-2 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                style={{ background: YELLOW, color: DARK }}
              >Pro</span>
            </span>
            <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              &copy; {new Date().getFullYear()} bloq5. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
