import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Users, Target, Award, Building2, TrendingUp, Shield } from "lucide-react";

const YELLOW = "#F5A623";

const TEAM = [
  { name: "Sophie Tremblay", role: "Co-fondatrice & CEO", img: "https://picsum.photos/seed/sophie/200/200" },
  { name: "Marc Lavoie",     role: "Co-fondateur & CTO", img: "https://picsum.photos/seed/marc/200/200" },
  { name: "Amina Diallo",    role: "Directrice Produit",  img: "https://picsum.photos/seed/amina/200/200" },
  { name: "Étienne Roy",     role: "Responsable Partenariats", img: "https://picsum.photos/seed/etienne/200/200" },
];

const VALUES = [
  { icon: Target,    color: "#E3F2FD", iconColor: "#1565C0", title: "Transparence",      desc: "Toutes les informations sont claires et accessibles — pas de frais cachés, pas de surprises." },
  { icon: Shield,    color: "#F3E5F5", iconColor: "#6A1B9A", title: "Fiabilité",          desc: "Chaque annonce est vérifiée. Chaque propriétaire est identifié. Chaque locataire est protégé." },
  { icon: TrendingUp, color: "#E8F5E9", iconColor: "#2E7D32", title: "Innovation",        desc: "Signature électronique, visite virtuelle, IA — nous utilisons la technologie pour simplifier votre vie." },
  { icon: Users,     color: "#FFF3E0", iconColor: "#E65100", title: "Communauté",         desc: "BLOQ5 relie propriétaires et locataires dans un écosystème fondé sur la confiance et le respect." },
  { icon: Building2, color: "#FCE4EC", iconColor: "#880E4F", title: "Toutes typologies",  desc: "Résidentiel et commercial — notre plateforme s'adapte à chaque type de bien et chaque projet." },
  { icon: Award,     color: "#F1F8E9", iconColor: "#33691E", title: "Excellence",         desc: "Nous visons le meilleur service à chaque étape : recherche, signature, gestion et suivi." },
];

const STATS = [
  { num: "2 400+", label: "Propriétés actives" },
  { num: "12 000+", label: "Locataires satisfaits" },
  { num: "98 %",   label: "Taux de satisfaction" },
  { num: "5",      label: "Provinces couvertes" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="py-20 px-6 text-center" style={{ background: "#F8F8F8" }}>
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ background: "#FFF8EE", color: YELLOW }}>
            À propos de BLOQ5
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "#1A1A1A" }}>
            La gestion immobilière,{" "}
            <span className="relative inline-block">
              réinventée
              <span className="absolute bottom-0 left-0 w-full h-1.5 rounded-full" style={{ background: YELLOW }} />
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            BLOQ5 est la plateforme PropTech canadienne qui simplifie la location pour tous les types de biens — appartements, maisons, bureaux, commerces et entrepôts.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black mb-1" style={{ color: YELLOW }}>{s.num}</div>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto md:flex gap-16 items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80"
              alt="Bureau BLOQ5"
              className="rounded-2xl w-full object-cover shadow-md"
              style={{ height: 340 }}
            />
          </div>
          <div className="md:w-1/2">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YELLOW }}>Notre mission</p>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
              Rendre la location accessible, transparente et efficace
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Fondée à Montréal en 2022, BLOQ5 est née d'un constat simple : la gestion locative est trop complexe, trop opaque et trop chronophage — pour les propriétaires comme pour les locataires.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Notre équipe a conçu une plateforme tout-en-un qui couvre l'ensemble du cycle locatif : publication d'annonces, vérification des dossiers, signature électronique, suivi des paiements et gestion des incidents.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Résidentiel et commercial — BLOQ5 s'adapte à chaque type de bien et à chaque projet locatif, partout au Canada.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 px-6" style={{ background: "#F8F8F8" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YELLOW }}>Nos valeurs</p>
            <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Ce qui nous guide au quotidien</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: v.color }}>
                  <v.icon className="w-5 h-5" style={{ color: v.iconColor }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>{v.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YELLOW }}>L'équipe</p>
          <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Des passionnés de PropTech</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {TEAM.map((m) => (
            <div key={m.name} className="text-center">
              <img src={m.img} alt={m.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-2 border-white shadow-md" />
              <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{m.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6" style={{ background: "#FFF8EE" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Prêt à simplifier votre gestion locative ?</h2>
          <p className="text-gray-500 text-sm mb-6">Rejoignez des milliers de propriétaires et locataires qui font confiance à BLOQ5.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="/properties" className="px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-colors">
              Voir les annonces
            </a>
            <a href="/sign-up" className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ background: YELLOW, color: "#1A1A1A" }}>
              Créer un compte
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
