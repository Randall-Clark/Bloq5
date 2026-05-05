import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth-client";
import {
  Building2, CheckCircle2, ChevronRight, ClipboardList,
  LayoutDashboard, ShieldCheck, Sparkles, Phone, MessageSquare,
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";

const YELLOW = "#F5A623";
const DARK   = "#1A1A1A";
const STORAGE_KEY = "bloq5_pro_onboarded";

/* ── Slides ── */
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
          { num: "1", title: "Créez votre première annonce",      desc: "Renseignez les infos du bien, ajoutez des photos et publiez en un clic." },
          { num: "2", title: "Recevez des candidatures qualifiées", desc: "Les locataires soumettent leur dossier directement via la plateforme." },
          { num: "3", title: "Gérez depuis votre dashboard",       desc: "Suivez les demandes, communiquez avec les candidats et analysez vos stats." },
        ].map((s) => (
          <div key={s.num} className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: YELLOW, color: DARK }}>
              {s.num}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{s.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
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

/* ── Phone verification overlay ── */
function PhoneVerification({ onSuccess }: { onSuccess: () => void }) {
  const [phone,    setPhone]    = useState("");
  const [dialCode, setDialCode] = useState("+1");
  const [codeSent, setCodeSent] = useState(false);
  const [digits,   setDigits]   = useState(["", "", "", "", "", ""]);
  const [error,    setError]    = useState("");
  const [sending,  setSending]  = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function sendCode() {
    const nums = phone.replace(/\D/g, "");
    if (nums.length < 4) { setError("Numéro trop court — vérifiez le numéro saisi."); return; }
    setError("");
    setSending(true);
    /* Simulated SMS send — replace with real SMS provider in production */
    setTimeout(() => { setSending(false); setCodeSent(true); }, 900);
  }

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  function verify() {
    const code = digits.join("");
    if (code.length < 6) { setError("Entrez les 6 chiffres reçus par SMS."); return; }
    /* Simulated verification — any 6-digit code accepted */
    setError("");
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#FFF8EE" }}>
            <Phone className="w-6 h-6" style={{ color: YELLOW }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: DARK }}>Vérification du numéro</h2>
          <p className="text-sm text-gray-500 mt-1">
            {codeSent
              ? "Entrez le code à 6 chiffres reçu par SMS."
              : "Renseignez votre numéro de téléphone pour activer votre compte Pro."}
          </p>
        </div>

        <div className="px-8 pb-6 space-y-4">
          {!codeSent ? (
            /* Step 1 — phone number */
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Numéro de téléphone</label>
                <PhoneInput
                  value={phone}
                  dialCode={dialCode}
                  onChange={(v, d) => { setPhone(v); setDialCode(d); setError(""); }}
                  placeholder="000 000 0000"
                />
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <button
                onClick={sendCode}
                disabled={sending}
                className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: YELLOW, color: DARK }}
              >
                <MessageSquare className="w-4 h-4" />
                {sending ? "Envoi en cours…" : "Recevoir le code par SMS"}
              </button>
            </>
          ) : (
            /* Step 2 — 6-digit code */
            <>
              <p className="text-xs text-gray-500">
                Code envoyé au <strong className="text-gray-800">{dialCode} {phone}</strong>
              </p>
              <div className="flex gap-2 justify-center my-2">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-11 h-13 text-center text-xl font-bold border-2 rounded-xl outline-none transition-colors focus:border-[#F5A623]"
                    style={{
                      borderColor: d ? YELLOW : "#E5E7EB",
                      color: DARK,
                      height: 52,
                    }}
                  />
                ))}
              </div>
              {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
              <button
                onClick={verify}
                className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: DARK, color: "#fff" }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Vérifier et continuer
              </button>
              <button
                onClick={() => { setCodeSent(false); setDigits(["","","","","",""]); setError(""); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
              >
                Changer de numéro
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function ProPricingPage() {
  const [, navigate]          = useLocation();
  const { data: session }     = authClient.useSession();
  const [step, setStep]       = useState(0);
  const [visible, setVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPhone, setShowPhone]         = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      navigate("/pro/dashboard");
    } else {
      setVisible(true);
    }
  }, []);

  function onPopupFinish() {
    /* Show phone verification before completing onboarding */
    setShowPhone(true);
  }

  function onPhoneVerified() {
    localStorage.setItem(STORAGE_KEY, "1");
    navigate(session ? "/pro/properties/new" : "/sign-up");
  }

  if (!visible) return null;

  const slide  = SLIDES[step];
  const isLast = step === SLIDES.length - 1;
  const Icon   = slide.icon;
  const blocked = step === TERMS_STEP && !termsAccepted;

  return (
    <>
      {/* Phone verification overlay — shown after popup */}
      {showPhone && <PhoneVerification onSuccess={onPhoneVerified} />}

      {/* Onboarding popup */}
      {!showPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-8 pb-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  {SLIDES.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: i === step ? 24 : 8, background: i <= step ? YELLOW : "#E5E7EB" }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">{step + 1} / {SLIDES.length}</span>
              </div>

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

              {/* Terms checkbox */}
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
                      style={{ borderColor: termsAccepted ? YELLOW : "#D1D5DB", background: termsAccepted ? YELLOW : "#fff" }}
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
                  onClick={onPopupFinish}
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
      )}
    </>
  );
}
