import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { User, MessageSquare, Heart, Calendar, LogOut, ChevronLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PublicNavbar } from "@/components/public-navbar";

const YELLOW = "#F5A623";

export default function UserLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/profile", label: "Mon profil", icon: User },
    { href: "/profile/requests", label: "Mes demandes", icon: MessageSquare },
    { href: "/profile/favorites", label: "Favoris", icon: Heart },
    { href: "/profile/visits", label: "Visites", icon: Calendar },
  ];

  function isActive(href: string) {
    if (href === "/profile") return location === "/profile";
    return location.startsWith(href);
  }

  return (
    <div className="min-h-[100dvh] bg-white" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Sub-header: breadcrumb + account tabs */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Breadcrumb / back button */}
          <div className="pt-4 pb-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Horizontal tab nav */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 overflow-x-auto">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                      active
                        ? "border-[#F5A623] text-[#1A1A1A]"
                        : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    <item.icon className="w-4 h-4" style={active ? { color: YELLOW } : {}} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Disconnect */}
            <button
              onClick={() =>
                authClient.signOut({
                  fetchOptions: { onSuccess: () => { window.location.href = "/"; } },
                })
              }
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors py-3 px-2 ml-4"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
