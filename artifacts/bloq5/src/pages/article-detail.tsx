import { useParams, Link } from "wouter";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { ArrowLeft, Clock, CalendarDays, ChevronRight } from "lucide-react";
import { ARTICLES } from "@/data/articles";

const YELLOW = "#F5A623";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = ARTICLES.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="text-gray-400 text-sm mb-4">Article introuvable.</p>
          <Link href="/articles">
            <span className="text-sm font-semibold cursor-pointer" style={{ color: YELLOW }}>← Retour aux articles</span>
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const related = ARTICLES.filter(a => a.slug !== slug && a.category === article.category).slice(0, 2);

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-2">
        <Link href="/articles">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Tous les articles
          </span>
        </Link>
      </div>

      {/* Article header */}
      <article className="max-w-3xl mx-auto px-6 pb-16 pt-4">
        <header className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: YELLOW }}>
            {article.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 mb-4 leading-snug" style={{ color: "#1A1A1A" }}>
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
            <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {article.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime} de lecture</span>
          </div>
          {/* Cover image */}
          <div className="w-full h-56 md:h-80 rounded-2xl overflow-hidden mb-6">
            <img src={article.img} alt={article.title} className="w-full h-full object-cover" />
          </div>
          {/* Lead */}
          <p className="text-base text-gray-500 leading-relaxed border-l-4 pl-4" style={{ borderColor: YELLOW }}>
            {article.excerpt}
          </p>
        </header>

        {/* Body */}
        <div className="prose-like space-y-7">
          {article.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-lg font-bold mb-3 mt-6" style={{ color: "#1A1A1A" }}>
                  {section.heading}
                </h2>
              )}
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {section.body.split(/\*\*(.*?)\*\*/g).map((part, idx) =>
                  idx % 2 === 1
                    ? <strong key={idx} className="font-semibold text-gray-800">{part}</strong>
                    : <span key={idx}>{part}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl" style={{ background: "#FFF8EE" }}>
          <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>Gérez vos biens avec BLOQ5</p>
          <p className="text-xs text-gray-500 mb-4">Publication d'annonces, dossiers candidats, signature de bail et suivi des paiements — tout en un.</p>
          <Link href="/sign-up">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-85 cursor-pointer" style={{ background: YELLOW, color: "#1A1A1A" }}>
              Créer un compte Pro <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 py-12 px-6" style={{ background: "#F8F8F8" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-base font-bold mb-6" style={{ color: "#1A1A1A" }}>Dans la même catégorie</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(a => (
                <Link key={a.slug} href={`/articles/${a.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex gap-4 p-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <img src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold" style={{ color: YELLOW }}>{a.category}</span>
                      <p className="text-sm font-bold leading-snug mt-0.5 line-clamp-2" style={{ color: "#1A1A1A" }}>{a.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{a.readTime} de lecture</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
