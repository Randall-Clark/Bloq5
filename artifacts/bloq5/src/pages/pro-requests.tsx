import ProLayout from "@/components/layout/pro-layout";
import { useListPropertyRentalRequests } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import { ChevronRight, MessageSquare } from "lucide-react";
type RentalRequestStatus = "pending" | "in_review" | "awaiting_documents" | "approved" | "rejected";

export default function ProRequestsPage() {
  // Pass 0 to get all requests for dashboard
  const { data: requests, isLoading } = useListPropertyRentalRequests(0);

  const getStatusBadge = (status: RentalRequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 rounded-none hover:bg-orange-100">En attente</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 rounded-none hover:bg-blue-100">En examen</Badge>;
      case 'awaiting_documents':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 rounded-none hover:bg-purple-100">Docs requis</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200 rounded-none hover:bg-green-100">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200 rounded-none hover:bg-red-100">Refusée</Badge>;
      default:
        return null;
    }
  };

  return (
    <ProLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Demandes de location</h1>
        <p className="text-gray-500">Traitez les dossiers des candidats locataires.</p>
      </div>

      {isLoading ? (
        <Card className="rounded-none border-gray-200">
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : !requests || requests.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune demande</h3>
          <p className="text-gray-500">Vos biens n'ont pas encore reçu de demandes de location.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <TableRow>
                <TableHead className="font-bold text-[#1a237e]">Date</TableHead>
                <TableHead className="font-bold text-[#1a237e]">Candidat</TableHead>
                <TableHead className="font-bold text-[#1a237e]">Bien immobilier</TableHead>
                <TableHead className="font-bold text-[#1a237e]">Statut</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} className="hover:bg-gray-50 cursor-pointer group">
                  <TableCell className="text-gray-500">
                    {format(new Date(request.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-gray-900">{request.applicantName}</p>
                    <p className="text-sm text-gray-500">{request.applicantEmail}</p>
                  </TableCell>
                  <TableCell>
                    <Link href={`/properties/${request.propertyId}`} className="hover:text-[#f57c00] font-medium text-[#1a237e] transition-colors line-clamp-1">
                      {request.propertyTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/pro/requests/${request.id}`}>
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-200 text-gray-400 group-hover:text-[#f57c00] transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </ProLayout>
  );
}