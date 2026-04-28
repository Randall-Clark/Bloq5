import { Link } from "wouter";
import { useGetFeaturedProperties } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Home, Store, Users, Briefcase, Factory, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { data: properties, isLoading } = useGetFeaturedProperties();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
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

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero-exterior.png" 
              alt="Luxury Parisian exterior" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#1a237e]/40 dark:bg-[#0a0a0a]/60 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-[#0a0a0a]"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
              L'adresse de <br className="md:hidden" />votre réussite.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-medium drop-shadow">
              L'expérience immobilière repensée pour l'élégance, la transparence et la simplicité.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/properties" className="inline-flex h-14 items-center justify-center rounded-none bg-[#f57c00] px-8 text-base font-bold text-white transition-colors hover:bg-[#e65100] w-full sm:w-auto">
                Explorer les biens
              </Link>
              <Link href="/pro" className="inline-flex h-14 items-center justify-center rounded-none bg-white px-8 text-base font-bold text-[#1a237e] transition-colors hover:bg-gray-100 w-full sm:w-auto">
                Espace Propriétaire
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-24 bg-white dark:bg-[#0a0a0a]">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-[#1a237e] dark:text-white mb-4 tracking-tight">Biens d'exception</h2>
                <p className="text-gray-600 dark:text-gray-400">Une sélection rigoureuse pour une clientèle exigeante.</p>
              </div>
              <Link href="/properties" className="hidden md:flex items-center text-[#f57c00] font-semibold hover:text-[#e65100]">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[400px] w-full rounded-none" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties?.slice(0, 3).map((property) => (
                  <Link key={property.id} href={`/properties/${property.id}`}>
                    <Card className="group cursor-pointer rounded-none border-0 shadow-none bg-transparent overflow-hidden">
                      <div className="relative h-64 overflow-hidden mb-4">
                        <img 
                          src={property.images[0] || "/images/hero-interior.png"} 
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 bg-white px-3 py-1 text-xs font-bold tracking-wider text-[#1a237e]">
                          {property.type.toUpperCase()}
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-[#1a237e] dark:text-white group-hover:text-[#f57c00] transition-colors line-clamp-1">{property.title}</h3>
                          <span className="text-lg font-bold text-[#f57c00]">{property.price}€<span className="text-sm text-gray-500 font-normal">/mo</span></span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{property.city}</p>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-4">
                          {property.bedrooms && <span>{property.bedrooms} ch.</span>}
                          {property.area && <span>{property.area} m²</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="py-24 bg-gray-50 dark:bg-[#111]">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-[#1a237e] dark:text-white mb-16 tracking-tight">Votre style de vie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Home, label: "Maison", type: "house" },
                { icon: Building2, label: "Appartement", type: "apartment" },
                { icon: Users, label: "Coliving", type: "co-living" },
                { icon: Store, label: "Commerce", type: "commercial" },
                { icon: Briefcase, label: "Bureau", type: "office" },
                { icon: Factory, label: "Industriel", type: "industrial" },
              ].map((cat) => (
                <Link key={cat.type} href={`/properties?type=${cat.type}`}>
                  <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-[#1a1a1a] hover:bg-[#1a237e] hover:text-white dark:hover:bg-[#f57c00] transition-colors cursor-pointer group border border-gray-100 dark:border-gray-800">
                    <cat.icon className="h-8 w-8 mb-4 text-[#f57c00] group-hover:text-white transition-colors" />
                    <span className="text-sm font-semibold tracking-wide">{cat.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

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