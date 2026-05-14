import {
  useGetProfile,
  useUpdateProfile,
  getGetProfileQueryKey,
  useListRentalRequests,
  useListFavorites,
  useListVisits,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import UserLayout from "@/components/layout/user-layout";
import {
  User, MessageSquare, Heart, Calendar, Loader2,
  LayoutDashboard, Mail, CheckCircle2, ArrowLeft, X, Lock, Eye, EyeOff,
} from "lucide-react";
import { Link } from "wouter";
import { authClient } from "@/lib/auth-client";

const YELLOW = "#F5A623";
const NAVY   = "#1A237E";

const profileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName:  z.string().min(1, "Le nom est requis"),
  phone:     z.string().optional().nullable(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

type EmailChangeStep = "idle" | "input" | "verify" | "success";
type PwdStep = "idle" | "send" | "verify" | "new-pwd" | "success";

/* ── ProButton ────────────────────────────────────────── */
function ProButton({ role }: { role: string }) {
  const isPro = role === "owner" || role === "manager";
  if (!isPro) return null;
  return (
    <Link href="/pro/dashboard">
      <span
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
        style={{ background: NAVY, color: "#fff" }}
      >
        <LayoutDashboard className="w-4 h-4" />
        Dashboard Pro
      </span>
    </Link>
  );
}

/* ── EmailChangePanel ─────────────────────────────────── */
function EmailChangePanel({
  currentEmail,
  onSuccess,
}: {
  currentEmail: string;
  onSuccess: (newEmail: string) => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<EmailChangeStep>("idle");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setStep("idle");
    setNewEmail("");
    setOtp("");
    setError("");
  }

  async function requestChange() {
    setError("");
    if (!newEmail.trim()) { setError("Veuillez saisir une adresse e-mail."); return; }
    if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setError("Cette adresse e-mail est identique à votre adresse actuelle.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/profile/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'envoi."); return; }
      setStep("verify");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  async function confirmChange() {
    setError("");
    if (otp.trim().length !== 6) { setError("Le code doit contenir 6 chiffres."); return; }
    setPending(true);
    try {
      const res = await fetch("/api/profile/confirm-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail: newEmail.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Code incorrect."); return; }
      setStep("success");
      onSuccess(newEmail.trim().toLowerCase());
      toast({ title: "Adresse e-mail mise à jour avec succès !" });
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  if (step === "idle") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
        <div className="flex items-center gap-3">
          <input
            value={currentEmail}
            disabled
            className="flex-1 bg-gray-100 border border-gray-200 rounded-lg h-11 px-3.5 text-sm text-gray-500 cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setStep("input")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap"
          >
            <Mail className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
        <div className="flex items-center gap-2 h-11 px-3.5 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-sm text-green-700 font-medium">{newEmail.trim().toLowerCase()} — modifié avec succès</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Reconnectez-vous pour voir la mise à jour dans votre session.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#F5A623]/40 bg-amber-50/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#FFF8EE" }}>
            <Mail className="w-4 h-4" style={{ color: YELLOW }} />
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {step === "input" ? "Nouvelle adresse e-mail" : "Vérification en 2 étapes"}
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {step === "input" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Saisissez votre nouvelle adresse. Un code de vérification à 6 chiffres vous sera envoyé pour confirmer la modification.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nouvelle adresse e-mail</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && requestChange()}
              placeholder="nouveau@exemple.com"
              autoFocus
              className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-10 px-3.5 text-sm transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={requestChange}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: NAVY }}
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {pending ? "Envoi..." : "Envoyer le code"}
            </button>
            <button type="button" onClick={reset} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Un code à 6 chiffres a été envoyé à{" "}
            <span className="font-semibold text-gray-700">{newEmail.trim()}</span>. Le code expire dans 10 minutes.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Code de vérification</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && confirmChange()}
              placeholder="000000"
              autoFocus
              className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-11 px-3.5 text-2xl font-mono tracking-[0.5em] text-center transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmChange}
              disabled={pending || otp.length !== 6}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: YELLOW, color: "#1A1A1A" }}
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {pending ? "Vérification..." : "Confirmer la modification"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("input"); setOtp(""); setError(""); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setOtp(""); setError(""); requestChange(); }}
            disabled={pending}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            Renvoyer un nouveau code
          </button>
        </div>
      )}
    </div>
  );
}

