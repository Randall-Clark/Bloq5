import { Link } from "wouter";
import { useGetFeaturedProperties } from "@workspace/api-client-react";
import {
  Search, ChevronDown, Bed, Bath, Maximize2, MapPin,
  CheckCircle, FileText, PenLine, ClipboardList, ChevronRight
} from "lucide-react";

const YELLOW = "#F5A623";

const CITIES = [
  { name: "Paris", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&q=80" },
  { name: "Lyon", img: "https://images.unsplash.com/photo-1569949261756-48d5e02a9e8b?w=200&q=80" },
  { name: "Lille", img: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=200&q=80" },
  { name: "Bordeaux", img: "https://images.unsplash.com/photo-1588515724527-074a7a56616c?w=200&q=80" },
  { name: "Toulouse", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80" },
  { name: "Angoulême", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80" },
  { name: "Strasbourg", img: "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=200&q=80" },
  { name: "Avignon", img: "https://images.unsplash.com/photo-1562864778-3d3d75ac19e9?w=200&q=80" },
];

const STATIC_PROPS = [
  { title: "Appartement Studio – location meublée", city: "Tours", price: 550, bedrooms: 1, bathrooms: 1, area: 22, img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80" },
  { title: "Chambre 1 – colocation meublée", city: "Grenoble", price: 370, bedrooms: 1, bathrooms: 1, area: 14, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80" },
  { title: "Chambre 3 – colocation meublée", city: "Nancy", price: 350, bedrooms: 1, bathrooms: 1, area: 12, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80" },
  { title: "Chambre 2 – colocation meublée", city: "Villeneuve-d'Ascq", price: 730, bedrooms: 1, bathrooms: 1, area: 16, img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80" },
  { title: "Chambre 4 – colocation meublée", city: "Nouvelle-Vilaine", price: 490, bedrooms: 1, bathrooms: 1, area: 13, img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=80" },
  { title: "Chambre 5 – colocation meublée", city: "Rouen", price: 500, bedrooms: 1, bathrooms: 1, area: 15, img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=500&q=80" },
];

const ARTICLES = [
  { category: "Investissement", title: "Pourquoi investir dans une colocation ?", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80" },
  { category: "Baromètre", title: "Baromètre de la colocation 2025", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80" },
  { category: "City Guide", title: "Vivre à Lyon", img: "https://images.unsplash.com/photo-1569949261756-48d5e02a9e8b?w=500&q=80" },
];

export default function HomePage() {
  const { data: featured } = useGetFeaturedProperties();
  const displayProps = (featured && featured.length > 0) ? featured.slice(0, 6).map((p, i) => ({
    title: p.title,
    city: p.city,
    price: p.price,
    bedrooms: p.bedrooms ?? 1,
    bathrooms: p.bathrooms ?? 1,
    area: p.area ?? 20,
    img: p.images?.[0] ?? STATIC_PROPS[i % STATIC_PROPS.length].img,
    id: p.id,
  })) : STATIC_PROPS.map((p, i) => ({ ...p, id: i + 1 }));

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .script-yellow { font-family: 'Dancing Script', cursive; color: ${YELLOW}; font-weight: 700; }
        .btn-yellow { background: ${YELLOW}; color: #1A1A1A; font-weight: 600; border-radius: 6px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 6px; transition: opacity .2s; border: none; cursor: pointer; }
        .btn-yellow:hover { opacity: 0.88; }
        .btn-outline-yellow { background: transparent; color: ${YELLOW}; border: 1.5px solid ${YELLOW}; font-weight: 600; border-radius: 6px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: background .2s, color .2s; }
        .btn-outline-yellow:hover { background: ${YELLOW}; color: #1A1A1A; }
        .btn-outline-dark { background: transparent; color: #1A1A1A; border: 1.5px solid #1A1A1A; font-weight: 600; border-radius: 6px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: background .2s; }
        .btn-outline-dark:hover { background: #f0f0f0; }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black tracking-tight" style={{ color: "#1A1A1A" }}>
              BLOQ<span style={{ color: YELLOW }}>5</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/properties" className="hover:text-gray-900 transition-colors">Biens à louer</Link>
              <a href="#" className="hover:text-gray-900 transition-colors">À propos</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Articles</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-full px-4 py-2 hover:border-gray-400 transition-colors">
              <Search className="w-3.5 h-3.5" /> Référence
            </button>
            <Link href="/sign-in" className="text-sm font-semibold text-gray-700 border border-gray-400 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
              Se connecter
            </Link>
            <Link href="/sign-up" className="btn-yellow text-sm">
              Vous êtes propriétaire ? <ChevronDown className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section
        className="relative flex items-center justify-center"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1800&q=85)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "560px",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />

        {/* "Vu au journal" badge bottom-left */}
        <div className="absolute bottom-5 left-6 z-10 bg-white/90 rounded-lg px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-600 shadow-md">
          <span>Vu au journal de</span>
          <span className="font-black text-gray-900">TF1 · M6</span>
        </div>

        <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 text-center">
            {/* Badge */}
            <p className="text-xs text-gray-500 font-medium mb-4">
              <span style={{ color: YELLOW }} className="mr-1 text-base">✳</span>
              BLOQ5, votre plateforme de colocation 100% en ligne
            </p>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-snug mb-6" style={{ color: "#1A1A1A" }}>
              Visitez &{" "}
              <span className="script-yellow" style={{ fontSize: "1.15em" }}>louez</span>
              <br />
              depuis chez vous !
            </h1>

            {/* Search */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-5">
              <div className="flex items-center flex-1 px-4 py-3">
                <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher une ville, une école…"
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />
              </div>
              <button className="text-white text-sm font-semibold px-5 py-3 flex-shrink-0 transition-opacity hover:opacity-85" style={{ background: YELLOW }}>
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* City pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {["Paris", "Lyon", "Lille", "Bordeaux", "Toulouse", "Strasbourg"].map((c) => (
                <Link key={c} href={`/properties?city=${c}`}>
                  <span className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                    <MapPin className="w-3 h-3" />{c}
                  </span>
                </Link>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {[11, 12, 13, 14, 15].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/40?img=${i}`} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                <span className="text-amber-400">★★★★</span>
                <strong className="text-gray-800 ml-1">4.8</strong>
                {" "}+1 200 avis
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NOS DERNIERS BIENS ─── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-3">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "#1A1A1A" }}>
              Nos derniers biens à{" "}
              <span className="script-yellow" style={{ textDecoration: `underline ${YELLOW}` }}>louer</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Location ou colocation meublée, découvrez nos derniers appartements !</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            {displayProps.map((prop, i) => (
              <Link key={i} href={`/properties/${prop.id}`}>
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group bg-white">
                  <div className="relative h-44 overflow-hidden">
                    <span className="absolute top-2.5 left-2.5 z-10 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      ● Disponible
                    </span>
                    <img src={prop.img} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-1">{prop.title}</h3>
                    <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                      <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{prop.bedrooms} ch.</span>
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{prop.bathrooms} sdb</span>
                      <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{prop.area} m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{prop.city}
                      </span>
                      <span className="text-sm font-bold rounded-md px-3 py-1" style={{ background: YELLOW, color: "#1A1A1A" }}>
                        {prop.price} €/mois
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/properties">
              <button className="btn-outline-yellow text-sm px-8 py-3">
                8000 biens à découvrir — Voir tous les biens <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className="py-14" style={{ background: "#F8F8F8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="md:flex md:gap-16 items-start">
            <div className="md:w-1/3 mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Comment ça marche ?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                BLOQ5, la solution la plus simple et rapide pour trouver sa location meublée.
              </p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Search, color: "#E3F2FD", iconColor: "#1565C0", step: "Je sélectionne mon bien", desc: "Parmi les biens du catalogue BLOQ5, je choisis mon futur chez moi." },
                { icon: FileText, color: "#FFF3E0", iconColor: "#E65100", step: "Je dépose mon dossier", desc: "Déposez votre dossier directement en ligne en quelques minutes." },
                { icon: PenLine, color: "#E8F5E9", iconColor: "#2E7D32", step: "Je signe mes documents", desc: "Signez tous vos documents en ligne grâce à DocuSign®." },
                { icon: ClipboardList, color: "#F3E5F5", iconColor: "#6A1B9A", step: "Je réalise mon état des lieux", desc: "BLOQ5 réalise avec vous un état des lieux physique." },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: s.color }}>
                    <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>{s.step}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── VILLES COUP DE CŒUR ─── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
            Nos villes <span style={{ color: YELLOW }}>coup de cœur</span>
          </h2>
          <p className="text-gray-500 text-sm mb-10">
            BLOQ5 : gestion locative dans les plus grandes métropoles françaises.
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-8">
            {CITIES.map((city) => (
              <Link key={city.name} href={`/properties?city=${city.name}`}>
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg transition-shadow">
                    <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{city.name}</span>
                </div>
              </Link>
            ))}
          </div>
          <button className="btn-outline-yellow text-sm px-8 py-3">Voir toutes les villes</button>
        </div>
      </section>

      {/* ─── DOUBLE CTA ─── */}
      <section className="py-14" style={{ background: "#F8F8F8" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloc gauche – fond crème */}
          <div className="rounded-2xl p-8 flex flex-col" style={{ background: "#FEF9EE" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YELLOW }}>✳ BLOQ5 Solo</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
              Trouvez votre prochain locataire avec nous.
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Rejoignez Synric, Anais, Dorine, Felix et plus de 5000 propriétaires satisfaits. BLOQ5 gère votre colocation 100% en ligne, rapport 25% ROI annuel.
            </p>
            <ul className="space-y-2 mb-7">
              {["Annonce mise en ligne sous 24h", "Dossiers locataires vérifiés", "Zéro paperasse, 100% digital"].map((txt) => (
                <li key={txt} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#22C55E" }} />
                  {txt}
                </li>
              ))}
            </ul>
            <button className="btn-yellow self-start text-sm">Déposer une annonce</button>
          </div>

          {/* Bloc droit – fond jaune */}
          <div className="rounded-2xl p-8 flex flex-col" style={{ background: YELLOW }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2 text-white/80">✳ BLOQ5 Plus</div>
            <h3 className="text-xl font-bold mb-2 text-white">
              Optez pour la tranquillité totale, au meilleur prix
            </h3>
            <p className="text-sm text-white/80 mb-5">
              Plus de 400 propriétés nous font confiance pour la gestion complète de leurs logements, partout en France. Rejoignez notre plateforme nouvelle génération.
            </p>
            <ul className="space-y-2 mb-7">
              {["Mise en location express", "Gestion locative complète", "Suivi en temps réel"].map((txt) => (
                <li key={txt} className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-white" />
                  {txt}
                </li>
              ))}
            </ul>
            <button className="self-start text-sm font-semibold rounded-md px-5 py-2.5 transition-opacity hover:opacity-85" style={{ background: "#1A1A1A", color: "#fff" }}>
              Vous êtes propriétaire ?
            </button>
          </div>
        </div>
      </section>

      {/* ─── BIEN ENTOURÉE ─── */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="md:flex items-center gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>BLOQ5 bien entourée</h2>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Soutenu par la Banque Publique d'Investissement et labellisé French Tech &amp; Lyon Startup,
                BLOQ5 est accompagnée par les meilleurs acteurs de l'innovation immobilière depuis 2020.
              </p>
              <button className="btn-outline-dark text-sm px-6 py-2.5">En savoir +</button>
            </div>
            <div className="md:w-1/2 flex items-center justify-center gap-8 flex-wrap">
              {[
                { name: "bpifrance", color: "#003189" },
                { name: "La French Tech", color: "#e03531" },
                { name: "Real Estech", color: "#1A1A1A" },
              ].map((p) => (
                <div key={p.name} className="text-center">
                  <div className="font-black text-lg" style={{ color: p.color }}>{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ARTICLES ─── */}
      <section className="py-14" style={{ background: "#F8F8F8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Nos articles</p>
              <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>L'actu immobilière de BLOQ5</h2>
            </div>
            <button className="btn-yellow text-sm px-5 py-2">Tous les articles</button>
          </div>
          <p className="text-sm text-gray-500 mb-8">Tous les conseils pour vos logements et votre déménagement</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.map((a, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="relative h-40 overflow-hidden">
                  <img src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: YELLOW }}>{a.category}</span>
                  <h4 className="font-semibold text-sm mt-1 leading-snug" style={{ color: "#1A1A1A" }}>{a.title}</h4>
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 font-medium">
                    Lire l'article <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#1A1A1A", color: "#ccc" }} className="pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Logo + carte pro */}
            <div>
              <div className="text-2xl font-black text-white mb-2">BLOQ<span style={{ color: YELLOW }}>5</span></div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Carte professionnelle : n°CIN 4567<br />219-005-539-504
              </p>
            </div>
            {/* Nos services */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Nos services</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Gestion locative", "Estimation en ligne", "Gestion de colocations", "Gestion routine", "BLOQ5 ULTRA", "Tarifs"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            {/* Nos outils */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Nos outils</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Générateur de bail", "Générateur d'architectures", "Générateur de quittance", "AcroFAQ"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            {/* Société */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Société</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Références", "Presse", "Recrutement", "Politique cookies", "Mentions légales", "CGU"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* SEO links */}
          <div className="border-t border-gray-800 pt-8 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Location appartement", links: ["Paris", "Lyon", "Bordeaux", "Marseille"] },
              { title: "Appartements meublés", links: ["Toulouse", "Nice", "Lille", "Strasbourg"] },
              { title: "Appartements en colocation", links: ["Grenoble", "Nantes", "Rennes", "Montpellier"] },
              { title: "Appartements en coliving", links: ["Tours", "Metz", "Nancy", "Rouen"] },
            ].map((col) => (
              <div key={col.title}>
                <h5 className="text-xs font-semibold text-gray-400 mb-2">{col.title}</h5>
                <ul className="space-y-1">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-3">
            <p>© {new Date().getFullYear()} BLOQ5. Tous droits réservés.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-400">Mentions légales</a>
              <a href="#" className="hover:text-gray-400">Politique de confidentialité</a>
              <a href="#" className="hover:text-gray-400">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
