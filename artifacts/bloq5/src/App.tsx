import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LocationProvider, useLocation_ } from "@/context/location-context";
import { LocationPopup } from "@/components/location-popup";
import { CountryChangeBanner } from "@/components/country-change-banner";
import { isActiveCountry } from "@/data/countries";
import { authClient } from "@/lib/auth-client";

// Pages
import HomePage from "@/pages/home";
import PropertiesPage from "@/pages/properties";
import PropertyDetailPage from "@/pages/property-detail";
import PropertyDossierPage from "@/pages/property-dossier";
import ProfilePage from "@/pages/profile";
import ProfileRequestsPage from "@/pages/profile-requests";
import ProfileRequestDetailPage from "@/pages/profile-request-detail";
import ProfileFavoritesPage from "@/pages/profile-favorites";
import ProfileVisitsPage from "@/pages/profile-visits";
import ProPricingPage from "@/pages/pro-pricing";
import CitiesPage from "@/pages/cities";
import ComingSoonPage from "@/pages/coming-soon";
import ProDashboardPage from "@/pages/pro-dashboard";
import ProPropertiesPage from "@/pages/pro-properties";
import ProPropertyNewPage from "@/pages/pro-property-new";
import ProRequestsPage from "@/pages/pro-requests";
import ProRequestDetailPage from "@/pages/pro-request-detail";
import ProManagersPage from "@/pages/pro-managers";
import ProSubscriptionPage from "@/pages/pro-subscription";
import PropertyApplicationPage from "@/pages/property-application";
import ProPropertyEditPage from "@/pages/pro-property-edit";
import ProProfilePage from "@/pages/pro-profile";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/* Redirects returning users with a non-active saved country to /coming-soon */
function LocationGuard() {
  const { isReady, country } = useLocation_();
  const [location, navigate] = useLocation();
  useEffect(() => {
    const exempt = ["/coming-soon", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"];
    if (isReady && !isActiveCountry(country.code) && !exempt.some(p => location.startsWith(p))) {
      navigate("/coming-soon");
    }
  }, [isReady, country.code, location, navigate]);
  return null;
}

function AuthQueryInvalidator() {
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const prevRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const id = session?.user?.id ?? null;
    if (prevRef.current !== undefined && prevRef.current !== id) {
      qc.clear();
    }
    prevRef.current = id;
  }, [session?.user?.id, qc]);
  return null;
}

/* ── Auth Layout (split screen) ── */
function AuthLayout({ children, mode }: { children: React.ReactNode; mode: "signin" | "signup" | "forgot" | "reset" }) {
  const bgImage = `${import.meta.env.BASE_URL}images/hero-interior.png`;
  const titles: Record<typeof mode, string> = {
    signin: "Retrouvez vos propriétés et candidatures",
    signup: "Commencez à gérer vos locations dès aujourd'hui",
    forgot: "Récupérez l'accès à votre compte",
    reset:  "Choisissez un nouveau mot de passe",
  };
  return (
    <div className="flex min-h-[100dvh] bg-white">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />
        <div className="relative z-10">
          <a href={basePath || "/"} className="inline-block">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="bloq5" className="h-10 brightness-0 invert" />
          </a>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#F5A623]/20 border border-[#F5A623]/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] inline-block" />
            <span className="text-[#F5A623] text-sm font-semibold">Gestion immobilière simplifiée</span>
          </div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">{titles[mode]}</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            Recherche, candidatures et suivi de vos dossiers locatifs — tout en un seul endroit.
          </p>
        </div>
        <div className="relative z-10 flex gap-8">
          {[
            { num: "2 400+", label: "Propriétés actives" },
            { num: "98%", label: "Satisfaction locataires" },
            { num: "48h", label: "Délai de réponse moyen" },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="text-[#F5A623] text-2xl font-bold">{num}</div>
              <div className="text-white/60 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="lg:hidden mb-8">
          <a href={basePath || "/"}>
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="bloq5" className="h-9" />
          </a>
        </div>
        <div className="w-full max-w-[460px]">
          {children}
        </div>
        <p className="mt-8 text-xs text-gray-400 text-center max-w-xs">
          En continuant, vous acceptez les{" "}
          <a href="#" className="underline hover:text-gray-600">Conditions d'utilisation</a>{" "}
          et la{" "}
          <a href="#" className="underline hover:text-gray-600">Politique de confidentialité</a>{" "}
          de bloq5.
        </p>
      </div>
    </div>
  );
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

function SocialButtons() {
  async function handleSocial(provider: "google" | "github") {
    await authClient.signIn.social({ provider, callbackURL: `${basePath}/profile` });
  }
  return (
    <div className="flex flex-col gap-3 mb-6">
      <button type="button" onClick={() => handleSocial("google")}
        className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl h-12 text-[#1A1A1A] font-semibold hover:bg-gray-50 transition-colors text-sm">
        <GoogleIcon />
        Continuer avec Google
      </button>
      <button type="button" onClick={() => handleSocial("github")}
        className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl h-12 text-[#1A1A1A] font-semibold hover:bg-gray-50 transition-colors text-sm">
        <GithubIcon />
        Continuer avec GitHub
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-gray-400 text-sm">ou</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

/* ── Sign In Page ── */
function SignInPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await authClient.signIn.email({ email, password, callbackURL: "/profile" });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Identifiants incorrects");
    } else {
      navigate("/profile");
    }
  }

  return (
    <AuthLayout mode="signin">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Se connecter</h2>
        <p className="text-gray-500 text-sm mb-6">Bienvenue sur bloq5</p>
        <SocialButtons />
        <Divider />
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}
          <div>
            <label className="block font-medium text-[#1A1A1A] text-sm mb-1.5">Adresse e-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 text-base transition-colors" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-medium text-[#1A1A1A] text-sm">Mot de passe</label>
              <a href={`${basePath}/forgot-password`}
                className="text-xs text-[#F5A623] hover:text-[#e09520] font-medium">
                Mot de passe oublié ?
              </a>
            </div>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 text-base transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#F5A623] hover:bg-[#e09520] text-white font-bold rounded-xl h-12 text-base transition-colors disabled:opacity-60">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <a href={`${basePath}/sign-up`} className="text-[#F5A623] hover:text-[#e09520] font-semibold">Créer un compte</a>
        </p>
      </div>
    </AuthLayout>
  );
}

/* ── Sign Up Page ── */
function SignUpPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setLoading(true);
    const result = await authClient.signUp.email({ name, email, password, callbackURL: "/profile" });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Erreur lors de l'inscription");
    } else {
      navigate("/profile");
    }
  }

  return (
    <AuthLayout mode="signup">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Créer un compte</h2>
        <p className="text-gray-500 text-sm mb-6">Rejoignez bloq5</p>
        <SocialButtons />
        <Divider />
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}
          <div>
            <label className="block font-medium text-[#1A1A1A] text-sm mb-1.5">Nom complet</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Jean Dupont"
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 text-base transition-colors" />
          </div>
          <div>
            <label className="block font-medium text-[#1A1A1A] text-sm mb-1.5">Adresse e-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 text-base transition-colors" />
          </div>
          <div>
            <label className="block font-medium text-[#1A1A1A] text-sm mb-1.5">Mot de passe</label>
            <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 text-base transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#F5A623] hover:bg-[#e09520] text-white font-bold rounded-xl h-12 text-base transition-colors disabled:opacity-60">
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <a href={`${basePath}/sign-in`} className="text-[#F5A623] hover:text-[#e09520] font-semibold">Se connecter</a>
        </p>
      </div>
    </AuthLayout>
  );
}

