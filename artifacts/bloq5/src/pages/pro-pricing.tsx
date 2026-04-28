import PublicLayout from "@/components/layout/public-layout";
import { useListSubscriptionPlans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import { Link } from "wouter";

export default function ProPricingPage() {
  const { data: plans, isLoading } = useListSubscriptionPlans();

  return (
    <PublicLayout>
      <div className="bg-[#f8f9fa] dark:bg-[#0a0a0a] min-h-screen py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a237e] dark:text-white mb-6">
              bloq<span className="text-[#f57c00]">5</span> Pro
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              L'outil de gestion locative de nouvelle génération pour les professionnels de l'immobilier et les propriétaires exigeants.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans?.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`rounded-none border-2 flex flex-col ${
                    plan.name.toLowerCase().includes('pro') && !plan.isEnterprise
                      ? 'border-[#f57c00] shadow-xl relative scale-105 z-10' 
                      : 'border-gray-200 dark:border-gray-800 shadow-sm'
                  }`}
                >
                  {plan.name.toLowerCase().includes('pro') && !plan.isEnterprise && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f57c00] text-white px-4 py-1 text-xs font-bold uppercase tracking-wider">
                      Le plus populaire
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-10">
                    <CardTitle className="text-2xl font-bold text-[#1a237e] dark:text-white mb-2">{plan.name}</CardTitle>
                    <div className="flex justify-center items-end gap-1">
                      {plan.price !== null ? (
                        <>
                          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}€</span>
                          <span className="text-gray-500 mb-1">/{plan.interval === 'month' ? 'mois' : 'an'}</span>
                        </>
                      ) : (
                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">Sur devis</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-[#f57c00] shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.maxProperties && (
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-[#f57c00] shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Jusqu'à {plan.maxProperties} propriétés</span>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-8 pb-10">
                    <Link href="/sign-up" className="w-full">
                      <Button 
                        className={`w-full rounded-none h-12 text-base font-bold ${
                          plan.name.toLowerCase().includes('pro') && !plan.isEnterprise
                            ? 'bg-[#f57c00] hover:bg-[#e65100] text-white' 
                            : 'bg-[#1a237e] hover:bg-[#0d47a1] text-white'
                        }`}
                      >
                        {plan.isEnterprise ? "Contactez-nous" : "Commencer"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}