import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

const YELLOW = "#F5A623";

export function PublicNavbar({ activeItem }: { activeItem?: "biens" }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="text-2xl font-black tracking-tight" style={{ color: "#1A1A1A" }}>
            BLOQ<span style={{ color: YELLOW }}>5</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link
              href="/cities"
              className={activeItem === "biens" ? "font-semibold" : "hover:text-gray-900 transition-colors"}
              style={activeItem === "biens" ? { color: YELLOW } : {}}
            >
              Biens à louer
            </Link>
            <a href="#" className="hover:text-gray-900 transition-colors">À propos</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Articles</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sign-in"
            className="hidden sm:block text-sm font-semibold text-gray-700 border border-gray-400 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/sign-up"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold rounded-md px-3 py-1.5 transition-opacity hover:opacity-85"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            <span className="hidden lg:inline">Vous êtes </span>propriétaire ?
          </Link>
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-lg">
          <Link href="/cities" className="text-sm font-semibold py-3 border-b border-gray-50" style={activeItem === "biens" ? { color: YELLOW } : { color: "#1A1A1A" }} onClick={() => setOpen(false)}>
            Biens à louer
          </Link>
          <a href="#" className="text-sm font-medium text-gray-700 py-3 border-b border-gray-50" onClick={() => setOpen(false)}>À propos</a>
          <a href="#" className="text-sm font-medium text-gray-700 py-3 border-b border-gray-50" onClick={() => setOpen(false)}>Articles</a>
          <a href="#" className="text-sm font-medium text-gray-700 py-3 border-b border-gray-50" onClick={() => setOpen(false)}>Contact</a>
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/sign-in" className="text-sm font-semibold text-gray-700 border border-gray-400 rounded-md px-4 py-2.5 text-center hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>
              Se connecter
            </Link>
            <Link href="/sign-up" className="text-sm font-bold rounded-md px-4 py-2.5 text-center transition-opacity hover:opacity-85" style={{ background: YELLOW, color: "#1A1A1A" }} onClick={() => setOpen(false)}>
              Vous êtes propriétaire ?
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
