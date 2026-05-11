import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Users, Target, Award, Building2, TrendingUp, Shield, Home, Briefcase, Store, FileText, PenLine, HeartHandshake } from "lucide-react";

const YELLOW = "#F5A623";

const TEAM = [
  { name: "Archange Ponke Song",    role: "CEO",                                    img: "https://picsum.photos/seed/archange/200/200" },
  { name: "Randall TOM'OVOLO",      role: "Responsable Recherche & Développement",  img: "https://picsum.photos/seed/randall/200/200" },
  { name: "Chia Jei Lane",          role: "Comptable",                              img: "https://picsum.photos/seed/chia/200/200" },
  { name: "Sergino Bradford",       role: "Analyste Stratégie",                     img: "https://picsum.photos/seed/sergino/200/200" },
  { name: "Fructueux Jefferson",    role: "CTO",                                    img: "https://picsum.photos/seed/fructueux/200/200" },
];

const VALUES = [
  { icon: Target,    color: "#E3F2FD", iconColor: "#1565C0", title: "Transparence",     desc: "Toutes les informations sont claires et accessibles — pas de frais cachés, pas de surprises." },
  { icon: Shield,    color: "#F3E5F5", iconColor: "#6A1B9A", title: "Fiabilité",         desc: "Chaque annonce est vérifiée. Chaque propriétaire est identifié. Chaque locataire est protégé." },
  { icon: TrendingUp, color: "#E8F5E9", iconColor: "#2E7D32", title: "Innovation",       desc: "Signature électronique, visite virtuelle, IA — nous utilisons la technologie pour simplifier votre vie." },
  { icon: Users,     color: "#FFF3E0", iconColor: "#E65100", title: "Communauté",        desc: "BLOQ5 relie propriétaires et locataires dans un écosystème fondé sur la confiance et le respect." },
  { icon: Building2, color: "#FCE4EC", iconColor: "#880E4F", title: "Toutes typologies", desc: "Résidentiel et commercial — notre plateforme s'adapte à chaque type de bien et chaque projet." },
  { icon: Award,     color: "#F1F8E9", iconColor: "#33691E", title: "Excellence",        desc: "Nous visons le meilleur service à chaque étape : recherche, signature, gestion et suivi." },
];

const SERVICES = [
  {
    icon: Home,
    title: "Gestion locative résidentielle",
    desc: "Gérez vos appartements, maisons et colocations en toute simplicité : annonces, candidatures, baux et suivi des paiements centralisés en un seul espace.",
    color: "#E3F2FD", iconColor: "#1565C0",
  },
  {
    icon: Briefcase,
    title: "Gestion locative commerciale",
    desc: "Bureaux, locaux commerciaux, entrepôts — BLOQ5 Pro prend en charge la publication, la qualification des dossiers et la gestion des baux commerciaux.",
    color: "#F3E5F5", iconColor: "#6A1B9A",
  },
  {
    icon: Store,
    title: "Location longue durée",
    desc: "Des contrats de location structurés et sécurisés pour les propriétaires souhaitant louer leurs biens sur le long terme, avec un suivi complet du cycle locatif.",
    color: "#E8F5E9", iconColor: "#2E7D32",
  },
  {
    icon: FileText,
    title: "Gestion des dossiers candidats",
    desc: "Collectez, analysez et comparez les dossiers de candidature de vos locataires potentiels avec des outils de scoring intégrés et conformes aux réglementations en vigueur.",
    color: "#FFF3E0", iconColor: "#E65100",
  },
  {
    icon: PenLine,
    title: "Signature électronique & bail digital",
    desc: "Générez et signez vos baux en ligne en quelques minutes. Documents juridiquement valides, archivés et accessibles à tout moment depuis votre espace.",
    color: "#FCE4EC", iconColor: "#880E4F",
  },
  {
    icon: HeartHandshake,
    title: "BLOQ5 Pro — Espace propriétaire",
    desc: "Un espace dédié aux propriétaires et gestionnaires : tableau de bord, suivi des revenus, gestion des demandes locataires et accès aux outils premium de la plateforme.",
    color: "#F1F8E9", iconColor: "#33691E",
  },
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
            BLOQ5 est la plateforme PropTech qui simplifie la location pour tous les types de biens — appartements, maisons, bureaux, commerces et entrepôts, au Canada et en France.
          </p>
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
              Fondée à Montréal, BLOQ5 est née d'un constat simple : la gestion locative est trop complexe, trop opaque et trop chronophage — pour les propriétaires comme pour les locataires.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Notre équipe a conçu une plateforme tout-en-un qui couvre l'ensemble du cycle locatif : publication d'annonces, vérification des dossiers, signature électronique, suivi des paiements et gestion des incidents.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Résidentiel et commercial — BLOQ5 s'adapte à chaque type de bien et à chaque projet locatif, au Canada et en France.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-6" style={{ background: "#F8F8F8" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YELLOW }}>Ce que nous offrons</p>
            <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Nos services</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">Des outils pensés pour simplifier chaque étape de la gestion locative, du premier contact à la fin du bail.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color }}>
                  <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
                </div>
                <h3 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YELLOW }}>Nos valeurs</p>
            <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Ce qui nous guide au quotidien</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4 items-start">
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
      <section className="py-16 px-6" style={{ background: "#F8F8F8" }}>
        <div className="max-w-5xl mx-auto text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YELLOW }}>L'équipe</p>
          <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Des passionnés de PropTech</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">
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
          <p className="text-gray-500 text-sm mb-6">Rejoignez propriétaires et locataires qui font confiance à BLOQ5.</p>
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
