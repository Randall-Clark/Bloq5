import { useState } from "react";
import ProLayout from "@/components/layout/pro-layout";
import { useListPropertyRentalRequests } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import { ChevronRight, MessageSquare, Search } from "lucide-react";

type RentalRequestStatus = "pending" | "in_review" | "awaiting_documents" | "approved" | "rejected";

const STATUS_BADGE: Record<RentalRequestStatus, { label: string; cls: string }> = {
  pending:             { label: "En attente",   cls: "bg-orange-100 text-orange-800 border-orange-200" },
  in_review:           { label: "En examen",    cls: "bg-blue-100 text-blue-800 border-blue-200" },
  awaiting_documents:  { label: "Docs requis",  cls: "bg-purple-100 text-purple-800 border-purple-200" },
  approved:            { label: "Approuvée",    cls: "bg-green-100 text-green-800 border-green-200" },
  rejected:            { label: "Refusée",      cls: "bg-red-100 text-red-800 border-red-200" },
};

const TABS: { key: RentalRequestStatus | "all"; label: string }[] = [
  { key: "all",                label: "Toutes" },
  { key: "pending",            label: "En attente" },
  { key: "in_review",          label: "En examen" },
  { key: "awaiting_documents", label: "Docs requis" },
  { key: "approved",           label: "Approuvées" },
  { key: "rejected",           label: "Refusées" },
];

export default function ProRequestsPage() {
  const { data: requests, isLoading } = useListPropertyRentalRequests(0);
  const [activeTab, setActiveTab] = useState<RentalRequestStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = (requests ?? []).filter((r) => {
    const matchTab = activeTab === "all" || r.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || r.applicantName?.toLowerCase().includes(q) || r.applicantEmail?.toLowerCase().includes(q) || r.propertyTitle?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const countByStatus = (key: RentalRequestStatus | "all") =>
    key === "all" ? (requests ?? []).length : (requests ?? []).filter((r) => r.status === key).length;

  return (
    <ProLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#1a237e]">Demandes de location</h1>
        <p className="text-gray-500">Traitez les dossiers de vos candidats locataires.</p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map((tab) => {
            const count = countByStatus(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1a237e] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a237e] hover:text-[#1a237e]"
                }`}
              >
                {tab.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un candidat ou bien…"
            className="pl-9 rounded-xl border-gray-200 focus-visible:ring-[#F5A623] w-full sm:w-72"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 bg-white border border-gray-200 rounded-xl p-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-xl">
          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {search ? "Aucun résultat" : "Aucune demande"}
          </h3>
          <p className="text-gray-400 text-sm">
            {search ? `Aucune demande pour « ${search} »` : "Vos biens n'ont pas encore reçu de candidatures."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="font-bold text-[#1a237e] w-32">Date</TableHead>
                <TableHead className="font-bold text-[#1a237e]">Candidat</TableHead>
                <TableHead className="font-bold text-[#1a237e]">Bien immobilier</TableHead>
                <TableHead className="font-bold text-[#1a237e]">Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((request) => {
                const badge = STATUS_BADGE[request.status as RentalRequestStatus];
                return (
                  <TableRow key={request.id} className="hover:bg-gray-50 cursor-pointer group">
                    <TableCell className="text-gray-400 text-sm">
                      {format(new Date(request.createdAt), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a237e]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#1a237e]">{(request.applicantName || "?").charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{request.applicantName}</p>
                          <p className="text-xs text-gray-400">{request.applicantEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/properties/${request.propertyId}`} className="hover:text-[#F5A623] font-medium text-[#1a237e] transition-colors text-sm line-clamp-1">
                        {request.propertyTitle}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {badge && <Badge className={`${badge.cls} rounded-full border text-xs font-medium`}>{badge.label}</Badge>}
                    </TableCell>
                    <TableCell>
                      <Link href={`/pro/requests/${request.id}`}>
                        <div className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 text-gray-300 group-hover:text-[#F5A623] transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtered.length} demande{filtered.length > 1 ? "s" : ""}{activeTab !== "all" || search ? " filtrée" + (filtered.length > 1 ? "s" : "") : " au total"}
          </div>
        </div>
      )}
    </ProLayout>
  );
}