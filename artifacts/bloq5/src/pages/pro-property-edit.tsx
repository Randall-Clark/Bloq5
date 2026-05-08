import ProLayout from "@/components/layout/pro-layout";
import { useUpdateProperty, useGetProperty, getGetDashboardPropertiesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";

const editSchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string().min(20, "La description est trop courte"),
  type: z.enum(["house", "apartment", "co-living", "commercial", "office"]),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  country: z.string().min(2, "Le pays est requis"),
  price: z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
  status: z.enum(["available", "rented", "unavailable"]),
  bedrooms: z.coerce.number().optional().nullable(),
  bathrooms: z.coerce.number().optional().nullable(),
  area: z.coerce.number().optional().nullable(),
  images: z.string().optional(),
  virtualTourUrl: z.string().optional().nullable(),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function ProPropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const updateProperty = useUpdateProperty();
  const { data: property, isLoading } = useGetProperty(propertyId);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "apartment",
      address: "",
      city: "",
      country: "Canada",
      price: undefined,
      status: "available",
      bedrooms: undefined,
      bathrooms: undefined,
      area: undefined,
      images: "",
      virtualTourUrl: "",
    },
  });

  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title ?? "",
        description: property.description ?? "",
        type: (property.type as EditFormValues["type"]) ?? "apartment",
        address: property.address ?? "",
        city: property.city ?? "",
        country: property.country ?? "Canada",
        price: property.price ? Number(property.price) : undefined,
        status: (property.status as EditFormValues["status"]) ?? "available",
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        area: property.area ? Number(property.area) : undefined,
        images: Array.isArray(property.images) ? property.images.join(", ") : "",
        virtualTourUrl: property.virtualTourUrl ?? "",
      });
    }
  }, [property, form]);

  const onSubmit = (data: EditFormValues) => {
    const images = data.images ? data.images.split(",").map((s) => s.trim()).filter(Boolean) : [];
    updateProperty.mutate(
      { id: propertyId, data: { ...data, images } as any },
      {
        onSuccess: () => {
          toast({ title: "Propriété mise à jour avec succès" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardPropertiesQueryKey() });
          setLocation("/pro/properties");
        },
        onError: () => {
          toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
        },
      }
    );
  };

  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    rented: "bg-blue-100 text-blue-800",
    unavailable: "bg-gray-100 text-gray-800",
  };
  const statusLabels: Record<string, string> = {
    available: "Disponible",
    rented: "Loué",
    unavailable: "Indisponible",
  };

  return (
    <ProLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/pro/properties" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#1a237e]">Modifier le bien</h1>
            {property && (
              <Badge className={`${statusColors[property.status]} rounded-full border-0`}>
                {statusLabels[property.status]}
              </Badge>
            )}
          </div>
          <p className="text-gray-500">{property?.title || "Chargement…"}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
            <Card className="rounded-xl border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
                <CardTitle className="text-[#1a237e]">Informations principales</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'annonce *</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl focus:ring-[#F5A623]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Appartement</SelectItem>
                          <SelectItem value="house">Maison</SelectItem>
                          <SelectItem value="co-living">Coliving</SelectItem>
                          <SelectItem value="commercial">Local commercial</SelectItem>
                          <SelectItem value="office">Bureau</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loyer mensuel (CA$) *</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} className="rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl focus:ring-[#F5A623]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Disponible</SelectItem>
                          <SelectItem value="rented">Loué</SelectItem>
                          <SelectItem value="unavailable">Indisponible</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl><Textarea {...field} className="min-h-[140px] rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
                <CardTitle className="text-[#1a237e]">Localisation</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse complète *</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville *</FormLabel>
                      <FormControl><Input {...field} className="rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays *</FormLabel>
                      <FormControl><Input {...field} className="rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
                <CardTitle className="text-[#1a237e]">Caractéristiques</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surface (m²)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} className="rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bedrooms" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chambres</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} className="rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bathrooms" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salles de bain</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} className="rounded-xl focus-visible:ring-[#F5A623]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
                <CardTitle className="text-[#1a237e]">Photos & médias</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField control={form.control} name="images" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URLs des photos (séparées par des virgules)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} className="rounded-xl focus-visible:ring-[#F5A623] min-h-[100px]" placeholder="https://..., https://..." />
                    </FormControl>
                    <p className="text-xs text-gray-500">Collez les URLs directement depuis votre hébergeur d'images (Supabase Storage, Cloudinary, etc.)</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="virtualTourUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visite virtuelle (URL Matterport ou autre)</FormLabel>
                    <FormControl><Input {...field} value={field.value ?? ""} className="rounded-xl focus-visible:ring-[#F5A623]" placeholder="https://my.matterport.com/..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pb-8">
              <Link href="/pro/properties">
                <Button type="button" variant="outline" className="rounded-xl border-gray-300 px-6">Annuler</Button>
              </Link>
              <Button type="submit" disabled={updateProperty.isPending} className="rounded-xl bg-[#F5A623] hover:bg-[#e09520] text-white px-8 font-bold">
                {updateProperty.isPending ? "Enregistrement…" : <><Save className="mr-2 h-4 w-4" /> Sauvegarder les modifications</>}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </ProLayout>
  );
}
