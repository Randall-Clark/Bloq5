import {
  useGetProfile,
  useUpdateProfile,
  getGetProfileQueryKey,
  useListRentalRequests,
  useListFavorites,
  useListVisits,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import UserLayout from "@/components/layout/user-layout";
import { User, MessageSquare, Heart, Calendar, Loader2, Building2, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import { authClient } from "@/lib/auth-client";

const YELLOW = "#F5A623";
const NAVY   = "#1A237E";

const profileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName:  z.string().min(1, "Le nom est requis"),
  phone:     z.string().optional().nullable(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

function ProButton({ role }: { role: string }) {
  const isPro = role === "owner" || role === "manager";

  if (isPro) {
    return (
      <Link href="/pro/dashboard">
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: NAVY, color: "#fff" }}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard Pro
        </span>
      </Link>
    );
  }

  return (
    <Link href="/pro">
      <span
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
        style={{ background: YELLOW, color: "#1A1A1A" }}
      >
        <Building2 className="w-4 h-4" />
        Devenir Pro
      </span>
    </Link>
  );
}

export default function ProfilePage() {
  const { toast }      = useToast();
  const queryClient    = useQueryClient();
  const { data: session } = authClient.useSession();

  const { data: profile,       isLoading: pL } = useGetProfile();
  const { data: requestsData,  isLoading: rL } = useListRentalRequests();
  const { data: favoritesData, isLoading: fL } = useListFavorites();
  const { data: visitsData,    isLoading: vL } = useListVisits();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName || "",
      lastName:  profile?.lastName  || "",
      phone:     profile?.phone     || "",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfile.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Profil mis à jour avec succès" });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
      onError: () => {
        toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
      },
    });
  }

  if (pL || rL || fL || vL) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: YELLOW }} />
        </div>
      </UserLayout>
    );
  }

  const cnt = (d: unknown) =>
    Array.isArray(d) ? d.length : ((d as any)?.data?.length ?? 0);
  const requestsCount  = cnt(requestsData);
  const favoritesCount = cnt(favoritesData);
  const visitsCount    = cnt(visitsData);
  const hasStats       = requestsCount > 0 || favoritesCount > 0 || visitsCount > 0;

  const displayName = profile?.firstName || session?.user?.name?.split(" ")[0] || null;
  const role = profile?.role ?? "tenant";

  const stats = [
    { label: "Demandes actives", value: requestsCount,  icon: MessageSquare, href: "/profile/requests"  },
    { label: "Favoris",          value: favoritesCount, icon: Heart,         href: "/profile/favorites" },
    { label: "Visites prévues",  value: visitsCount,    icon: Calendar,      href: "/profile/visits"    },
  ];

  return (
    <UserLayout>

      {/* Header row: greeting + Pro button */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
            {displayName ? `Bonjour, ${displayName} 👋` : "Bienvenue sur bloq5"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre profil et suivez vos activités.</p>
        </div>
        {profile && <ProButton role={role} />}
      </div>

      {/* Stats cards — only when real data exists */}
      {hasStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.href} href={stat.href}>
              <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-[#F5A623] transition-colors cursor-pointer">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold" style={{ color: NAVY }}>{stat.value}</p>
                </div>
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#FFF8EE" }}>
                  <stat.icon className="w-5 h-5" style={{ color: YELLOW }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Profile form card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FFF8EE" }}>
            <User className="w-5 h-5" style={{ color: YELLOW }} />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Informations personnelles</h2>
            <p className="text-xs text-gray-400">Complétez vos coordonnées pour faciliter vos demandes.</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-5 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
              <input
                {...form.register("firstName")}
                placeholder="Jean"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-11 px-3.5 text-sm transition-colors"
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input
                {...form.register("lastName")}
                placeholder="Dupont"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-11 px-3.5 text-sm transition-colors"
              />
              {form.formState.errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <input
              {...form.register("phone")}
              placeholder="+1 514 000 0000"
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-lg h-11 px-3.5 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
            <input
              value={profile?.email || session?.user?.email || ""}
              disabled
              className="w-full bg-gray-100 border border-gray-200 rounded-lg h-11 px-3.5 text-sm text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">L'adresse e-mail ne peut pas être modifiée.</p>
          </div>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {updateProfile.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </UserLayout>
  );
}
