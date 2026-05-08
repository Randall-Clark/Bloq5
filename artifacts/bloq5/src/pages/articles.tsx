import { useState } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { ChevronRight, Search } from "lucide-react";

const YELLOW = "#F5A623";

const CATEGORIES_LIST = ["Tous", "Guide propriétaire", "Guide locataire", "Marché commercial", "Juridique", "Fiscalité"];

const ARTICLES = [
  {
    category: "Guide propriétaire",
    title: "Gestion locative au Canada : comment déléguer en toute sérénité",
    excerpt: "Déléguer la gestion de votre bien à un professionnel vous fait gagner du temps et sécurise vos revenus. Découvrez nos conseils.",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
    date: "28 avril 2025",
    readTime: "6 min",
  },
  {
    category: "Marché commercial",
    title: "Bail commercial au Québec : ce que tout propriétaire doit savoir",
    excerpt: "Durée, indice de révision, clause de sortie — le bail commercial québécois a ses spécificités. On vous explique tout.",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    date: "20 avril 2025",
    readTime: "8 min",
  },
  {
    category: "Guide locataire",
    title: "Constituer un dossier locataire solide : les documents indispensables",
    excerpt: "Préparez un dossier complet et convaincant pour mettre toutes les chances de votre côté lors de votre prochaine candidature.",
    img: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=600&q=80",
    date: "8 avril 2025",
    readTime: "4 min",
  },
  {
    category: "Juridique",
    title: "Résiliation de bail en cours : droits et obligations des parties",
    excerpt: "Quelles conditions permettent de mettre fin à un bail avant son terme ? Ce que dit la loi au Québec et en Ontario.",
    img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
    date: "1 avril 2025",
    readTime: "7 min",
  },
  {
    category: "Fiscalité",
    title: "Revenus locatifs au Canada : comment optimiser votre déclaration fiscale",
    excerpt: "Déductions admissibles, amortissement, frais de gestion — les règles fiscales pour les propriétaires bailleurs en 2025.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    date: "22 mars 2025",
    readTime: "9 min",
  },
  {
    category: "Guide propriétaire",
    title: "Colocation : comment gérer un bien multi-locataires efficacement",
    excerpt: "Colocation étudiante ou professionnelle, gestion des chambres individuelles, baux multiples — nos bonnes pratiques.",
    img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80",
    date: "14 mars 2025",
    readTime: "5 min",
  },
  {
    category: "Marché commercial",
    title: "Louer un local commercial à Montréal : les quartiers à surveiller en 2025",
    excerpt: "Mile End, Griffintown, Rosemont — quelles artères offrent le meilleur rapport qualité/prix pour les commerces ?",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    date: "5 mars 2025",
    readTime: "6 min",
  },
  {
    category: "Guide locataire",
    title: "Visite virtuelle : comment évaluer un bien à distance avant de signer",
    excerpt: "Les visites 3D Matterport et les outils de visite virtuelle changent la façon dont les locataires choisissent leur logement.",
    img: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=600&q=80",
    date: "25 février 2025",
    readTime: "4 min",
  },
];

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = ARTICLES.filter((a) => {
    const matchCat = activeCategory === "Tous" || a.category === activeCategory;
    const matchQ = !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="py-16 px-6 text-center" style={{ background: "#F8F8F8" }}>
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ background: "#FFF8EE", color: YELLOW }}>
            Nos articles
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "#1A1A1A" }}>
            L'actu immobilière de <span style={{ color: YELLOW }}>BLOQ5</span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Conseils, guides et tendances pour propriétaires et locataires — résidentiel et commercial.
          </p>
        </div>
      </section>

      {/* Search + filters */}
      <section className="py-6 px-6 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un article…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={activeCategory === cat
                  ? { background: YELLOW, borderColor: YELLOW, color: "#1A1A1A" }
                  : { background: "white", borderColor: "#D1D5DB", color: "#4B5563" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-sm">Aucun article ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a, i) => (
                <article key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="relative h-44 overflow-hidden">
                    <img src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: YELLOW }}>{a.category}</span>
                    <h3 className="font-bold text-sm mt-1 leading-snug mb-2" style={{ color: "#1A1A1A" }}>{a.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{a.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{a.date}</span>
                      <span className="flex items-center gap-1 font-medium" style={{ color: YELLOW }}>
                        Lire <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
