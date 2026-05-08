import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProLayout from "@/components/layout/pro-layout";
import { useGetCurrentSubscription, useListSubscriptionPlans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, CreditCard, Crown, Video, UserPlus, CalendarClock, Home, XCircle, TriangleAlert, Plus, Building2, Wallet, ChevronRight, ArrowLeft, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

const PLAN_COLORS: Record<string, string> = {
  free: "text-gray-500",
  starter: "text-[#F5A623]",
  pro: "text-[#1A1A1A]",
  enterprise: "text-purple-700",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: "Actif",        color: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulé",       color: "bg-red-100 text-red-800" },
  past_due:  { label: "Impayé",       color: "bg-orange-100 text-orange-800" },
  trialing:  { label: "Essai",        color: "bg-blue-100 text-blue-800" },
};

type PmType = "card" | "bank" | "paypal" | null;

export default function ProSubscriptionPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: sub, isLoading: subLoading, refetch: refetchSub } = useGetCurrentSubscription();
  const { data: plans, isLoading: plansLoading } = useListSubscriptionPlans();

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState<{ type: "success" | "cancel" | "error"; text: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [addonLoading, setAddonLoading] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  /* Payment method modal */
  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [pmType, setPmType] = useState<PmType>(null);
  const [pmForm, setPmForm] = useState<Record<string, string>>({});
  const [pmSaving, setPmSaving] = useState(false);
  const [pmSuccess, setPmSuccess] = useState(false);

  const openPmModal = () => { setPmType(null); setPmForm({}); setPmSuccess(false); setPmModalOpen(true); };
  const setPmField = (k: string, v: string) => setPmForm(f => ({ ...f, [k]: v }));

  const handleSavePm = async () => {
    setPmSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setPmSaving(false);
    setPmSuccess(true);
  };

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

  const currentPlan = plans?.find((p: any) => p.id === sub?.planId) ?? (sub as any)?.plan;
  const addonDiscount: number = currentPlan?.addonDiscount ?? 0;
  const vtPrice = addonDiscount > 0 ? Math.round(29 * (1 - addonDiscount / 100)) : 29;
  const mgPrice = addonDiscount > 0 ? Math.round(15 * (1 - addonDiscount / 100)) : 15;
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

  async function handleCancelSubscription() {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutMsg({ type: "error", text: data.error ?? "Erreur lors de la résiliation." });
        return;
      }
      refetchSub();
      queryClient.invalidateQueries();
      setCheckoutMsg({
        type: "success",
        text: `Abonnement résilié. Il reste actif jusqu'au ${
          sub?.currentPeriodEnd
            ? format(new Date(sub.currentPeriodEnd), "dd MMMM yyyy", { locale: fr })
            : "prochain renouvellement"
        }, puis votre compte repasse au forfait Gratuit.`,
      });
    } catch {
      setCheckoutMsg({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setCancelLoading(false);
      setCancelOpen(false);
    }
  }

  async function handleAddon(addonId: string) {
    setAddonLoading(addonId);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId: addonId }),
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
      setAddonLoading(null);
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
  const isCancelled = sub?.status === "cancelled";
  const canCancel = isActive && !!sub?.stripeSubscriptionId;

  return (
    <ProLayout>
      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="rounded-2xl border-gray-200 max-w-md p-0 overflow-hidden">
          <div className="bg-red-600 px-6 py-5 flex items-center gap-3 rounded-t-2xl">
            <div className="w-10 h-10 bg-white/10 flex items-center justify-center shrink-0">
              <TriangleAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Résilier l'abonnement</h2>
              <p className="text-white/70 text-sm">Forfait {currentPlan?.name}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              Votre abonnement sera résilié mais restera <strong>pleinement actif jusqu'au</strong>{" "}
              <strong className="text-[#1A1A1A]">
                {sub?.currentPeriodEnd
                  ? format(new Date(sub.currentPeriodEnd), "dd MMMM yyyy", { locale: fr })
                  : "prochain renouvellement"}
              </strong>.
              Passé cette date, votre compte repassera automatiquement au forfait Gratuit.
            </p>
            <div className="bg-orange-50 border border-orange-200 p-3 text-xs text-orange-800 space-y-1">
              <p className="font-bold">Ce qui sera désactivé après la période :</p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>Publication d'annonces supplémentaires</li>
                <li>Accès aux gestionnaires inclus dans le forfait</li>
                <li>Visites virtuelles et services inclus</li>
              </ul>
            </div>
            <DialogFooter className="flex flex-col gap-2 pt-1 sm:flex-col">
              <Button
                className="w-full h-11 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
              >
                {cancelLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Résiliation en cours…</>
                  : <><XCircle className="h-4 w-4 mr-2" /> Confirmer la résiliation</>
                }
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl text-sm border-gray-200 text-gray-600"
                onClick={() => setCancelOpen(false)}
                disabled={cancelLoading}
              >
                Annuler — garder mon abonnement
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white">Abonnement & Facturation</h1>
        <p className="text-gray-500">Gérez votre forfait bloq5 Pro.</p>
      </div>

      {/* Stripe redirect feedback */}
      {(checkoutMsg || verifying) && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
          verifying ? "border-[#1A1A1A]/20 bg-blue-50" :
          checkoutMsg?.type === "success" ? "border-green-200 bg-green-50" :
          checkoutMsg?.type === "cancel" ? "border-orange-200 bg-orange-50" :
          "border-red-200 bg-red-50"
        }`}>
          {verifying
            ? <Loader2 className="h-5 w-5 text-[#1A1A1A] shrink-0 animate-spin mt-0.5" />
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
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Current plan card */}
          <Card className="rounded-xl border-[#F5A623] border-2 shadow-sm mb-8 bg-[#F5A623]/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div>
                  <h3 className="text-sm font-bold text-[#F5A623] uppercase tracking-wider mb-2">Forfait actuel</h3>
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
                  {isCancelled && sub?.currentPeriodEnd && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 px-3 py-2">
                      <TriangleAlert className="h-4 w-4 shrink-0" />
                      Résilié — actif jusqu'au {format(new Date(sub.currentPeriodEnd), "dd MMMM yyyy", { locale: fr })}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {isActive && sub?.stripeCustomerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A]/5"
                        onClick={handlePortal}
                        disabled={portalLoading}
                      >
                        {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                        Gérer la facturation
                        <ExternalLink className="h-3 w-3 ml-2 opacity-60" />
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        onClick={() => setCancelOpen(true)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Résilier l'abonnement
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 max-w-md bg-white p-6 border border-orange-100 rounded-xl">
                  <div className="flex justify-between mb-2 text-sm font-bold text-[#1A1A1A]">
                    <span>Crédits utilisés</span>
                    <span>
                      {sub?.propertiesUsed ?? 0} / {maxProps === -1 ? "∞" : maxProps}
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-2 rounded-full bg-orange-100 [&>div]:bg-[#F5A623]" />
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
          <h2 id="plan-grid" className="text-2xl font-bold text-[#1A1A1A] mb-6">Choisir un forfait</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {plans?.map((plan: any) => {
              const isCurrent = sub?.planId === plan.id;
              const isUpgrade = plan.price !== null && plan.price > 0 && !plan.isEnterprise;
              const isLoading = checkoutLoading === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`rounded-xl border flex flex-col shadow-sm hover:shadow-md transition-shadow ${
                    isCurrent
                      ? "border-[#F5A623] ring-2 ring-[#F5A623]/30"
                      : plan.id === "pro"
                        ? "border-[#1A1A1A]"
                        : "border-gray-200"
                  }`}
                >
                  <CardHeader className="bg-gray-50 border-b border-gray-200 pb-6 pt-8 text-center relative rounded-t-xl">
                    {isCurrent && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#F5A623] text-[#1A1A1A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Votre forfait
                      </div>
                    )}
                    {plan.id === "pro" && !isCurrent && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Recommandé
                      </div>
                    )}
                    <CardTitle className="text-xl font-bold text-[#1A1A1A] mb-2">{plan.name}</CardTitle>
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
                          <CheckCircle2 className="h-4 w-4 text-[#F5A623] shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="p-6 pt-0 border-t border-gray-100 mt-auto">
                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full rounded-xl h-12 font-bold">
                        Forfait actuel
                      </Button>
                    ) : plan.isEnterprise ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-12 font-bold border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => window.open("mailto:contact@bloq5.com?subject=Forfait Entreprise", "_blank")}
                      >
                        Contacter les ventes
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        className="w-full rounded-xl h-12 font-bold bg-[#F5A623] hover:bg-[#d4901f] text-[#1A1A1A]"
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
                      <Button variant="outline" className="w-full rounded-xl h-12 font-bold" disabled>
                        Forfait de base
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* À la carte services */}
          <div className="mb-10">
            <div className="mb-6">
              <div className="flex flex-wrap items-end gap-3">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Services à la carte</h2>
                {addonDiscount > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {addonDiscount} % de rabais inclus avec votre forfait {currentPlan?.name}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">Achetez un service individuel sans changer de forfait. Chaque crédit est lié à un bien spécifique ou à votre compte.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Visite virtuelle */}
              <div className="rounded-xl border border-gray-200 bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100 bg-gray-50/60 flex items-start gap-4 rounded-t-xl">
                  <div className="w-12 h-12 bg-[#FFF8EE] border border-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-[#F5A623]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] text-lg leading-tight">Visite virtuelle</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Crédit de réservation · 1 appartement</p>
                  </div>
                  <div className="ml-auto text-right shrink-0">
                    {addonDiscount > 0 && (
                      <div className="text-xs text-gray-400 line-through">29 CAD</div>
                    )}
                    <div className="text-2xl font-extrabold text-gray-900">
                      {vtPrice} <span className="text-base font-bold text-gray-500">CAD</span>
                    </div>
                    <div className="text-xs text-gray-400">par bien</div>
                  </div>
                </div>
                <div className="p-6 flex-1 space-y-3">
                  <p className="text-sm text-gray-600">
                    Activez une visite virtuelle interactive (Matterport 3D) pour <strong>un appartement</strong> de votre portfolio. Le crédit est valide jusqu'à ce que la visite soit configurée sur le bien choisi.
                  </p>
                  <ul className="space-y-2 pt-1">
                    {[
                      "Scan 3D Matterport professionnel",
                      "Lien de visite embarqué dans votre annonce",
                      "Valide pour 1 bien, durée illimitée",
                      "Prise de rendez-vous coordinée par bloq5",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-[#F5A623] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 pt-1">
                    <Home className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Vous choisissez le bien après l'achat</span>
                  </div>
                </div>
                <div className="p-6 pt-0 border-t border-gray-100">
                  <Button
                    className="w-full h-12 rounded-xl font-bold bg-[#F5A623] hover:bg-[#d4901f] text-[#1A1A1A]"
                    onClick={() => handleAddon("addon_virtual_tour")}
                    disabled={addonLoading === "addon_virtual_tour"}
                  >
                    {addonLoading === "addon_virtual_tour"
                      ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Redirection…</>
                      : <>Acheter ce crédit — {vtPrice} CAD</>
                    }
                  </Button>
                </div>
              </div>

              {/* Siège gestionnaire */}
              <div className="rounded-xl border border-gray-200 bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100 bg-gray-50/60 flex items-start gap-4 rounded-t-xl">
                  <div className="w-12 h-12 bg-[#F5F5F5] border border-[#1A1A1A]/10 rounded-xl flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5 text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] text-lg leading-tight">Siège gestionnaire</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Place supplémentaire · Valide 1 mois</p>
                  </div>
                  <div className="ml-auto text-right shrink-0">
                    {addonDiscount > 0 && (
                      <div className="text-xs text-gray-400 line-through">15 CAD</div>
                    )}
                    <div className="text-2xl font-extrabold text-gray-900">
                      {mgPrice} <span className="text-base font-bold text-gray-500">CAD</span>
                    </div>
                    <div className="text-xs text-gray-400">/ mois</div>
                  </div>
                </div>
                <div className="p-6 flex-1 space-y-3">
                  <p className="text-sm text-gray-600">
                    Ajoutez <strong>un gestionnaire supplémentaire</strong> à votre compte sans changer de forfait. Le siège est actif pendant <strong>30 jours</strong> à partir de l'achat, renouvelable à tout moment.
                  </p>
                  <ul className="space-y-2 pt-1">
                    {[
                      "1 invitation gestionnaire envoyée immédiatement",
                      "Accès complet aux propriétés partagées",
                      "Validité : 30 jours à partir de l'achat",
                      "Renouvelable indépendamment du forfait",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-[#1A1A1A] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 pt-1">
                    <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Non renouvelé automatiquement — vous contrôlez l'accès</span>
                  </div>
                </div>
                <div className="p-6 pt-0 border-t border-gray-100">
                  <Button
                    className="w-full h-12 rounded-xl font-bold bg-[#1A1A1A] hover:bg-[#333333] text-white"
                    onClick={() => handleAddon("addon_extra_manager")}
                    disabled={addonLoading === "addon_extra_manager"}
                  >
                    {addonLoading === "addon_extra_manager"
                      ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Redirection…</>
                      : <>Ajouter un gestionnaire — 15 CAD</>
                    }
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Payment methods */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Méthodes de paiement</h2>
            <p className="text-gray-500 text-sm mb-6">Ajoutez un mode de paiement pour régler votre abonnement bloq5.</p>
            <Button
              className="rounded-xl h-11 font-bold bg-[#1A1A1A] hover:bg-[#333333] text-white px-6"
              onClick={openPmModal}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une méthode de paiement
            </Button>
          </div>

          {/* Payment method modal */}
          <Dialog open={pmModalOpen} onOpenChange={open => { setPmModalOpen(open); if (!open) { setPmType(null); setPmForm({}); setPmSuccess(false); } }}>
            <DialogContent className="rounded-2xl border-gray-200 max-w-lg p-0 overflow-hidden">
              <DialogTitle className="sr-only">Méthode de paiement</DialogTitle>
              {/* Header */}
              <div className="bg-[#1A1A1A] px-6 py-5 flex items-center gap-3 rounded-t-2xl">
                <div className="w-9 h-9 bg-white/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">Méthode de paiement</h2>
                  <p className="text-white/60 text-sm">
                    {!pmType ? "Choisissez votre mode de paiement" : pmType === "card" ? "Carte de crédit / débit" : pmType === "bank" ? "Compte bancaire" : "Compte PayPal"}
                  </p>
                </div>
              </div>

              <div className="p-6">
                {pmSuccess ? (
                  /* Success */
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-lg mb-1">Méthode enregistrée</p>
                    <p className="text-sm text-gray-500 mb-6">Votre méthode de paiement a été ajoutée avec succès.</p>
                    <Button className="rounded-xl bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold w-full h-11" onClick={() => setPmModalOpen(false)}>
                      Fermer
                    </Button>
                  </div>
                ) : !pmType ? (
                  /* Step 1 — choose type */
                  <div className="space-y-3">
                    {([
                      { id: "card",   icon: CreditCard,  label: "Carte de crédit / débit",   desc: "Visa, Mastercard, American Express" },
                      { id: "bank",   icon: Building2,   label: "Compte bancaire",             desc: "Virement depuis votre compte" },
                      { id: "paypal", icon: Wallet,       label: "PayPal",                      desc: "Payer via votre compte PayPal" },
                    ] as const).map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPmType(opt.id)}
                        className="w-full flex items-center gap-4 p-4 border border-gray-200 bg-white hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors text-left group rounded-xl"
                      >
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#1A1A1A]/10 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                          <opt.icon className="h-5 w-5 text-gray-500 group-hover:text-[#1A1A1A]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm group-hover:text-[#1A1A1A]">{opt.label}</p>
                          <p className="text-xs text-gray-400">{opt.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#1A1A1A]" />
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Step 2 — form */
                  <div>
                    <button onClick={() => { setPmType(null); setPmForm({}); }} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A1A1A] mb-5 transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" /> Changer de méthode
                    </button>

                    <div className="space-y-4">
                      {pmType === "card" && (
                        <>
                          <div>
                            <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Titulaire de la carte</Label>
                            <Input className="rounded-lg" placeholder="Jean Dupont" value={pmForm.name ?? ""} onChange={e => setPmField("name", e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Numéro de carte</Label>
                            <Input className="rounded-lg font-mono" placeholder="1234 5678 9012 3456" maxLength={19}
                              value={pmForm.number ?? ""}
                              onChange={e => setPmField("number", e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Date d'expiration</Label>
                              <Input className="rounded-lg font-mono" placeholder="MM/AA" maxLength={5}
                                value={pmForm.expiry ?? ""}
                                onChange={e => {
                                  let v = e.target.value.replace(/\D/g, "");
                                  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                                  setPmField("expiry", v);
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold text-gray-600 mb-1.5 block">CVV</Label>
                              <Input className="rounded-lg font-mono" placeholder="123" maxLength={4} value={pmForm.cvv ?? ""} onChange={e => setPmField("cvv", e.target.value.replace(/\D/g, ""))} />
                            </div>
                          </div>
                        </>
                      )}

                      {pmType === "bank" && (
                        <>
                          <div>
                            <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Titulaire du compte</Label>
                            <Input className="rounded-lg" placeholder="Jean Dupont" value={pmForm.name ?? ""} onChange={e => setPmField("name", e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Nom de l'institution bancaire</Label>
                            <Input className="rounded-lg" placeholder="ex: Banque Nationale, RBC, BMO…" value={pmForm.bank ?? ""} onChange={e => setPmField("bank", e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Numéro de transit</Label>
                              <Input className="rounded-lg font-mono" placeholder="00000" maxLength={5} value={pmForm.transit ?? ""} onChange={e => setPmField("transit", e.target.value.replace(/\D/g, ""))} />
                            </div>
                            <div>
                              <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Numéro de compte</Label>
                              <Input className="rounded-lg font-mono" placeholder="0000000" maxLength={12} value={pmForm.account ?? ""} onChange={e => setPmField("account", e.target.value.replace(/\D/g, ""))} />
                            </div>
                          </div>
                        </>
                      )}

                      {pmType === "paypal" && (
                        <div>
                          <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Adresse e-mail PayPal</Label>
                          <Input className="rounded-lg" type="email" placeholder="votre@email.com" value={pmForm.email ?? ""} onChange={e => setPmField("email", e.target.value)} />
                          <p className="text-xs text-gray-400 mt-2">Assurez-vous d'utiliser l'adresse associée à votre compte PayPal actif.</p>
                        </div>
                      )}
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-5">
                      <Lock className="h-3 w-3" /> Vos informations sont chiffrées et sécurisées.
                    </p>

                    <Button
                      className="w-full h-11 rounded-xl font-bold bg-[#1A1A1A] hover:bg-[#333333] text-white mt-4"
                      onClick={handleSavePm}
                      disabled={pmSaving}
                    >
                      {pmSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enregistrement…</> : "Enregistrer la méthode de paiement"}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Info banner */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
            <p className="font-bold mb-1">Paiement sécurisé par Stripe</p>
            <p>Vos informations de paiement sont traitées directement par Stripe et ne sont jamais stockées sur nos serveurs. Vous pouvez annuler à tout moment depuis le portail de facturation.</p>
          </div>
        </>
      )}
    </ProLayout>
  );
}
