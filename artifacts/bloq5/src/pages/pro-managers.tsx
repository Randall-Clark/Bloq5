import ProLayout from "@/components/layout/pro-layout";
import { useListManagers, useAddManager, useRemoveManager, getListManagersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2, ShieldCheck, Clock, XCircle } from "lucide-react";
type ManagerStatus = "pending" | "verified" | "rejected";

export default function ProManagersPage() {
  const { data: managers, isLoading } = useListManagers();
  const addManager = useAddManager();
  const removeManager = useRemoveManager();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addManager.mutate({
      data: {
        managerName: formData.name,
        managerEmail: formData.email,
        ownerEmail: "owner@example.com" // Needs actual owner email from auth context ideally
      }
    }, {
      onSuccess: () => {
        toast({ title: "Gestionnaire invité avec succès" });
        setOpen(false);
        setFormData({ name: "", email: "" });
        queryClient.invalidateQueries({ queryKey: getListManagersQueryKey() });
      },
      onError: () => toast({ title: "Erreur lors de l'invitation", variant: "destructive" })
    });
  };

  const handleRemove = (id: number) => {
    if(confirm("Retirer l'accès de ce gestionnaire ?")) {
      removeManager.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Accès révoqué" });
          queryClient.invalidateQueries({ queryKey: getListManagersQueryKey() });
        }
      });
    }
  };

  const getStatusBadge = (status: ManagerStatus) => {
    switch(status) {
      case 'verified': return <Badge className="bg-green-100 text-green-800 rounded-none"><ShieldCheck className="w-3 h-3 mr-1" /> Actif</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-800 rounded-none"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 rounded-none"><XCircle className="w-3 h-3 mr-1" /> Refusé</Badge>;
      default: return null;
    }
  };

  return (
    <ProLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Équipe de gestion</h1>
          <p className="text-gray-500">Déléguez l'administration de vos propriétés.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#f57c00] hover:bg-[#e65100] text-white rounded-none">
              <Plus className="mr-2 h-4 w-4" /> Inviter
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-[#1a237e]">Inviter un gestionnaire</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="rounded-none focus-visible:ring-[#f57c00]" 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="rounded-none focus-visible:ring-[#f57c00]" 
                />
              </div>
              <Button type="submit" disabled={addManager.isPending} className="w-full bg-[#1a237e] hover:bg-[#0d47a1] rounded-none">
                {addManager.isPending ? "Envoi..." : "Envoyer l'invitation"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !managers || managers.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-200">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun gestionnaire</h3>
          <p className="text-gray-500">Invitez des collaborateurs pour vous aider à gérer votre parc.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold text-[#1a237e]">Nom</TableHead>
                <TableHead className="font-bold text-[#1a237e]">Contact</TableHead>
                <TableHead className="font-bold text-[#1a237e]">Statut</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-bold text-gray-900">{manager.managerName}</TableCell>
                  <TableCell>
                    <div className="text-sm">{manager.managerEmail}</div>
                    {manager.managerPhone && <div className="text-sm text-gray-500">{manager.managerPhone}</div>}
                  </TableCell>
                  <TableCell>{getStatusBadge(manager.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemove(manager.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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