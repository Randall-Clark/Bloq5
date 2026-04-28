import ProLayout from "@/components/layout/pro-layout";
import { useGetCurrentSubscription, useListSubscriptionPlans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProSubscriptionPage() {
  const { data: sub, isLoading: subLoading } = useGetCurrentSubscription();
  const { data: plans, isLoading: plansLoading } = useListSubscriptionPlans();

  const usagePercent = sub ? Math.min(100, Math.round((sub.propertiesUsed / (plans?.find(p => p.id === sub.planId)?.maxProperties || 1)) * 100)) : 0;

  return (
    <ProLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Abonnement & Facturation</h1>
        <p className="text-gray-500">Gérez votre forfait bloq5 Pro.</p>
      </div>

      {subLoading || plansLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <>
          <Card className="rounded-none border-[#f57c00] border-2 shadow-sm mb-8 bg-[#f57c00]/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div>
                  <h3 className="text-sm font-bold text-[#f57c00] uppercase tracking-wider mb-2">Forfait actuel</h3>
                  <div className="text-4xl font-extrabold text-[#1a237e] mb-4">{sub?.planName || "Gratuit"}</div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Statut: <strong className="uppercase">{sub?.status || 'Inconnu'}</strong>
                  </div>
                  {sub?.currentPeriodEnd && (
                    <p className="text-sm text-gray-500 mt-2">
                      Prochain renouvellement le {format(new Date(sub.currentPeriodEnd), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
                
                <div className="flex-1 max-w-md bg-white p-6 border border-orange-100">
                  <div className="flex justify-between mb-2 text-sm font-bold text-[#1a237e]">
                    <span>Propriétés utilisées</span>
                    <span>{sub?.propertiesUsed || 0} / {plans?.find(p => p.id === sub?.planId)?.maxProperties || '∞'}</span>
                  </div>
                  <Progress value={usagePercent} className="h-2 rounded-none bg-orange-100 [&>div]:bg-[#f57c00]" />
                  <p className="text-xs text-gray-500 mt-3 text-right">
                    {usagePercent >= 90 ? "Attention, vous approchez de votre limite." : "Vous avez encore de la marge."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold text-[#1a237e] mb-6">Changer de forfait</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => {
              const isCurrent = sub?.planId === plan.id;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`rounded-none border flex flex-col ${isCurrent ? 'border-[#1a237e] ring-1 ring-[#1a237e]' : 'border-gray-200'}`}
                >
                  <CardHeader className="bg-gray-50 border-b border-gray-200 pb-6 pt-8 text-center relative">
                    {isCurrent && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#1a237e] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Votre forfait
                      </div>
                    )}
                    <CardTitle className="text-xl font-bold text-[#1a237e] mb-2">{plan.name}</CardTitle>
                    <div className="text-3xl font-extrabold text-gray-900">
                      {plan.price !== null ? `${plan.price}€` : 'Sur devis'}
                      {plan.price !== null && <span className="text-sm font-normal text-gray-500">/mo</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-[#f57c00] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 border-t border-gray-100 mt-auto">
                    <Button 
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent}
                      className={`w-full rounded-none h-12 font-bold ${!isCurrent && !plan.isEnterprise ? 'bg-[#f57c00] hover:bg-[#e65100] text-white' : ''}`}
                    >
                      {isCurrent ? "Forfait actuel" : plan.isEnterprise ? "Contacter les ventes" : "Mettre à niveau"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </ProLayout>
  );
}