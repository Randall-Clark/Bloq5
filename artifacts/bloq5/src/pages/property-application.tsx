import { useRoute, Link, useLocation } from "wouter";
import { useGetProperty } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, ChevronDown } from "lucide-react";

const YELLOW = "#F5A623";
const LAVENDER_BG = "linear-gradient(180deg, #EAE8F5 0%, #F5F5FA 50%, #FFFFFF 100%)";
const ACCENT = "#E05A2B";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
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
}

const OCCUPANT_OPTIONS = [
  { value: "seul", label: "Locataire seul(e)", icon: "👤" },
  { value: "couple", label: "Couple (sans enfant)", icon: "👫" },
  { value: "famille", label: "Famille", icon: "👨‍👩‍👧" },
  { value: "colocation", label: "Colocation", icon: "👥" },
];

const SOURCE_OPTIONS = [
  { value: "kijiji", label: "Kijiji", bg: "#FF6400", text: "K" },
  { value: "realtor", label: "Realtor.ca", bg: "#2E7D32", text: "R" },
  { value: "centris", label: "Centris", bg: "#1565C0", text: "C" },
  { value: "zumper", label: "Zumper", bg: "#1A1A1A", text: "Z" },
  { value: "facebook", label: "Facebook", bg: "#1877F2", text: "f" },
  { value: "linkedin", label: "LinkedIn", bg: "#0A66C2", text: "in" },
  { value: "recommandation", label: "Recommandation", bg: "#7C3AED", text: "👥" },
  { value: "autre", label: "Autre", bg: "#9E9E9E", text: "?" },
];

const DURATION_OPTIONS = [
  "1 à 3 mois",
  "4 à 6 mois",
  "7 à 9 mois",
  "10 à 12 mois",
  "Plus d'un an",
  "Je ne sais pas",
];

const CITIZENSHIP_OPTIONS = [
  "Citoyen canadien",
  "Résident permanent",
  "Visa étudiant",
  "Visa travail",
  "Autre",
];

const PERSONAL_STATUS_OPTIONS = ["Célibataire", "En couple", "Marié(e)", "Autre"];

