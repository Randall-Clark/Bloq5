import { useState } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  Heart, Zap, Users, Globe, ArrowRight, SearchX,
} from "lucide-react";

const YELLOW = "#F5A623";

const BENEFITS = [
  { icon: Heart,  title: "Bien-être au travail",    desc: "Horaires flexibles, télétravail partiel, semaines de 4 jours discutables selon le poste." },
  { icon: Zap,    title: "Environnement stimulant", desc: "Startup en forte croissance, prise de décision rapide, impact direct sur le produit." },
  { icon: Users,  title: "Équipe bienveillante",    desc: "Une équipe soudée, multiculturelle et passionnée par l'immobilier et la tech." },
  { icon: Globe,  title: "Portée internationale",   desc: "Présence au Canada et en France — opportunités d'évoluer sur deux marchés." },
];

const PROCESS = [
  { step: "01", label: "Candidature",      desc: "Envoyez votre CV et lettre de motivation à recrutement@bloq5.com." },
  { step: "02", label: "Entretien RH",     desc: "Échange de 30 min avec l'équipe RH pour mieux vous connaître." },
  { step: "03", label: "Entretien métier", desc: "Discussion technique ou cas pratique avec le responsable du département." },
  { step: "04", label: "Offre",            desc: "Retour sous 5 jours ouvrables et envoi de l'offre si tout concorde." },
];

export default function RecrutementPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSent(true);
  }

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="py-20 px-6 text-center" style={{ background: "#F8F8F8" }}>
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ background: "#FFF8EE", color: YELLOW }}>
            Carrières
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "#1A1A1A" }}>
            Construisez l'avenir de{" "}
            <span className="relative inline-block">
              l'immobilier
              <span className="absolute bottom-0 left-0 w-full h-1.5 rounded-full" style={{ background: YELLOW }} />
            </span>
            {" "}avec nous
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            BLOQ5 réinvente la gestion locative au Canada et en France. Rejoignez une équipe passionnée, engagée et en pleine croissance.
          </p>
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            <a href="#postes" className="inline-block px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-85" style={{ background: YELLOW, color: "#1A1A1A" }}>
              Voir les postes ouverts
            </a>
            <a href="mailto:recrutement@bloq5.com" className="inline-block px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-colors">
              Candidature spontanée
            </a>
          </div>
        </div>
      </section>

      {/* Pourquoi BLOQ5 */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "#1A1A1A" }}>Pourquoi rejoindre BLOQ5 ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: YELLOW + "20" }}>
                  <b.icon className="w-6 h-6" style={{ color: YELLOW }} />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: "#1A1A1A" }}>{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No jobs — empty state */}
      <section id="postes" className="py-12 px-6" style={{ background: "#F8F8F8" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
              Postes ouverts <span className="text-base font-normal text-gray-400 ml-2">(0 offre)</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "#FFF8EE" }}>
              <SearchX className="w-8 h-8" style={{ color: YELLOW }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>Aucun poste disponible actuellement</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-6">
              Nous n'avons pas d'offres d'emploi ouvertes pour le moment. Revenez régulièrement — notre équipe est en pleine croissance.
            </p>
            {sent ? (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#F0FDF4", color: "#15803D" }}>
                ✓ Vous serez notifié dès qu'un poste s'ouvre.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F5A623] transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-85 whitespace-nowrap"
                  style={{ background: YELLOW, color: "#1A1A1A" }}
                >
                  M'alerter
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Processus de recrutement */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "#1A1A1A" }}>Notre processus de recrutement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p) => (
              <div key={p.step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-4" style={{ background: YELLOW, color: "#1A1A1A" }}>
                  {p.step}
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: "#1A1A1A" }}>{p.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA spontanée */}
      <section className="py-16 px-6" style={{ background: "#FFF8EE" }}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Vous ne trouvez pas votre poste ?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Nous sommes toujours à la recherche de talents. Envoyez-nous une candidature spontanée et nous reviendrons vers vous si un poste correspond à votre profil.
          </p>
          <a
            href="mailto:recrutement@bloq5.com?subject=Candidature spontanée BLOQ5"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-85"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            Envoyer ma candidature spontanée <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
