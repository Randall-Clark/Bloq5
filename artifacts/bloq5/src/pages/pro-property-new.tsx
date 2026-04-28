import ProLayout from "@/components/layout/pro-layout";
import { useCreateProperty, getGetDashboardPropertiesQueryKey } from "@workspace/api-client-react";
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
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";

const propertySchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string().min(20, "La description est trop courte"),
  type: z.enum(["house", "apartment", "co-living", "commercial", "office", "industrial"]),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  country: z.string().min(2, "Le pays est requis"),
  price: z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
  bedrooms: z.coerce.number().optional().nullable(),
  bathrooms: z.coerce.number().optional().nullable(),
  area: z.coerce.number().optional().nullable(),
  images: z.string().optional(),
  virtualTourUrl: z.string().optional().nullable(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function ProPropertyNewPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createProperty = useCreateProperty();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      type: "apartment",
      address: "",
      city: "",
      country: "France",
      price: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      area: undefined,
      // @ts-ignore - using string for input, transform handles it
      images: "",
      virtualTourUrl: "",
    }
  });

  const onSubmit = (data: PropertyFormValues) => {
    const images = data.images ? data.images.split(',').map(s => s.trim()).filter(Boolean) : [];
    createProperty.mutate({ data: { ...data, images } as any }, {
      onSuccess: () => {
        toast({ title: "Propriété ajoutée avec succès" });
        queryClient.invalidateQueries({ queryKey: getGetDashboardPropertiesQueryKey() });
        setLocation("/pro/properties");
      },
      onError: () => {
        toast({ title: "Erreur lors de l'ajout", variant: "destructive" });
      }
    });
  };

  return (
    <ProLayout>
      <div className="mb-6 flex items-center">
        <Link href="/pro/properties" className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Nouvelle propriété</h1>
          <p className="text-gray-500">Ajouter un bien à votre portefeuille.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-[#1a237e]">Informations principales</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'annonce *</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" placeholder="Ex: Superbe appartement haussmannien..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
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
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loyer mensuel (€) *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[150px] rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-[#1a237e]">Localisation</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse complète *</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville *</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays *</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-[#1a237e]">Caractéristiques</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surface (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chambres</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salles de bain</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-[#1a237e]">Médias</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                // @ts-ignore
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URLs des images (séparées par des virgules) *</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-none focus-visible:ring-[#f57c00]" placeholder="https://..., https://..." />
                    </FormControl>
                    <p className="text-xs text-gray-500">Pour le prototype, vous pouvez utiliser: /images/hero-interior.png</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/pro/properties">
              <Button type="button" variant="outline" className="rounded-none border-gray-300">Annuler</Button>
            </Link>
            <Button type="submit" disabled={createProperty.isPending} className="rounded-none bg-[#f57c00] hover:bg-[#e65100] text-white px-8">
              {createProperty.isPending ? "Enregistrement..." : <><Save className="mr-2 h-4 w-4" /> Enregistrer le bien</>}
            </Button>
          </div>
        </form>
      </Form>
    </ProLayout>
  );
}