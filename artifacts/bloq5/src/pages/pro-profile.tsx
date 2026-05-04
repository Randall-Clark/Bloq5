import { useState, useRef, useEffect } from "react";
import ProLayout from "@/components/layout/pro-layout";
import { authClient } from "@/lib/auth-client";
import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProfileQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail, Phone, Shield, Building2, Pencil,
  CheckCircle2, X, AlertCircle, Loader2,
} from "lucide-react";

const YELLOW = "#F5A623";
const DARK   = "#1A1A1A";

/* ─── 6-digit code input ─── */
function CodeInput({
  digits,
  setDigits,
}: {
  digits: string[];
  setDigits: (d: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  function handleChange(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }
  return (
    <div className="flex gap-2 justify-center my-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 text-center text-xl font-bold border-2 rounded-xl outline-none transition-colors focus:border-[#F5A623]"
          style={{ height: 52, borderColor: d ? YELLOW : "#E5E7EB", color: DARK }}
        />
      ))}
    </div>
  );
}

/* ─── Phone formatter ─── */
function fmtPhone(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 10);
  if (n.length <= 3)  return n;
  if (n.length <= 6)  return `(${n.slice(0,3)}) ${n.slice(3)}`;
  return `(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`;
}

/* ═══════════════════════════════════════════════
   Email edit modal
   Flow: verify old email → enter new email → save
═══════════════════════════════════════════════ */
function EmailEditModal({
  currentEmail,
  onClose,
  onSaved,
}: {
  currentEmail: string;
  onClose: () => void;
  onSaved: (newEmail: string) => void;
}) {
  const [step,    setStep]   = useState<"verify_old" | "new_email">("verify_old");
  const [sending, setSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [digits,  setDigits] = useState(Array(6).fill(""));
  const [newEmail,  setNewEmail]  = useState("");
  const [error,   setError]  = useState("");
  const updateProfile = useUpdateProfile();

  function sendOldCode() {
    setSending(true);
    /* Simulated — replace with real email provider in production */
    setTimeout(() => { setSending(false); setCodeSent(true); }, 800);
  }

  function verifyOld() {
    if (digits.join("").length < 6) { setError("Entrez les 6 chiffres reçus."); return; }
    setError("");
    setStep("new_email");
    setDigits(Array(6).fill(""));
  }

  function save() {
    if (!newEmail.trim() || !newEmail.includes("@")) { setError("Adresse e-mail invalide."); return; }
    setError("");
    updateProfile.mutate(
      { data: { email: newEmail.trim() } },
      { onSuccess: () => onSaved(newEmail.trim()), onError: () => setError("Erreur lors de la mise à jour.") }
    );
  }

  return (
    <Overlay onClose={onClose}>
      <ModalHeader icon={Mail} title="Modifier l'adresse e-mail" onClose={onClose} />
      <div className="px-6 pb-6 space-y-4">
        {step === "verify_old" ? (
          <>
            <p className="text-sm text-gray-500">
              Pour confirmer votre identité, envoyez un code de vérification à votre adresse actuelle&nbsp;:
              <strong className="text-gray-800 ml-1">{currentEmail}</strong>
            </p>
            {!codeSent ? (
              <button
                onClick={sendOldCode}
                disabled={sending}
                className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: YELLOW, color: DARK }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sending ? "Envoi…" : "Envoyer le code de vérification"}
              </button>
            ) : (
              <>
                <p className="text-xs text-gray-400 text-center">Code envoyé à <strong className="text-gray-700">{currentEmail}</strong></p>
                <CodeInput digits={digits} setDigits={setDigits} />
                {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}
                <button
                  onClick={verifyOld}
                  className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: DARK, color: "#fff" }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmer
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">Identité vérifiée. Saisissez votre nouvelle adresse e-mail.</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nouvelle adresse e-mail</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setError(""); }}
                placeholder="nouvelle@adresse.com"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 text-sm transition-colors"
              />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <button
              onClick={save}
              disabled={updateProfile.isPending}
              className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: YELLOW, color: DARK }}
            >
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {updateProfile.isPending ? "Enregistrement…" : "Enregistrer le nouvel e-mail"}
            </button>
          </>
        )}
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════════
   Phone edit modal
   Flow (existing phone): verify old phone → enter new phone → verify new → save
   Flow (no phone): directly enter new phone → verify → save
