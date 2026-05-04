import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { User, MessageSquare, Heart, Calendar, LogOut, ChevronLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PublicNavbar } from "@/components/public-navbar";

const YELLOW = "#F5A623";

const NAV_ITEMS = [
  { href: "/profile",           label: "Mon profil",    icon: User },
  { href: "/profile/requests",  label: "Mes demandes",  icon: MessageSquare },
  { href: "/profile/favorites", label: "Favoris",       icon: Heart },
  { href: "/profile/visits",    label: "Visites",       icon: Calendar },
];

export default function UserLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  function isActive(href: string) {
    return href === "/profile"
      ? location === "/profile"
      : location.startsWith(href);
  }

  return (
    <div className="min-h-[100dvh] bg-white" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Sub-header */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Back link */}
          <div className="pt-3 pb-0.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Tab row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-150"
                    style={{
                      borderBottomColor: active ? YELLOW : "transparent",
                      color: active ? "#1A1A1A" : "#9CA3AF",
                    }}
                  >
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: active ? YELLOW : "#9CA3AF" }}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() =>
                authClient.signOut({
                  fetchOptions: { onSuccess: () => { window.location.href = "/"; } },
                })
              }
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors py-3 px-2 ml-4 flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
