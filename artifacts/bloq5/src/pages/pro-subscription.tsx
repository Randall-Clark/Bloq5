import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProLayout from "@/components/layout/pro-layout";
import { useGetCurrentSubscription, useListSubscriptionPlans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, CreditCard, Crown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

const PLAN_COLORS: Record<string, string> = {
  free: "text-gray-500",
  starter: "text-[#f57c00]",
  pro: "text-[#1a237e]",
  enterprise: "text-purple-700",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: "Actif",        color: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulé",       color: "bg-red-100 text-red-800" },
  past_due:  { label: "Impayé",       color: "bg-orange-100 text-orange-800" },
  trialing:  { label: "Essai",        color: "bg-blue-100 text-blue-800" },
};

export default function ProSubscriptionPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: sub, isLoading: subLoading, refetch: refetchSub } = useGetCurrentSubscription();
  const { data: plans, isLoading: plansLoading } = useListSubscriptionPlans();

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState<{ type: "success" | "cancel" | "error"; text: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  /* Handle Stripe redirect params */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");

    if (checkout === "success" && sessionId) {
      setVerifying(true);
      fetch(`/api/subscriptions/verify-checkout?session_id=${sessionId}`, { credentials: "include" })
        .then((r) => r.json())
        .then(() => {
          refetchSub();
          queryClient.invalidateQueries();
          setCheckoutMsg({ type: "success", text: "Paiement confirmé ! Votre abonnement est maintenant actif." });
        })
        .catch(() => setCheckoutMsg({ type: "error", text: "Impossible de confirmer le paiement. Contactez le support." }))
        .finally(() => {
          setVerifying(false);
          window.history.replaceState({}, "", "/pro/subscription");
        });
    } else if (checkout === "cancel") {
      setCheckoutMsg({ type: "cancel", text: "Paiement annulé. Vous pouvez réessayer à tout moment." });
      window.history.replaceState({}, "", "/pro/subscription");
    }
  }, []);

  const currentPlan = plans?.find((p: any) => p.id === sub?.planId);
  const maxProps = currentPlan?.maxProperties ?? 1;
  const usagePercent = sub
    ? maxProps === -1 ? 0 : Math.min(100, Math.round(((sub.propertiesUsed ?? 0) / maxProps) * 100))
    : 0;

  async function handleCheckout(planId: string) {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutMsg({ type: "error", text: data.error ?? "Erreur lors de la création de la session de paiement." });
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutMsg({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/subscriptions/portal", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutMsg({ type: "error", text: data.error ?? "Impossible d'accéder au portail de facturation." });
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutMsg({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setPortalLoading(false);
    }
  }

  const statusInfo = STATUS_LABELS[sub?.status ?? ""] ?? { label: sub?.status ?? "—", color: "bg-gray-100 text-gray-700" };
  const isActive = sub?.status === "active" && sub?.planId !== "free";

  return (
    <ProLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Abonnement & Facturation</h1>
        <p className="text-gray-500">Gérez votre forfait bloq5 Pro.</p>
      </div>

      {/* Stripe redirect feedback */}
      {(checkoutMsg || verifying) && (
        <div className={`mb-6 p-4 border-l-4 flex items-start gap-3 ${
          verifying ? "border-[#1a237e] bg-blue-50" :
          checkoutMsg?.type === "success" ? "border-green-500 bg-green-50" :
          checkoutMsg?.type === "cancel" ? "border-orange-400 bg-orange-50" :
          "border-red-500 bg-red-50"
        }`}>
          {verifying
            ? <Loader2 className="h-5 w-5 text-[#1a237e] shrink-0 animate-spin mt-0.5" />
            : checkoutMsg?.type === "success"
              ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              : <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          }
          <p className="text-sm font-medium">
            {verifying ? "Vérification du paiement en cours…" : checkoutMsg?.text}
          </p>
        </div>
      )}

      {subLoading || plansLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      ) : (
        <>
          {/* Current plan card */}
          <Card className="rounded-none border-[#f57c00] border-2 shadow-sm mb-8 bg-[#f57c00]/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div>
                  <h3 className="text-sm font-bold text-[#f57c00] uppercase tracking-wider mb-2">Forfait actuel</h3>
                  <div className={`text-4xl font-extrabold mb-3 ${PLAN_COLORS[sub?.planId ?? "free"] ?? "text-gray-900"}`}>
                    {currentPlan?.name ?? "Gratuit"}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {!isActive && (
                      <span className="text-xs text-gray-500">— Abonnez-vous pour publier vos annonces</span>
                    )}
                  </div>
                  {sub?.currentPeriodEnd && (
                    <p className="text-sm text-gray-500">
                      Renouvellement le {format(new Date(sub.currentPeriodEnd), "dd MMMM yyyy", { locale: fr })}
                    </p>
                  )}
                  {isActive && sub?.stripeCustomerId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-none border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e]/5"
                      onClick={handlePortal}
                      disabled={portalLoading}
                    >
                      {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                      Gérer la facturation
                      <ExternalLink className="h-3 w-3 ml-2 opacity-60" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 max-w-md bg-white p-6 border border-orange-100">
                  <div className="flex justify-between mb-2 text-sm font-bold text-[#1a237e]">
                    <span>Propriétés utilisées</span>
                    <span>
                      {sub?.propertiesUsed ?? 0} / {maxProps === -1 ? "∞" : maxProps}
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-2 rounded-none bg-orange-100 [&>div]:bg-[#f57c00]" />
                  <p className="text-xs text-gray-500 mt-3 text-right">
                    {usagePercent >= 90
                      ? "⚠ Vous approchez de votre limite."
                      : maxProps === -1
                        ? "Propriétés illimitées"
                        : "Vous avez encore de la capacité disponible."}
                  </p>
                  <div className="mt-4 pt-4 border-t border-orange-100 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Gestionnaires max</span>
                      <span className="font-medium">{currentPlan?.maxManagers === -1 ? "∞" : (currentPlan?.maxManagers ?? 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Publication d'annonces</span>
                      <span className={`font-medium ${currentPlan?.canPublish ? "text-green-600" : "text-red-500"}`}>
                        {currentPlan?.canPublish ? "✓ Autorisée" : "✗ Requiert un abonnement"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan grid */}
          <h2 className="text-2xl font-bold text-[#1a237e] mb-6">Choisir un forfait</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {plans?.map((plan: any) => {
              const isCurrent = sub?.planId === plan.id;
              const isUpgrade = plan.price !== null && plan.price > 0 && !plan.isEnterprise;
              const isLoading = checkoutLoading === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`rounded-none border flex flex-col ${
                    isCurrent
                      ? "border-[#f57c00] ring-2 ring-[#f57c00]/30"
                      : plan.id === "pro"
                        ? "border-[#1a237e]"
                        : "border-gray-200"
                  }`}
                >
                  <CardHeader className="bg-gray-50 border-b border-gray-200 pb-6 pt-8 text-center relative">
                    {isCurrent && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#f57c00] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Votre forfait
                      </div>
                    )}
                    {plan.id === "pro" && !isCurrent && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#1a237e] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Recommandé
                      </div>
                    )}
                    <CardTitle className="text-xl font-bold text-[#1a237e] mb-2">{plan.name}</CardTitle>
                    <div className="text-3xl font-extrabold text-gray-900">
                      {plan.price === 0
                        ? "Gratuit"
                        : plan.price !== null
                          ? (
                            <>
                              {plan.price} <span className="text-lg font-bold text-gray-600">CAD</span>
                              <span className="text-sm font-normal text-gray-500">/mois</span>
                            </>
                          )
                          : "Sur devis"}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-[#f57c00] shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="p-6 pt-0 border-t border-gray-100 mt-auto">
                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full rounded-none h-12 font-bold">
                        Forfait actuel
                      </Button>
                    ) : plan.isEnterprise ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-none h-12 font-bold border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => window.open("mailto:contact@bloq5.com?subject=Forfait Entreprise", "_blank")}
                      >
                        Contacter les ventes
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        className="w-full rounded-none h-12 font-bold bg-[#f57c00] hover:bg-[#e65100] text-white"
                        onClick={() => handleCheckout(plan.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Redirection…</>
                        ) : (
                          <>S'abonner — {plan.price} CAD/mois</>
                        )}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full rounded-none h-12 font-bold" disabled>
                        Forfait de base
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Info banner */}
          <div className="border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
            <p className="font-bold mb-1">Paiement sécurisé par Stripe</p>
            <p>Vos informations de paiement sont traitées directement par Stripe et ne sont jamais stockées sur nos serveurs. Vous pouvez annuler à tout moment depuis le portail de facturation.</p>
          </div>
        </>
      )}
    </ProLayout>
  );
}
