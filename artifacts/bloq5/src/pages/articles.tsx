import { useState } from "react";
import { Link } from "wouter";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { ChevronRight, Search } from "lucide-react";
import { ARTICLES } from "@/data/articles";

const YELLOW = "#F5A623";

const CATEGORIES_LIST = ["Tous", "Guide propriétaire", "Guide locataire", "Marché commercial", "Juridique", "Fiscalité"];

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
              {filtered.map((a) => (
                <Link key={a.slug} href={`/articles/${a.slug}`}>
                  <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col">
                    <div className="relative h-44 overflow-hidden">
                      <img src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: YELLOW }}>{a.category}</span>
                      <h3 className="font-bold text-sm mt-1 leading-snug mb-2 flex-1" style={{ color: "#1A1A1A" }}>{a.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{a.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                        <span>{a.date} · {a.readTime}</span>
                        <span className="flex items-center gap-1 font-medium" style={{ color: YELLOW }}>
                          Lire <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
