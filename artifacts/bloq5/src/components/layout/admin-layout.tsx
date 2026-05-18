import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, MessageSquare, Building2, FileText,
  Calendar, TrendingUp, BarChart2, UserCog, Shield, Settings,
  HelpCircle, Trash2, ChevronRight, ChevronLeft,
  Plus, Search, LayoutGrid, Home, Mail, LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type NavItem = {
  href?: string;
  label: string;
  icon: any;
  children?: { href: string; label: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard",      label: "Dashboard",            icon: LayoutDashboard },
  { label: "Contacts",             icon: Users,
    children: [
      { href: "/admin/users",               label: "All Contacts" },
      { href: "/admin/contacts/providers",  label: "Services Providers" },
      { href: "/admin/contacts/groups",     label: "Groups" },
      { href: "/admin/contacts/company-leads", label: "Company Leads" },
      { href: "/admin/contacts/leads-provider", label: "Leads Provider" },
      { href: "/admin/contacts/import-export",  label: "Import / Export" },
      { href: "/admin/contacts/playbook",   label: "Playbook" },
    ] },
  { label: "Messages",             icon: MessageSquare,
    children: [{ href: "/admin/messages", label: "Conversations" }] },
  { label: "Propriétés",           icon: Building2,
    children: [
      { href: "/admin/properties", label: "Toutes les annonces" },
      { href: "/admin/cities",     label: "Villes actives" },
    ] },
  { label: "Transactions",         icon: FileText,
    children: [{ href: "/admin/requests", label: "Demandes" }] },
  { href: "/admin/stats",          label: "Calendrier",           icon: Calendar },
  { label: "Marketing",            icon: TrendingUp,
    children: [{ href: "/admin/subscriptions", label: "Abonnements" }] },
  { href: "/admin/stats",          label: "Rapports",             icon: BarChart2 },
  { label: "Comptes utilisateurs", icon: UserCog,
    children: [{ href: "/admin/users", label: "Gestion des rôles" }] },
  { label: "Rôles de sécurité",    icon: Shield,
    children: [{ href: "/admin/users", label: "Permissions" }] },
  { href: "/admin/settings",       label: "Paramètres",           icon: Settings },
  { href: "/admin/settings",       label: "Corbeille",            icon: Trash2 },
  { href: "/admin/settings",       label: "Support",              icon: HelpCircle },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":     "Dashboard",
  "/admin/stats":         "Statistiques",
  "/admin/users":         "Contacts",
  "/admin/properties":    "Propriétés",
  "/admin/requests":      "Transactions",
  "/admin/subscriptions": "Marketing",
  "/admin/messages":      "Messages",
  "/admin/cities":        "Villes actives",
  "/admin/settings":      "Paramètres",
};

function NavEntry({ item, location, collapsed }: { item: NavItem; location: string; collapsed: boolean }) {
  const isChildActive = item.children?.some(c => location === c.href || location.startsWith(c.href + "/"));
  const isSelfActive  = item.href && (location === item.href || location.startsWith(item.href + "/"));
  const isActive = !!(isSelfActive || isChildActive);
  const [open, setOpen] = useState(!!isActive);

  const activeStyle   = { background: "#F5A623", color: "#1A1A1A" };
  const inactiveStyle = { color: "#AAAAAA" };
  const hoverStyle    = { background: "rgba(245,166,35,0.15)", color: "#fff" };

  function applyHover(el: HTMLElement) { if (!isActive) { el.style.background = hoverStyle.background; el.style.color = hoverStyle.color; } }
  function clearHover(el: HTMLElement) { if (!isActive) { el.style.background = ""; el.style.color = inactiveStyle.color; } }

  if (item.href && !item.children) {
    return (
      <Link href={item.href}
        className="flex items-center gap-3 px-5 py-2.5 rounded-lg transition-all cursor-pointer select-none text-[13px] font-medium"
        style={isActive ? activeStyle : inactiveStyle}
        onMouseEnter={e => applyHover(e.currentTarget as HTMLElement)}
        onMouseLeave={e => clearHover(e.currentTarget as HTMLElement)}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      </Link>
    );
  }

  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-2.5 rounded-lg transition-all text-[13px] font-medium"
        style={isActive ? activeStyle : inactiveStyle}
        onMouseEnter={e => applyHover(e.currentTarget as HTMLElement)}
        onMouseLeave={e => clearHover(e.currentTarget as HTMLElement)}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left">{item.label}</span>
            <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
          </>
        )}
      </button>

      {!collapsed && open && item.children && (
        <div className="ml-8 mt-0.5 space-y-0.5">
          {item.children.map(child => {
            const childActive = location === child.href || location.startsWith(child.href + "/");
            return (
              <Link key={child.href} href={child.href}
                className="block px-3 py-1.5 rounded text-[12px] transition-all"
                style={childActive ? { color: "#F5A623", fontWeight: 600 } : { color: "#777777" }}
                onMouseEnter={e => { if (!childActive) (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                onMouseLeave={e => { if (!childActive) (e.currentTarget as HTMLElement).style.color = "#777777"; }}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [collapsed, setCollapsed] = useState(false);

  const pageTitle = PAGE_TITLES[location] ?? "Admin";
  const userName  = session?.user?.name ?? "Admin";
  const initials  = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const sidebarW  = collapsed ? 60 : 220;

  async function handleLogout() {
    await authClient.signOut();
    navigate("/sign-in");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100vw", overflow: "hidden", background: "#F7F7F7", fontFamily: "'Inter', sans-serif" }}>

      {/* TOPBAR */}
      <header style={{ height: 52, background: "#fff", borderBottom: "1px solid #EEEEEE", display: "flex", alignItems: "center", paddingLeft: 16, paddingRight: 20, gap: 12, flexShrink: 0, zIndex: 50 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: collapsed ? 44 : 188, transition: "width 0.3s ease", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, background: "#F5A623", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>B</span>
          </div>
          {!collapsed && <span style={{ fontWeight: 800, fontSize: 14, color: "#1A1A1A", whiteSpace: "nowrap" }}>BLOQ5</span>}
        </div>

        {/* Collapse btn */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ width: 32, height: 32, borderRadius: "50%", background: "#F5F5F5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#888" }}
        >
          {collapsed ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
        </button>

        {/* Page title */}
        <span style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginLeft: 8, whiteSpace: "nowrap" }}>{pageTitle}</span>

        <div style={{ flex: 1 }} />

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {[
            { icon: Plus, title: "Ajouter" },
            { icon: Search, title: "Recherche" },
            { icon: Settings, title: "Paramètres" },
            { icon: BarChart2, title: "Rapports" },
            { icon: LayoutGrid, title: "Grille" },
            { icon: HelpCircle, title: "Aide" },
          ].map(({ icon: Icon, title }) => (
            <button key={title} title={title} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 2, display: "flex" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#888")}>
              <Icon style={{ width: 18, height: 18 }} />
            </button>
          ))}

          <div style={{ width: 1, height: 20, background: "#E0E0E0" }} />

          <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>Bonjour, {userName.split(" ")[0]}</span>

          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F5A623", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{initials}</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* SIDEBAR */}
        <aside style={{
          width: sidebarW, transition: "width 0.3s ease", background: "#1A1A1A",
          display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
        }}>
          {/* Sidebar logo */}
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            {!collapsed && (
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>
                BLOQ<span style={{ color: "#F5A623" }}>5</span>
              </span>
            )}
            {collapsed && (
              <span style={{ color: "#F5A623", fontWeight: 900, fontSize: 16 }}>B</span>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "4px 8px", scrollbarWidth: "none" }}>
            {NAV_ITEMS.map((item, i) => (
              <NavEntry key={i} item={item} location={location} collapsed={collapsed} />
            ))}
          </nav>

          {/* Bottom quick actions */}
          <div style={{ borderTop: "1px solid #333", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            {[Plus, Users, Trash2, Home, Mail].map((Icon, i) => (
              <button key={i} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 4, display: "flex" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
                onMouseLeave={e => (e.currentTarget.style.color = "#666")}>
                <Icon style={{ width: 16, height: 16 }} />
              </button>
            ))}
            <button onClick={handleLogout} title="Déconnexion" style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 4, display: "flex" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "#666")}>
              <LogOut style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Sub-topbar */}
          <div style={{ height: 44, background: "#fff", borderBottom: "1px solid #EEEEEE", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
            <SubTopbarDropdown />
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {[
                { icon: "share", label: "Partager" },
                { icon: "download", label: "Télécharger" },
                { icon: "export", label: "Exporter" },
                { icon: "print", label: "Imprimer" },
                { icon: "settings", label: "Options" },
                { icon: "more", label: "Plus" },
              ].map(a => (
                <SubAction key={a.icon} label={a.label} />
              ))}
            </div>
          </div>

          {/* Page */}
          <main style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function SubTopbarDropdown() {
  const [open, setOpen] = useState(false);
  const items = ["Dashboard principal", "Vue propriétaire", "Vue locataire", "Vue analytique"];
  const [selected, setSelected] = useState(items[0]);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: "#fff", border: "1px solid #E0E0E0", borderRadius: 20,
        padding: "8px 16px", fontSize: 13, color: "#1A1A1A", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6, fontWeight: 500,
      }}>
        {selected}
        <ChevronRight style={{ width: 14, height: 14, transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff",
          border: "1px solid #E0E0E0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          zIndex: 100, minWidth: 180, overflow: "hidden",
        }}>
          {items.map(item => (
            <button key={item} onClick={() => { setSelected(item); setOpen(false); }} style={{
              display: "block", width: "100%", textAlign: "left", padding: "10px 16px",
              fontSize: 13, color: item === selected ? "#F5A623" : "#1A1A1A",
              background: "none", border: "none", cursor: "pointer", fontWeight: item === selected ? 600 : 400,
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F7F7F7")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SubAction({ label }: { label: string }) {
  return (
    <button title={label} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 2, fontSize: 12 }}
      onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
      onMouseLeave={e => (e.currentTarget.style.color = "#888")}>
      <Settings style={{ width: 18, height: 18 }} />
    </button>
  );
}
