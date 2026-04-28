import { ReactNode } from "react";
import { Link } from "wouter";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white dark:bg-[#0a0a0a]">
      <header className="fixed top-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold tracking-tighter text-[#1a237e] dark:text-[#f57c00]">bloq<span className="text-[#f57c00]">5</span></Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/properties" className="text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-200 hover:text-[#f57c00] transition-colors">Annonces</Link>
            <Link href="/pro" className="text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-200 hover:text-[#f57c00] transition-colors">Devenir Pro</Link>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
            <Link href="/sign-in" className="text-sm font-semibold text-[#1a237e] dark:text-white hover:text-[#f57c00] transition-colors">Se connecter</Link>
            <Link href="/sign-up" className="inline-flex h-10 items-center justify-center rounded-none bg-[#f57c00] px-6 text-sm font-bold text-white transition-colors hover:bg-[#e65100]">
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 pt-20">
        {children}
      </main>
      <footer className="bg-[#1a237e] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="text-3xl font-extrabold tracking-tighter text-white mb-6 block">bloq<span className="text-[#f57c00]">5</span></Link>
              <p className="text-blue-200 max-w-sm">
                La référence de l'immobilier premium. Une expérience repensée pour les locataires exigeants et les propriétaires professionnels.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Navigation</h4>
              <ul className="space-y-4 text-blue-200">
                <li><Link href="/properties" className="hover:text-white transition-colors">Annonces</Link></li>
                <li><Link href="/pro" className="hover:text-white transition-colors">Espace Pro</Link></li>
                <li><Link href="/sign-in" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-blue-200">
                <li>contact@bloq5.com</li>
                <li>+33 1 23 45 67 89</li>
                <li>Paris, France</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-blue-300">
            <p>&copy; {new Date().getFullYear()} bloq5. Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Mentions légales</a>
              <a href="#" className="hover:text-white">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}