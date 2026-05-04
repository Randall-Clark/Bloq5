import ProLayout from "@/components/layout/pro-layout";
import { useGetDashboardProperties, useDeleteProperty, useUpdateProperty, getGetDashboardPropertiesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Eye, MessageSquare, Building2, Pencil } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type PropertyStatus = "available" | "rented" | "unavailable";

const STATUS_OPTS: { value: PropertyStatus; label: string; cls: string }[] = [
  { value: "available",   label: "Disponible",   cls: "bg-green-100 text-green-800" },
  { value: "rented",      label: "Loué",          cls: "bg-blue-100 text-blue-800" },
  { value: "unavailable", label: "Indisponible",  cls: "bg-gray-100 text-gray-700" },
];

export default function ProPropertiesPage() {
  const { data: properties, isLoading } = useGetDashboardProperties();
  const deleteProperty = useDeleteProperty();
  const updateProperty = useUpdateProperty();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette propriété ?")) {
      deleteProperty.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Propriété supprimée" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardPropertiesQueryKey() });
        },
      });
    }
  };

  const handleStatusChange = (id: number, status: PropertyStatus) => {
    updateProperty.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Statut mis à jour" });
        queryClient.invalidateQueries({ queryKey: getGetDashboardPropertiesQueryKey() });
      },
    });
  };

  return (
    <ProLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">Mes propriétés</h1>
          <p className="text-gray-500">Gérez votre portefeuille immobilier.</p>
        </div>
        <Link href="/pro/properties/new">
          <Button className="bg-[#F5A623] hover:bg-[#e09520] text-white rounded-xl h-11 px-6 font-bold gap-2">
            <Plus className="h-4 w-4" /> Ajouter un bien
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 bg-white border border-gray-200 rounded-xl p-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : !properties || properties.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-xl">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune propriété</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter votre premier bien immobilier.</p>
          <Link href="/pro/properties/new">
            <Button className="bg-[#1a237e] hover:bg-[#0d47a1] text-white rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Ajouter maintenant
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 border-b border-gray-200">
                <TableRow>
                  <TableHead className="font-bold text-[#1a237e] min-w-[260px]">Bien</TableHead>
                  <TableHead className="font-bold text-[#1a237e]">Statut</TableHead>
                  <TableHead className="font-bold text-[#1a237e] text-right">Loyer / mois</TableHead>
                  <TableHead className="font-bold text-[#1a237e] text-center">Vues</TableHead>
                  <TableHead className="font-bold text-[#1a237e] text-center">Demandes</TableHead>
                  <TableHead className="font-bold text-[#1a237e] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const statusInfo = STATUS_OPTS.find(s => s.value === property.status);
                  return (
                    <TableRow key={property.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                            <img
                              src={property.images[0] || "/images/property-office.png"}
                              alt={property.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 line-clamp-1 text-sm">{property.title}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{property.address}, {property.city}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select value={property.status} onValueChange={(val) => handleStatusChange(property.id, val as PropertyStatus)}>
                          <SelectTrigger className={`h-7 w-36 rounded-full border-0 text-xs font-semibold px-3 ${statusInfo?.cls ?? ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTS.map(o => (
                              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#F5A623] text-sm">
                        {Number(property.price).toLocaleString("fr-CA")} $
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                          <Eye className="h-3.5 w-3.5" /> {property.views}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                          <MessageSquare className="h-3.5 w-3.5" /> {property.activeRequests}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-[#1a237e] hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/pro/properties/${property.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-[#F5A623] hover:bg-orange-50">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(property.id)}
                            disabled={deleteProperty.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
            {properties.length} bien{properties.length > 1 ? "s" : ""} dans votre portefeuille
          </div>
        </div>
      )}
    </ProLayout>
  );
}