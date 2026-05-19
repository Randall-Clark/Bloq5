import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, MessageSquare, Building2, FileText,
  Calendar, TrendingUp, BarChart2, UserCog, Shield, Settings,
  MapPin, HelpCircle, Trash2, ChevronDown, ChevronRight,
  Bell, Plus, RefreshCw, Download, Share2, Search,
  LogOut, Menu, X,
  Phone, Upload, Printer, MoreHorizontal, Mail, Star,
  FolderDown, BookOpen, Megaphone, BarChart, Tag, Filter,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type NavItem = {
  href?: string;
  label: string;
  icon: any;
  color: string;
  children?: { href: string; label: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard",     label: "Dashboard",            icon: LayoutDashboard, color: "#3b82f6" },
  {
    label: "Contacts",            icon: Users,                   color: "#22c55e",
    children: [
      { href: "/admin/users",                   label: "All Contacts" },
      { href: "/admin/contacts/providers",      label: "Services Providers" },
      { href: "/admin/contacts/groups",         label: "Groups" },
      { href: "/admin/contacts/company-leads",  label: "Company Leads" },
      { href: "/admin/contacts/leads-provider", label: "Leads Provider" },
      { href: "/admin/contacts/import-export",  label: "Import / Export" },
      { href: "/admin/contacts/playbook",       label: "Playbook" },
    ],
  },
  {
    label: "Messages",            icon: MessageSquare,           color: "#a855f7",
    children: [
      { href: "/admin/messages",  label: "Conversations" },
    ],
  },
  {
    label: "Propriétés",          icon: Building2,               color: "#f97316",
    children: [
      { href: "/admin/properties", label: "Toutes les annonces" },
      { href: "/admin/cities",     label: "Villes actives" },
    ],
  },
  {
    label: "Transactions",        icon: FileText,                color: "#eab308",
    children: [
      { href: "/admin/requests",  label: "Demandes" },
    ],
  },
  { href: "/admin/stats",         label: "Calendrier",           icon: Calendar,    color: "#6366f1" },
  {
    label: "Marketing",           icon: TrendingUp,              color: "#ec4899",
    children: [
      { href: "/admin/subscriptions", label: "Abonnements" },
    ],
  },
  { href: "/admin/stats",         label: "Rapports",             icon: BarChart2,   color: "#2563eb" },
  {
    label: "Comptes utilisateurs",icon: UserCog,                 color: "#6b7280",
    children: [
      { href: "/admin/users",     label: "Gestion des rôles" },
    ],
  },
  { href: "/admin/settings",      label: "Paramètres",           icon: Settings,    color: "#374151" },
  { href: "/admin/settings",      label: "Support",              icon: HelpCircle,  color: "#0ea5e9" },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":     "Dashboard",
  "/admin/stats":         "Statistiques",
  "/admin/users":         "Contacts",
  "/admin/properties":    "Propriétés",
  "/admin/requests":      "Transactions",
  "/admin/subscriptions": "Marketing — Abonnements",
  "/admin/messages":      "Messages",
  "/admin/cities":        "Villes actives",
  "/admin/settings":      "Paramètres",
};

function NavEntry({ item, location, collapsed }: { item: NavItem; location: string; collapsed: boolean }) {
  const isChildActive = item.children?.some(c => location === c.href || location.startsWith(c.href + "/"));
  const isSelfActive  = item.href && (location === item.href || location.startsWith(item.href + "/"));
  const isActive = isSelfActive || isChildActive;
  const [open, setOpen] = useState(!!isActive);

  if (item.href && !item.children) {
    return (
      <Link
        href={item.href}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all group cursor-pointer select-none"
        style={isActive ? { background: "#e8f0fe", color: "#1d4ed8" } : { color: "#374151" }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ""; }}
      >
        <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: item.color + "22" }}>
          <item.icon className="h-3 w-3" style={{ color: item.color }} />
        </span>
        {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
        style={isActive ? { background: "#e8f0fe", color: "#1d4ed8" } : { color: "#374151" }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ""; }}
      >
        <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: item.color + "22" }}>
          <item.icon className="h-3 w-3" style={{ color: item.color }} />
        </span>
        {!collapsed && (
          <>
            <span className="text-sm font-medium truncate flex-1 text-left">{item.label}</span>
            {open
              ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              : <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
          </>
        )}
      </button>

      {!collapsed && open && item.children && (
        <div className="ml-7 mt-0.5 space-y-0.5 border-l border-gray-200 pl-3">
          {item.children.map(child => {
            const childActive = location === child.href || location.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                className="block px-2 py-1.5 rounded text-sm transition-all"
                style={childActive ? { color: "#1d4ed8", fontWeight: 600 } : { color: "#6b7280" }}
                onMouseEnter={e => { if (!childActive) (e.currentTarget as HTMLElement).style.color = "#374151"; }}
                onMouseLeave={e => { if (!childActive) (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
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

/* ── Context-sensitive sidebar toolbar ─────────────────────── */
type ToolAction = { icon: any; label: string };

function getToolbarActions(location: string): ToolAction[] {
  if (location.startsWith("/admin/users") || location.startsWith("/admin/contacts")) {
    return [
      { icon: Plus,           label: "Nouveau contact" },
      { icon: Phone,          label: "Appeler" },
      { icon: Mail,           label: "Envoyer un email" },
      { icon: Upload,         label: "Importer" },
      { icon: Download,       label: "Exporter" },
      { icon: Printer,        label: "Imprimer" },
      { icon: MoreHorizontal, label: "Plus d'actions" },
    ];
  }
  if (location.startsWith("/admin/messages")) {
    return [
      { icon: Plus,           label: "Nouveau message" },
      { icon: Mail,           label: "Composer" },
      { icon: Star,           label: "Favoris" },
      { icon: Download,       label: "Exporter" },
      { icon: Trash2,         label: "Supprimer" },
      { icon: Settings,       label: "Paramètres" },
      { icon: MoreHorizontal, label: "Plus" },
    ];
  }
  if (location.startsWith("/admin/properties") || location.startsWith("/admin/cities")) {
    return [
      { icon: Plus,           label: "Nouvelle propriété" },
      { icon: Filter,         label: "Filtrer" },
      { icon: Tag,            label: "Étiquetter" },
      { icon: Download,       label: "Exporter" },
      { icon: Share2,         label: "Partager" },
      { icon: Printer,        label: "Imprimer" },
      { icon: MoreHorizontal, label: "Plus" },
    ];
  }
  if (location.startsWith("/admin/requests")) {
    return [
      { icon: Plus,           label: "Nouvelle demande" },
      { icon: Filter,         label: "Filtrer" },
      { icon: FolderDown,     label: "Archiver" },
      { icon: Download,       label: "Exporter" },
      { icon: Printer,        label: "Imprimer" },
      { icon: Settings,       label: "Paramètres" },
      { icon: MoreHorizontal, label: "Plus" },
    ];
  }
  if (location.startsWith("/admin/subscriptions")) {
    return [
      { icon: Plus,           label: "Nouvel abonnement" },
      { icon: Megaphone,      label: "Campagne" },
      { icon: BarChart,       label: "Statistiques" },
      { icon: Download,       label: "Exporter" },
      { icon: Printer,        label: "Imprimer" },
      { icon: Settings,       label: "Paramètres" },
      { icon: MoreHorizontal, label: "Plus" },
    ];
  }
  if (location.startsWith("/admin/stats")) {
    return [
      { icon: RefreshCw,      label: "Actualiser" },
      { icon: BarChart2,      label: "Graphiques" },
      { icon: Download,       label: "Exporter" },
      { icon: Share2,         label: "Partager" },
      { icon: Printer,        label: "Imprimer" },
      { icon: Settings,       label: "Paramètres" },
      { icon: MoreHorizontal, label: "Plus" },
    ];
  }
  if (location.startsWith("/admin/settings")) {
    return [
      { icon: Settings,       label: "Sauvegarder" },
      { icon: RefreshCw,      label: "Réinitialiser" },
      { icon: Download,       label: "Exporter config" },
      { icon: Upload,         label: "Importer config" },
      { icon: BookOpen,       label: "Documentation" },
      { icon: MoreHorizontal, label: "Plus" },
    ];
  }
  /* default / dashboard */
  return [
    { icon: Plus,           label: "Ajouter" },
    { icon: RefreshCw,      label: "Actualiser" },
    { icon: Download,       label: "Exporter" },
    { icon: Share2,         label: "Partager" },
    { icon: Printer,        label: "Imprimer" },
    { icon: Settings,       label: "Paramètres" },
    { icon: MoreHorizontal, label: "Plus" },
  ];
}

function SidebarToolbar({ location, collapsed }: { location: string; collapsed: boolean }) {
  const actions = getToolbarActions(location);
  const visible = collapsed ? actions.slice(0, 3) : actions;

  return (
    <div className="border-t border-gray-100 px-2 py-2 flex items-center justify-around gap-0.5">
      {visible.map(({ icon: Icon, label }) => (
        <button
          key={label}
          title={label}
          className="flex-1 flex items-center justify-center p-1.5 rounded transition-all text-gray-400 hover:text-[#F5A623] hover:bg-amber-50"
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
        </button>
      ))}
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [collapsed, setCollapsed] = useState(false);

  const pageTitle = PAGE_TITLES[location] ?? "Admin";
  const sidebarWidth = collapsed ? 56 : 220;

  async function handleLogout() {
    await authClient.signOut();
    navigate("/sign-in");
  }

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-gray-50">

      {/* Sidebar */}
      <aside
        className="shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden transition-all duration-300 z-50"
        style={{ width: sidebarWidth }}
      >
        {/* Logo + collapse */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#F5A623" }}>
                <span className="text-white text-[10px] font-black">B5</span>
              </div>
              <span className="text-sm font-extrabold text-gray-900 tracking-tight truncate">
                BLOQ<span style={{ color: "#F5A623" }}>5</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/admin/dashboard" className="mx-auto flex items-center justify-center">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#F5A623" }}>
                <span className="text-white text-[10px] font-black">B5</span>
              </div>
            </Link>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="flex items-center justify-center py-2 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map((item, i) => (
            <NavEntry key={i} item={item} location={location} collapsed={collapsed} />
          ))}

          <div className="my-2 border-t border-gray-100" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-gray-400 hover:text-red-500"
            onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
            onMouseLeave={e => (e.currentTarget.style.background = "")}
          >
            <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-red-50">
              <LogOut className="h-3 w-3 text-red-400" />
            </span>
            {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </nav>

        {/* User footer */}
        {!collapsed && session?.user && (
          <div className="px-3 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ background: "#F5A623" }}
              >
                {session.user.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 truncate">{session.user.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Context-sensitive bottom toolbar */}
        <SidebarToolbar location={location} collapsed={collapsed} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="shrink-0 h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
          <h1 className="text-sm font-bold text-gray-900">{pageTitle}</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Plus className="h-4 w-4" /></button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><RefreshCw className="h-4 w-4" /></button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Search className="h-4 w-4" /></button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><BarChart2 className="h-4 w-4" /></button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Bell className="h-4 w-4" /></button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><HelpCircle className="h-4 w-4" /></button>
            {session?.user && (
              <div className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: "#F5A623" }}>
                {session.user.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
            )}
            {session?.user && (
              <span className="text-xs font-semibold text-gray-700 hidden md:block">
                Hi, {session.user.name?.split(" ")[0] ?? "Admin"}
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