function ProgressBar({ step }: { step: Step }) {
  if (step === 0) return null;
  const pct = Math.round(((step - 1) / 5) * 100);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-gray-200">
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${pct}%`, background: YELLOW }}
      />
    </div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  const text = String(children);
  const words = text.split(" ");
  const last = words.pop()!;
  return (
    <h1 className="text-[22px] font-bold text-[#1A1A1A] text-center mb-2">
      {words.join(" ")}{" "}
      <span
        style={{
          borderBottom: `3px solid ${ACCENT}`,
          paddingBottom: "1px",
          textDecoration: "none",
        }}
      >
        {last}
      </span>
    </h1>
  );
}

function NextButton({
  onClick,
  disabled,
  children = "Suivant →",
}: {
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mx-auto block mt-8 px-10 py-[14px] rounded-[30px] font-semibold text-[15px] transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: YELLOW, color: "#1A1A1A" }}
    >
      {children}
    </button>
  );
}

function Screen0Modal({
  onStart,
  addr,
}: {
  onStart: () => void;
  addr: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(70,80,110,0.55)" }}
    >
      {/* Blurred background preview */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: LAVENDER_BG,
          filter: "blur(6px)",
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[480px] rounded-[20px] bg-white p-9 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <h2 className="text-[20px] font-bold text-[#1A1A1A] mb-6 pr-8">
          Trouvez votre prochain logement depuis chez vous !
        </h2>

        <div className="space-y-5 mb-8">
          {[
            {
              n: 1,
              title: "Visite virtuelle du logement",
              desc: "Choisissez votre logement grâce à la visite virtuelle 3D.",
            },
            {
              n: 2,
              title: "Dépôt de votre dossier en ligne",
              desc: "Candidatez et déposez les pièces justificatives de votre dossier en ligne.",
            },
            {
              n: 3,
              title: "Signature électronique de votre bail",
              desc: "Vous signez votre contrat de location en ligne grâce à DocuSeal.",
            },
            {
              n: 4,
              title: "Emménagement",
              desc: "Vous choisissez la date de votre état des lieux, que nous réalisons physiquement avec vous.",
            },
          ].map((s) => (
            <div key={s.n} className="flex gap-4">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ border: `2px solid ${YELLOW}`, color: YELLOW }}
              >
                {s.n}
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1A1A1A] leading-snug">
                  {s.title}
                </div>
                <div className="text-[13px] text-[#666] leading-[1.5] mt-0.5">
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {addr && (
          <p className="text-xs text-gray-400 mb-4 text-center">
            Candidature pour :{" "}
            <span className="font-semibold text-gray-600">{addr}</span>
          </p>
        )}

        <button
          onClick={onStart}
          className="w-full py-4 rounded-[30px] font-semibold text-[16px] text-white transition-opacity hover:opacity-90"
          style={{ background: YELLOW }}
        >
          J'ai compris →
        </button>
      </div>
    </div>
  );
}

function Screen1({
  value,
  onChange,
  onNext,
  addr,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  addr: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Qui occupera le logement ?</StepTitle>
      {addr && (
        <p className="text-sm text-center text-gray-500 mb-8 max-w-sm">
          Votre candidature concerne le{" "}
          <span className="font-semibold" style={{ color: YELLOW }}>
            {addr}
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[520px]">
        {OCCUPANT_OPTIONS.map((opt) => {
          const sel = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="flex items-center gap-4 p-5 rounded-[14px] bg-white text-left transition-all"
              style={{
                border: sel
                  ? `2px solid ${YELLOW}`
                  : "1.5px solid #E8E8E8",
                boxShadow: sel
                  ? `0 0 0 3px rgba(245,166,35,0.15)`
                  : "none",
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{
                  border: sel ? `2px solid ${YELLOW}` : "2px solid #CCC",
                  background: sel ? YELLOW : "transparent",
                  boxShadow: sel ? `inset 0 0 0 3px white` : "none",
                }}
              />
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-[15px] font-semibold text-[#1A1A1A]">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <NextButton onClick={onNext} disabled={!value} />
    </div>
  );
}

const inputClass =
  "w-full border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[#F5A623] transition-colors bg-white";
const labelClass = "block text-xs text-gray-500 mb-1 font-medium";

function Screen2({
  form,
  onChange,
  onNext,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  onNext: () => void;
}) {
  const ok = form.firstName && form.lastName && form.email && form.phone;
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Informations candidat·e</StepTitle>
      <p className="text-sm text-gray-500 mb-8">
        Vous avez déjà un compte ?{" "}
        <Link href="/sign-in">
          <span className="font-semibold cursor-pointer" style={{ color: YELLOW }}>
            Connectez-vous
          </span>
        </Link>
      </p>

      <div
        className="w-full max-w-[600px] bg-white rounded-2xl p-8 shadow-sm"
        style={{ border: "1px solid #E8E8E8" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Prénom *</label>
            <input
              className={inputClass}
              placeholder="Alex"
              value={form.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Nom *</label>
            <input
              className={inputClass}
              placeholder="Beaulieu"
              value={form.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Adresse courriel *</label>
            <input
              className={inputClass}
              type="email"
              placeholder="alex.beaulieu@courriel.ca"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Téléphone *</label>
            <div className="flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden focus-within:border-[#F5A623] bg-white">
              <span className="px-3 py-3 text-sm text-gray-600 border-r border-[#E0E0E0] bg-gray-50 flex-shrink-0">
                🇨🇦 +1
              </span>
              <input
                className="flex-1 px-3 py-3 text-sm focus:outline-none"
                placeholder="514 123 4567"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#999] max-w-[600px] mx-auto mt-4 text-center leading-relaxed">
        BLOQ5 inc. est un professionnel de l'immobilier titulaire de la carte
        professionnelle n°CPI 6901 2019 000 039 604. Pour en savoir plus sur la
        gestion de vos données personnelles, reportez-vous à nos CGU et notre
        politique de confidentialité.
      </p>

      <NextButton onClick={onNext} disabled={!ok} />
    </div>
  );
}

function Screen3({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Comment nous avez-vous connu ?</StepTitle>
      <p className="text-sm text-gray-500 mb-8">
        Aidez-nous à comprendre d'où vous venez
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-[560px]">
        {SOURCE_OPTIONS.map((opt) => {
          const sel = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="flex flex-col items-center gap-2.5 p-4 rounded-[14px] bg-white text-center transition-all"
              style={{
                border: sel
                  ? `2px solid ${YELLOW}`
                  : "1.5px solid #E8E8E8",
                boxShadow: sel ? `0 0 0 3px rgba(245,166,35,0.15)` : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: opt.bg }}
              >
                {opt.text}
              </div>
              <span className="text-[13px] font-semibold text-[#1A1A1A] leading-tight">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <NextButton onClick={onNext} disabled={!value} />
    </div>
  );
}

function Screen4({
  form,
  onChange,
  onNext,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  onNext: () => void;
}) {
  const [durationOpen, setDurationOpen] = useState(false);
  const ok = form.startDate && form.duration;
  const today = new Date();
  const minDate = new Date(today.getFullYear(), 6, 1); // July 1
  const minDateStr = `${minDate.getFullYear()}-07-01`;

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Informations sur votre location</StepTitle>

      <div
        className="w-full max-w-[560px] bg-white rounded-2xl p-8 shadow-sm mt-6"
        style={{ border: "1px solid #E8E8E8" }}
      >
        {/* Info banner */}
        <div
          className="rounded-lg p-3 mb-6 text-[13px] text-gray-700"
          style={{ background: "#EAE8F5" }}
        >
          Le logement sera libre le{" "}
          <span className="font-semibold" style={{ color: YELLOW }}>
            01 juillet
          </span>{" "}
          et les propriétaires préfèrent en général les candidats qui peuvent
          emménager le plus tôt possible.
        </div>

        {/* Start date */}
        <div className="mb-5">
          <label className={labelClass}>
            À quelle date souhaitez-vous faire débuter votre bail ? *
          </label>
          <div
            className="text-[11px] mb-2 flex items-center gap-1"
            style={{ color: "#5C9BF5" }}
          >
            ⓘ Au plus tôt le 01/07/2026
          </div>
          <input
            type="date"
            className={inputClass}
            min={minDateStr}
            value={form.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
          />
          <p className="text-[11px] text-[#999] italic mt-1.5">
            *Il s'agit ici de choisir la date à laquelle commencera votre bail.
            Vous aurez ensuite la possibilité d'emménager à une date ultérieure
            selon votre besoin.
          </p>
        </div>

        {/* Duration */}
        <div className="relative">
          <label className={labelClass}>
            Combien de temps prévoyez-vous de rester ? *
          </label>
          <button
            onClick={() => setDurationOpen(!durationOpen)}
            className="w-full flex items-center justify-between border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm bg-white focus:border-[#F5A623]"
          >
            <span className={form.duration ? "text-[#1A1A1A]" : "text-gray-400"}>
              {form.duration || "Sélectionner..."}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${durationOpen ? "rotate-180" : ""}`}
            />
          </button>
          {durationOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onChange("duration", d);
                    setDurationOpen(false);
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <NextButton onClick={onNext} disabled={!ok}>
        Suivant ✦
      </NextButton>
    </div>
  );
}

