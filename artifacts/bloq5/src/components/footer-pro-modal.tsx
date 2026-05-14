import { useState, useRef } from "react";
import {
  X, ShieldCheck, MailOpen, ChevronRight, Loader2, CheckCircle,
  RotateCcw, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Building2,
} from "lucide-react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth-client";

const YELLOW = "#F5A623";
const NAVY   = "#1A237E";
const BG     = "#F7F6FF";

type Step = "choose" | "signin" | "signup" | "otp" | "terms" | "register" | "success";

const inputClass =
  "w-full border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F5A623] transition-colors bg-white";
const labelClass =
  "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";

const TERMS = [
  "Je certifie exercer une activité professionnelle de gestion ou de propriété immobilière.",
  "Je m'engage à respecter la réglementation en vigueur (RLRQ, Code civil du Québec, Loi sur la protection du consommateur).",
  "Les informations renseignées sont exactes et à jour.",
  "Je consens au traitement de mes données par BLOQ5 inc. conformément à la politique de confidentialité.",
];

export function FooterProModal({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("choose");

  const [signInEmail, setSignInEmail]       = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPwd, setShowSignInPwd]   = useState(false);
  const [signUpName, setSignUpName]         = useState("");
  const [signUpEmail, setSignUpEmail]       = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPwd, setShowSignUpPwd]   = useState(false);

  const [sentTo, setSentTo]                 = useState("");
  const [code, setCode]                     = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

  const [termsChecked, setTermsChecked] = useState<boolean[]>(TERMS.map(() => false));
  const allTermsChecked = termsChecked.every(Boolean);
  const [form, setForm] = useState({ firstName: "", lastName: "", residentialAddress: "", proEmail: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function goTo(target: Step) { setError(""); setStep(target); }

  function startCooldown() {
    setResendCooldown(60);
    const iv = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(iv); return 0; } return prev - 1; });
    }, 1000);
  }

  async function sendOtp() {
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/pro/auth/send-otp", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'envoi"); return; }
      setSentTo(data.sentTo ?? "votre adresse e-mail");
      setCode(""); goTo("otp"); startCooldown();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  async function handleSignIn() {
    if (!signInEmail.trim() || !signInPassword) { setError("Veuillez remplir tous les champs."); return; }
    setError(""); setLoading(true);
    try {
      const result = await authClient.signIn.email({ email: signInEmail.trim(), password: signInPassword });
      if (result.error) { setError("Adresse e-mail ou mot de passe incorrect."); return; }
      await sendOtp();
    } catch { setError("Erreur réseau. Réessayez."); }
    finally { setLoading(false); }
  }

  async function handleSignUp() {
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) { setError("Veuillez remplir tous les champs."); return; }
    if (signUpPassword.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setError(""); setLoading(true);
    try {
      const result = await authClient.signUp.email({ email: signUpEmail.trim(), password: signUpPassword, name: signUpName.trim() });
      if (result.error) {
        setError((result.error as { message?: string }).message ?? "Erreur lors de l'inscription. Cet e-mail est peut-être déjà utilisé.");
        return;
      }
      goTo("terms");
    } catch { setError("Erreur réseau. Réessayez."); }
    finally { setLoading(false); }
  }

  async function handleVerifyOtp() {
    if (code.length !== 6) { setError("Entrez les 6 caractères du code"); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/pro/auth/verify-otp", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Code invalide"); return; }
      goTo(data.hasProAccount ? "success" : "terms");
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  async function handleComplete() {
    const { firstName, lastName, residentialAddress, proEmail: pEmail } = form;
    if (!firstName || !lastName || !residentialAddress || !pEmail) { setError("Tous les champs sont obligatoires"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pro/auth/complete", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ proEmail: pEmail, firstName, lastName, residentialAddress }) });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      goTo("success");
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  function handleCodeChange(val: string, idx: number) {
    const char = val.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase();
    const arr  = code.split("").slice(0, 6);
    arr[idx]   = char;
    setCode(arr.join("").slice(0, 6));
    if (char && idx < 5) codeInputs.current[idx + 1]?.focus();
    if (!char && idx > 0) codeInputs.current[idx - 1]?.focus();
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase();
    setCode(text);
    codeInputs.current[Math.min(text.length, 5)]?.focus();
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" style={{ background: BG }}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-8">

          {/* ── CHOOSE ── */}
          {step === "choose" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: YELLOW + "22" }}>
                <ShieldCheck className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Espace Pro BLOQ5</h2>
              <p className="text-sm text-gray-500 mb-7">
                Gérez vos biens, vos locataires et vos revenus depuis votre espace propriétaire.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => goTo("signup")}
                  className="flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all hover:shadow-md"
                  style={{ background: "#fff", borderColor: "#E0E0E0" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: YELLOW + "22" }}>
                    <UserPlus className="w-5 h-5" style={{ color: YELLOW }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-left" style={{ color: "#1A1A1A" }}>Devenir un Pro</p>
                    <p className="text-xs text-gray-400 mt-0.5 text-left">Créer mon espace propriétaire</p>
                  </div>
                </button>
                <button
                  onClick={() => goTo("signin")}
                  className="flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all hover:shadow-md"
                  style={{ background: NAVY, borderColor: NAVY }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <LogIn className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white text-left">Se connecter</p>
                    <p className="text-xs text-white/60 mt-0.5 text-left">Accéder à mon espace pro</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* ── SIGNUP → skip OTP → terms ── */}
          {step === "signup" && (
            <>
              <button onClick={() => goTo("choose")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour
              </button>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: YELLOW + "22" }}>
                <UserPlus className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Créer un compte Pro</h2>
              <p className="text-sm text-gray-500 mb-5">Rejoignez BLOQ5 et commencez à gérer vos propriétés dès aujourd'hui.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nom complet</label>
                  <input type="text" className={inputClass} placeholder="Jean Tremblay" value={signUpName}
                    onChange={e => { setSignUpName(e.target.value); setError(""); }} autoFocus />
                </div>
                <div>
                  <label className={labelClass}>Adresse e-mail</label>
                  <input type="email" className={inputClass} placeholder="jean@exemple.ca" value={signUpEmail}
                    onChange={e => { setSignUpEmail(e.target.value); setError(""); }} />
                </div>
                <div>
                  <label className={labelClass}>Mot de passe</label>
                  <div className="relative">
                    <input type={showSignUpPwd ? "text" : "password"} className={inputClass + " pr-11"}
                      placeholder="8 caractères minimum" value={signUpPassword}
                      onChange={e => { setSignUpPassword(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSignUp()} />
                    <button type="button" onClick={() => setShowSignUpPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSignUpPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
              <button onClick={handleSignUp} disabled={loading}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Création…" : "Créer mon compte →"}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Déjà un compte ?{" "}
                <button className="font-semibold underline" style={{ color: NAVY }} onClick={() => goTo("signin")}>Se connecter</button>
              </p>
            </>
          )}

          {/* ── SIGNIN → send OTP ── */}
          {step === "signin" && (
            <>
              <button onClick={() => goTo("choose")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour
              </button>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: NAVY + "15" }}>
                <LogIn className="w-6 h-6" style={{ color: NAVY }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Connexion Pro</h2>
              <p className="text-sm text-gray-500 mb-5">Entrez vos identifiants — un code de vérification vous sera envoyé par e-mail.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Adresse e-mail</label>
                  <input type="email" className={inputClass} placeholder="jean@exemple.ca" value={signInEmail}
                    onChange={e => { setSignInEmail(e.target.value); setError(""); }} autoFocus />
                </div>
                <div>
                  <label className={labelClass}>Mot de passe</label>
                  <div className="relative">
                    <input type={showSignInPwd ? "text" : "password"} className={inputClass + " pr-11"}
                      placeholder="••••••••" value={signInPassword}
                      onChange={e => { setSignInPassword(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSignIn()} />
                    <button type="button" onClick={() => setShowSignInPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSignInPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
              <button onClick={handleSignIn} disabled={loading}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Connexion…" : "Recevoir mon code par e-mail →"}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Pas encore de compte ?{" "}
                <button className="font-semibold underline" style={{ color: NAVY }} onClick={() => goTo("signup")}>Créer un compte</button>
              </p>
            </>
          )}

          {/* ── OTP (connexion only) ── */}
          {step === "otp" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: NAVY + "15" }}>
                <MailOpen className="w-6 h-6" style={{ color: NAVY }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Code de vérification</h2>
              <p className="text-sm text-gray-500 mb-6">
                Un code à 6 caractères a été envoyé à <span className="font-semibold text-gray-700">{sentTo}</span>.
              </p>
              <div className="flex gap-2 justify-center mb-4" onPaste={handleCodePaste}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input key={i} ref={el => { codeInputs.current[i] = el; }}
                    type="text" inputMode="text" maxLength={1} value={code[i] ?? ""}
                    onChange={e => handleCodeChange(e.target.value, i)}
                    onKeyDown={e => { if (e.key === "Backspace" && !code[i] && i > 0) codeInputs.current[i - 1]?.focus(); }}
                    className="w-11 h-14 text-center text-xl font-bold border rounded-xl focus:outline-none transition-colors uppercase"
                    style={{ borderColor: code[i] ? YELLOW : "#E0E0E0", background: code[i] ? YELLOW + "10" : "#fff" }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
              <button onClick={handleVerifyOtp} disabled={loading || code.length !== 6}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Vérification…" : "Valider →"}
              </button>
              <div className="flex justify-center mt-4">
                <button disabled={resendCooldown > 0} onClick={sendOtp}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : "Renvoyer le code"}
                </button>
              </div>
            </>
          )}

          {/* ── TERMS ── */}
          {step === "terms" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: YELLOW + "22" }}>
                <ShieldCheck className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Conditions d'accès Pro</h2>
              <p className="text-sm text-gray-500 mb-5">Veuillez lire et accepter les conditions suivantes pour activer votre accès propriétaire.</p>
              <div className="space-y-3 mb-6">
                {TERMS.map((t, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-[#F5A623] shrink-0"
                      checked={termsChecked[i]}
                      onChange={() => setTermsChecked(prev => prev.map((v, j) => j === i ? !v : v))}
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">{t}</span>
                  </label>
                ))}
              </div>
              {error && <p className="text-red-500 text-xs mb-2 text-center">{error}</p>}
              <button
                onClick={() => { if (allTermsChecked) goTo("register"); else setError("Veuillez accepter toutes les conditions."); }}
                disabled={!allTermsChecked}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                Continuer →
              </button>
            </>
          )}

          {/* ── REGISTER ── */}
          {step === "register" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: YELLOW + "22" }}>
                <Building2 className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Informations professionnelles</h2>
              <p className="text-sm text-gray-500 mb-5">Ces informations seront associées à votre compte Pro.</p>
              <div className="space-y-4">
                {([
                  { key: "firstName",          label: "Prénom",               placeholder: "Jean",                              type: "text" },
                  { key: "lastName",           label: "Nom",                  placeholder: "Tremblay",                          type: "text" },
                  { key: "residentialAddress", label: "Adresse résidentielle", placeholder: "123 rue Principale, Montréal",      type: "text" },
                  { key: "proEmail",           label: "E-mail professionnel", placeholder: "jean@monentreprise.ca",              type: "email" },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input type={f.type} className={inputClass} placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
              <button onClick={handleComplete} disabled={loading}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Enregistrement…" : "Activer mon accès Pro →"}
              </button>
            </>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#F0FDF4" }}>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Accès Pro activé !</h2>
              <p className="text-sm text-gray-500 mb-6">Votre espace propriétaire est prêt. Commencez à gérer vos biens dès maintenant.</p>
              <button
                onClick={() => { onClose(); navigate("/pro/dashboard"); }}
                className="px-8 py-3 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                Accéder à mon dashboard →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
