import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth-client";
import {
  Building2, CheckCircle2, ChevronRight, ClipboardList,
  LayoutDashboard, ShieldCheck, Sparkles,
} from "lucide-react";

const YELLOW = "#F5A623";
const DARK   = "#1A1A1A";
const STORAGE_KEY = "bloq5_pro_onboarded";

/* ── Slides content ── */
const SLIDES = [
  {
    icon: Sparkles,
    title: "Bienvenue sur bloq5 Pro",
    subtitle: "Gérez vos biens, recevez des candidatures et suivez vos revenus — tout au même endroit.",
    content: (
      <ul className="space-y-3 mt-4">
        {[
          "Publiez vos annonces en quelques minutes",
          "Recevez et gérez les candidatures locatives",
          "Suivez vos revenus et votre taux d'occupation",
          "Collaborez avec vos gestionnaires d'immeuble",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: YELLOW }} />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: ClipboardList,
    title: "Comment ça fonctionne",
    subtitle: "Trois étapes simples pour gérer votre parc immobilier.",
    content: (
      <div className="space-y-4 mt-4">
        {[
          { num: "1", title: "Créez votre première annonce", desc: "Renseignez les infos du bien, ajoutez des photos et publiez en un clic." },
          { num: "2", title: "Recevez des candidatures qualifiées", desc: "Les locataires soumettent leur dossier directement via la plateforme." },
          { num: "3", title: "Gérez depuis votre dashboard", desc: "Suivez les demandes, communiquez avec les candidats et analysez vos stats." },
        ].map((step) => (
          <div key={step.num} className="flex items-start gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ background: YELLOW, color: DARK }}
            >
              {step.num}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{step.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Conditions d'utilisation",
    subtitle: "Quelques règles simples à respecter pour utiliser bloq5 Pro.",
    content: (
      <div className="space-y-3 mt-4 text-sm text-gray-600 leading-relaxed max-h-44 overflow-y-auto pr-1">
        <p><strong className="text-gray-800">Vos annonces :</strong> Vous êtes responsable des informations que vous publiez. Elles doivent être exactes et honnêtes.</p>
        <p><strong className="text-gray-800">Données des locataires :</strong> Traitez les informations personnelles reçues avec respect et en conformité avec les lois en vigueur.</p>
        <p><strong className="text-gray-800">Usage de la plateforme :</strong> bloq5 Pro est réservé à un usage immobilier légitime. Toute utilisation abusive entraîne la suspension du compte.</p>
        <p><strong className="text-gray-800">Abonnement :</strong> Le forfait se renouvelle chaque mois. Vous pouvez annuler à tout moment depuis votre espace Abonnement.</p>
        <p><strong className="text-gray-800">Rôle de bloq5 :</strong> Nous mettons en relation propriétaires et locataires. Les décisions finales vous appartiennent.</p>
      </div>
    ),
  },
  {
    icon: LayoutDashboard,
    title: "Tout est prêt !",
    subtitle: "Votre espace propriétaire est configuré. Publiez votre premier bien dès maintenant.",
    content: (
      <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
        <p className="text-sm text-gray-600 leading-relaxed">
          Cliquez sur <strong className="text-gray-900">"Faire une annonce"</strong> pour créer
          votre première annonce et commencer à recevoir des candidatures de locataires qualifiés.
        </p>
      </div>
    ),
  },
];

const TERMS_STEP = 2;

export default function ProPricingPage() {
  const [, navigate]  = useLocation();
  const { data: session } = authClient.useSession();
  const [step, setStep]           = useState(0);
  const [visible, setVisible]     = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      navigate("/pro/dashboard");
    } else {
      setVisible(true);
    }
  }, []);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    navigate(session ? "/pro/properties/new" : "/sign-up");
  }

  if (!visible) return null;

  const slide  = SLIDES[step];
  const isLast = step === SLIDES.length - 1;
  const Icon   = slide.icon;
  const blocked = step === TERMS_STEP && !termsAccepted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-0">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width:      i === step ? 24 : 8,
                    background: i <= step ? YELLOW : "#E5E7EB",
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-medium">{step + 1} / {SLIDES.length}</span>
          </div>

          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFF8EE" }}>
              <Icon className="w-6 h-6" style={{ color: YELLOW }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: DARK }}>{slide.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{slide.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-4">
          {slide.content}

          {/* Checkbox on terms step */}
          {step === TERMS_STEP && (
            <label className="flex items-start gap-3 mt-4 cursor-pointer select-none">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    borderColor: termsAccepted ? YELLOW : "#D1D5DB",
                    background:  termsAccepted ? YELLOW : "#fff",
                  }}
                >
                  {termsAccepted && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700 leading-snug">
                Je reconnais avoir lu et accepté les{" "}
                <strong className="text-gray-900">conditions d'utilisation</strong>{" "}
                du compte Pro bloq5 pour la publication d'annonces immobilières.
              </span>
            </label>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-8" />

        {/* Footer */}
        <div className="px-8 py-5 flex items-center justify-between gap-3">
          <button
            onClick={() => step > 0 && setStep(s => s - 1)}
            className={`text-sm font-medium transition-colors ${step === 0 ? "invisible" : "text-gray-400 hover:text-gray-700"}`}
          >
            ← Précédent
          </button>

          {isLast ? (
            <button
              onClick={finish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: YELLOW, color: DARK }}
            >
              <Building2 className="w-4 h-4" />
              Faire une annonce
            </button>
          ) : (
            <button
              onClick={() => !blocked && setStep(s => s + 1)}
              disabled={blocked}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: blocked ? "#E5E7EB" : YELLOW,
                color:      blocked ? "#9CA3AF" : DARK,
                cursor:     blocked ? "not-allowed" : "pointer",
              }}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