function Screen5({
  form,
  onChange,
  onNext,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  onNext: () => void;
}) {
  const name = [form.firstName, form.lastName].filter(Boolean).join(" ") || "Alex Beaulieu";
  const ok = form.birthDate && form.citizenship && form.personalStatus;

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-32 px-4" style={{ background: LAVENDER_BG }}>
      <StepTitle>Quelques informations sur vous</StepTitle>
      <p className="text-sm text-gray-500 mb-8 max-w-sm text-center">
        Ces informations sont indispensables pour présenter votre dossier au
        propriétaire.
      </p>

      <div
        className="w-full max-w-[600px] bg-white rounded-2xl p-8 shadow-sm"
        style={{ border: "1px solid #E8E8E8" }}
      >
        <p className="text-[16px] font-bold text-[#1A1A1A] mb-6">{name}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Date de naissance *</label>
            <input
              type="date"
              className={inputClass}
              value={form.birthDate}
              onChange={(e) => onChange("birthDate", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Citoyenneté / Statut *</label>
            <select
              className={inputClass}
              value={form.citizenship}
              onChange={(e) => onChange("citizenship", e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {CITIZENSHIP_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Lieu de naissance</label>
            <input
              className={inputClass}
              placeholder="Montréal, QC"
              value={form.birthPlace}
              onChange={(e) => onChange("birthPlace", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Situation personnelle *</label>
            <select
              className={inputClass}
              value={form.personalStatus}
              onChange={(e) => onChange("personalStatus", e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {PERSONAL_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Revenu net par mois (CA$)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="ex: 3 500"
              value={form.monthlyIncome}
              onChange={(e) => onChange("monthlyIncome", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
            <p
              className="text-[13px] mt-1.5 flex items-center gap-1"
              style={{ color: "#5C9BF5" }}
            >
              ⓘ Dites-nous en un peu plus sur vous :)
            </p>
          </div>
        </div>
      </div>

      <NextButton onClick={onNext} disabled={!ok} />
    </div>
  );
}

function Screen6({
  form,
  propertyAddr,
  propertyId,
}: {
  form: FormData;
  propertyAddr: string;
  propertyId: number;
}) {
  const [checked, setChecked] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 100);
    return () => clearTimeout(t);
  }, []);

  const name = [form.firstName, form.lastName].filter(Boolean).join(" ") || "vous";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 pb-20"
      style={{ background: LAVENDER_BG }}
    >
      {/* Animated checkmark */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-500"
        style={{
          background: YELLOW,
          transform: checked ? "scale(1)" : "scale(0)",
        }}
      >
        <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
      </div>

      <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-3 text-center">
        Candidature envoyée !
      </h2>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-8 leading-relaxed">
        Merci {name} ! Votre dossier a bien été transmis au propriétaire du{" "}
        <span className="font-semibold text-[#1A1A1A]">{propertyAddr}</span>.
        Vous recevrez une réponse par courriel sous 48h.
      </p>

      {/* Summary */}
      <div
        className="w-full max-w-[480px] rounded-xl p-5 mb-8"
        style={{ background: "#F5F5F5" }}
      >
        <div className="space-y-3">
          {[
            {
              label: "Type d'occupant",
              value:
                OCCUPANT_OPTIONS.find((o) => o.value === form.occupantType)
                  ?.label || "—",
            },
            {
              label: "Date de début souhaitée",
              value: form.startDate
                ? new Date(form.startDate + "T00:00:00").toLocaleDateString("fr-CA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—",
            },
            { label: "Durée prévue", value: form.duration || "—" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-[13px] text-[#999]">{row.label}</span>
              <span className="text-[14px] font-bold text-[#1A1A1A]">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => navigate("/profile/requests")}
          className="px-6 py-3 rounded-[24px] font-semibold text-sm transition-opacity hover:opacity-85"
          style={{ background: YELLOW, color: "#1A1A1A" }}
        >
          Voir mes candidatures
        </button>
        <button
          onClick={() => navigate(`/properties/${propertyId}`)}
          className="px-6 py-3 rounded-[24px] font-medium text-sm border border-[#E0E0E0] text-[#1A1A1A] hover:bg-gray-50 transition-colors"
        >
          Retour à l'annonce
        </button>
      </div>
    </div>
  );
}

export default function PropertyApplicationPage() {
  const [, params] = useRoute("/properties/:id/application");
  const id = params?.id ? parseInt(params.id) : 0;

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormData>({
    occupantType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "",
    startDate: "",
    duration: "",
    birthDate: "",
    citizenship: "",
    birthPlace: "",
    personalStatus: "",
    monthlyIncome: "",
    description: "",
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const { data: property } = useGetProperty(id, {
    query: { enabled: !!id, queryKey: ["getProperty", id] as const },
  });

  const addr = property
    ? `${property.address || property.title}`
    : "";

  function setField(k: keyof FormData, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function goTo(s: Step) {
    if (containerRef.current) {
      containerRef.current.style.opacity = "0";
      setTimeout(() => {
        setStep(s);
        if (containerRef.current) containerRef.current.style.opacity = "1";
      }, 200);
    } else {
      setStep(s);
    }
  }

  return (
    <>
      <ProgressBar step={step} />

      {step === 0 && (
        <div
          className="min-h-screen"
          style={{ background: LAVENDER_BG }}
        >
          <Screen0Modal onStart={() => goTo(1)} addr={addr} />
        </div>
      )}

      <div
        ref={containerRef}
        style={{ transition: "opacity 0.2s ease", opacity: step === 0 ? 0 : 1 }}
      >
        {step === 1 && (
          <Screen1
            value={form.occupantType}
            onChange={(v) => setField("occupantType", v)}
            onNext={() => goTo(2)}
            addr={addr}
          />
        )}
        {step === 2 && (
          <Screen2 form={form} onChange={setField} onNext={() => goTo(3)} />
        )}
        {step === 3 && (
          <Screen3
            value={form.source}
            onChange={(v) => setField("source", v)}
            onNext={() => goTo(4)}
          />
        )}
        {step === 4 && (
          <Screen4 form={form} onChange={setField} onNext={() => goTo(5)} />
        )}
        {step === 5 && (
          <Screen5 form={form} onChange={setField} onNext={() => goTo(6)} />
        )}
        {step === 6 && (
          <Screen6 form={form} propertyAddr={addr} propertyId={id} />
        )}
      </div>
    </>
  );
}
