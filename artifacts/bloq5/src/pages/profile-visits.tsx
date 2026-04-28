import UserLayout from "@/components/layout/user-layout";
import { useListVisits } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Video, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
type VisitStatus = "scheduled" | "completed" | "cancelled";

export default function ProfileVisitsPage() {
  const { data: visits, isLoading } = useListVisits();

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">Planifiée</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider">Terminée</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">Annulée</span>;
      default:
        return null;
    }
  };

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Mes visites</h1>
        <p className="text-gray-500">Gérez vos rendez-vous de visite.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : !visits || visits.length === 0 ? (
        <div className="text-center py-20 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]">
          <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune visite</h3>
          <p className="text-gray-500 mb-6">Vous n'avez aucune visite planifiée.</p>
          <Link href="/properties" className="inline-flex h-10 items-center justify-center rounded-none bg-[#1a237e] px-6 text-sm font-medium text-white transition-colors hover:bg-[#0d47a1]">
            Rechercher un bien
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visits.map((visit) => (
            <Card key={visit.id} className="rounded-none border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] overflow-hidden flex flex-col">
              <div className="h-32 relative bg-gray-100 shrink-0">
                <img 
                  src={visit.propertyImage || "/images/hero-interior.png"} 
                  alt={visit.propertyTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {getStatusBadge(visit.status)}
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center ${visit.type === 'virtual' ? 'bg-[#f57c00] text-white' : 'bg-gray-800 text-white'}`}>
                    {visit.type === 'virtual' ? <Video className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                    {visit.type === 'virtual' ? 'Virtuelle' : 'Sur place'}
                  </span>
                </div>
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <Link href={`/properties/${visit.propertyId}`}>
                  <h3 className="font-bold text-[#1a237e] dark:text-white hover:text-[#f57c00] transition-colors mb-4 line-clamp-1">
                    {visit.propertyTitle}
                  </h3>
                </Link>
                <div className="flex items-start gap-3 mt-auto bg-gray-50 dark:bg-[#1a1a1a] p-4 border border-gray-100 dark:border-gray-800">
                  <Calendar className="h-5 w-5 text-[#f57c00] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {format(new Date(visit.scheduledDate), 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                    <p className="text-gray-500 text-sm">
                      à {format(new Date(visit.scheduledDate), 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </UserLayout>
  );
}