import { useRoute } from "wouter";
import PublicLayout from "@/components/layout/public-layout";
import { useGetProperty, useCreateRentalRequest, useGetPropertyAvailableDates, getGetPropertyAvailableDatesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Bed, Bath, Square, Calendar as CalendarIcon, ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PropertyDetailPage() {
  const [, params] = useRoute("/properties/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  
  const { data: property, isLoading } = useGetProperty(id, { 
    query: { enabled: !!id, queryKey: ["getProperty", id] as const } 
  });
  
  const { data: availableDates } = useGetPropertyAvailableDates(id, {
    query: { enabled: !!id, queryKey: getGetPropertyAvailableDatesQueryKey(id) }
  });

  const createRequest = useCreateRentalRequest();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate({
      data: {
        propertyId: id,
        ...formData
      }
    }, {
      onSuccess: () => {
        toast({ title: "Dossier envoyé avec succès" });
        setOpen(false);
        setFormData({ applicantName: "", applicantEmail: "", applicantPhone: "", message: "" });
      },
      onError: () => {
        toast({ title: "Erreur lors de l'envoi", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-12">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-[60vh] w-full mb-8" />
          <div className="grid grid-cols-3 gap-8">
            <Skeleton className="col-span-2 h-64" />
            <Skeleton className="col-span-1 h-96" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!property) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-bold text-[#1a237e] mb-4">Bien introuvable</h2>
          <Link href="/properties">
            <Button className="bg-[#f57c00] hover:bg-[#e65100]">Retour aux annonces</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24">
        {/* Gallery */}
        <div className="relative h-[60vh] min-h-[500px] w-full bg-gray-100 overflow-hidden">
          <img 
            src={property.images[0] || "/images/hero-interior.png"} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 z-10">
            <Link href="/properties">
              <Button variant="secondary" size="icon" className="bg-white/80 hover:bg-white text-[#1a237e] rounded-none">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-6 pt-12">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Main Content */}
            <div className="flex-1 w-full">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#1a237e] text-white px-3 py-1 text-xs font-bold tracking-wider">
                    {property.type.toUpperCase()}
                  </span>
                  <span className="flex items-center text-gray-500 text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.city}, {property.country}
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-[#1a237e] dark:text-white mb-6 leading-tight">
                  {property.title}
                </h1>
                
                <div className="flex items-center gap-8 py-6 border-y border-gray-200 dark:border-gray-800">
                  {property.bedrooms != null && (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Bed className="h-6 w-6 text-[#f57c00]" />
                      <span className="text-sm font-semibold">{property.bedrooms} Chambres</span>
                    </div>
                  )}
                  {property.bathrooms != null && (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Bath className="h-6 w-6 text-[#f57c00]" />
                      <span className="text-sm font-semibold">{property.bathrooms} Salles de bain</span>
                    </div>
                  )}
                  {property.area != null && (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Square className="h-6 w-6 text-[#f57c00]" />
                      <span className="text-sm font-semibold">{property.area} m²</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-2xl font-bold text-[#1a237e] dark:text-white mb-4">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-[#1a237e] dark:text-white mb-4">Équipements</h3>
                  <div className="flex flex-wrap gap-3">
                    {property.amenities.map((amenity: string) => (
                      <span key={amenity} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 text-sm font-medium">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Sticky */}
            <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-28">
              <Card className="rounded-none border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-[#111]">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wider block mb-2">Loyer mensuel</span>
                    <span className="text-4xl font-extrabold text-[#f57c00]">{property.price}€</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="font-bold text-[#1a237e] dark:text-white">Détails</h4>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Statut</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{property.status === 'available' ? 'Disponible' : 'Loué'}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Référence</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">REF-{property.id}</span>
                    </div>
                  </div>

                  {property.status === 'available' ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full rounded-none h-14 text-base font-bold bg-[#1a237e] hover:bg-[#0d47a1] text-white">
                          Déposer un dossier
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-none border-gray-200 max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-[#1a237e] text-xl">Dossier de location</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Nom complet</Label>
                            <Input 
                              required 
                              value={formData.applicantName}
                              onChange={e => setFormData({...formData, applicantName: e.target.value})}
                              className="rounded-none focus-visible:ring-[#f57c00]" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input 
                              type="email" 
                              required 
                              value={formData.applicantEmail}
                              onChange={e => setFormData({...formData, applicantEmail: e.target.value})}
                              className="rounded-none focus-visible:ring-[#f57c00]" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Téléphone</Label>
                            <Input 
                              value={formData.applicantPhone}
                              onChange={e => setFormData({...formData, applicantPhone: e.target.value})}
                              className="rounded-none focus-visible:ring-[#f57c00]" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea 
                              required
                              value={formData.message}
                              onChange={e => setFormData({...formData, message: e.target.value})}
                              className="rounded-none focus-visible:ring-[#f57c00] min-h-[100px]" 
                              placeholder="Présentez votre situation..."
                            />
                          </div>
                          <Button type="submit" disabled={createRequest.isPending} className="w-full bg-[#1a237e] hover:bg-[#0d47a1] rounded-none h-12 mt-2">
                            {createRequest.isPending ? "Envoi..." : <><Send className="mr-2 h-4 w-4" /> Envoyer mon dossier</>}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button disabled className="w-full rounded-none h-14 text-base font-bold bg-gray-300 text-gray-500">
                      Bien indisponible
                    </Button>
                  )}

                  <div className="mt-6 flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{availableDates?.length ? `${availableDates.length} dates de visite disponibles` : 'Contactez le propriétaire pour visiter'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}