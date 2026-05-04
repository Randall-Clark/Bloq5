import { useGetProfile, useUpdateProfile, getGetProfileQueryKey, useListRentalRequests, useListFavorites, useListVisits } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import UserLayout from "@/components/layout/user-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MessageSquare, Heart, Calendar } from "lucide-react";
import { Link } from "wouter";
import { authClient } from "@/lib/auth-client";

const profileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: requestsData, isLoading: requestsLoading } = useListRentalRequests();
  const { data: favoritesData, isLoading: favoritesLoading } = useListFavorites();
  const { data: visitsData, isLoading: visitsLoading } = useListVisits();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Profil mis à jour avec succès" });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
      onError: () => {
        toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
      }
    });
  };

  const isLoading = profileLoading || requestsLoading || favoritesLoading || visitsLoading;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </UserLayout>
    );
  }

  // Counts from real DB data
  const requestsCount = Array.isArray(requestsData) ? requestsData.length : ((requestsData as any)?.data?.length ?? 0);
  const favoritesCount = Array.isArray(favoritesData) ? favoritesData.length : ((favoritesData as any)?.data?.length ?? 0);
  const visitsCount = Array.isArray(visitsData) ? visitsData.length : ((visitsData as any)?.data?.length ?? 0);

  // Greeting: use profile name if set, fall back to session name
  const displayName = profile?.firstName || session?.user?.name?.split(" ")[0] || null;

  const stats = [
    { label: "Demandes actives", value: requestsCount, icon: MessageSquare, href: "/profile/requests" },
    { label: "Favoris", value: favoritesCount, icon: Heart, href: "/profile/favorites" },
    { label: "Visites prévues", value: visitsCount, icon: Calendar, href: "/profile/visits" },
  ];

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">
          {displayName ? `Bonjour, ${displayName}` : "Bienvenue sur bloq5"}
        </h1>
        <p className="text-gray-500">Bienvenue dans votre espace locataire.</p>
      </div>

      {/* Stats — only show if at least one has data */}
      {(requestsCount > 0 || favoritesCount > 0 || visitsCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <Link key={i} href={stat.href}>
              <Card className="hover:border-[#f57c00] transition-colors cursor-pointer rounded-none border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111]">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#1a237e] dark:text-white">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-50 dark:bg-orange-950/30 rounded-full flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-[#f57c00]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card className="rounded-none border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111]">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-6">
          <CardTitle className="flex items-center gap-2 text-[#1a237e] dark:text-white">
            <User className="h-5 w-5 text-[#f57c00]" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Complétez vos coordonnées pour faciliter vos demandes de location.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jean" className="rounded-none focus-visible:ring-[#f57c00]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dupont" className="rounded-none focus-visible:ring-[#f57c00]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="+1 514 000 0000" className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A1A1A]">Email</label>
                <Input value={profile?.email || session?.user?.email || ""} disabled className="rounded-none bg-gray-50 text-gray-500" />
                <p className="text-xs text-gray-500">L'adresse e-mail ne peut pas être modifiée.</p>
              </div>
              <Button type="submit" disabled={updateProfile.isPending} className="rounded-none bg-[#1a237e] hover:bg-[#0d47a1] text-white">
                {updateProfile.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </UserLayout>
  );
}
