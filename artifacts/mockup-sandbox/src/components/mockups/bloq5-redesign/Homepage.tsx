import React from 'react';
import { Search, MapPin, Home, FileText, Activity, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Homepage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-3xl font-black tracking-tight text-[#1a237e]">bloq<span className="text-[#f57c00]">5</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-slate-600 hover:text-[#1a237e] font-medium transition-colors">Annonces</a>
              <a href="#" className="text-slate-600 hover:text-[#1a237e] font-medium transition-colors">Devenir Pro</a>
              <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                <Button variant="outline" className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white rounded-full px-6 font-medium">Se connecter</Button>
                <Button className="bg-[#f57c00] hover:bg-[#e67300] text-white rounded-full px-6 shadow-md shadow-[#f57c00]/20 font-medium">Créer un compte</Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section 
        className="relative pt-32 pb-40 flex items-center justify-center min-h-[700px]"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center bg-[#1a237e]/10 text-[#1a237e] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🏠 La location immobilière simplifiée
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a237e] mb-8 tracking-tight">
              Trouvez & <span className="font-['Playfair_Display'] italic text-[#f57c00] font-medium">louez</span> votre bien idéal
            </h1>
            
            <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-2xl md:rounded-full shadow-lg border border-slate-100 mb-8 max-w-3xl mx-auto">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 text-slate-400 w-5 h-5" />
                <Input 
                  placeholder="Ville, quartier…" 
                  className="pl-12 border-0 focus-visible:ring-0 shadow-none text-lg h-14 bg-transparent"
                />
              </div>
              <Button className="bg-[#f57c00] hover:bg-[#e67300] text-white rounded-xl md:rounded-full h-14 px-8 text-lg font-semibold shadow-md w-full md:w-auto">
                Rechercher
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8 text-sm font-medium text-slate-500">
              <span className="hover:text-[#1a237e] cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 transition-colors">Paris</span>
              <span className="hover:text-[#1a237e] cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 transition-colors">Lyon</span>
              <span className="hover:text-[#1a237e] cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 transition-colors">Bordeaux</span>
              <span className="hover:text-[#1a237e] cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 transition-colors">Nice</span>
              <span className="hover:text-[#1a237e] cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 transition-colors">Toulouse</span>
              <span className="hover:text-[#1a237e] cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 transition-colors">Strasbourg</span>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100/50">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 z-${10-i} overflow-hidden`}>
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start">
                <div className="flex text-amber-400 text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-sm font-semibold text-slate-700">4.8 ★ · +1 200 locataires satisfaits</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Biens à la une */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a237e] mb-4">
              Nos derniers biens à <span className="font-['Playfair_Display'] italic text-[#f57c00] font-medium">louer</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Location ou colocation meublée, découvrez nos dernières annonces exclusives vérifiées par nos soins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Appartement Haussmannien",
                city: "Paris 9e",
                price: "2800€",
                image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
                specs: "3 ch. · 95m²"
              },
              {
                title: "Maison avec Jardin",
                city: "Bordeaux",
                price: "1900€",
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
                specs: "4 ch. · 120m²"
              },
              {
                title: "Studio Cosy",
                city: "Paris 3e",
                price: "1350€",
                image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
                specs: "1 ch. · 35m²"
              }
            ].map((prop, i) => (
              <Card key={i} className="rounded-2xl overflow-hidden border-0 shadow-lg shadow-slate-200/50 group cursor-pointer hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium border-0 shadow-sm px-3 py-1">
                      Disponible
                    </Badge>
                  </div>
                  <img 
                    src={prop.image} 
                    alt={prop.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                    <div className="flex items-center text-white/90 text-sm font-medium">
                      <MapPin className="w-4 h-4 mr-1" />
                      {prop.city}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-[#1a237e] mb-1 line-clamp-1">{prop.title}</h3>
                      <p className="text-slate-500 text-sm font-medium">{prop.specs}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-bold text-[#f57c00] leading-none">{prop.price}</span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">/mois</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="outline" className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e]/5 rounded-full px-8 py-6 text-lg font-semibold inline-flex items-center group">
              Voir toutes les annonces
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pourquoi bloq5 */}
      <section className="py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a237e] mb-4">
              Pourquoi choisir <span className="text-[#f57c00]">bloq5</span> ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-[#1a237e]">
                <Home className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#1a237e] mb-3">Visite virtuelle 100% en ligne</h3>
              <p className="text-slate-600 leading-relaxed">
                Visitez votre futur logement depuis votre canapé. Des visites 3D immersives pour vous projeter avant même de vous déplacer.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-[#1a237e]">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#1a237e] mb-3">Dossier simplifié</h3>
              <p className="text-slate-600 leading-relaxed">
                Déposez votre dossier de location en quelques clics. Un profil unique valable pour toutes vos candidatures.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-[#1a237e]">
                <Activity className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#1a237e] mb-3">Suivi en temps réel</h3>
              <p className="text-slate-600 leading-relaxed">
                Soyez notifié à chaque étape. De la visite à la signature du bail, suivez l'avancement de votre dossier instantanément.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a237e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <span className="text-3xl font-black tracking-tight text-white mb-6 block">bloq<span className="text-[#f57c00]">5</span></span>
              <p className="text-blue-200 max-w-sm mb-6">
                La plateforme française qui simplifie la gestion locative pour les locataires et les propriétaires.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Locataires</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Rechercher un bien</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mon dossier</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Propriétaires</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Confier son bien</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs gestion</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Espace Pro</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800/50 pt-8 flex flex-col md:flex-row justify-between items-center text-blue-300 text-sm">
            <p>© {new Date().getFullYear()} bloq5. Tous droits réservés.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">CGU</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
