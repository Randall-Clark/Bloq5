import UserLayout from "@/components/layout/user-layout";
import { useListRentalRequests } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { MessageSquare, ArrowRight, Clock, FileText, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
type RentalRequestStatus = "pending" | "in_review" | "awaiting_documents" | "approved" | "rejected";

const statusConfig: Record<RentalRequestStatus, { label: string, color: string, bg: string, icon: any }> = {
  pending: { label: "En attente", color: "text-[#f57c00]", bg: "bg-orange-50 dark:bg-orange-950/30", icon: Clock },
  in_review: { label: "En cours d'examen", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", icon: Clock },
  awaiting_documents: { label: "Documents requis", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30", icon: FileText },
  approved: { label: "Approuvée", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30", icon: CheckCircle },
  rejected: { label: "Refusée", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", icon: XCircle },
};

export default function ProfileRequestsPage() {
  const { data: requests, isLoading } = useListRentalRequests();

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Mes demandes</h1>
        <p className="text-gray-500">Suivez l'état de vos dossiers de location.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="text-center py-20 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]">
          <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune demande en cours</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore déposé de dossier de location.</p>
          <Link href="/properties" className="inline-flex h-10 items-center justify-center rounded-none bg-[#1a237e] px-6 text-sm font-medium text-white transition-colors hover:bg-[#0d47a1]">
            Parcourir les biens
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const config = statusConfig[request.status];
            const StatusIcon = config.icon;
            
            return (
              <Link key={request.id} href={`/profile/requests/${request.id}`}>
                <Card className="hover:border-[#1a237e] transition-colors cursor-pointer rounded-none border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] overflow-hidden group">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-32 relative bg-gray-100 shrink-0">
                      <img 
                        src={request.propertyImage || "/images/hero-interior.png"} 
                        alt={request.propertyTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-[#1a237e] dark:text-white group-hover:text-[#f57c00] transition-colors">{request.propertyTitle}</h3>
                          <p className="text-sm text-gray-500">Demande envoyée le {format(new Date(request.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider ${config.bg} ${config.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {request.message ? "Message inclus" : "Dossier standard"}
                        </span>
                        <span className="text-sm font-bold text-[#f57c00] flex items-center group-hover:underline">
                          Voir les détails <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </UserLayout>
  );
}