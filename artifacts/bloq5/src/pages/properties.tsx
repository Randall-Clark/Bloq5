import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import PublicLayout from "@/components/layout/public-layout";
import { PropertyCard } from "@/components/ui/property-card";
import { useListProperties } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
type ListPropertiesType = "house" | "apartment" | "co-living" | "commercial" | "office" | "industrial";

export default function PropertiesPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [type, setType] = useState<ListPropertiesType | "all">(
    (searchParams.get("type") as ListPropertiesType) || "all"
  );
  
  const params = {
    city: city || undefined,
    type: (type === "all" ? undefined : type) as ListPropertiesType | undefined,
    limit: 12,
  };

  const { data, isLoading } = useListProperties(params);

  // Update URL when filters change
  useEffect(() => {
    const url = new URL(window.location.href);
    if (city) url.searchParams.set("city", city);
    else url.searchParams.delete("city");
    
    if (type) url.searchParams.set("type", type);
    else url.searchParams.delete("type");
    
    window.history.replaceState({}, "", url.toString());
  }, [city, type]);

  return (
    <PublicLayout>
      <div className="bg-gray-50 dark:bg-[#0a0a0a] min-h-[calc(100vh-80px)] py-12">
        <div className="container mx-auto px-6">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white dark:bg-[#111] p-6 border border-gray-200 dark:border-gray-800 rounded-none">
              <div>
                <h3 className="text-lg font-bold text-[#1a237e] dark:text-white flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-5 w-5 text-[#f57c00]" />
                  Filtres
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Localisation</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Ville" 
                      className="pl-9 rounded-none border-gray-300 focus-visible:ring-[#f57c00]"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type de bien</label>
                  <Select value={type} onValueChange={(val) => setType(val as ListPropertiesType | "all")}>
                    <SelectTrigger className="rounded-none border-gray-300 focus:ring-[#f57c00]">
                      <SelectValue placeholder="Tous types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="apartment">Appartement</SelectItem>
                      <SelectItem value="house">Maison</SelectItem>
                      <SelectItem value="co-living">Coliving</SelectItem>
                      <SelectItem value="commercial">Local Commercial</SelectItem>
                      <SelectItem value="office">Bureau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full rounded-none border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => {
                    setCity("");
                    setType("all");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 w-full">
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[#1a237e] dark:text-white">Biens disponibles</h1>
                <span className="text-sm text-gray-500 font-medium">
                  {isLoading ? "Chargement..." : `${data?.total || 0} résultat(s)`}
                </span>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-[400px] w-full rounded-none" />
                  ))}
                </div>
              ) : data?.data && data.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.data.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun bien trouvé</h3>
                  <p className="text-gray-500">Essayez de modifier vos filtres de recherche.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}