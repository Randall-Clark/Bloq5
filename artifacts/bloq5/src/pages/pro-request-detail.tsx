import ProLayout from "@/components/layout/pro-layout";
import { 
  useGetRentalRequest, 
  useGetConversationMessages, 
  useSendMessage, 
  useUpdateRentalRequestStatus, 
  useEndConversation,
  getGetConversationMessagesQueryKey,
  getGetRentalRequestQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Send, User, Phone, Mail, FileCheck2, Ban } from "lucide-react";
type UpdateRentalRequestStatusBodyStatus = "pending" | "in_review" | "awaiting_documents" | "approved" | "rejected";

export default function ProRequestDetailPage() {
  const [, params] = useRoute("/pro/requests/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: request, isLoading: requestLoading } = useGetRentalRequest(id, { query: { enabled: !!id, queryKey: getGetRentalRequestQueryKey(id) } });
  const { data: messages, isLoading: messagesLoading } = useGetConversationMessages(id, { query: { enabled: !!id, queryKey: getGetConversationMessagesQueryKey(id) } });
  
  const sendMessage = useSendMessage();
  const updateStatus = useUpdateRentalRequestStatus();
  const endConv = useEndConversation();
  
  const [newMessage, setNewMessage] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage.mutate({
      data: { requestId: id, content: newMessage }
    }, {
      onSuccess: () => {
        setNewMessage("");
        queryClient.invalidateQueries({ queryKey: getGetConversationMessagesQueryKey(id) });
      }
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({
      id,
      data: { status: newStatus as UpdateRentalRequestStatusBodyStatus, note: statusNote || undefined }
    }, {
      onSuccess: () => {
        toast({ title: "Statut mis à jour avec succès" });
        queryClient.invalidateQueries({ queryKey: getGetRentalRequestQueryKey(id) });
      }
    });
  };

  const handleEndConversation = () => {
    if (confirm("Êtes-vous sûr de vouloir clôturer cette conversation ?")) {
      endConv.mutate({ requestId: id }, {
        onSuccess: () => {
          toast({ title: "Conversation clôturée" });
          queryClient.invalidateQueries({ queryKey: getGetRentalRequestQueryKey(id) });
        }
      });
    }
  };

  if (requestLoading) {
    return (
      <ProLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="col-span-1 h-96" />
            <Skeleton className="col-span-2 h-[600px]" />
          </div>
        </div>
      </ProLayout>
    );
  }

  if (!request) return null;

  return (
    <ProLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/pro/requests" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a237e]">Dossier: {request.applicantName}</h1>
            <Link href={`/properties/${request.propertyId}`} className="text-sm text-gray-500 hover:text-[#f57c00]">
              {request.propertyTitle}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={request.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] rounded-none border-gray-300 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="in_review">En examen</SelectItem>
              <SelectItem value="awaiting_documents">Docs requis</SelectItem>
              <SelectItem value="approved" className="text-green-600 font-bold">Approuver</SelectItem>
              <SelectItem value="rejected" className="text-red-600 font-bold">Refuser</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-6">
          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-[#1a237e] flex items-center gap-2">
                <User className="h-5 w-5 text-[#f57c00]" /> Informations candidat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-bold text-gray-900">{request.applicantName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${request.applicantEmail}`} className="flex items-center text-[#1a237e] hover:underline">
                  <Mail className="h-4 w-4 mr-2" /> {request.applicantEmail}
                </a>
              </div>
              {request.applicantPhone && (
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <a href={`tel:${request.applicantPhone}`} className="flex items-center text-[#1a237e] hover:underline">
                    <Phone className="h-4 w-4 mr-2" /> {request.applicantPhone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Date de la demande</p>
                <p className="text-gray-900">{format(new Date(request.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-[#1a237e] flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[#f57c00]" /> Message initial
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 whitespace-pre-line italic">"{request.message || "Aucun message fourni"}"</p>
            </CardContent>
          </Card>
        </div>

        {/* Messaging Column */}
        <div className="lg:col-span-2">
          <Card className="rounded-none border-gray-200 shadow-sm flex flex-col h-[650px]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="font-bold text-[#1a237e]">Communication avec le candidat</h3>
              {!request.conversationEnded && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEndConversation}
                  disabled={endConv.isPending}
                  className="rounded-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Ban className="h-4 w-4 mr-2" /> Clôturer
                </Button>
              )}
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/50">
              {messagesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-3/4 rounded-xl" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.senderId !== request.userId; // Owner is sender if senderId != applicant
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-[#1a237e] text-white rounded-tr-sm shadow-md' : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm'}`}>
                        {msg.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1.5 px-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })} 
                        <span className="mx-1">•</span> 
                        Expire {formatDistanceToNow(new Date(msg.expiresAt), { locale: fr, addSuffix: true })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 h-full">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Send className="h-5 w-5 text-gray-300" />
                  </div>
                  <p>Demandez des documents ou posez vos questions au candidat.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Écrivez votre message..." 
                  className="min-h-[60px] resize-none rounded-none focus-visible:ring-[#f57c00] border-gray-300"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={request.conversationEnded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  className="h-auto rounded-none bg-[#f57c00] hover:bg-[#e65100] px-8"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessage.isPending || request.conversationEnded}
                >
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </div>
              {request.conversationEnded && (
                <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm flex items-center justify-center font-medium">
                  <Ban className="h-4 w-4 mr-2" />
                  Cette conversation est clôturée et n'accepte plus de nouveaux messages.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ProLayout>
  );
}