import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
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

const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  phone: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading } = useGetProfile();
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

  const stats = [
    { label: "Demandes actives", value: "3", icon: MessageSquare, href: "/profile/requests" },
    { label: "Favoris", value: "12", icon: Heart, href: "/profile/favorites" },
    { label: "Visites prévues", value: "1", icon: Calendar, href: "/profile/visits" },
  ];

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Bonjour, {profile?.firstName}</h1>
        <p className="text-gray-500">Bienvenue dans votre espace locataire.</p>
      </div>

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

      <Card className="rounded-none border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111]">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-6">
          <CardTitle className="flex items-center gap-2 text-[#1a237e] dark:text-white">
            <User className="h-5 w-5 text-[#f57c00]" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Mettez à jour vos coordonnées.</CardDescription>
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
                        <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" />
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
                        <Input {...field} className="rounded-none focus-visible:ring-[#f57c00]" />
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
                      <Input {...field} value={field.value || ""} className="rounded-none focus-visible:ring-[#f57c00]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input value={profile?.email || ""} disabled className="rounded-none bg-gray-50 text-gray-500" />
                <p className="text-xs text-gray-500">L'email ne peut pas être modifié.</p>
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