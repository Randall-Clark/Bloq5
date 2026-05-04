import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { shadcn } from '@clerk/themes';
import { useEffect, useRef } from "react";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LocationProvider, useLocation_ } from "@/context/location-context";
import { LocationPopup } from "@/components/location-popup";
import { CountryChangeBanner } from "@/components/country-change-banner";
import { isActiveCountry } from "@/data/countries";

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

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "none" as const,
  },
  variables: {
    colorPrimary: "#F5A623",
    colorForeground: "#1A1A1A",
    colorMutedForeground: "#6B7280",
    colorDanger: "#EF4444",
    colorBackground: "#FFFFFF",
    colorInput: "#F9FAFB",
    colorInputForeground: "#1A1A1A",
    colorNeutral: "#E5E7EB",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.75rem",
    fontSize: "1rem",
    spacingUnit: "1.1rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none border-0",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none !p-0",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "!text-2xl !font-bold !text-[#1A1A1A]",
    headerSubtitle: "!text-gray-500 !text-sm",
    socialButtonsBlockButtonText: "font-semibold text-[#1A1A1A]",
    socialButtonsBlockButton: "!border !border-gray-200 hover:!bg-gray-50 !rounded-xl !h-12",
    formFieldLabel: "font-medium text-[#1A1A1A] text-sm",
    formFieldInput: "!bg-gray-50 !border !border-gray-200 focus:!border-[#F5A623] !rounded-xl !h-12 !text-base",
    formButtonPrimary: "!bg-[#F5A623] hover:!bg-[#e09520] !text-white !font-bold !rounded-xl !h-12 !text-base",
    footerActionLink: "!text-[#F5A623] hover:!text-[#e09520] font-semibold",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-400 text-sm",
    dividerLine: "bg-gray-200",
    identityPreviewEditButton: "text-[#F5A623]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-sm",
    alert: "!border-red-200 !bg-red-50 !text-red-800 !rounded-xl",
    otpCodeFieldInput: "!border-gray-200 focus:!border-[#F5A623] !rounded-xl",
    formFieldRow: "mb-3",
    main: "!p-0",
    logoBox: "hidden",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

/* Redirects returning users with a non-active saved country to /coming-soon */
function LocationGuard() {
  const { isReady, country } = useLocation_();
  const [location, navigate] = useLocation();
  useEffect(() => {
    const exempt = ["/coming-soon", "/sign-in", "/sign-up"];
    if (isReady && !isActiveCountry(country.code) && !exempt.some(p => location.startsWith(p))) {
      navigate("/coming-soon");
    }
  }, [isReady, country.code, location, navigate]);
  return null;
}

function AuthLayout({ children, mode }: { children: React.ReactNode; mode: "signin" | "signup" }) {
  const bgImage = `${import.meta.env.BASE_URL}images/hero-interior.png`;
  return (
    <div className="flex min-h-[100dvh] bg-white">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />

        {/* Logo */}
        <div className="relative z-10">
          <a href={basePath || "/"} className="inline-block">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="bloq5" className="h-10 brightness-0 invert" />
          </a>
        </div>

        {/* Center tagline */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#F5A623]/20 border border-[#F5A623]/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] inline-block" />
            <span className="text-[#F5A623] text-sm font-semibold">Gestion immobilière simplifiée</span>
          </div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            {mode === "signin"
              ? "Retrouvez vos propriétés et candidatures"
              : "Commencez à gérer vos locations dès aujourd'hui"}
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            Recherche, candidatures et suivi de vos dossiers locatifs — tout en un seul endroit.
          </p>
        </div>

        {/* Bottom trust signals */}
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

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 overflow-y-auto">
        {/* Mobile logo */}
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

function SignInPage() {
  return (
    <AuthLayout mode="signin">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthLayout>
  );
}

function SignUpPage() {
  return (
    <AuthLayout mode="signup">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthLayout>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/profile" />
      </Show>
      <Show when="signed-out">
        <HomePage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Se connecter",
            subtitle: "Bienvenue sur bloq5",
          },
        },
        signUp: {
          start: {
            title: "Créer un compte",
            subtitle: "Rejoignez bloq5",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
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
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          
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
          <Route path="/pro/requests" component={() => <ProtectedRoute component={ProRequestsPage} />} />
          <Route path="/pro/requests/:id" component={() => <ProtectedRoute component={ProRequestDetailPage} />} />
          <Route path="/pro/managers" component={() => <ProtectedRoute component={ProManagersPage} />} />
          <Route path="/pro/subscription" component={() => <ProtectedRoute component={ProSubscriptionPage} />} />
          
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <LocationProvider>
        <TooltipProvider>
          <ClerkProviderWithRoutes />
          <Toaster />
          <LocationPopup />
          <CountryChangeBanner />
        </TooltipProvider>
      </LocationProvider>
    </WouterRouter>
  );
}

export default App;
