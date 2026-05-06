import { useState, useRef } from "react";
import { X, Phone, ShieldCheck, MailOpen, ChevronRight, Loader2, CheckCircle, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";

const YELLOW = "#F5A623";
const NAVY = "#1A237E";
const BG = "#F7F6FF";

type Step = "phone" | "otp" | "recovery" | "recovery-sent" | "terms" | "register" | "success";

const inputClass = "w-full border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F5A623] transition-colors bg-white";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";

const TERMS = [
  "Je certifie exercer une activité professionnelle de gestion ou de propriété immobilière.",
  "Je m'engage à respecter la réglementation en vigueur (RLRQ, Code civil du Québec, Loi sur la protection du consommateur).",
  "Les informations renseignées sont exactes et à jour.",
  "Je consens au traitement de mes données par bloq5 inc. conformément à la politique de confidentialité.",
];

export function ProAuthModal({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [proEmail, setProEmail] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", residentialAddress: "", proEmail: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

  function startCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    cooldownRef.current = interval;
  }

  async function handleSendOtp(phoneOverride?: string) {
    const p = phoneOverride ?? phone;
    if (!p.trim()) { setError("Veuillez entrer votre numéro de téléphone"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pro/auth/send-otp", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      setStep("otp"); setCode(""); startCooldown();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  async function handleVerifyOtp() {
    if (code.length !== 6) { setError("Entrez les 6 chiffres du code"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pro/auth/verify-otp", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Code invalide"); return; }
      if (data.hasProAccount) {
        setStep("success");
      } else {
        setStep("terms");
      }
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  async function handleRecovery() {
    if (!recoveryEmail.trim()) { setError("Veuillez entrer votre adresse e-mail"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pro/auth/recover", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proEmail: recoveryEmail }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      setStep("recovery-sent");
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  async function handleComplete() {
    const { firstName, lastName, residentialAddress, proEmail: pEmail } = form;
    if (!firstName || !lastName || !residentialAddress || !pEmail) {
      setError("Tous les champs sont obligatoires"); return;
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pro/auth/complete", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, proEmail: pEmail, firstName, lastName, residentialAddress }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      setStep("success");
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  function handleCodeChange(val: string, idx: number) {
    const digits = val.replace(/\D/g, "").slice(0, 1);
    const arr = code.split("").slice(0, 6);
    arr[idx] = digits;
    const newCode = arr.join("").slice(0, 6);
    setCode(newCode);
    if (digits && idx < 5) codeInputs.current[idx + 1]?.focus();
    if (!digits && idx > 0) codeInputs.current[idx - 1]?.focus();
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setCode(text);
    codeInputs.current[Math.min(text.length, 5)]?.focus();
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" style={{ background: BG }}>
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-8">
          {/* ── PHONE ─────────────────────────────── */}
          {step === "phone" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: YELLOW + "22" }}>
                <Phone className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Accès Espace Pro</h2>
              <p className="text-sm text-gray-500 mb-6">Entrez votre numéro de téléphone professionnel. Vous recevrez un code de confirmation par SMS.</p>
              <div>
                <label className={labelClass}>Numéro de téléphone *</label>
                <div className="flex items-center border border-[#E0E0E0] rounded-xl overflow-hidden focus-within:border-[#F5A623] bg-white">
                  <span className="px-4 py-3.5 text-sm text-gray-600 border-r border-[#E0E0E0] bg-gray-50 flex-shrink-0 font-medium">🇨🇦 +1</span>
                  <input
                    className="flex-1 px-3 py-3.5 text-sm focus:outline-none"
                    placeholder="514 000 0000"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              <button
                onClick={() => handleSendOtp()}
                disabled={loading || !phone.trim()}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Envoi en cours…" : "Recevoir le code SMS →"}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Vous n'avez plus accès à ce numéro ?{" "}
                <button className="font-semibold underline" style={{ color: NAVY }} onClick={() => { setStep("recovery"); setError(""); }}>
                  Récupérer mon compte
                </button>
              </p>
            </>
          )}

          {/* ── OTP ──────────────────────────────── */}
          {step === "otp" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: NAVY + "15" }}>
                <ShieldCheck className="w-6 h-6" style={{ color: NAVY }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Code de vérification</h2>
              <p className="text-sm text-gray-500 mb-6">
                Un code à 6 chiffres a été envoyé au <span className="font-semibold text-gray-700">{phone}</span>.{" "}
                <button className="underline text-gray-400 text-xs" onClick={() => { setStep("phone"); setError(""); }}>Changer</button>
              </p>
              <div className="flex gap-2 justify-center mb-4" onPaste={handleCodePaste}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={el => { codeInputs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1}
                    value={code[i] ?? ""}
                    onChange={e => handleCodeChange(e.target.value, i)}
                    onKeyDown={e => {
                      if (e.key === "Backspace" && !code[i] && i > 0) codeInputs.current[i - 1]?.focus();
                    }}
                    className="w-11 h-14 text-center text-xl font-bold border rounded-xl focus:outline-none transition-colors"
                    style={{ borderColor: code[i] ? YELLOW : "#E0E0E0", background: code[i] ? YELLOW + "10" : "#fff" }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
              <button
                onClick={handleVerifyOtp}
                disabled={loading || code.length !== 6}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Vérification…" : "Vérifier le code →"}
              </button>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => handleSendOtp()}
                  disabled={resendCooldown > 0 || loading}
                  className="text-xs flex items-center gap-1 disabled:opacity-40"
                  style={{ color: NAVY }}>
                  <RotateCcw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
                </button>
                <button className="text-xs text-gray-400 underline" onClick={() => { setStep("recovery"); setError(""); }}>
                  Numéro oublié / changé ?
                </button>
              </div>
            </>
          )}

          {/* ── RECOVERY ─────────────────────────── */}
          {step === "recovery" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "#FFF3E0" }}>
                <MailOpen className="w-6 h-6" style={{ color: "#F57C00" }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Récupérer mon accès</h2>
              <p className="text-sm text-gray-500 mb-6">
                Entrez l'adresse e-mail liée à votre compte pro. Nous vous enverrons les instructions de récupération.
              </p>
              <div>
                <label className={labelClass}>Adresse e-mail pro *</label>
                <input type="email" className={inputClass} placeholder="pro@exemple.ca"
                  value={recoveryEmail} onChange={e => { setRecoveryEmail(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleRecovery()} autoFocus />
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              <button onClick={handleRecovery} disabled={loading || !recoveryEmail.trim()}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: NAVY, color: "#fff" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Envoi…" : "Envoyer les instructions"}
              </button>
              <button className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => { setStep("phone"); setError(""); }}>
                ← Retour
              </button>
            </>
          )}

          {/* ── RECOVERY SENT ────────────────────── */}
          {step === "recovery-sent" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#E8F5E9" }}>
                <CheckCircle className="w-8 h-8" style={{ color: "#2E7D32" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Instructions envoyées</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Si un compte pro correspond à cette adresse e-mail, vous recevrez un message avec les étapes de récupération.
              </p>
              <button onClick={onClose}
                className="mx-auto px-8 py-3 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                Fermer
              </button>
            </div>
          )}

          {/* ── TERMS ────────────────────────────── */}
          {step === "terms" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: NAVY + "15" }}>
                <ShieldCheck className="w-6 h-6" style={{ color: NAVY }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Conditions d'utilisation Pro</h2>
              <p className="text-sm text-gray-500 mb-5">Veuillez lire et accepter les conditions avant de créer votre profil pro.</p>
              <div className="rounded-2xl p-4 mb-5 space-y-3" style={{ background: "#fff", border: "1px solid #E8E8E8" }}>
                {TERMS.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: YELLOW + "22" }}>
                      <span className="text-[10px] font-bold" style={{ color: YELLOW }}>{i + 1}</span>
                    </div>
                    <p className="text-[13px] text-gray-700 leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-yellow-400" />
                <span className="text-sm text-gray-700">
                  J'ai lu et j'accepte l'ensemble des conditions ci-dessus.
                </span>
              </label>
              <button onClick={() => setStep("register")} disabled={!termsAccepted}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                Créer mon profil Pro <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* ── REGISTER ─────────────────────────── */}
          {step === "register" && (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Informations du profil Pro</h2>
              <p className="text-sm text-gray-500 mb-5">Ces informations seront utilisées pour votre compte professionnel.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Prénom *</label>
                    <input className={inputClass} placeholder="Jean" value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Nom *</label>
                    <input className={inputClass} placeholder="Tremblay" value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>E-mail professionnel *</label>
                  <input type="email" className={inputClass} placeholder="jean@agence.ca" value={form.proEmail}
                    onChange={e => setForm(f => ({ ...f, proEmail: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Numéro de téléphone</label>
                  <input className={inputClass} value={phone} disabled
                    style={{ background: "#F5F5F5", color: "#888" }} />
                </div>
                <div>
                  <label className={labelClass}>Adresse de résidence *</label>
                  <input className={inputClass} placeholder="123 rue Sainte-Catherine, Montréal, QC" value={form.residentialAddress}
                    onChange={e => setForm(f => ({ ...f, residentialAddress: e.target.value }))} />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
              <button onClick={handleComplete} disabled={loading}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Création…" : "Créer mon compte Pro →"}
              </button>
            </>
          )}

          {/* ── SUCCESS ──────────────────────────── */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: YELLOW + "22" }}>
                <CheckCircle className="w-8 h-8" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Compte Pro vérifié !</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Votre identité professionnelle a été confirmée. Accédez à votre espace de gestion.
              </p>
              <button
                onClick={() => { onClose(); navigate("/pro/dashboard"); }}
                className="mx-auto flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: NAVY, color: "#fff" }}>
                <ChevronRight className="w-4 h-4" />
                Accéder au Dashboard Pro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
