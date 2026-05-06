import { useRoute, useLocation, useSearch } from "wouter";
import { useGetProperty, useCreateRentalRequest } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { CheckCircle, ChevronDown, ArrowLeft } from "lucide-react";

const YELLOW = "#F5A623";
const LAVENDER_BG = "linear-gradient(180deg, #EAE8F5 0%, #F5F5FA 50%, #FFFFFF 100%)";
const ACCENT = "#E05A2B";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/* ─── FormData ─────────────────────────────────────────────── */
interface FormData {
  /* Co-living */
  selectedRoom: "all" | number | null;
  /* Residential */
  occupantType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  startDate: string;
  duration: string;
  birthDate: string;
  citizenship: string;
  birthPlace: string;
  personalStatus: string;
  monthlyIncome: string;
  description: string;
  /* Commercial */
  companyType: string;
  companyName: string;
  companyNEQ: string;
  companyEmail: string;
  companyPhone: string;
  companyContact: string;
  leaseDuration: string;
  businessSector: string;
  annualRevenue: string;
  employeeCount: string;
  activityDescription: string;
}

const EMPTY_FORM: FormData = {
  selectedRoom: null,
  occupantType: "", firstName: "", lastName: "", email: "", phone: "",
  source: "", startDate: "", duration: "", birthDate: "", citizenship: "",
  birthPlace: "", personalStatus: "", monthlyIncome: "", description: "",
  companyType: "", companyName: "", companyNEQ: "", companyEmail: "",
  companyPhone: "", companyContact: "", leaseDuration: "",
  businessSector: "", annualRevenue: "", employeeCount: "", activityDescription: "",
};

/* ─── Static data ───────────────────────────────────────────── */
const OCCUPANT_OPTIONS = [
  { value: "seul",      label: "Locataire seul(e)", icon: "👤" },
  { value: "couple",    label: "Couple (sans enfant)", icon: "👫" },
  { value: "famille",   label: "Famille",             icon: "👨‍👩‍👧" },
  { value: "colocation",label: "Colocation",           icon: "👥" },
];

const COMPANY_TYPE_OPTIONS = [
  { value: "inc",          label: "Société (Inc./SAS)", icon: "🏢" },
  { value: "auto",         label: "Travailleur autonome", icon: "👤" },
  { value: "association",  label: "Association / OBNL", icon: "🤝" },
  { value: "grande",       label: "Grande entreprise", icon: "🏭" },
];

const SOURCE_OPTIONS = [
  { value: "kijiji",         label: "Kijiji",         bg: "#FF6400", text: "K" },
  { value: "realtor",        label: "Realtor.ca",      bg: "#2E7D32", text: "R" },
  { value: "centris",        label: "Centris",         bg: "#1565C0", text: "C" },
  { value: "zumper",         label: "Zumper",          bg: "#1A1A1A", text: "Z" },
  { value: "facebook",       label: "Facebook",        bg: "#1877F2", text: "f" },
  { value: "linkedin",       label: "LinkedIn",        bg: "#0A66C2", text: "in" },
  { value: "recommandation", label: "Recommandation",  bg: "#7C3AED", text: "👥" },
  { value: "autre",          label: "Autre",           bg: "#9E9E9E", text: "?" },
];

const RESIDENTIAL_DURATION = ["1 à 3 mois","4 à 6 mois","7 à 9 mois","10 à 12 mois","Plus d'un an","Je ne sais pas"];
const COMMERCIAL_LEASE_OPTIONS = ["3 ans (bail 3-6-9)","6 ans (bail 3-6-9)","9 ans (bail 3-6-9)","À négocier"];

const CITIZENSHIP_OPTIONS = ["Citoyen canadien","Résident permanent","Visa étudiant","Visa travail","Autre"];
const PERSONAL_STATUS_OPTIONS = ["Célibataire","En couple","Marié(e)","Autre"];

const BUSINESS_SECTORS = [
  "Technologies / Informatique","Finance / Comptabilité","Commerce de détail",
  "Restauration / Alimentation","Santé / Médical","Éducation / Formation",
  "Art / Créatif / Design","Consultation / Services aux entreprises",
  "Import / Export / Logistique","Construction / Immobilier","Autre",
];

/* ─── Shared UI helpers ─────────────────────────────────────── */
const inputClass = "w-full border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] transition-colors bg-white";
const labelClass = "block text-xs text-gray-500 mb-1 font-medium";

function ProgressBar({ step }: { step: Step }) {
  if (step === 0) return null;
  const pct = Math.round(((step - 1) / 5) * 100);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-gray-200">
      <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: YELLOW }} />
    </div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  const words = String(children).split(" ");
  const last = words.pop()!;
  return (
    <h1 className="text-[22px] font-bold text-[#1A1A1A] text-center mb-2">
      {words.join(" ")}{" "}
      <span style={{ borderBottom: `3px solid ${ACCENT}`, paddingBottom: "1px" }}>{last}</span>
    </h1>
  );
}

function NextButton({ onClick, disabled, children = "Suivant →" }: {
  onClick: () => void; disabled?: boolean; children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className="mx-auto block mt-8 px-10 py-[14px] rounded-[30px] font-semibold text-[15px] transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: YELLOW, color: "#1A1A1A" }}
    >
      {children}
    </button>
  );
}

