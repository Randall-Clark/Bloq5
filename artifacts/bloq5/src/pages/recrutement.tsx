import { useState } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  MapPin, Clock, Briefcase, ChevronDown, ChevronUp,
  Heart, Zap, Users, Globe, ArrowRight, CheckCircle,
} from "lucide-react";

const YELLOW = "#F5A623";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  mode: string;
  tags: string[];
  intro: string;
  missions: string[];
  profile: string[];
  bonus?: string[];
}

const JOBS: Job[] = [
  {
    id: "fullstack",
    title: "Développeur(se) Full Stack",
    department: "Ingénierie",
    location: "Montréal, QC",
    type: "Temps plein",
    mode: "Hybride",
    tags: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    intro:
      "Vous rejoindrez l'équipe Ingénierie de BLOQ5 pour concevoir et faire évoluer notre plateforme de gestion immobilière utilisée par des milliers de propriétaires et locataires au Canada et en France.",
    missions: [
      "Développer de nouvelles fonctionnalités côté frontend (React + Vite + TailwindCSS) et backend (Express 5 + Drizzle ORM).",
      "Participer à la conception de l'architecture technique et aux revues de code.",
      "Améliorer la qualité, les performances et la couverture de tests de l'application.",
      "Collaborer étroitement avec les équipes produit et design pour livrer des expériences utilisateurs soignées.",
      "Maintenir et faire évoluer notre infrastructure (PostgreSQL, API RESTful, authentification).",
    ],
    profile: [
      "3+ ans d'expérience en développement web fullstack.",
      "Maîtrise de React, TypeScript, Node.js/Express.",
      "Bonne connaissance des bases de données relationnelles (PostgreSQL).",
      "Capacité à travailler de façon autonome et en équipe.",
      "Français courant requis ; anglais fonctionnel apprécié.",
    ],
    bonus: [
      "Expérience avec Drizzle ORM, Vite ou shadcn/ui.",
      "Intérêt pour l'immobilier ou les PropTech.",
      "Connaissance du cadre réglementaire québécois ou français.",
    ],
  },
  {
    id: "sales",
    title: "Responsable Commercial(e)",
    department: "Ventes & Partenariats",
    location: "Montréal, QC",
    type: "Temps plein",
    mode: "Hybride",
    tags: ["B2B", "SaaS", "Immobilier", "Développement commercial"],
    intro:
      "Vous serez responsable du développement de notre portefeuille de clients professionnels (propriétaires, agences, gestionnaires d'immeubles) et de la mise en place de partenariats stratégiques.",
    missions: [
      "Identifier, prospecter et qualifier de nouveaux clients Pro (propriétaires, gestionnaires, agences).",
      "Présenter et démontrer la valeur de la plateforme BLOQ5 en visioconférence ou en présentiel.",
      "Négocier et conclure les accords commerciaux en lien avec la direction.",
      "Développer et animer un réseau de partenaires (agences immobilières, notaires, syndicats de propriétaires).",
      "Assurer le suivi des comptes et contribuer à la fidélisation des clients.",
    ],
    profile: [
      "2+ ans d'expérience en vente B2B, idéalement dans le SaaS ou l'immobilier.",
      "Excellent relationnel et capacité à convaincre des interlocuteurs variés.",
      "Autonomie, rigueur et orientation résultats.",
      "Connaissance du marché immobilier canadien ou français appréciée.",
      "Français courant ; anglais business requis.",
    ],
  },
  {
    id: "support",
    title: "Chargé(e) de relation client & support",
    department: "Expérience client",
    location: "Montréal, QC ou Télétravail",
    type: "Temps plein",
    mode: "Télétravail possible",
    tags: ["Support", "Onboarding", "CRM", "Relation client"],
    intro:
      "En tant que premier point de contact de nos utilisateurs, vous jouez un rôle central dans la satisfaction et la fidélisation des propriétaires et locataires qui utilisent BLOQ5 au quotidien.",
    missions: [
      "Répondre aux questions et signalements des utilisateurs via e-mail, chat et téléphone.",
      "Accompagner les nouveaux clients Pro dans la prise en main de la plateforme (onboarding).",
      "Rédiger et maintenir à jour la base de connaissances et les guides d'utilisation.",
      "Remonter les retours utilisateurs à l'équipe produit pour améliorer l'expérience.",
      "Participer à la définition et au suivi des indicateurs de satisfaction (NPS, CSAT).",
    ],
    profile: [
      "1+ an d'expérience en support client ou relation client.",
      "Excellentes qualités rédactionnelles et de communication orale en français.",
      "Empathie, patience et sens du service.",
      "À l'aise avec les outils numériques (CRM, helpdesk, Google Workspace).",
      "Anglais fonctionnel apprécié.",
    ],
  },
  {
    id: "ux",
    title: "Designer UX/UI",
    department: "Design & Produit",
    location: "Montréal, QC",
    type: "Temps plein",
    mode: "Hybride",
    tags: ["Figma", "UX Research", "Design System", "Mobile"],
    intro:
      "Vous concevrez des expériences utilisateurs intuitives et esthétiques pour notre plateforme web et mobile, en étroite collaboration avec les équipes produit et ingénierie.",
    missions: [
      "Concevoir des maquettes, prototypes et flux utilisateurs pour les nouvelles fonctionnalités.",
      "Mener des tests utilisateurs et analyser les retours pour améliorer l'expérience produit.",
      "Maintenir et faire évoluer notre design system (composants, tokens, guidelines).",
      "Travailler en itération rapide avec les développeurs pour assurer une implémentation fidèle.",
      "Contribuer à définir la stratégie design de BLOQ5 à long terme.",
    ],
    profile: [
      "2+ ans d'expérience en design UX/UI (produit digital).",
      "Maîtrise de Figma et des outils de prototypage.",
      "Solide portfolio présentant des projets web et/ou mobile.",
      "Sens aigu de l'esthétique et de l'ergonomie.",
      "Capacité à travailler dans un environnement agile et à itérer rapidement.",
    ],
    bonus: [
      "Expérience dans un environnement startup ou PropTech.",
      "Connaissance de l'accessibilité (WCAG).",
    ],
  },
  {
    id: "data",
    title: "Analyste Données & Croissance",
    department: "Données & Stratégie",
    location: "Montréal, QC ou Télétravail",
    type: "Temps plein",
    mode: "Hybride / Télétravail",
    tags: ["SQL", "Analytics", "Growth", "Tableaux de bord"],
    intro:
      "Vous serez responsable de l'analyse des données de la plateforme pour guider les décisions stratégiques, suivre la croissance et identifier les opportunités d'optimisation.",
    missions: [
      "Collecter, structurer et analyser les données d'usage et de performance de la plateforme.",
      "Construire et maintenir des tableaux de bord pour les équipes métier et la direction.",
      "Identifier les leviers de croissance (acquisition, activation, rétention) et proposer des plans d'action.",
      "Collaborer avec les équipes produit et marketing pour évaluer l'impact des nouvelles fonctionnalités.",
      "Mettre en place et suivre les KPIs clés de l'entreprise.",
    ],
    profile: [
      "2+ ans d'expérience en analyse de données ou en growth.",
      "Bonne maîtrise de SQL et d'au moins un outil de visualisation (Metabase, Tableau, Looker Studio).",
      "Esprit analytique, curiosité intellectuelle et rigueur.",
      "Capacité à vulgariser des analyses complexes pour des non-techniciens.",
      "Python ou R apprécié.",
    ],
  },
];

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

