import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Building2, MessageSquare, Users, CreditCard, LogOut } from "lucide-react";
import { useClerk } from "@clerk/react";

export default function ProLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();

  const navItems = [
    { href: "/pro/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pro/properties", label: "Propriétés", icon: Building2 },
    { href: "/pro/requests", label: "Demandes", icon: MessageSquare },
    { href: "/pro/managers", label: "Gestionnaires", icon: Users },
    { href: "/pro/subscription", label: "Abonnement", icon: CreditCard },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      {/* Sidebar - Darker Pro Theme */}
      <aside className="w-full md:w-64 bg-[#1a237e] dark:bg-[#111111] text-white shrink-0 shadow-xl">
        <div className="p-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            bloq<span className="text-[#f57c00]">5</span>
            <span className="ml-2 text-xs font-medium tracking-widest text-[#f57c00] uppercase bg-white/10 px-2 py-0.5 rounded">Pro</span>
          </Link>
        </div>
        <nav className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/pro");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#f57c00] text-white shadow-sm" 
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 opacity-90" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 opacity-90" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}