/* ─── Screen 0 — "Comment ça marche" modal ─────────────────── */
function Screen0Modal({ onStart, addr, isCommercial }: {
  onStart: () => void; addr: string; isCommercial: boolean;
}) {
  const steps = isCommercial ? [
    { n: 1, title: "Soumettez votre dossier en ligne", desc: "Renseignez les informations sur votre entreprise et votre activité depuis chez vous." },
    { n: 2, title: "Visite de l'espace commercial", desc: "Un de nos conseillers vous organise une visite physique adaptée à vos besoins." },
    { n: 3, title: "Signature électronique du bail", desc: "Signez votre bail commercial 3-6-9 en toute sécurité grâce à DocuSeal." },
    { n: 4, title: "Remise des clés", desc: "Nous réalisons l'état des lieux d'entrée et vous remettons les clés de votre espace." },
  ] : [
    { n: 1, title: "Visite virtuelle du logement", desc: "Choisissez votre logement grâce à la visite virtuelle 3D." },
    { n: 2, title: "Dépôt de votre dossier en ligne", desc: "Candidatez et déposez les pièces justificatives de votre dossier en ligne." },
    { n: 3, title: "Signature électronique de votre bail", desc: "Vous signez votre contrat de location en ligne grâce à DocuSeal." },
    { n: 4, title: "Emménagement", desc: "Vous choisissez la date de votre état des lieux, que nous réalisons physiquement avec vous." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(70,80,110,0.55)" }}>
      <div className="absolute inset-0 -z-10" style={{ background: LAVENDER_BG, filter: "blur(6px)" }} />
      <div className="relative w-full max-w-[480px] rounded-[20px] bg-white p-9 shadow-[0_20px_60px_rgba(0,0,0,0.2)]" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <h2 className="text-[20px] font-bold text-[#1A1A1A] mb-1 pr-4">
          {isCommercial ? "Louez votre espace professionnel en ligne !" : "Trouvez votre prochain logement depuis chez vous !"}
        </h2>
        {isCommercial && (
          <p className="text-[13px] text-gray-500 mb-5">Bail commercial 3-6-9 · Contexte canadien</p>
        )}
        {!isCommercial && <div className="mb-5" />}

        <div className="space-y-5 mb-8">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ border: `2px solid ${YELLOW}`, color: YELLOW }}>
                {s.n}
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1A1A1A] leading-snug">{s.title}</div>
                <div className="text-[13px] text-[#666] leading-[1.5] mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {addr && (
          <p className="text-xs text-gray-400 mb-4 text-center">
            {isCommercial ? "Candidature pour l'espace :" : "Candidature pour :"}{" "}
            <span className="font-semibold text-gray-600">{addr}</span>
          </p>
        )}
        <button onClick={onStart} className="w-full py-4 rounded-[30px] font-semibold text-[16px] text-white transition-opacity hover:opacity-90" style={{ background: YELLOW }}>
          J'ai compris →
        </button>
      </div>
    </div>
  );
}

/* ─── RESIDENTIAL SCREENS ───────────────────────────────────── */