═══════════════════════════════════════════════ */
function PhoneEditModal({
  currentPhone,
  onClose,
  onSaved,
}: {
  currentPhone: string | null;
  onClose: () => void;
  onSaved: (newPhone: string) => void;
}) {
  type Step = "verify_old" | "new_phone" | "verify_new";
  const [step,     setStep]    = useState<Step>(currentPhone ? "verify_old" : "new_phone");
  const [sending,  setSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [digits,   setDigits]  = useState(Array(6).fill(""));
  const [newPhone, setNewPhone] = useState("");
  const [newCodeSent, setNewCodeSent] = useState(false);
  const [newDigits,   setNewDigits]   = useState(Array(6).fill(""));
  const [error,    setError]   = useState("");
  const updateProfile = useUpdateProfile();

  function sendOldCode() {
    setSending(true);
    /* Simulated — replace with real SMS provider in production */
    setTimeout(() => { setSending(false); setCodeSent(true); }, 800);
  }

  function verifyOld() {
    if (digits.join("").length < 6) { setError("Entrez les 6 chiffres reçus."); return; }
    setError("");
    setStep("new_phone");
    setDigits(Array(6).fill(""));
  }

  function sendNewCode() {
    const nums = newPhone.replace(/\D/g, "");
    if (nums.length < 10) { setError("Numéro invalide — 10 chiffres requis."); return; }
    setError("");
    setSending(true);
    /* Simulated — replace with real SMS provider in production */
    setTimeout(() => { setSending(false); setNewCodeSent(true); setStep("verify_new"); }, 800);
  }

  function verifyNew() {
    if (newDigits.join("").length < 6) { setError("Entrez les 6 chiffres reçus."); return; }
    setError("");
    const fmt = `+1 ${newPhone}`;
    updateProfile.mutate(
      { data: { phone: fmt } },
      { onSuccess: () => onSaved(fmt), onError: () => setError("Erreur lors de la mise à jour.") }
    );
  }

  return (
    <Overlay onClose={onClose}>
      <ModalHeader icon={Phone} title="Modifier le numéro de téléphone" onClose={onClose} />
      <div className="px-6 pb-6 space-y-4">

        {/* Step: verify old phone */}
        {step === "verify_old" && (
          <>
            <p className="text-sm text-gray-500">
              Pour confirmer votre identité, envoyez un code au numéro actuel&nbsp;:
              <strong className="text-gray-800 ml-1">{currentPhone}</strong>
            </p>
            {!codeSent ? (
              <button
                onClick={sendOldCode}
                disabled={sending}
                className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: YELLOW, color: DARK }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {sending ? "Envoi…" : "Envoyer le code par SMS"}
              </button>
            ) : (
              <>
                <p className="text-xs text-gray-400 text-center">Code envoyé au <strong className="text-gray-700">{currentPhone}</strong></p>
                <CodeInput digits={digits} setDigits={setDigits} />
                {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}
                <button
                  onClick={verifyOld}
                  className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: DARK, color: "#fff" }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmer
                </button>
              </>
            )}
          </>
        )}

        {/* Step: enter new phone */}
        {step === "new_phone" && (
          <>
            <p className="text-sm text-gray-500">
              {currentPhone ? "Identité vérifiée. " : ""}Saisissez le nouveau numéro de téléphone.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nouveau numéro (Canada)</label>
              <div className="flex items-center gap-2 border border-gray-200 focus-within:border-[#F5A623] rounded-xl px-4 h-12 transition-colors">
                <span className="text-sm text-gray-400 font-medium shrink-0">🇨🇦 +1</span>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => { setNewPhone(fmtPhone(e.target.value)); setError(""); }}
                  placeholder="(514) 000-0000"
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                  onKeyDown={e => e.key === "Enter" && sendNewCode()}
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <button
              onClick={sendNewCode}
              disabled={sending}
              className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: YELLOW, color: DARK }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              {sending ? "Envoi…" : "Recevoir le code de vérification"}
            </button>
          </>
        )}

        {/* Step: verify new phone */}
        {step === "verify_new" && (
          <>
            <p className="text-xs text-gray-400 text-center">
              Code envoyé au <strong className="text-gray-700">+1 {newPhone}</strong>
            </p>
            <CodeInput digits={newDigits} setDigits={setNewDigits} />
            {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}
            <button
              onClick={verifyNew}
              disabled={updateProfile.isPending}
              className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: YELLOW, color: DARK }}
            >
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {updateProfile.isPending ? "Enregistrement…" : "Vérifier et enregistrer"}
            </button>
            <button
              onClick={() => { setStep("new_phone"); setNewDigits(Array(6).fill("")); setError(""); }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              Changer de numéro
            </button>
          </>
        )}
      </div>
    </Overlay>
  );
}

