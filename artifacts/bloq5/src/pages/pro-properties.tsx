import ProLayout from "@/components/layout/pro-layout";
import { useGetDashboardProperties, useDeleteProperty, getGetDashboardPropertiesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye, MessageSquare, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type PropertyStatus = "available" | "rented" | "unavailable";

export default function ProPropertiesPage() {
  const { data: properties, isLoading } = useGetDashboardProperties();
  const deleteProperty = useDeleteProperty();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette propriété ?")) {
      deleteProperty.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Propriété supprimée" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardPropertiesQueryKey() });
        }
      });
    }
  };

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 border-green-200 rounded-none">Disponible</Badge>;
      case 'rented':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 rounded-none">Loué</Badge>;
      case 'unavailable':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 rounded-none">Indisponible</Badge>;
      default:
        return null;
    }
  };

  return (
    <ProLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Mes propriétés</h1>
          <p className="text-gray-500">Gérez votre portefeuille immobilier.</p>
        </div>
        <Link href="/pro/properties/new">
          <Button className="bg-[#f57c00] hover:bg-[#e65100] text-white rounded-none h-12 px-6">
            <Plus className="mr-2 h-5 w-5" /> Ajouter un bien
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !properties || properties.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune propriété</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter votre premier bien immobilier.</p>
          <Link href="/pro/properties/new">
            <Button className="bg-[#1a237e] hover:bg-[#0d47a1] text-white rounded-none">
              <Plus className="mr-2 h-4 w-4" /> Ajouter maintenant
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableHead className="w-[300px] font-bold text-[#1a237e] dark:text-gray-300">Bien</TableHead>
                  <TableHead className="font-bold text-[#1a237e] dark:text-gray-300">Statut</TableHead>
                  <TableHead className="font-bold text-[#1a237e] dark:text-gray-300 text-right">Loyer</TableHead>
                  <TableHead className="font-bold text-[#1a237e] dark:text-gray-300 text-center">Vues</TableHead>
                  <TableHead className="font-bold text-[#1a237e] dark:text-gray-300 text-center">Demandes</TableHead>
                  <TableHead className="font-bold text-[#1a237e] dark:text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 bg-gray-100 shrink-0">
                          <img 
                            src={property.images[0] || "/images/property-office.png"} 
                            alt={property.title} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{property.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{property.address}, {property.city}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(property.status)}</TableCell>
                    <TableCell className="text-right font-bold text-[#f57c00]">{property.price}€</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <Eye className="h-4 w-4" /> {property.views}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <MessageSquare className="h-4 w-4" /> {property.activeRequests}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/properties/${property.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-gray-300 text-gray-600 hover:text-[#1a237e]">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none border-gray-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(property.id)}
                          disabled={deleteProperty.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </ProLayout>
  );
}