import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  Home, Briefcase, Store, FileText, PenLine, HeartHandshake,
  LayoutDashboard, MapPin, ShieldCheck, Clock,
} from "lucide-react";
import { Link } from "wouter";

const YELLOW = "#F5A623";

const SERVICES = [
  {
    icon: Home,
    title: "Gestion locative résidentielle",
    desc: "Gérez vos appartements, maisons et colocations de A à Z : publication d'annonces, réception des candidatures, sélection des locataires, rédaction du bail et suivi des paiements — tout centralisé dans un seul espace.",
    tags: ["Appartements", "Maisons", "Colocations"],
    color: "#E3F2FD", iconColor: "#1565C0",
  },
  {
    icon: Briefcase,
    title: "Gestion locative commerciale",
    desc: "Bureaux, locaux commerciaux, entrepôts et espaces industriels — BLOQ5 Pro prend en charge la mise en location, la qualification des dossiers et la gestion des baux commerciaux, en conformité avec la réglementation en vigueur.",
    tags: ["Bureaux", "Commerces", "Entrepôts"],
    color: "#F3E5F5", iconColor: "#6A1B9A",
  },
  {
    icon: Store,
    title: "Location longue durée",
    desc: "Des contrats de location structurés et sécurisés pour les propriétaires souhaitant louer leurs biens sur le long terme. Suivi complet du cycle locatif, de la signature à la fin du bail.",
    tags: ["Bail 12 mois+", "Résidentiel", "Commercial"],
    color: "#E8F5E9", iconColor: "#2E7D32",
  },
  {
    icon: FileText,
    title: "Gestion des dossiers candidats",
    desc: "Collectez, analysez et comparez les dossiers de candidature de vos locataires potentiels. Outils de scoring intégrés, vérification des justificatifs et conformité aux réglementations canadiennes et françaises.",
    tags: ["Scoring", "Vérification", "Conformité"],
    color: "#FFF3E0", iconColor: "#E65100",
  },
  {
    icon: PenLine,
    title: "Signature électronique & bail digital",
    desc: "Générez et signez vos baux en ligne en quelques minutes. Documents juridiquement valides, archivés et accessibles à tout moment depuis votre espace. Disponible pour les baux résidentiels et commerciaux.",
    tags: ["Signature légale", "Archivage", "Dématérialisé"],
    color: "#FCE4EC", iconColor: "#880E4F",
  },
  {
    icon: HeartHandshake,
    title: "Gestion des colocations",
    desc: "Un module dédié aux propriétaires de biens en colocation : gestion des chambres individuelles, des loyers par chambre, des contrats individuels et du suivi des entrées/sorties par colocataire.",
    tags: ["Chambres", "Contrats individuels", "Co-living"],
    color: "#E0F7FA", iconColor: "#00696F",
  },
  {
    icon: MapPin,
    title: "Annonces immobilières géolocalisées",
    desc: "Publiez vos annonces avec géolocalisation précise, photos, visite virtuelle et description détaillée. Vos biens sont visibles sur la carte interactive et dans les résultats de recherche BLOQ5.",
    tags: ["Carte interactive", "Photos", "Visite virtuelle"],
    color: "#F1F8E9", iconColor: "#33691E",
  },
  {
    icon: ShieldCheck,
    title: "Vérification et sécurité des transactions",
    desc: "Toutes les transactions et les communications sur BLOQ5 sont sécurisées. Identités vérifiées, données chiffrées, et conformité avec les lois sur la protection des données au Canada et en France.",
    tags: ["Sécurité", "RGPD", "Chiffrement"],
    color: "#FFF8E1", iconColor: "#F57F17",
  },
  {
    icon: LayoutDashboard,
    title: "BLOQ5 Pro — Espace propriétaire",
    desc: "Un tableau de bord complet dédié aux propriétaires et gestionnaires : suivi en temps réel des revenus, gestion des demandes locataires, alertes de paiement, statistiques de performance et accès aux outils premium.",
    tags: ["Dashboard", "Revenus", "Statistiques"],
    color: "#EDE7F6", iconColor: "#4527A0",
  },
  {
    icon: Clock,
    title: "État des lieux digital",
    desc: "Réalisez vos états des lieux d'entrée et de sortie de manière numérique : formulaires structurés, photos annotées, signatures en ligne et archivage automatique. Fini le papier, place à l'efficacité.",
    tags: ["Entrée", "Sortie", "Photos"],
    color: "#FCE4EC", iconColor: "#AD1457",
  },
];

export default function ServicesProPage() {
  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="py-20 px-6 text-center" style={{ background: "#F8F8F8" }}>
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ background: "#FFF8EE", color: YELLOW }}>
            Nos services
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "#1A1A1A" }}>
            Tout ce dont vous avez besoin pour{" "}
            <span className="relative inline-block">
              gérer vos biens
              <span className="absolute bottom-0 left-0 w-full h-1.5 rounded-full" style={{ background: YELLOW }} />
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            BLOQ5 centralise l'ensemble de la gestion locative — résidentiel et commercial — pour les propriétaires et gestionnaires au Canada et en France.
          </p>
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            <Link href="/sign-up">
              <span className="inline-block px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-85 cursor-pointer" style={{ background: YELLOW, color: "#1A1A1A" }}>
                Créer un compte Pro
              </span>
            </Link>
            <Link href="/contact">
              <span className="inline-block px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                Nous contacter
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color }}>
                    <s.icon className="w-6 h-6" style={{ color: s.iconColor }} />
                  </div>
                  <h3 className="font-bold text-sm leading-snug mt-1" style={{ color: "#1A1A1A" }}>{s.title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {s.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.color, color: s.iconColor }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6" style={{ background: "#FFF8EE" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Prêt à gérer vos biens avec BLOQ5 ?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Créez votre espace Pro gratuitement et commencez à publier vos annonces dès aujourd'hui.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/properties">
              <span className="inline-block px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                Voir les annonces
              </span>
            </Link>
            <Link href="/sign-up">
              <span className="inline-block px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-85 cursor-pointer" style={{ background: YELLOW, color: "#1A1A1A" }}>
                Créer un compte Pro
              </span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
