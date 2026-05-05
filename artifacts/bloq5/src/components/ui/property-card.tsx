import React from "react";
import { Link } from "wouter";
import { Property } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Bed, Bath, Square, MapPin } from "lucide-react";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group cursor-pointer rounded-none border-0 shadow-none bg-transparent overflow-hidden h-full flex flex-col">
        <div className="relative h-64 overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
          <img 
            src={property.images[0] || "/images/hero-interior.png"} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 bg-white dark:bg-[#1a1a1a] px-3 py-1 text-xs font-bold tracking-wider text-[#1a237e] dark:text-[#f57c00]">
            {property.type.toUpperCase()}
          </div>
          {property.status !== 'available' && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 text-xs font-bold tracking-wider">
              {property.status === 'rented' ? 'LOUÉ' : 'INDISPONIBLE'}
            </div>
          )}
        </div>
        <CardContent className="p-0 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2 gap-4">
            <h3 className="text-xl font-bold text-[#1a237e] dark:text-white group-hover:text-[#f57c00] transition-colors line-clamp-1">{property.title}</h3>
            <span className="text-lg font-bold text-[#f57c00] whitespace-nowrap">{Number(property.price).toLocaleString("fr-CA")} CA$<span className="text-sm text-gray-500 font-normal">/mois</span></span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{property.city}</span>
          </div>
          
          <div className="mt-auto flex items-center text-sm text-gray-600 dark:text-gray-300 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {property.bedrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-gray-400" />
                <span>{property.bedrooms} ch.</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-gray-400" />
                <span>{property.bathrooms} sdb.</span>
              </div>
            )}
            {property.area != null && (
              <div className="flex items-center gap-1.5">
                <Square className="h-4 w-4 text-gray-400" />
                <span>{property.area} m²</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}