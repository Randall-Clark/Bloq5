import { useState, useRef, useEffect } from "react";
import {
  X, ShieldCheck, MailOpen, ChevronRight, Loader2, CheckCircle,
  RotateCcw, LogIn, UserPlus, Eye, EyeOff, ArrowLeft,
} from "lucide-react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth-client";

const YELLOW = "#F5A623";
const NAVY   = "#1A237E";
const BG     = "#F7F6FF";

type Step =
  | "choose" | "signin" | "signup"
  | "email" | "otp"
  | "recovery" | "recovery-sent"
  | "terms" | "register" | "success";

const inputClass =
  "w-full border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F5A623] transition-colors bg-white";
const labelClass =
  "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";

const TERMS = [
  "Je certifie exercer une activité professionnelle de gestion ou de propriété immobilière.",
  "Je m'engage à respecter la réglementation en vigueur (RLRQ, Code civil du Québec, Loi sur la protection du consommateur).",
  "Les informations renseignées sont exactes et à jour.",
  "Je consens au traitement de mes données par bloq5 inc. conformément à la politique de confidentialité.",
];

export function ProAuthModal({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [step, setStep]         = useState<Step>("choose");
  const [initialized, setInit]  = useState(false);

  /* auth forms */
  const [signInEmail, setSignInEmail]       = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPwd, setShowSignInPwd]   = useState(false);
  const [signUpName, setSignUpName]         = useState("");
  const [signUpEmail, setSignUpEmail]       = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPwd, setShowSignUpPwd]   = useState(false);

  /* OTP */
  const [sentTo, setSentTo]               = useState("");
  const [code, setCode]                   = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeInputs  = useRef<(HTMLInputElement | null)[]>([]);

  /* recovery */
  const [recoveryEmail, setRecoveryEmail] = useState("");

  /* terms + register */
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", residentialAddress: "", proEmail: "" });

  /* shared */
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  /* ── Skip "choose" when already logged in ──────── */
  useEffect(() => {
    if (initialized || sessionPending) return;
    setInit(true);
    if (session?.user) setStep("email");
  }, [session, sessionPending, initialized]);

  /* ── Cooldown timer ────────────────────────────── */
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

  /* ── Send OTP (user must already be signed-in) ── */
  async function handleSendOtp() {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pro/auth/send-otp", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'envoi"); return; }
      setSentTo(data.sentTo ?? "votre adresse e-mail");
      setStep("otp"); setCode(""); startCooldown();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  /* ── Sign in then send OTP ─────────────────────── */
  async function handleSignIn() {
    if (!signInEmail.trim() || !signInPassword) {
      setError("Veuillez remplir tous les champs."); return;
    }
    setError(""); setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: signInEmail.trim(),
        password: signInPassword,
      });
      if (result.error) {
        setError("Adresse e-mail ou mot de passe incorrect.");
        return;
      }
      await handleSendOtp();
    } catch { setError("Erreur réseau. Réessayez."); }
    finally { setLoading(false); }
  }

  /* ── Sign up then send OTP ─────────────────────── */
  async function handleSignUp() {
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setError("Veuillez remplir tous les champs."); return;
    }
    if (signUpPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères."); return;
    }
    setError(""); setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: signUpEmail.trim(),
        password: signUpPassword,
        name: signUpName.trim(),
      });
      if (result.error) {
        const msg = (result.error as { message?: string }).message;
        setError(msg ?? "Erreur lors de l'inscription. Cet e-mail est peut-être déjà utilisé.");
        return;
      }
      await handleSendOtp();
    } catch { setError("Erreur réseau. Réessayez."); }
    finally { setLoading(false); }
  }

  /* ── Verify OTP ────────────────────────────────── */
  async function handleVerifyOtp() {
    if (code.length !== 6) { setError("Entrez les 6 caractères du code"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pro/auth/verify-otp", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Code invalide"); return; }
      if (data.hasProAccount) { setStep("success"); }
      else { setStep("terms"); }
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  /* ── Recovery ──────────────────────────────────── */
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

  /* ── Complete registration ─────────────────────── */
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
        body: JSON.stringify({ proEmail: pEmail, firstName, lastName, residentialAddress }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      setStep("success");
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }

  /* ── OTP box input ─────────────────────────────── */
  function handleCodeChange(val: string, idx: number) {
    const char = val.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase();
    const arr = code.split("").slice(0, 6);
    arr[idx] = char;
    const newCode = arr.join("").slice(0, 6);
    setCode(newCode);
    if (char && idx < 5) codeInputs.current[idx + 1]?.focus();
    if (!char && idx > 0) codeInputs.current[idx - 1]?.focus();
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase();
    setCode(text);
    codeInputs.current[Math.min(text.length, 5)]?.focus();
  }

  function goBack(target: Step) {
    setError("");
    setStep(target);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" style={{ background: BG }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-8">

          {/* ── CHOOSE ───────────────────────────────── */}
          {step === "choose" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: YELLOW + "22" }}>
                <ShieldCheck className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
                Vous êtes propriétaire<br />ou gestionnaire ?
              </h2>
              <p className="text-sm text-gray-500 mb-7">
                Connectez-vous à votre espace pro ou créez un compte pour gérer vos propriétés sur bloq5.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => goBack("signin")}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm transition-all hover:shadow-md border-2"
                  style={{ background: NAVY, color: "#fff", borderColor: NAVY }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <LogIn className="w-4 h-4 text-white" />
                    </div>
                    <span>Se connecter</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
                <button
                  onClick={() => goBack("signup")}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm transition-all hover:shadow-md border-2"
                  style={{ background: "#fff", color: "#1A1A1A", borderColor: "#E0E0E0" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: YELLOW + "22" }}>
                      <UserPlus className="w-4 h-4" style={{ color: YELLOW }} />
                    </div>
                    <span>Créer un compte</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-5">
                Déjà un accès pro actif ?{" "}
                <button className="font-semibold underline" style={{ color: NAVY }} onClick={() => goBack("recovery")}>
                  Récupérer mon accès
                </button>
              </p>
            </>
          )}

          {/* ── SIGN IN ──────────────────────────────── */}
          {step === "signin" && (
            <>
              <button onClick={() => goBack("choose")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour
              </button>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: NAVY + "15" }}>
                <LogIn className="w-6 h-6" style={{ color: NAVY }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Connexion Pro</h2>
              <p className="text-sm text-gray-500 mb-5">
                Entrez vos identifiants pour accéder à votre espace propriétaire.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Adresse e-mail</label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="jean@exemple.ca"
                    value={signInEmail}
                    onChange={e => { setSignInEmail(e.target.value); setError(""); }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={labelClass}>Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showSignInPwd ? "text" : "password"}
                      className={inputClass + " pr-11"}
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={e => { setSignInPassword(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSignIn()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSignInPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Connexion…" : "Se connecter →"}
              </button>
              <div className="flex items-center justify-between mt-4">
                <button
                  className="text-xs underline"
                  style={{ color: NAVY }}
                  onClick={() => {
                    authClient.requestPasswordReset({ email: signInEmail.trim(), redirectTo: window.location.origin + "/reset-password" });
                    goBack("recovery-sent");
                  }}
                >
                  Mot de passe oublié ?
                </button>
                <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => goBack("signup")}>
                  Pas encore de compte ?
                </button>
              </div>
            </>
          )}

          {/* ── SIGN UP ──────────────────────────────── */}
          {step === "signup" && (
            <>
              <button onClick={() => goBack("choose")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour
              </button>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: YELLOW + "22" }}>
                <UserPlus className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Créer un compte Pro</h2>
              <p className="text-sm text-gray-500 mb-5">
                Rejoignez bloq5 et commencez à gérer vos propriétés dès aujourd'hui.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nom complet</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Jean Tremblay"
                    value={signUpName}
                    onChange={e => { setSignUpName(e.target.value); setError(""); }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={labelClass}>Adresse e-mail</label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="jean@exemple.ca"
                    value={signUpEmail}
                    onChange={e => { setSignUpEmail(e.target.value); setError(""); }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showSignUpPwd ? "text" : "password"}
                      className={inputClass + " pr-11"}
                      placeholder="8 caractères minimum"
                      value={signUpPassword}
                      onChange={e => { setSignUpPassword(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSignUp()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSignUpPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Création…" : "Créer mon compte →"}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Déjà un compte ?{" "}
                <button className="font-semibold underline" style={{ color: NAVY }} onClick={() => goBack("signin")}>
                  Se connecter
                </button>
              </p>
            </>
          )}

          {/* ── SEND OTP (logged-in shortcut) ────────── */}
          {step === "email" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: YELLOW + "22" }}>
                <ShieldCheck className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Accès Espace Pro</h2>
              <p className="text-sm text-gray-500 mb-6">
                Un code de vérification à 6 caractères sera envoyé à votre adresse e-mail pour confirmer votre identité.
              </p>
              {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Envoi en cours…" : "Recevoir mon code par e-mail →"}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Problème d'accès ?{" "}
                <button className="font-semibold underline" style={{ color: NAVY }} onClick={() => goBack("recovery")}>
                  Récupérer mon compte
                </button>
              </p>
            </>
          )}

          {/* ── OTP ──────────────────────────────────── */}
          {step === "otp" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: NAVY + "15" }}>
                <ShieldCheck className="w-6 h-6" style={{ color: NAVY }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Code de vérification</h2>
              <p className="text-sm text-gray-500 mb-6">
                Un code à 6 caractères a été envoyé à{" "}
                <span className="font-semibold text-gray-700">{sentTo}</span>.
              </p>
              <div className="flex gap-2 justify-center mb-4" onPaste={handleCodePaste}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={el => { codeInputs.current[i] = el; }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={code[i] ?? ""}
                    onChange={e => handleCodeChange(e.target.value, i)}
                    onKeyDown={e => {
                      if (e.key === "Backspace" && !code[i] && i > 0) codeInputs.current[i - 1]?.focus();
                    }}
                    className="w-11 h-14 text-center text-xl font-bold border rounded-xl focus:outline-none transition-colors uppercase"
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
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Vérification…" : "Vérifier le code →"}
              </button>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-xs flex items-center gap-1 disabled:opacity-40"
                  style={{ color: NAVY }}
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
                </button>
                <button className="text-xs text-gray-400 underline" onClick={() => goBack("recovery")}>
                  Problème de réception ?
                </button>
              </div>
            </>
          )}

          {/* ── RECOVERY ─────────────────────────────── */}
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
                <input
                  type="email"
                  className={inputClass}
                  placeholder="pro@exemple.ca"
                  value={recoveryEmail}
                  onChange={e => { setRecoveryEmail(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleRecovery()}
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              <button
                onClick={handleRecovery}
                disabled={loading || !recoveryEmail.trim()}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: NAVY, color: "#fff" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Envoi…" : "Envoyer les instructions"}
              </button>
              <button
                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => goBack("choose")}
              >
                ← Retour
              </button>
            </>
          )}

          {/* ── RECOVERY SENT ────────────────────────── */}
          {step === "recovery-sent" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#E8F5E9" }}>
                <CheckCircle className="w-8 h-8" style={{ color: "#2E7D32" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Instructions envoyées</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Si un compte correspond à cette adresse e-mail, vous recevrez un message avec les étapes de récupération.
              </p>
              <button
                onClick={onClose}
                className="mx-auto px-8 py-3 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                Fermer
              </button>
            </div>
          )}

          {/* ── TERMS ────────────────────────────────── */}
          {step === "terms" && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: NAVY + "15" }}>
                <ShieldCheck className="w-6 h-6" style={{ color: NAVY }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Conditions d'utilisation Pro</h2>
              <p className="text-sm text-gray-500 mb-5">
                Veuillez lire et accepter les conditions avant de créer votre profil pro.
              </p>
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
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-yellow-400"
                />
                <span className="text-sm text-gray-700">J'ai lu et j'accepte l'ensemble des conditions ci-dessus.</span>
              </label>
              <button
                onClick={() => setStep("register")}
                disabled={!termsAccepted}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                Créer mon profil Pro <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* ── REGISTER ─────────────────────────────── */}
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
                  <label className={labelClass}>Adresse de résidence *</label>
                  <input className={inputClass} placeholder="123 rue Sainte-Catherine, Montréal, QC" value={form.residentialAddress}
                    onChange={e => setForm(f => ({ ...f, residentialAddress: e.target.value }))} />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Création…" : "Créer mon compte Pro →"}
              </button>
            </>
          )}

          {/* ── SUCCESS ──────────────────────────────── */}
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
                style={{ background: NAVY, color: "#fff" }}
              >
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