/* ── PasswordChangePanel ──────────────────────────────── */
function PasswordChangePanel({ hasCredential }: { hasCredential: boolean }) {
  const { toast } = useToast();
  const [step, setStep] = useState<PwdStep>("idle");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setStep("idle");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setShowPwd(false);
    setShowConfirm(false);
  }

  async function sendOtp() {
    setPending(true); setError("");
    try {
      const res = await fetch("/api/profile/request-password-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'envoi."); return; }
      setStep("verify");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally { setPending(false); }
  }

  async function setPassword() {
    if (newPassword.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (newPassword !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    setPending(true); setError("");
    try {
      const res = await fetch("/api/profile/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword, otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setStep("success");
      toast({ title: "Mot de passe mis à jour avec succès !" });
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally { setPending(false); }
  }

  if (step === "idle") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 border border-gray-200 rounded-lg h-11 px-3.5 flex items-center">
            <span className="text-sm text-gray-400 tracking-widest">
              {hasCredential ? "••••••••••••" : "Non défini"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStep("send")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap"
          >
            <Lock className="w-4 h-4" />
            {hasCredential ? "Modifier" : "Définir"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
        <div className="flex items-center gap-2 h-11 px-3.5 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-sm text-green-700 font-medium">Mot de passe mis à jour avec succès</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#F5A623]/40 bg-amber-50/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#FFF8EE" }}>
            <Lock className="w-4 h-4" style={{ color: YELLOW }} />
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {step === "send" && (hasCredential ? "Modifier le mot de passe" : "Définir un mot de passe")}
            {step === "verify" && "Vérification en 2 étapes"}
            {step === "new-pwd" && "Nouveau mot de passe"}
          </span>
        </div>
        <button type="button" onClick={reset} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step: send OTP */}
      {step === "send" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Pour sécuriser cette modification, un code de vérification à 6 chiffres sera envoyé à votre adresse e-mail.
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={sendOtp}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: NAVY }}
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {pending ? "Envoi..." : "Envoyer le code de vérification"}
            </button>
            <button type="button" onClick={reset} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Step: enter OTP */}
      {step === "verify" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Un code à 6 chiffres a été envoyé à votre adresse e-mail. Le code expire dans 10 minutes.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Code de vérification</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otp.length === 6) setStep("new-pwd");
              }}
              placeholder="000000"
              autoFocus
              className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-11 px-3.5 text-2xl font-mono tracking-[0.5em] text-center transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { if (otp.length === 6) setStep("new-pwd"); else setError("Le code doit contenir 6 chiffres."); }}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: YELLOW, color: "#1A1A1A" }}
            >
              Continuer
            </button>
            <button
              type="button"
              onClick={() => { setStep("send"); setOtp(""); setError(""); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setOtp(""); setError(""); sendOtp(); }}
            disabled={pending}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            Renvoyer un nouveau code
          </button>
        </div>
      )}

      {/* Step: new password */}
      {step === "new-pwd" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Choisissez un nouveau mot de passe d'au moins 8 caractères.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-10 px-3.5 pr-10 text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setPassword()}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-10 px-3.5 pr-10 text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={setPassword}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: YELLOW, color: "#1A1A1A" }}
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {pending ? "Enregistrement..." : "Enregistrer le mot de passe"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("verify"); setError(""); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ProfilePage ──────────────────────────────────────── */
export default function ProfilePage() {
  const { toast }      = useToast();
  const queryClient    = useQueryClient();
  const { data: session } = authClient.useSession();
  const [displayEmail, setDisplayEmail] = useState<string | null>(null);
  const [hasCredential, setHasCredential] = useState<boolean>(false);

  const { data: profile,       isLoading: pL } = useGetProfile();
  const { data: requestsData,  isLoading: rL } = useListRentalRequests();
  const { data: favoritesData, isLoading: fL } = useListFavorites();
  const { data: visitsData,    isLoading: vL } = useListVisits();
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    fetch("/api/auth/has-credential", { credentials: "include" })
      .then(r => r.json())
      .then(d => setHasCredential(d.hasCredential ?? false))
      .catch(() => setHasCredential(false));
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName || "",
      lastName:  profile?.lastName  || "",
      phone:     profile?.phone     || "",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfile.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Profil mis à jour avec succès" });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
      onError: () => {
        toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
      },
    });
  }

  if (pL || rL || fL || vL) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: YELLOW }} />
        </div>
      </UserLayout>
    );
  }

  const cnt = (d: unknown) =>
    Array.isArray(d) ? d.length : ((d as any)?.data?.length ?? 0);
  const requestsCount  = cnt(requestsData);
  const favoritesCount = cnt(favoritesData);
  const visitsCount    = cnt(visitsData);
  const hasStats       = requestsCount > 0 || favoritesCount > 0 || visitsCount > 0;

  const displayName = profile?.firstName || session?.user?.name?.split(" ")[0] || null;
  const role = profile?.role ?? "tenant";
  const currentEmail = displayEmail ?? profile?.email ?? session?.user?.email ?? "";

  const stats = [
    { label: "Demandes actives", value: requestsCount,  icon: MessageSquare, href: "/profile/requests"  },
    { label: "Favoris",          value: favoritesCount, icon: Heart,         href: "/profile/favorites" },
    { label: "Visites prévues",  value: visitsCount,    icon: Calendar,      href: "/profile/visits"    },
  ];

  return (
    <UserLayout>
      {/* Header row: greeting + Pro button */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
            {displayName ? `Bonjour, ${displayName} 👋` : "Bienvenue sur bloq5"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre profil et suivez vos activités.</p>
        </div>
        {profile && <ProButton role={role} />}
      </div>

      {/* Stats cards */}
      {hasStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.href} href={stat.href}>
              <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-[#F5A623] transition-colors cursor-pointer">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold" style={{ color: NAVY }}>{stat.value}</p>
                </div>
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#FFF8EE" }}>
                  <stat.icon className="w-5 h-5" style={{ color: YELLOW }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Profile form card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FFF8EE" }}>
            <User className="w-5 h-5" style={{ color: YELLOW }} />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Informations personnelles</h2>
            <p className="text-xs text-gray-400">Complétez vos coordonnées pour faciliter vos demandes.</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-5 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
              <input
                {...form.register("firstName")}
                placeholder="Jean"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-11 px-3.5 text-sm transition-colors"
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input
                {...form.register("lastName")}
                placeholder="Dupont"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-11 px-3.5 text-sm transition-colors"
              />
              {form.formState.errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <input
              {...form.register("phone")}
              placeholder="+1 514 000 0000"
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-11 px-3.5 text-sm transition-colors"
            />
          </div>

          <EmailChangePanel
            currentEmail={currentEmail}
            onSuccess={(email) => setDisplayEmail(email)}
          />

          <PasswordChangePanel hasCredential={hasCredential} />

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {updateProfile.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </UserLayout>
  );
}
