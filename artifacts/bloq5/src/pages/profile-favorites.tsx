import UserLayout from "@/components/layout/user-layout";
import { useListFavorites, useRemoveFavorite, getListFavoritesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ProfileFavoritesPage() {
  const { data: favorites, isLoading } = useListFavorites();
  const removeFavorite = useRemoveFavorite();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRemove = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    removeFavorite.mutate({ propertyId: id }, {
      onSuccess: () => {
        toast({ title: "Retiré des favoris" });
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      }
    });
  };

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Mes favoris</h1>
        <p className="text-gray-500">Les biens immobiliers que vous avez sauvegardés.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full" />
          ))}
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <div className="text-center py-20 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]">
          <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun favori</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore sauvegardé de biens immobiliers.</p>
          <Link href="/properties" className="inline-flex h-10 items-center justify-center rounded-none bg-[#1a237e] px-6 text-sm font-medium text-white transition-colors hover:bg-[#0d47a1]">
            Explorer les annonces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((property) => (
            <div key={property.id} className="relative group">
              <PropertyCard property={property} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 z-10 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleRemove(e, property.id)}
                disabled={removeFavorite.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  );
}