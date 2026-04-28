import { useRoute } from "wouter";
import UserLayout from "@/components/layout/user-layout";
import { useGetRentalRequest, useGetConversationMessages, useSendMessage, getGetConversationMessagesQueryKey, getGetRentalRequestQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, FileText, CheckCircle, XCircle, Send, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type RentalRequestStatus = "pending" | "in_review" | "awaiting_documents" | "approved" | "rejected";

const statusConfig: Record<RentalRequestStatus, { label: string, color: string, bg: string, icon: any }> = {
  pending: { label: "En attente", color: "text-[#f57c00]", bg: "bg-orange-50 dark:bg-orange-950/30", icon: Clock },
  in_review: { label: "En cours d'examen", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", icon: Clock },
  awaiting_documents: { label: "Documents requis", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30", icon: FileText },
  approved: { label: "Approuvée", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30", icon: CheckCircle },
  rejected: { label: "Refusée", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", icon: XCircle },
};

export default function ProfileRequestDetailPage() {
  const [, params] = useRoute("/profile/requests/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const queryClient = useQueryClient();
  
  const { data: request, isLoading: requestLoading } = useGetRentalRequest(id, { query: { enabled: !!id, queryKey: getGetRentalRequestQueryKey(id) } });
  const { data: messages, isLoading: messagesLoading } = useGetConversationMessages(id, { query: { enabled: !!id, queryKey: getGetConversationMessagesQueryKey(id) } });
  
  const sendMessage = useSendMessage();
  const [newMessage, setNewMessage] = useState("");

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

  if (requestLoading) {
    return (
      <UserLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </UserLayout>
    );
  }

  if (!request) {
    return (
      <UserLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4 text-[#1a237e]">Demande introuvable</h2>
          <Link href="/profile/requests" className="text-[#f57c00] hover:underline">Retour à mes demandes</Link>
        </div>
      </UserLayout>
    );
  }

  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  return (
    <UserLayout>
      <div className="mb-6 flex items-center">
        <Link href="/profile/requests" className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold text-[#1a237e] dark:text-white">Détail de la demande</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Messaging Panel */}
          <Card className="rounded-none border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1a1a1a]">
              <h3 className="font-bold text-[#1a237e] dark:text-white">Messagerie</h3>
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" /> Les messages expirent après 24h
              </span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
              {messagesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-3/4 self-end rounded-xl" />
                  <Skeleton className="h-16 w-3/4 rounded-xl" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.senderId === request.userId;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-[#1a237e] text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 px-1">
                        {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })} • Expire {formatDistanceToNow(new Date(msg.expiresAt), { locale: fr, addSuffix: true })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                  <p>Aucun message. Commencez la discussion avec le propriétaire.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111]">
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Écrivez votre message..." 
                  className="min-h-[60px] resize-none rounded-none focus-visible:ring-[#f57c00]"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  className="h-auto rounded-none bg-[#f57c00] hover:bg-[#e65100] px-6"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessage.isPending || request.conversationEnded}
                >
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </div>
              {request.conversationEnded && (
                <p className="text-xs text-red-500 mt-2">La conversation a été clôturée par le propriétaire.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <Card className="rounded-none border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111]">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Statut du dossier</h3>
              <div className={`flex items-center gap-3 px-4 py-3 border border-transparent ${config.bg} ${config.color}`}>
                <StatusIcon className="h-6 w-6" />
                <div>
                  <div className="font-bold">{config.label}</div>
                  <div className="text-sm opacity-80 mt-0.5">Mis à jour le {format(new Date(request.updatedAt), 'dd MMM yyyy', { locale: fr })}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Card */}
          <Card className="rounded-none border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] overflow-hidden">
            <div className="h-40 bg-gray-100 relative">
              <img 
                src={request.propertyImage || "/images/hero-interior.png"} 
                alt={request.propertyTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="font-bold text-[#1a237e] dark:text-white mb-4 line-clamp-2">{request.propertyTitle}</h3>
              <Link href={`/properties/${request.propertyId}`}>
                <Button variant="outline" className="w-full rounded-none border-gray-300 hover:bg-gray-50 text-gray-700">
                  Voir l'annonce
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}