import { Link } from "wouter";
import { CheckCircle, ArrowRight, Building2, Users, Briefcase } from "lucide-react";

const YELLOW = "#F5A623";

const PLANS = [
  {
    name: "Essentiel",
    price: 22,
    tagline: "Pour les petits propriétaires",
    icon: Building2,
    highlight: false,
    portes: 5,
    gestionnaires: 0,
    features: [
      "Jusqu'à 5 biens (portes) publiés",
      "Photos illimitées par annonce",
      "Visite virtuelle incluse (3 premiers mois)",
      "Gestion des demandes de location",
      "Messagerie intégrée avec les candidats",
      "Tableau de bord & KPI de base",
      "Support technique disponible 24/7",
    ],
    cta: "Commencer",
    ctaLink: "/sign-up",
  },
  {
    name: "Pro",
    price: 80,
    tagline: "Pour les propriétaires actifs",
    icon: Briefcase,
    highlight: true,
    portes: 12,
    gestionnaires: 5,
    features: [
      "Jusqu'à 12 biens (portes) publiés",
      "Photos illimitées par annonce",
      "Visite virtuelle incluse en continu",
      "Désignation de jusqu'à 5 gestionnaires",
      "Gestion avancée des demandes par bien",
      "Tableau de bord complet & KPI détaillés",
      "Messagerie avec contrôle total des conversations",
      "Support technique prioritaire 24/7",
    ],
    cta: "Passer Pro",
    ctaLink: "/sign-up",
  },
  {
    name: "Entreprise Pro",
    price: null,
    tagline: "Pour les agences & grands portefeuilles",
    icon: Users,
    highlight: false,
    portes: null,
    gestionnaires: null,
    features: [
      "Nombre de biens illimité",
      "Gestionnaires illimités avec rôles personnalisés",
      "Intégration sur mesure & API dédiée",
      "Tableau de bord multi-portefeuilles",
      "Accompagnement & onboarding dédié",
      "Contrat & facturation adaptés à votre structure",
      "Support VIP — interlocuteur dédié",
    ],
    cta: "Nous contacter",
    ctaLink: "/contact",
  },
];

export default function ProPricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      {/* Nav minimal */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-black" style={{ color: "#1A1A1A" }}>
            BLOQ<span style={{ color: YELLOW }}>5</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Se connecter</Link>
          <Link href="/sign-up">
            <button className="text-sm font-semibold px-4 py-2 rounded-md" style={{ background: YELLOW, color: "#1A1A1A" }}>
              S'inscrire
            </button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: YELLOW }}>✳ BLOQ5 Pro</p>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: "#1A1A1A" }}>
          Choisissez votre plan<br />
          <span style={{ color: YELLOW }}>et gérez sans limites</span>
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Publiez vos biens, gérez vos demandes et suivez vos KPI locatifs — résidentiels, commerciaux ou industriels. Annulation à tout moment.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: plan.highlight ? "#1A1A1A" : "white",
                  border: plan.highlight ? `2px solid ${YELLOW}` : "2px solid #E5E7EB",
                  boxShadow: plan.highlight ? "0 20px 50px rgba(245,166,35,0.15)" : "0 2px 12px rgba(0,0,0,0.06)",
                  transform: plan.highlight ? "scale(1.03)" : "none",
                }}
              >
                {plan.highlight && (
                  <div className="text-center py-2 text-xs font-bold uppercase tracking-widest" style={{ background: YELLOW, color: "#1A1A1A" }}>
                    Le plus populaire
                  </div>
                )}

                <div className="p-7 flex-1 flex flex-col">
                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: plan.highlight ? "rgba(245,166,35,0.15)" : "#F8F8F8" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: plan.highlight ? YELLOW : "#6B7280" }} />
                    </div>
                    <div>
                      <h2 className="font-bold text-base" style={{ color: plan.highlight ? "white" : "#1A1A1A" }}>{plan.name}</h2>
                      <p className="text-xs" style={{ color: plan.highlight ? "rgba(255,255,255,0.55)" : "#9CA3AF" }}>{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold" style={{ color: plan.highlight ? "white" : "#1A1A1A" }}>
                          {plan.price} CA$
                        </span>
                        <span className="text-sm mb-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}>/mois</span>
                      </div>
                    ) : (
                      <span className="text-3xl font-extrabold" style={{ color: "#1A1A1A" }}>Sur devis</span>
                    )}
                    {plan.portes !== null && (
                      <p className="text-xs mt-1 font-semibold" style={{ color: YELLOW }}>
                        {plan.portes} portes (biens) incluses
                      </p>
                    )}
                    {plan.gestionnaires !== null && plan.gestionnaires > 0 && (
                      <p className="text-xs font-semibold" style={{ color: plan.highlight ? "rgba(255,255,255,0.55)" : "#9CA3AF" }}>
                        + {plan.gestionnaires} gestionnaire{plan.gestionnaires > 1 ? "s" : ""} désignables
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: plan.highlight ? YELLOW : "#22C55E" }}
                        />
                        <span className="text-xs leading-relaxed" style={{ color: plan.highlight ? "rgba(255,255,255,0.75)" : "#4B5563" }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={plan.ctaLink}>
                    <button
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
                      style={
                        plan.highlight
                          ? { background: YELLOW, color: "#1A1A1A" }
                          : { background: "#1A1A1A", color: "white" }
                      }
                    >
                      {plan.cta} <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note bas de page */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
            Tous les prix sont en dollars canadiens (CA$), taxes applicables en sus. Les plans peuvent être modifiés ou résiliés à tout moment depuis votre dashboard. Pour le plan Entreprise Pro, contactez notre équipe commerciale pour un devis personnalisé.
          </p>
        </div>
      </div>

      {/* Footer minimal */}
      <div className="border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">© 2025 BLOQ5 — Plateforme de gestion immobilière locative</p>
      </div>
    </div>
  );
}
