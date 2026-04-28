import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { shadcn } from '@clerk/themes';
import { useEffect, useRef } from "react";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import HomePage from "@/pages/home";
import PropertiesPage from "@/pages/properties";
import PropertyDetailPage from "@/pages/property-detail";
import ProfilePage from "@/pages/profile";
import ProfileRequestsPage from "@/pages/profile-requests";
import ProfileRequestDetailPage from "@/pages/profile-request-detail";
import ProfileFavoritesPage from "@/pages/profile-favorites";
import ProfileVisitsPage from "@/pages/profile-visits";
import ProPricingPage from "@/pages/pro-pricing";
import CitiesPage from "@/pages/cities";
import ProDashboardPage from "@/pages/pro-dashboard";
import ProPropertiesPage from "@/pages/pro-properties";
import ProPropertyNewPage from "@/pages/pro-property-new";
import ProRequestsPage from "@/pages/pro-requests";
import ProRequestDetailPage from "@/pages/pro-request-detail";
import ProManagersPage from "@/pages/pro-managers";
import ProSubscriptionPage from "@/pages/pro-subscription";

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
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(30 100% 48%)", // Amber
    colorForeground: "hsl(235 66% 15%)", // Navy base
    colorMutedForeground: "hsl(215 16% 47%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(214 32% 91%)",
    colorInputForeground: "hsl(235 66% 15%)",
    colorNeutral: "hsl(214 32% 91%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-gray-100",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold text-[#1a237e]",
    headerSubtitle: "text-gray-500",
    socialButtonsBlockButtonText: "font-semibold",
    formFieldLabel: "font-medium text-[#1a237e]",
    footerActionLink: "text-[#f57c00] hover:text-[#e65100]",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-400",
    identityPreviewEditButton: "text-[#f57c00]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-sm",
    logoBox: "h-12 flex items-center justify-center mb-4",
    logoImage: "h-full w-auto",
    socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
    formButtonPrimary: "bg-[#f57c00] hover:bg-[#e65100] text-white",
    formFieldInput: "bg-gray-50 border-gray-200 focus:border-[#f57c00] focus:ring-[#f57c00]",
    footerAction: "mt-4",
    dividerLine: "bg-gray-200",
    alert: "border-red-200 bg-red-50 text-red-800",
    otpCodeFieldInput: "border-gray-200 focus:border-[#f57c00]",
    formFieldRow: "mb-4",
    main: "p-8",
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

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
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
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={HomeRedirect} />
          <Route path="/cities" component={CitiesPage} />
          <Route path="/properties" component={PropertiesPage} />
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
      <TooltipProvider>
        <ClerkProviderWithRoutes />
        <Toaster />
      </TooltipProvider>
    </WouterRouter>
  );
}

export default App;
