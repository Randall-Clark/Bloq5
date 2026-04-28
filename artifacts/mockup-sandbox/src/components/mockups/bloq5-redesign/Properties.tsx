import React from 'react';
import { Search, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Properties() {
  const properties = [
    { title: "Appartement Haussmannien", city: "Paris 9e", price: "2800€", type: "Appartement", specs: "3 ch. · 95m²", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600" },
    { title: "Maison avec Jardin", city: "Bordeaux", price: "1900€", type: "Maison", specs: "4 ch. · 120m²", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600" },
    { title: "Studio Cosy", city: "Paris 3e", price: "1350€", type: "Studio", specs: "1 ch. · 35m²", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600" },
    { title: "Coliving Moderne", city: "Lyon", price: "750€", type: "Coliving", specs: "1 ch. · 18m² (privé)", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600" },
    { title: "Bureau Premium", city: "La Défense", price: "4500€", type: "Bureau", specs: "Open space · 150m²", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600" },
    { title: "Villa avec Piscine", city: "Nice", price: "3200€", type: "Villa", specs: "5 ch. · 200m²", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600" }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-3xl font-black tracking-tight text-[#1a237e]">bloq<span className="text-[#f57c00]">5</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-[#1a237e] font-bold transition-colors">Annonces</a>
              <a href="#" className="text-slate-600 hover:text-[#1a237e] font-medium transition-colors">Devenir Pro</a>
              <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                <Button variant="outline" className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white rounded-full px-6 font-medium">Se connecter</Button>
                <Button className="bg-[#f57c00] hover:bg-[#e67300] text-white rounded-full px-6 shadow-md font-medium">Créer un compte</Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Page */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-[#1a237e] mb-2">Biens disponibles</h1>
            <p className="text-slate-500 font-medium">6 résultats correspondants à votre recherche</p>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <Card className="bg-white border-0 shadow-sm rounded-2xl sticky top-28">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 font-bold text-[#1a237e] text-lg mb-6">
                <SlidersHorizontal className="w-5 h-5" />
                Filtres
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Localisation</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input placeholder="Saisir une ville..." className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-[#1a237e]/20" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Type de bien</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-[#1a237e]/20">
                      <SelectValue placeholder="Tous types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="appartement">Appartement</SelectItem>
                      <SelectItem value="maison">Maison</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="coliving">Coliving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Budget max. (€)</label>
                  <Input type="number" placeholder="ex: 1500" className="bg-slate-50 border-slate-200 focus-visible:ring-[#1a237e]/20" />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button variant="outline" className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 rounded-xl font-medium">
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((prop, i) => (
              <Card key={i} className="rounded-2xl overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow group bg-white cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium border-0 px-2.5 py-0.5">
                      Disponible
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="outline" className="bg-white/90 text-[#1a237e] border-0 shadow-sm backdrop-blur-sm font-semibold px-2 py-0.5">
                      {prop.type}
                    </Badge>
                  </div>
                  <img 
                    src={prop.image} 
                    alt={prop.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
                    <div className="flex items-center text-white/95 text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {prop.city}
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex flex-col h-full justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg text-[#1a237e] line-clamp-1 mb-1">{prop.title}</h3>
                      <p className="text-slate-500 text-sm font-medium">{prop.specs}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[#f57c00]">
                        <span className="text-xl font-bold">{prop.price}</span>
                        <span className="text-xs font-medium uppercase tracking-wider ml-1 text-slate-400">/mois</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-[#1a237e] hover:bg-[#1a237e]/5 p-0 h-auto font-semibold">
                        Détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
