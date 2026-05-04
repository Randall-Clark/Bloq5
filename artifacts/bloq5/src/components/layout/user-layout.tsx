import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { User, MessageSquare, Heart, Calendar, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function UserLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/profile", label: "Mon Profil", icon: User },
    { href: "/profile/requests", label: "Mes demandes", icon: MessageSquare },
    { href: "/profile/favorites", label: "Favoris", icon: Heart },
    { href: "/profile/visits", label: "Visites", icon: Calendar },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-gray-50 dark:bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 shrink-0">
        <div className="p-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-[#1a237e] dark:text-[#f57c00]">
            bloq<span className="text-[#f57c00]">5</span>
          </Link>
        </div>
        <nav className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/profile");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#1a237e]/10 text-[#1a237e] dark:bg-[#f57c00]/10 dark:text-[#f57c00]" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