function ResScreen1({ value, onChange, onNext, addr, singleRoomOnly = false }: {
  value: string; onChange: (v: string) => void; onNext: () => void; addr: string;
  singleRoomOnly?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Qui occupera le logement ?</StepTitle>
      {addr && (
        <p className="text-sm text-center text-gray-500 mb-8 max-w-sm">
          Votre candidature concerne le{" "}
          <span className="font-semibold" style={{ color: YELLOW }}>{addr}</span>
        </p>
      )}
      {singleRoomOnly && (
        <p className="text-xs text-center mb-6 px-4 py-2.5 rounded-xl max-w-sm" style={{ background: "#FFF8EE", color: "#92400E", border: "1px solid #FDE68A" }}>
          Location d'une chambre individuelle — une seule personne autorisée
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[520px]">
        {OCCUPANT_OPTIONS.map((opt) => {
          const sel = value === opt.value;
          const blocked = singleRoomOnly && opt.value !== "seul";
          return (
            <button key={opt.value}
              onClick={() => !blocked && onChange(opt.value)}
              disabled={blocked}
              className="flex items-center gap-4 p-5 rounded-[14px] bg-white text-left transition-all"
              style={{
                border: sel ? `2px solid ${YELLOW}` : "1.5px solid #E8E8E8",
                boxShadow: sel ? `0 0 0 3px rgba(245,166,35,0.15)` : "none",
                opacity: blocked ? 0.35 : 1,
                cursor: blocked ? "not-allowed" : "pointer",
              }}>
              <div className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ border: sel ? `2px solid ${YELLOW}` : "2px solid #CCC", background: sel ? YELLOW : "transparent", boxShadow: sel ? `inset 0 0 0 3px white` : "none" }} />
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-[15px] font-semibold text-[#1A1A1A]">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} disabled={!value} />
    </div>
  );
}

function ResScreen2({ form, onChange, onNext, onSaveDraftAndLogin }: {
  form: FormData; onChange: (k: keyof FormData, v: string) => void; onNext: () => void;
  onSaveDraftAndLogin: () => void;
}) {
  const ok = form.firstName && form.lastName && form.email && form.phone;
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Informations candidat·e</StepTitle>
      <p className="text-sm text-gray-500 mb-8">
        Vous avez déjà un compte ?{" "}
        <button onClick={onSaveDraftAndLogin} className="font-semibold" style={{ color: YELLOW }}>Connectez-vous</button>
      </p>
      <div className="w-full max-w-[600px] bg-white rounded-2xl p-8 shadow-sm" style={{ border: "1px solid #E8E8E8" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelClass}>Prénom *</label><input className={inputClass} placeholder="Alex" value={form.firstName} onChange={e => onChange("firstName", e.target.value)} /></div>
          <div><label className={labelClass}>Nom *</label><input className={inputClass} placeholder="Beaulieu" value={form.lastName} onChange={e => onChange("lastName", e.target.value)} /></div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Adresse courriel *</label>
            <input className={inputClass} type="email" placeholder="alex.beaulieu@courriel.ca" value={form.email} onChange={e => onChange("email", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Téléphone *</label>
            <div className="flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden focus-within:border-[#F5A623] bg-white">
              <span className="px-3 py-3 text-sm text-gray-600 border-r border-[#E0E0E0] bg-gray-50 flex-shrink-0">🇨🇦 +1</span>
              <input className="flex-1 px-3 py-3 text-sm focus:outline-none" placeholder="514 123 4567" value={form.phone} onChange={e => onChange("phone", e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[#999] max-w-[600px] mx-auto mt-4 text-center leading-relaxed">
        BLOQ5 inc. est un professionnel de l'immobilier titulaire de la carte professionnelle n°CPI 6901 2019 000 039 604.
        Pour en savoir plus sur la gestion de vos données personnelles, reportez-vous à nos CGU et notre politique de confidentialité.
      </p>
      <NextButton onClick={onNext} disabled={!ok} />
    </div>
  );
}

function SharedScreen3({ value, onChange, onNext }: {
  value: string; onChange: (v: string) => void; onNext: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Comment nous avez-vous connu ?</StepTitle>
      <p className="text-sm text-gray-500 mb-8">Aidez-nous à comprendre d'où vous venez</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-[560px]">
        {SOURCE_OPTIONS.map((opt) => {
          const sel = value === opt.value;
          return (
            <button key={opt.value} onClick={() => onChange(opt.value)}
              className="flex flex-col items-center gap-2.5 p-4 rounded-[14px] bg-white text-center transition-all"
              style={{ border: sel ? `2px solid ${YELLOW}` : "1.5px solid #E8E8E8", boxShadow: sel ? `0 0 0 3px rgba(245,166,35,0.15)` : "none" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: opt.bg }}>
                {opt.text}
              </div>
              <span className="text-[13px] font-semibold text-[#1A1A1A] leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} disabled={!value} />
    </div>
  );
}

function ResScreen4({ form, onChange, onNext, minStartDate }: {
  form: FormData; onChange: (k: keyof FormData, v: string) => void; onNext: () => void;
  minStartDate?: string;
}) {
  const [durationOpen, setDurationOpen] = useState(false);
  const ok = form.startDate && form.duration;
  const minDateStr = minStartDate ?? `${new Date().getFullYear()}-01-01`;
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Informations sur votre location</StepTitle>
      <div className="w-full max-w-[560px] bg-white rounded-2xl p-8 shadow-sm mt-6" style={{ border: "1px solid #E8E8E8" }}>
        <div className="mb-5">
          <label className={labelClass}>À quelle date souhaitez-vous faire débuter votre bail ? *</label>
          <input type="date" className={inputClass} min={minDateStr} value={form.startDate} onChange={e => onChange("startDate", e.target.value)} />
        </div>
        <div className="relative">
          <label className={labelClass}>Combien de temps prévoyez-vous de rester ? *</label>
          <button onClick={() => setDurationOpen(!durationOpen)}
            className="w-full flex items-center justify-between border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm bg-white">
            <span className={form.duration ? "text-[#1A1A1A]" : "text-gray-400"}>{form.duration || "Sélectionner..."}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${durationOpen ? "rotate-180" : ""}`} />
          </button>
          {durationOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
              {RESIDENTIAL_DURATION.map(d => (
                <button key={d} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => { onChange("duration", d); setDurationOpen(false); }}>{d}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <NextButton onClick={onNext} disabled={!ok}>Suivant ✦</NextButton>
    </div>
  );
}

function ResScreen5({ form, onChange, onNext, submitError, isSubmitting }: {
  form: FormData; onChange: (k: keyof FormData, v: string) => void; onNext: () => void;
  submitError?: string | null; isSubmitting?: boolean;
}) {
  const name = [form.firstName, form.lastName].filter(Boolean).join(" ") || "vous";
  const ok = form.birthDate && form.citizenship && form.personalStatus;
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Quelques informations sur vous</StepTitle>
      <p className="text-sm text-gray-500 mb-8 max-w-sm text-center">Ces informations sont indispensables pour présenter votre dossier au propriétaire.</p>
      <div className="w-full max-w-[600px] bg-white rounded-2xl p-8 shadow-sm" style={{ border: "1px solid #E8E8E8" }}>
        <p className="text-[16px] font-bold text-[#1A1A1A] mb-6">{name}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelClass}>Date de naissance *</label><input type="date" className={inputClass} value={form.birthDate} onChange={e => onChange("birthDate", e.target.value)} /></div>
          <div>
            <label className={labelClass}>Citoyenneté / Statut *</label>
            <select className={inputClass} value={form.citizenship} onChange={e => onChange("citizenship", e.target.value)}>
              <option value="">Sélectionner...</option>
              {CITIZENSHIP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className={labelClass}>Lieu de naissance</label><input className={inputClass} placeholder="Montréal, QC" value={form.birthPlace} onChange={e => onChange("birthPlace", e.target.value)} /></div>
          <div>
            <label className={labelClass}>Situation personnelle *</label>
            <select className={inputClass} value={form.personalStatus} onChange={e => onChange("personalStatus", e.target.value)}>
              <option value="">Sélectionner...</option>
              {PERSONAL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Revenu net par mois (CA$)</label><input type="number" className={inputClass} placeholder="ex: 3 500" value={form.monthlyIncome} onChange={e => onChange("monthlyIncome", e.target.value)} /></div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} resize-none`} rows={4} value={form.description} onChange={e => onChange("description", e.target.value)} />
            <p className="text-[13px] mt-1.5 flex items-center gap-1" style={{ color: "#5C9BF5" }}>ⓘ Dites-nous en un peu plus sur vous :)</p>
          </div>
        </div>
      </div>
      {submitError && (
        <div className="w-full max-w-[600px] mx-auto mt-4 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200 text-center">
          {submitError.includes("connecté") || submitError.includes("401")
            ? <>{submitError}{" "}<a href="/sign-in" className="font-semibold underline">Se connecter</a></>
            : submitError}
        </div>
      )}
      <NextButton onClick={onNext} disabled={!ok || !!isSubmitting}>
        {isSubmitting ? "Envoi en cours…" : "Soumettre ma candidature →"}
      </NextButton>
    </div>
  );
}

/* ─── COMMERCIAL SCREENS ────────────────────────────────────── */

function ComScreen1({ value, onChange, onNext, addr }: {
  value: string; onChange: (v: string) => void; onNext: () => void; addr: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Quel type d'entreprise ?</StepTitle>
      {addr && (
        <p className="text-sm text-center text-gray-500 mb-8 max-w-sm">
          Candidature pour l'espace :{" "}
          <span className="font-semibold" style={{ color: YELLOW }}>{addr}</span>
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[520px]">
        {COMPANY_TYPE_OPTIONS.map((opt) => {
          const sel = value === opt.value;
          return (
            <button key={opt.value} onClick={() => onChange(opt.value)}
              className="flex items-center gap-4 p-5 rounded-[14px] bg-white text-left transition-all"
              style={{ border: sel ? `2px solid ${YELLOW}` : "1.5px solid #E8E8E8", boxShadow: sel ? `0 0 0 3px rgba(245,166,35,0.15)` : "none" }}>
              <div className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ border: sel ? `2px solid ${YELLOW}` : "2px solid #CCC", background: sel ? YELLOW : "transparent", boxShadow: sel ? `inset 0 0 0 3px white` : "none" }} />
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-[15px] font-semibold text-[#1A1A1A]">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} disabled={!value} />
    </div>
  );
}

function ComScreen2({ form, onChange, onNext }: {
  form: FormData; onChange: (k: keyof FormData, v: string) => void; onNext: () => void;
}) {
  const ok = form.companyName && form.companyEmail && form.companyPhone && form.companyContact;
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Informations sur l'entreprise</StepTitle>
      <p className="text-sm text-gray-500 mb-8">Ces informations permettront de constituer votre dossier locataire professionnel.</p>
      <div className="w-full max-w-[600px] bg-white rounded-2xl p-8 shadow-sm" style={{ border: "1px solid #E8E8E8" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>Raison sociale *</label>
            <input className={inputClass} placeholder="Acme Technologies Inc." value={form.companyName} onChange={e => onChange("companyName", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Numéro d'entreprise (NEQ)</label>
            <input className={inputClass} placeholder="1234567890" value={form.companyNEQ} onChange={e => onChange("companyNEQ", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Représentant légal *</label>
            <input className={inputClass} placeholder="Marie Tremblay" value={form.companyContact} onChange={e => onChange("companyContact", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Courriel professionnel *</label>
            <input className={inputClass} type="email" placeholder="contact@entreprise.ca" value={form.companyEmail} onChange={e => onChange("companyEmail", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Téléphone *</label>
            <div className="flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden focus-within:border-[#F5A623] bg-white">
              <span className="px-3 py-3 text-sm text-gray-600 border-r border-[#E0E0E0] bg-gray-50 flex-shrink-0">🇨🇦 +1</span>
              <input className="flex-1 px-3 py-3 text-sm focus:outline-none" placeholder="514 123 4567" value={form.companyPhone} onChange={e => onChange("companyPhone", e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <NextButton onClick={onNext} disabled={!ok} />
    </div>
  );
}

function ComScreen4({ form, onChange, onNext }: {
  form: FormData; onChange: (k: keyof FormData, v: string) => void; onNext: () => void;
}) {
  const [leaseOpen, setLeaseOpen] = useState(false);
  const ok = form.startDate && form.leaseDuration;
  const minDateStr = `${new Date().getFullYear()}-07-01`;
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Informations sur votre bail</StepTitle>
      <div className="w-full max-w-[560px] bg-white rounded-2xl p-8 shadow-sm mt-6" style={{ border: "1px solid #E8E8E8" }}>
        <div className="rounded-lg p-3 mb-6 text-[13px] text-gray-700" style={{ background: "#EAE8F5" }}>
          L'espace est disponible le{" "}
          <span className="font-semibold" style={{ color: YELLOW }}>01 juillet</span>.{" "}
          Le bail commercial est structuré en tranches de 3 ans (bail 3-6-9).
        </div>
        <div className="mb-5">
          <label className={labelClass}>Date de début souhaitée pour le bail *</label>
          <div className="text-[11px] mb-2 flex items-center gap-1" style={{ color: "#5C9BF5" }}>ⓘ Au plus tôt le 01/07/2026</div>
          <input type="date" className={inputClass} min={minDateStr} value={form.startDate} onChange={e => onChange("startDate", e.target.value)} />
        </div>
        <div className="relative">
          <label className={labelClass}>Durée du bail souhaitée *</label>
          <button onClick={() => setLeaseOpen(!leaseOpen)}
            className="w-full flex items-center justify-between border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm bg-white">
            <span className={form.leaseDuration ? "text-[#1A1A1A]" : "text-gray-400"}>{form.leaseDuration || "Sélectionner..."}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${leaseOpen ? "rotate-180" : ""}`} />
          </button>
          {leaseOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
              {COMMERCIAL_LEASE_OPTIONS.map(d => (
                <button key={d} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => { onChange("leaseDuration", d); setLeaseOpen(false); }}>{d}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <NextButton onClick={onNext} disabled={!ok}>Suivant ✦</NextButton>
    </div>
  );
}

function ComScreen5({ form, onChange, onNext, submitError, isSubmitting }: {
  form: FormData; onChange: (k: keyof FormData, v: string) => void; onNext: () => void;
  submitError?: string | null; isSubmitting?: boolean;
}) {
  const ok = form.businessSector;
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Votre activité</StepTitle>
      <p className="text-sm text-gray-500 mb-8 max-w-sm text-center">Ces informations permettent au propriétaire de mieux évaluer votre candidature.</p>
      <div className="w-full max-w-[600px] bg-white rounded-2xl p-8 shadow-sm" style={{ border: "1px solid #E8E8E8" }}>
        <p className="text-[16px] font-bold text-[#1A1A1A] mb-6">{form.companyName || "Votre entreprise"}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>Secteur d'activité *</label>
            <select className={inputClass} value={form.businessSector} onChange={e => onChange("businessSector", e.target.value)}>
              <option value="">Sélectionner...</option>
              {BUSINESS_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Chiffre d'affaires annuel (CA$)</label>
            <input type="number" className={inputClass} placeholder="ex: 250 000" value={form.annualRevenue} onChange={e => onChange("annualRevenue", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Nombre d'employés</label>
            <input type="number" className={inputClass} placeholder="ex: 12" value={form.employeeCount} onChange={e => onChange("employeeCount", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description de l'activité</label>
            <textarea className={`${inputClass} resize-none`} rows={4}
              placeholder="Décrivez brièvement votre activité, vos besoins en espace et tout élément pertinent pour le propriétaire."
              value={form.activityDescription} onChange={e => onChange("activityDescription", e.target.value)} />
            <p className="text-[13px] mt-1.5 flex items-center gap-1" style={{ color: "#5C9BF5" }}>
              ⓘ Un bon descriptif augmente vos chances d'être sélectionné
            </p>
          </div>
        </div>
      </div>
      {submitError && (
        <div className="w-full max-w-[600px] mx-auto mt-4 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200 text-center">
          {submitError.includes("connecté") || submitError.includes("401")
            ? <>{submitError}{" "}<a href="/sign-in" className="font-semibold underline">Se connecter</a></>
            : submitError}
        </div>
      )}
      <NextButton onClick={onNext} disabled={!ok || !!isSubmitting}>
        {isSubmitting ? "Envoi en cours…" : "Soumettre ma candidature →"}
      </NextButton>
    </div>
  );
}

/* ─── Co-living Room Selection Screen ───────────────────────── */
type CoLivingRoomEntry = { number: number; price: number | null; status: string; availableFrom?: string | null };

function CoLivingRoomScreen({ rooms, selectedRoom, onSelect, onNext, addr, wholeUnitMinDate }: {
  rooms: CoLivingRoomEntry[];
  selectedRoom: "all" | number | null;
  onSelect: (r: "all" | number) => void;
  onNext: () => void;
  addr: string;
  wholeUnitMinDate?: string | null;
}) {
  const anyRented = rooms.some(r => r.status === "rented");
  const isAllSelected = selectedRoom === "all";
  const blockedAll = anyRented;
  const restrictedAll = !anyRented && !!wholeUnitMinDate;

  const minDateLabel = wholeUnitMinDate
    ? new Date(wholeUnitMinDate + "T00:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Que souhaitez-vous louer ?</StepTitle>
      {addr && (
        <p className="text-sm text-center text-gray-500 mb-8 max-w-sm">
          Sélectionnez une option pour le{" "}
          <span className="font-semibold" style={{ color: YELLOW }}>{addr}</span>
        </p>
      )}
      <div className="w-full max-w-[520px] space-y-3">
        {/* Tout le logement */}
        <button
          onClick={() => !blockedAll && onSelect("all")}
          disabled={blockedAll}
          className="w-full flex items-center gap-4 p-5 rounded-[14px] bg-white text-left transition-all"
          style={{
            border: isAllSelected ? `2px solid ${YELLOW}` : "1.5px solid #E8E8E8",
            boxShadow: isAllSelected ? `0 0 0 3px rgba(245,166,35,0.15)` : "none",
            opacity: blockedAll ? 0.45 : 1,
            cursor: blockedAll ? "not-allowed" : "pointer",
          }}>
          <div className="w-5 h-5 rounded-full flex-shrink-0"
            style={{ border: isAllSelected ? `2px solid ${YELLOW}` : "2px solid #CCC", background: isAllSelected ? YELLOW : "transparent", boxShadow: isAllSelected ? `inset 0 0 0 3px white` : "none" }} />
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-[#1A1A1A]">🏠 Tout le logement</p>
            <p className="text-xs mt-0.5" style={{ color: blockedAll ? "#C62828" : restrictedAll ? "#B45309" : "#6B7280" }}>
              {blockedAll
                ? "Non disponible — une ou plusieurs chambres sont déjà louées"
                : restrictedAll
                  ? `⏰ Disponible à partir du ${minDateLabel}`
                  : "Postuler pour l'ensemble du bien"}
            </p>
          </div>
        </button>
        {/* Chambres individuelles */}
        {rooms.map(room => {
          const isRented = room.status === "rented";
          const isSoon = room.status === "soon";
          const isSelected = selectedRoom === room.number;
          return (
            <button key={room.number}
              onClick={() => !isRented && onSelect(room.number)}
              disabled={isRented}
              className="w-full flex items-center gap-4 p-5 rounded-[14px] bg-white text-left transition-all"
              style={{ border: isSelected ? `2px solid ${YELLOW}` : "1.5px solid #E8E8E8", boxShadow: isSelected ? `0 0 0 3px rgba(245,166,35,0.15)` : "none", opacity: isRented ? 0.5 : 1, cursor: isRented ? "not-allowed" : "pointer" }}>
              <div className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ border: isSelected ? `2px solid ${YELLOW}` : "2px solid #CCC", background: isSelected ? YELLOW : "transparent", boxShadow: isSelected ? `inset 0 0 0 3px white` : "none" }} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[15px] font-semibold text-[#1A1A1A]">🚪 Chambre {room.number}</p>
                  {room.status === "available" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>Disponible</span>}
                  {isSoon && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#E65100" }}>⏰ Bientôt dispo{room.availableFrom ? ` · ${new Date(room.availableFrom + "T00:00:00").toLocaleDateString("fr-CA")}` : ""}</span>}
                  {isRented && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFEBEE", color: "#C62828" }}>Loué</span>}
                </div>
                {room.price != null && <p className="text-xs text-gray-500 mt-0.5">{Number(room.price).toLocaleString("fr-CA")} CA$/mois</p>}
              </div>
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} disabled={selectedRoom === null} />
    </div>
  );
}

/* ─── Screen 6 — Confirmation ───────────────────────────────── */
function Screen6({ form, propertyAddr, propertyId, isCommercial, selectedRoom }: {
  form: FormData; propertyAddr: string; propertyId: number; isCommercial: boolean; selectedRoom?: "all" | number | null;
}) {
  const [checked, setChecked] = useState(false);
  const [, navigate] = useLocation();
  useEffect(() => { const t = setTimeout(() => setChecked(true), 100); return () => clearTimeout(t); }, []);

  const name = isCommercial
    ? (form.companyName || "votre entreprise")
    : ([form.firstName, form.lastName].filter(Boolean).join(" ") || "vous");

  const summaryRows = isCommercial
    ? [
        { label: "Type d'entreprise", value: COMPANY_TYPE_OPTIONS.find(o => o.value === form.companyType)?.label || "—" },
        { label: "Date de début souhaitée", value: form.startDate ? new Date(form.startDate + "T00:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" }) : "—" },
        { label: "Durée du bail", value: form.leaseDuration || "—" },
      ]
    : [
        { label: "Type d'occupant", value: OCCUPANT_OPTIONS.find(o => o.value === form.occupantType)?.label || "—" },
        { label: "Date de début souhaitée", value: form.startDate ? new Date(form.startDate + "T00:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" }) : "—" },
        { label: "Durée prévue", value: form.duration || "—" },
      ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-20" style={{ background: LAVENDER_BG }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-500"
        style={{ background: YELLOW, transform: checked ? "scale(1)" : "scale(0)" }}>
        <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
      </div>
      <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-3 text-center">
        {isCommercial ? "Dossier envoyé !" : "Candidature envoyée !"}
      </h2>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-8 leading-relaxed">
        {isCommercial
          ? `Merci ! Le dossier de ${name} a bien été transmis au propriétaire de l'espace `
          : `Merci ${name} ! Votre dossier a bien été transmis au propriétaire du `}
        <span className="font-semibold text-[#1A1A1A]">{propertyAddr}</span>.{" "}
        Vous recevrez une réponse par courriel sous 48h.
      </p>
      <div className="w-full max-w-[480px] rounded-xl p-5 mb-8" style={{ background: "#F5F5F5" }}>
        <div className="space-y-3">
          {summaryRows.map(row => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-[13px] text-[#999]">{row.label}</span>
              <span className="text-[14px] font-bold text-[#1A1A1A]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={() => navigate("/profile/requests")}
          className="px-6 py-3 rounded-[24px] font-semibold text-sm transition-opacity hover:opacity-85"
          style={{ background: YELLOW, color: "#1A1A1A" }}>
          Voir mes candidatures
        </button>
        <button onClick={() => navigate(`/properties/${propertyId}`)}
          className="px-6 py-3 rounded-[24px] font-medium text-sm border border-[#E0E0E0] text-[#1A1A1A] hover:bg-gray-50 transition-colors">
          Retour à l'annonce
        </button>
      </div>
    </div>
  );
}

const DRAFT_KEY = "bloq5_application_draft";

/* ─── Main page ─────────────────────────────────────────────── */
export default function PropertyApplicationPage() {
  const [, params] = useRoute("/properties/:id/application");
  const id = params?.id ? parseInt(params.id) : 0;
  const [, navigate] = useLocation();
  const search = useSearch();

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: session, isPending: sessionLoading } = useSession();
  const isLoggedIn = !!session?.user;
  const createRequest = useCreateRentalRequest();

  const { data: property } = useGetProperty(id, {
    query: { enabled: !!id, queryKey: ["getProperty", id] as const },
  });

  /* Restore draft from localStorage after login */
  useEffect(() => {
    if (sessionLoading) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { propertyId: number; step: Step; form: FormData; ts: number };
      if (draft.propertyId !== id) return;
      if (Date.now() - draft.ts > 60 * 60 * 1000) { localStorage.removeItem(DRAFT_KEY); return; }
      setForm(draft.form);
      setStep(draft.step);
      localStorage.removeItem(DRAFT_KEY);
    } catch { /* ignore */ }
  }, [id, sessionLoading]);

  /* Pre-fill form from session when user is logged in */
  useEffect(() => {
    if (!session?.user) return;
    const u = session.user;
    const nameParts = (u.name ?? "").split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");
    setForm(prev => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastName,
      email: prev.email || (u.email ?? ""),
    }));
  }, [session?.user?.id]);

  const propType = property?.type ?? "";
  const isCommercial = propType === "office" || propType === "commercial" || propType === "industrial";
  const isCoLiving = propType === "co-living";
  const addr = property ? (property.address || property.title) : "";
  const rooms = (property?.rooms ?? []) as CoLivingRoomEntry[];

  /* Compute the latest "availableFrom" among "soon" rooms for whole-unit restriction */
  const wholeUnitMinDate: string | null = (() => {
    if (rooms.some(r => r.status === "rented")) return null; // fully blocked, not restricted
    const soonDates = rooms.filter(r => r.status === "soon" && r.availableFrom).map(r => r.availableFrom!);
    if (soonDates.length === 0) return null;
    return soonDates.reduce((latest, d) => (d > latest ? d : latest), soonDates[0]);
  })();

  /* Pre-fill room from URL query param ?room=all|N */
  useEffect(() => {
    const roomParam = new URLSearchParams(search).get("room");
    if (roomParam) {
      const val = roomParam === "all" ? "all" : parseInt(roomParam);
      setForm(prev => ({ ...prev, selectedRoom: isNaN(val as number) ? "all" : val }));
    }
  }, [search]);

  function setField(k: keyof FormData, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function goTo(s: Step) {
    if (containerRef.current) {
      containerRef.current.style.opacity = "0";
      setTimeout(() => {
        setStep(s);
        window.scrollTo({ top: 0 });
        if (containerRef.current) containerRef.current.style.opacity = "1";
      }, 200);
    } else {
      setStep(s);
    }
  }

  const confirmStep: Step = isCoLiving ? 7 : 6;

  async function handleSubmitAndConfirm() {
    setSubmitError(null);
    const applicantName = isCommercial
      ? (form.companyContact || form.companyName)
      : [form.firstName, form.lastName].filter(Boolean).join(" ");
    const applicantEmail = isCommercial ? form.companyEmail : form.email;
    const applicantPhone = isCommercial ? form.companyPhone : form.phone;

    const messageParts: string[] = [];
    if (!isCommercial) {
      if (form.occupantType) messageParts.push(`Type d'occupant: ${form.occupantType}`);
      if (form.startDate) messageParts.push(`Début souhaité: ${form.startDate}`);
      if (form.duration) messageParts.push(`Durée prévue: ${form.duration}`);
      if (form.citizenship) messageParts.push(`Citoyenneté: ${form.citizenship}`);
      if (form.monthlyIncome) messageParts.push(`Revenu mensuel: ${form.monthlyIncome} CA$`);
      if (form.description) messageParts.push(`Description: ${form.description}`);
      if (isCoLiving && form.selectedRoom !== null) {
        messageParts.push(`Chambre sélectionnée: ${form.selectedRoom === "all" ? "Tout le logement" : `Chambre ${form.selectedRoom}`}`);
      }
    } else {
      if (form.companyType) messageParts.push(`Type d'entreprise: ${form.companyType}`);
      if (form.companyName) messageParts.push(`Raison sociale: ${form.companyName}`);
      if (form.companyNEQ) messageParts.push(`NEQ: ${form.companyNEQ}`);
      if (form.startDate) messageParts.push(`Début souhaité: ${form.startDate}`);
      if (form.leaseDuration) messageParts.push(`Durée du bail: ${form.leaseDuration}`);
      if (form.businessSector) messageParts.push(`Secteur: ${form.businessSector}`);
      if (form.annualRevenue) messageParts.push(`CA annuel: ${form.annualRevenue} CA$`);
      if (form.activityDescription) messageParts.push(`Activité: ${form.activityDescription}`);
    }
    if (form.source) messageParts.push(`Source: ${form.source}`);

    try {
      await createRequest.mutateAsync({
        data: {
          propertyId: id,
          applicantName,
          applicantEmail,
          applicantPhone: applicantPhone || undefined,
          message: messageParts.join(" | ") || "Candidature déposée",
        },
      });
      goTo(confirmStep);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Erreur lors de l'envoi";
      if (msg.includes("401") || msg.includes("non authentifié") || msg.includes("connecté")) {
        setSubmitError("Vous devez être connecté pour soumettre une candidature.");
      } else {
        setSubmitError(msg);
      }
    }
  }

  function saveDraftAndLogin() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ propertyId: id, step, form, ts: Date.now() }));
    } catch { /* ignore */ }
    const returnTo = `/properties/${id}/application`;
    navigate(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }

  function handleBack() {
    if (step === 0) navigate(`/properties/${id}`);
    // Residential logged in: steps 2 (info) and 3 (source) are skipped
    else if (isLoggedIn && !isCoLiving && !isCommercial && step === 4) goTo(1);
    // Co-living logged in: steps 3 (info) and 4 (source) are skipped
    else if (isLoggedIn && isCoLiving && step === 5) goTo(2);
    // Commercial logged in: only step 3 (source) is skipped; step 2 (company info) stays
    else if (isLoggedIn && isCommercial && step === 4) goTo(2);
    else goTo((step - 1) as Step);
  }

  return (
    <>
      <ProgressBar step={step} />

      {/* Back arrow — all steps except confirmation */}
      {step !== confirmStep && (
        <button onClick={handleBack} aria-label="Retour"
          className="fixed top-4 left-4 z-[200] w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          style={{ border: "1px solid #E8E8E8" }}>
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
      )}

      {/* Screen 0 — modal */}
      {step === 0 && (
        <div className="min-h-screen" style={{ background: LAVENDER_BG }}>
          <Screen0Modal onStart={() => goTo(1)} addr={addr} isCommercial={isCommercial} />
        </div>
      )}

      {/* Screens 1–N with fade */}
      <div ref={containerRef} style={{ transition: "opacity 0.2s ease", opacity: step === 0 ? 0 : 1 }}>
        {isCoLiving ? (
          <>
            {step === 1 && (
              <CoLivingRoomScreen
                rooms={rooms}
                selectedRoom={form.selectedRoom}
                onSelect={r => setForm(prev => ({ ...prev, selectedRoom: r }))}
                onNext={() => goTo(2)}
                addr={addr}
                wholeUnitMinDate={wholeUnitMinDate}
              />
            )}
            {step === 2 && <ResScreen1 value={form.occupantType} onChange={v => setField("occupantType", v)} onNext={() => goTo(isLoggedIn ? 5 : 3)} addr={addr} singleRoomOnly={typeof form.selectedRoom === "number"} />}
            {step === 3 && !isLoggedIn && <ResScreen2 form={form} onChange={setField} onNext={() => goTo(4)} onSaveDraftAndLogin={saveDraftAndLogin} />}
            {step === 4 && !isLoggedIn && <SharedScreen3 value={form.source} onChange={v => setField("source", v)} onNext={() => goTo(5)} />}
            {step === 5 && <ResScreen4 form={form} onChange={setField} onNext={() => goTo(6)} minStartDate={form.selectedRoom === "all" && wholeUnitMinDate ? wholeUnitMinDate : undefined} />}
            {step === 6 && <ResScreen5 form={form} onChange={setField} onNext={handleSubmitAndConfirm} submitError={submitError} isSubmitting={createRequest.isPending} />}
          </>
        ) : isCommercial ? (
          <>
            {step === 1 && <ComScreen1 value={form.companyType} onChange={v => setField("companyType", v)} onNext={() => goTo(2)} addr={addr} />}
            {step === 2 && <ComScreen2 form={form} onChange={setField} onNext={() => goTo(isLoggedIn ? 4 : 3)} />}
            {step === 3 && !isLoggedIn && <SharedScreen3 value={form.source} onChange={v => setField("source", v)} onNext={() => goTo(4)} />}
            {step === 4 && <ComScreen4 form={form} onChange={setField} onNext={() => goTo(5)} />}
            {step === 5 && <ComScreen5 form={form} onChange={setField} onNext={handleSubmitAndConfirm} submitError={submitError} isSubmitting={createRequest.isPending} />}
          </>
        ) : (
          <>
            {step === 1 && <ResScreen1 value={form.occupantType} onChange={v => setField("occupantType", v)} onNext={() => goTo(isLoggedIn ? 4 : 2)} addr={addr} />}
            {step === 2 && !isLoggedIn && <ResScreen2 form={form} onChange={setField} onNext={() => goTo(3)} onSaveDraftAndLogin={saveDraftAndLogin} />}
            {step === 3 && !isLoggedIn && <SharedScreen3 value={form.source} onChange={v => setField("source", v)} onNext={() => goTo(4)} />}
            {step === 4 && <ResScreen4 form={form} onChange={setField} onNext={() => goTo(5)} />}
            {step === 5 && <ResScreen5 form={form} onChange={setField} onNext={handleSubmitAndConfirm} submitError={submitError} isSubmitting={createRequest.isPending} />}
          </>
        )}
        {step === confirmStep && <Screen6 form={form} propertyAddr={addr} propertyId={id} isCommercial={isCommercial} selectedRoom={form.selectedRoom} />}
      </div>
    </>
  );
}
