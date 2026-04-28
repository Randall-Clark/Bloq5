import React from 'react';
import { Search, MapPin, ChevronDown, AlertTriangle } from 'lucide-react';

export function Homepage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .script { font-family: 'Dancing Script', cursive; }
      `}</style>

      {/* Alert Banner */}
      <div className="bg-[#f57c00] text-white text-sm py-3 px-4 text-center">
        <span className="mr-2">🚨</span>
        <strong>Soyez vigilants :</strong> les fausses annonces immobilières peuvent circuler,{' '}
        <a href="#" className="underline font-semibold">apprenez à les détecter</a>{' '}
        et en cas de doute,{' '}
        <a href="#" className="underline font-semibold">contactez-nous.</a>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <a href="#" className="flex items-center gap-1">
                <span className="text-2xl font-black text-[#1a237e] tracking-tight">bloq</span>
                <span className="text-2xl font-black text-[#f57c00] tracking-tight">5</span>
              </a>
              {/* Nav links */}
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <a href="#" className="hover:text-[#1a237e] transition-colors">Biens à louer</a>
                <a href="#" className="hover:text-[#1a237e] transition-colors">À propos</a>
                <a href="#" className="hover:text-[#1a237e] transition-colors">Articles</a>
                <a href="#" className="hover:text-[#1a237e] transition-colors">Contact</a>
              </div>
            </div>
            {/* Right buttons */}
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2 text-slate-600 text-sm font-medium border border-slate-300 rounded-full px-4 py-2 hover:border-slate-400 transition-colors">
                <Search className="w-3.5 h-3.5" />
                Référence
              </button>
              <button className="text-slate-700 text-sm font-semibold border border-slate-700 rounded-sm px-5 py-2 hover:bg-slate-50 transition-colors">
                Se connecter
              </button>
              <button className="flex items-center gap-2 bg-[#f57c00] hover:bg-[#e67300] text-white text-sm font-semibold rounded-sm px-5 py-2 transition-colors">
                Vous êtes propriétaire
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '580px',
        }}
      >
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
            {/* Badge */}
            <p className="text-sm text-slate-500 font-medium mb-5">
              <span className="text-[#f57c00] mr-1">✳</span>
              bloq5, 1ère plateforme de location 100% en ligne
            </p>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-7">
              Visitez &{' '}
              <span className="script text-[#f57c00]" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}>
                louez
              </span>
              <br />
              depuis chez vous !
            </h1>

            {/* Search bar */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm mb-6 overflow-hidden">
              <div className="flex items-center flex-1 px-4 py-3">
                <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher une ville, un quartier..."
                  className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
                />
              </div>
              <button className="bg-[#f57c00] hover:bg-[#e67300] text-white px-5 py-3 flex-shrink-0 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* City pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-7 text-sm text-slate-600">
              {['Paris', 'Lyon', 'Lille', 'Bordeaux', 'Toulouse', 'Angoulême', 'Strasbourg'].map((city) => (
                <button
                  key={city}
                  className="flex items-center gap-1 border border-slate-300 rounded-full px-3 py-1 hover:border-[#1a237e] hover:text-[#1a237e] transition-colors text-xs"
                >
                  <MapPin className="w-3 h-3" />
                  {city}
                </button>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {[11, 12, 13, 14, 15].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/40?img=${i}`}
                    alt="user"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <span className="text-amber-400">★★★★</span>
                <span className="font-semibold">4.8</span>
                <span className="text-slate-400">+1 200 avis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              Nos derniers biens à{' '}
              <span className="script text-[#f57c00]" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}>
                louer
              </span>
            </h2>
            <p className="text-slate-500 text-base">
              Location ou colocation meublée, découvrez nos derniers appartements !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Appartement Haussmannien',
                city: 'Paris 9e',
                price: '2 800',
                image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
                specs: '3 pièces · 95m²',
              },
              {
                title: 'Maison avec Jardin',
                city: 'Bordeaux',
                price: '1 900',
                image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
                specs: '5 pièces · 120m²',
              },
              {
                title: 'Studio Cosy',
                city: 'Paris 3e',
                price: '1 350',
                image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
                specs: '1 pièce · 35m²',
              },
            ].map((p, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="relative h-56 overflow-hidden">
                  <span className="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    ● Disponible
                  </span>
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-base mb-1">{p.title}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.city} · {p.specs}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-800">{p.price}€</span>
                      <span className="text-slate-400 text-xs block">/mois</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button className="border border-[#1a237e] text-[#1a237e] font-semibold px-8 py-3 rounded-sm hover:bg-[#1a237e]/5 transition-colors text-sm">
              Voir toutes les annonces
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a237e] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2">
              <div className="text-2xl font-black mb-4">
                bloq<span className="text-[#f57c00]">5</span>
              </div>
              <p className="text-blue-200 text-sm max-w-xs">
                La plateforme française qui simplifie la gestion locative pour les locataires et les propriétaires.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Locataires</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Rechercher un bien</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mon dossier</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Propriétaires</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Confier son bien</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs gestion</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Espace Pro</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-6 flex flex-col md:flex-row justify-between items-center text-blue-300 text-xs gap-3">
            <p>© {new Date().getFullYear()} bloq5. Tous droits réservés.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Mentions légales</a>
              <a href="#" className="hover:text-white">CGU</a>
              <a href="#" className="hover:text-white">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