/* ─── Shared overlay wrapper ─── */
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  icon: Icon,
  title,
  onClose,
}: {
  icon: React.ElementType;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF8EE" }}>
          <Icon className="w-4 h-4" style={{ color: YELLOW }} />
        </div>
        <h2 className="text-base font-bold" style={{ color: DARK }}>{title}</h2>
      </div>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}

/* ─── Editable info row ─── */
function EditableRow({
  icon: Icon,
  label,
  value,
  required,
  missing,
  onEdit,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  required?: boolean;
  missing?: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${missing ? "bg-red-50" : "bg-gray-100"}`}>
        <Icon className={`h-4 w-4 ${missing ? "text-red-400" : "text-gray-500"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
          {label}
          {required && <span className="text-red-400 text-[10px]">*obligatoire</span>}
        </p>
        <p className={`text-sm font-semibold mt-0.5 ${missing ? "text-red-400 italic" : "text-gray-900"}`}>{value}</p>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100"
        style={{ color: DARK }}
        title={`Modifier ${label.toLowerCase()}`}
      >
        <Pencil className="w-3.5 h-3.5" />
        Modifier
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════ */
type Modal = "email" | "phone" | null;

export default function ProProfilePage() {
  const qc = useQueryClient();
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const { data: profile, isLoading } = useGetProfile();

  const [modal, setModal] = useState<Modal>(null);

  /* Current values (may be updated after save) */
  const [displayEmail, setDisplayEmail] = useState<string | null>(null);
  const [displayPhone, setDisplayPhone] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) setDisplayEmail(session.user.email);
  }, [session?.user?.email]);

  useEffect(() => {
    if (profile?.phone) setDisplayPhone(profile.phone);
  }, [profile?.phone]);

  const user       = session?.user;
  const email      = displayEmail ?? user?.email ?? "";
  const phone      = displayPhone ?? profile?.phone ?? null;
  const hasPhone   = !!phone;

  function onEmailSaved(newEmail: string) {
    setDisplayEmail(newEmail);
    setModal(null);
    qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
  }

  function onPhoneSaved(newPhone: string) {
    setDisplayPhone(newPhone);
    setModal(null);
    qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
  }

  return (
    <ProLayout>
      {modal === "email" && (
        <EmailEditModal
          currentEmail={email}
          onClose={() => setModal(null)}
          onSaved={onEmailSaved}
        />
      )}
      {modal === "phone" && (
        <PhoneEditModal
          currentPhone={phone}
          onClose={() => setModal(null)}
          onSaved={onPhoneSaved}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold" style={{ color: DARK }}>Profil Pro</h1>
        <p className="text-gray-500 mt-1">Gérez les informations de votre compte propriétaire.</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Phone missing banner */}
        {!isLoading && !hasPhone && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer"
            style={{ background: "#FFF5F5", borderColor: "#FECACA" }}
            onClick={() => setModal("phone")}
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-700">Numéro de téléphone manquant</p>
              <p className="text-xs text-red-500 mt-0.5">
                Un numéro de téléphone est obligatoire pour votre compte Pro. Cliquez ici pour en ajouter un.
              </p>
            </div>
          </div>
        )}

        {/* Identity */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-bold" style={{ color: DARK }}>Identité</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {isLoading || !user ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : (
              <>
                {/* Avatar + name (read-only) */}
                <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
                    style={{ background: YELLOW, color: DARK }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Compte Pro · bloq5</p>
                  </div>
                </div>

                {/* Editable: email */}
                <EditableRow
                  icon={Mail}
                  label="Adresse e-mail"
                  value={email}
                  onEdit={() => setModal("email")}
                />

                <div className="h-px bg-gray-100" />

                {/* Editable: phone */}
                <EditableRow
                  icon={Phone}
                  label="Téléphone"
                  value={phone ?? "Aucun numéro enregistré"}
                  required
                  missing={!hasPhone}
                  onEdit={() => setModal("phone")}
                />

                <div className="h-px bg-gray-100" />

                {/* Read-only: properties count */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                    <Building2 className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium">Propriétés actives</p>
                    <p className="text-sm font-semibold mt-0.5 text-gray-900">{profile?.totalProperties ?? 0}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pro status */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-bold" style={{ color: DARK }}>Statut du compte Pro</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "#FFF8EE" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: YELLOW }}>
                <Shield className="h-4 w-4" style={{ color: DARK }} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Compte Pro actif</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Vous avez accès à toutes les fonctionnalités propriétaire de bloq5.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </ProLayout>
  );
}
