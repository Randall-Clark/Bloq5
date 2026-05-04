import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Building2, MessageSquare, Users, CreditCard, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/pro/dashboard",    label: "Dashboard",      icon: LayoutDashboard },
  { href: "/pro/properties",   label: "Propriétés",     icon: Building2 },
  { href: "/pro/requests",     label: "Demandes",       icon: MessageSquare },
  { href: "/pro/managers",     label: "Gestionnaires",  icon: Users },
  { href: "/pro/subscription", label: "Abonnement",     icon: CreditCard },
];

export default function ProLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  function isActive(href: string) {
    return location === href || (location.startsWith(href) && href !== "/pro");
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#F8F9FA" }}>
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-64 shrink-0 flex flex-col" style={{ background: "#1A237E" }}>
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/10">
            <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
              bloq<span style={{ color: "#F5A623" }}>5</span>
              <span className="ml-2 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)", color: "#F5A623" }}>Pro</span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={
                    active
                      ? { background: "#F5A623", color: "#fff" }
                      : { color: "rgba(219,234,254,0.85)" }
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Disconnect */}
          <div className="px-3 pb-5 border-t border-white/10 pt-3">
            <button
              onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: "rgba(219,234,254,0.7)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(219,234,254,0.7)")}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto flex flex-col min-h-0">
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>

          {/* Footer */}
          <footer style={{ background: "#1A237E" }} className="text-white mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-extrabold tracking-tighter">
                    bloq<span style={{ color: "#F5A623" }}>5</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-widest" style={{ background: "rgba(245,166,35,0.2)", color: "#F5A623" }}>Pro</span>
                </div>
                <div className="flex items-center gap-6 text-xs" style={{ color: "rgba(219,234,254,0.6)" }}>
                  <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
                  <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                  <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>
                <p className="text-xs" style={{ color: "rgba(219,234,254,0.5)" }}>
                  &copy; {new Date().getFullYear()} bloq5. Tous droits réservés.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