/* ── Forgot Password Page ── */
function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}${basePath}/reset-password`,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Une erreur est survenue. Veuillez réessayer.");
    } else {
      setSent(true);
    }
  }

  return (
    <AuthLayout mode="forgot">
      <div>
        {sent ? (
          /* Success state */
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#FFF8EE" }}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Vérifiez votre boîte mail</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              Si un compte existe pour <strong className="text-gray-800">{email}</strong>, vous recevrez un lien de réinitialisation.
            </p>
            <p className="text-gray-400 text-xs mb-8">
              Vérifiez également votre dossier spam.
            </p>
            <a href={`${basePath}/sign-in`}
              className="inline-block w-full text-center bg-[#F5A623] hover:bg-[#e09520] text-white font-bold rounded-xl h-12 leading-[3rem] text-base transition-colors">
              Retour à la connexion
            </a>
            <button type="button" onClick={() => { setSent(false); setEmail(""); }}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Renvoyer le lien
            </button>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="mb-8">
              <a href={`${basePath}/sign-in`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
                Retour à la connexion
              </a>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Mot de passe oublié ?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Entrez l'adresse e-mail associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3 text-sm">{error}</div>
              )}
              <div>
                <label className="block font-medium text-[#1A1A1A] text-sm mb-1.5">Adresse e-mail</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 text-base transition-colors" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#F5A623] hover:bg-[#e09520] text-white font-bold rounded-xl h-12 text-base transition-colors disabled:opacity-60">
                {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

/* ── Reset Password Page ── */
function ResetPasswordPage() {
  const [, navigate]          = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);
  const [showPassword, setShowPassword]  = useState(false);
  const [showConfirm, setShowConfirm]    = useState(false);

  /* Extract token from URL query params */
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirm)  { setError("Les mots de passe ne correspondent pas."); return; }
    if (!token)                { setError("Lien invalide ou expiré. Demandez un nouveau lien."); return; }
    setLoading(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Ce lien est invalide ou a expiré.");
    } else {
      setDone(true);
    }
  }

  /* Password strength indicator */
  function strength(p: string): { score: number; label: string; color: string } {
    if (p.length === 0) return { score: 0, label: "", color: "" };
    let s = 0;
    if (p.length >= 8)  s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { score: s, label: "Très faible", color: "#EF4444" };
    if (s === 2) return { score: s, label: "Faible", color: "#F97316" };
    if (s === 3) return { score: s, label: "Moyen", color: "#EAB308" };
    if (s === 4) return { score: s, label: "Fort", color: "#22C55E" };
    return { score: s, label: "Très fort", color: "#16A34A" };
  }
  const str = strength(password);

  if (done) {
    return (
      <AuthLayout mode="reset">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "#F0FDF4" }}>
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Mot de passe mis à jour !</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          <button
            onClick={() => navigate("/sign-in")}
            className="w-full bg-[#F5A623] hover:bg-[#e09520] text-white font-bold rounded-xl h-12 text-base transition-colors">
            Se connecter
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout mode="reset">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "#FFF5F5" }}>
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Lien invalide</h2>
          <p className="text-gray-500 text-sm mb-8">Ce lien de réinitialisation est invalide ou a expiré.</p>
          <a href={`${basePath}/forgot-password`}
            className="inline-block w-full text-center bg-[#F5A623] hover:bg-[#e09520] text-white font-bold rounded-xl h-12 leading-[3rem] text-base transition-colors">
            Demander un nouveau lien
          </a>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout mode="reset">
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Nouveau mot de passe</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Choisissez un mot de passe sécurisé d'au moins 8 caractères.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          {/* New password */}
          <div>
            <label className="block font-medium text-[#1A1A1A] text-sm mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 pr-11 text-base transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword
                  ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {/* Strength meter */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all"
                      style={{ background: i <= str.score ? str.color : "#E5E7EB" }} />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: str.color }}>{str.label}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block font-medium text-[#1A1A1A] text-sm mb-1.5">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-12 px-4 pr-11 text-base transition-colors"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showConfirm
                  ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {confirm.length > 0 && password !== confirm && (
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
            )}
            {confirm.length > 0 && password === confirm && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                Les mots de passe correspondent.
              </p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#F5A623] hover:bg-[#e09520] text-white font-bold rounded-xl h-12 text-base transition-colors disabled:opacity-60">
            {loading ? "Réinitialisation…" : "Réinitialiser mon mot de passe"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Vous vous souvenez de votre mot de passe ?{" "}
          <a href={`${basePath}/sign-in`} className="text-[#F5A623] hover:text-[#e09520] font-semibold">Se connecter</a>
        </p>
      </div>
    </AuthLayout>
  );
}

/* ── Route Guards ── */
function HomeRedirect() {
  return <HomePage />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
      </div>
    );
  }
  if (!session) return <Redirect to="/sign-in" />;
  return <Component />;
}

/* ── App Routes ── */
function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthQueryInvalidator />
      <LocationGuard />
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomeRedirect} />
        <Route path="/cities" component={CitiesPage} />
        <Route path="/coming-soon" component={ComingSoonPage} />
        <Route path="/properties" component={PropertiesPage} />
        <Route path="/properties/:id/application" component={PropertyApplicationPage} />
        <Route path="/properties/:id/dossier" component={PropertyDossierPage} />
        <Route path="/properties/:id" component={PropertyDetailPage} />
        <Route path="/pro" component={ProPricingPage} />

        {/* Auth Routes */}
        <Route path="/sign-in"           component={SignInPage} />
        <Route path="/sign-up"           component={SignUpPage} />
        <Route path="/forgot-password"   component={ForgotPasswordPage} />
        <Route path="/reset-password"    component={ResetPasswordPage} />

        {/* Tenant Protected Routes */}
        <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
        <Route path="/profile/requests" component={() => <ProtectedRoute component={ProfileRequestsPage} />} />
        <Route path="/profile/requests/:id" component={() => <ProtectedRoute component={ProfileRequestDetailPage} />} />
        <Route path="/profile/favorites" component={() => <ProtectedRoute component={ProfileFavoritesPage} />} />
        <Route path="/profile/visits" component={() => <ProtectedRoute component={ProfileVisitsPage} />} />

        {/* Pro Protected Routes */}
        <Route path="/pro/dashboard" component={() => <ProtectedRoute component={ProDashboardPage} />} />
        <Route path="/pro/properties" component={() => <ProtectedRoute component={ProPropertiesPage} />} />
        <Route path="/pro/properties/new" component={() => <ProtectedRoute component={ProPropertyNewPage} />} />
        <Route path="/pro/properties/:id/edit" component={() => <ProtectedRoute component={ProPropertyEditPage} />} />
        <Route path="/pro/requests" component={() => <ProtectedRoute component={ProRequestsPage} />} />
        <Route path="/pro/requests/:id" component={() => <ProtectedRoute component={ProRequestDetailPage} />} />
        <Route path="/pro/managers" component={() => <ProtectedRoute component={ProManagersPage} />} />
        <Route path="/pro/subscription" component={() => <ProtectedRoute component={ProSubscriptionPage} />} />
        <Route path="/pro/profile"      component={() => <ProtectedRoute component={ProProfilePage} />} />

        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}

function ConditionalLocationPopup() {
  const [location] = useLocation();
  if (location.startsWith("/pro")) return null;
  return <LocationPopup />;
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <LocationProvider>
        <TooltipProvider>
          <AppRoutes />
          <Toaster />
          <ConditionalLocationPopup />
          <CountryChangeBanner />
        </TooltipProvider>
      </LocationProvider>
    </WouterRouter>
  );
}

export default App;