function JobCard({ job }: { job: Job }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <button
        className="w-full text-left p-6 flex items-start justify-between gap-4"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: YELLOW + "20", color: "#B87800" }}>
              {job.department}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {job.type}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {job.location}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{job.mode}</span>
          </div>
          <h3 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>{job.title}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.tags.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{t}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0 mt-1 text-gray-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-gray-100 px-6 pb-7 pt-5 space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">{job.intro}</p>

          <div>
            <h4 className="text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>Vos missions</h4>
            <ul className="space-y-1.5">
              {job.missions.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: YELLOW }} />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>Profil recherché</h4>
            <ul className="space-y-1.5">
              {job.profile.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-4 h-4 mt-0.5 shrink-0 rounded-full border-2 flex items-center justify-center" style={{ borderColor: YELLOW }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: YELLOW }} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {job.bonus && job.bonus.length > 0 && (
            <div>
              <h4 className="text-sm font-bold mb-2 text-gray-500">Atouts supplémentaires</h4>
              <ul className="space-y-1.5">
                {job.bonus.map((b, i) => (
                  <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                    <span className="mt-1 text-gray-300">+</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <a
            href={`mailto:recrutement@bloq5.com?subject=Candidature — ${job.title}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-85"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            Postuler à ce poste <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}

export default function RecrutementPage() {
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

      {/* Job listings */}
      <section id="postes" className="py-12 px-6" style={{ background: "#F8F8F8" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
              Postes ouverts <span className="text-base font-normal text-gray-400 ml-2">({JOBS.length} offres)</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Briefcase className="w-4 h-4" />
              Montréal, QC · Canada
            </div>
          </div>
          <div className="space-y-4">
            {JOBS.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      </section>

      {/* Processus de recrutement */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "#1A1A1A" }}>Notre processus de recrutement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-4" style={{ background: YELLOW, color: "#1A1A1A" }}>
                    {p.step}
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: "#1A1A1A" }}>{p.label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%-0px)] w-full h-px border-t-2 border-dashed border-gray-200" style={{ width: "calc(100% - 3rem)", left: "calc(50% + 1.5rem)" }} />
                )}
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
