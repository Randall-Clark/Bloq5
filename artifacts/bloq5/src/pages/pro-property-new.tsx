import { useState } from "react";
import ProLayout from "@/components/layout/pro-layout";
import { useCreateProperty, getGetDashboardPropertiesQueryKey, useListSubscriptionPlans } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Megaphone, X } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const YELLOW = "#F5A623";
const NAVY   = "#1A237E";

const propertySchema = z.object({
  title:          z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description:    z.string().min(20, "La description est trop courte"),
  type:           z.enum(["house", "apartment", "co-living", "commercial", "office", "industrial"]),
  address:        z.string().min(5, "L'adresse est requise"),
  city:           z.string().min(2, "La ville est requise"),
  country:        z.string().min(2, "Le pays est requis"),
  price:          z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
  bedrooms:       z.coerce.number().optional().nullable(),
  bathrooms:      z.coerce.number().optional().nullable(),
  area:           z.coerce.number().optional().nullable(),
  images:         z.string().optional(),
  virtualTourUrl: z.string().optional().nullable(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

/* ── Pricing modal ── */
function PricingModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel:  () => void;
  isPending: boolean;
}) {
  const { data: plans, isLoading } = useListSubscriptionPlans();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>Choisissez votre forfait</h2>
            <p className="text-sm text-gray-500 mt-0.5">Sélectionnez un plan pour publier votre annonce.</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plans */}
        <div className="px-7 py-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans?.map((plan) => {
                const isSelected = selected === plan.id;
                const isPopular  = plan.name.toLowerCase().includes("pro") && !plan.isEnterprise;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelected(plan.id)}
                    className="text-left rounded-xl border-2 p-4 transition-all"
                    style={{
                      borderColor: isSelected ? YELLOW : isPopular ? "#E8EEFF" : "#E5E7EB",
                      background:  isSelected ? "#FFF8EE" : "#fff",
                    }}
                  >
                    {isPopular && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2" style={{ background: YELLOW, color: "#1A1A1A" }}>
                        Le plus populaire
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold text-sm" style={{ color: NAVY }}>{plan.name}</p>
                      {isSelected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: YELLOW }} />}
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">
                      {plan.price !== null ? `${plan.price}$` : "Sur devis"}
                      {plan.price !== null && <span className="text-xs font-normal text-gray-400">/mois</span>}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: YELLOW }} />
                          {f}
                        </li>
                      ))}
                      {plan.maxProperties && (
                        <li className="flex items-start gap-1.5 text-xs font-semibold text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: YELLOW }} />
                          Jusqu'à {plan.maxProperties} propriétés
                        </li>
                      )}
                    </ul>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 flex items-center justify-between gap-3">
          <button onClick={onCancel} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Annuler
          </button>
          <Button
            onClick={onConfirm}
            disabled={!selected || isPending}
            className="gap-2 rounded-xl font-bold text-sm"
            style={{ background: NAVY, color: "#fff" }}
          >
            <Megaphone className="w-4 h-4" />
            {isPending ? "Publication..." : "Confirmer et publier"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function ProPropertyNewPage() {
  const { toast }      = useToast();
  const [, setLocation] = useLocation();
  const queryClient     = useQueryClient();
  const createProperty  = useCreateProperty();
  const [showPricing, setShowPricing] = useState(false);
  const [pendingData, setPendingData] = useState<PropertyFormValues | null>(null);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "", description: "", type: "apartment",
      address: "", city: "", country: "Canada",
      price: undefined, bedrooms: undefined,
      bathrooms: undefined, area: undefined,
      // @ts-ignore
      images: "", virtualTourUrl: "",
    },
  });

  /* Step 1: validate form → open pricing modal */
  const onSubmit = (data: PropertyFormValues) => {
    setPendingData(data);
    setShowPricing(true);
  };

  /* Step 2: user confirmed plan → create property */
  const handleConfirm = () => {
    if (!pendingData) return;
    const images = pendingData.images
      ? pendingData.images.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    createProperty.mutate(
      { data: { ...pendingData, images } as any },
      {
        onSuccess: () => {
          toast({ title: "Propriété publiée avec succès !" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardPropertiesQueryKey() });
          setLocation("/pro/properties");
        },
        onError: () => {
          toast({ title: "Erreur lors de la publication", variant: "destructive" });
          setShowPricing(false);
        },
      }
    );
  };

  return (
    <ProLayout>
      {showPricing && (
        <PricingModal
          onConfirm={handleConfirm}
          onCancel={() => setShowPricing(false)}
          isPending={createProperty.isPending}
        />
      )}

      <div className="mb-6 flex items-center">
        <Link href="/pro/properties" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: NAVY }}>Nouvelle propriété</h1>
          <p className="text-gray-500">Ajouter un bien à votre portefeuille.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">

          {/* Infos principales */}
          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle style={{ color: NAVY }}>Informations principales</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'annonce *</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" placeholder="Ex: Superbe appartement haussmannien..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de bien *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-none focus:ring-[#f57c00]">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Appartement</SelectItem>
                        <SelectItem value="house">Maison</SelectItem>
                        <SelectItem value="co-living">Coliving</SelectItem>
                        <SelectItem value="commercial">Local commercial</SelectItem>
                        <SelectItem value="office">Bureau</SelectItem>
                        <SelectItem value="industrial">Industriel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loyer mensuel (CA$) *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[150px] rounded-none focus-visible:ring-[#f57c00]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle style={{ color: NAVY }}>Localisation</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse complète *</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville *</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays *</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques */}
          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle style={{ color: NAVY }}>Caractéristiques</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bedrooms" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chambres</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bathrooms" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salles de bain</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* Médias */}
          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle style={{ color: NAVY }}>Médias</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                // @ts-ignore
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URLs des images (séparées par des virgules)</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-none focus-visible:ring-[#f57c00]" placeholder="https://..., https://..." />
                    </FormControl>
                    <p className="text-xs text-gray-500">Pour le prototype : /images/hero-interior.png</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-4">
            <Link href="/pro/properties">
              <Button type="button" variant="outline" className="rounded-none border-gray-300">Annuler</Button>
            </Link>
            <Button
              type="submit"
              className="rounded-none gap-2 font-bold text-white px-8"
              style={{ background: YELLOW, color: "#1A1A1A" }}
            >
              <Megaphone className="h-4 w-4" />
              Publier l'annonce
            </Button>
          </div>
        </form>
      </Form>
    </ProLayout>
  );
}
