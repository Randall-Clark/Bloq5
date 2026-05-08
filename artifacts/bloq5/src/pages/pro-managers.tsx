import ProLayout from "@/components/layout/pro-layout";
import { useListManagers, useAddManager, useRemoveManager, getListManagersQueryKey, useGetCurrentSubscription } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2, ShieldCheck, Clock, XCircle, Lock, ArrowRight, UserPlus, Zap } from "lucide-react";

type ManagerStatus = "pending" | "verified" | "rejected";

export default function ProManagersPage() {
  const { data: managers, isLoading } = useListManagers();
  const { data: sub, isLoading: subLoading } = useGetCurrentSubscription();
  const addManager = useAddManager();
  const removeManager = useRemoveManager();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [open, setOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const plan = (sub as any)?.plan;
  const maxManagers: number = plan?.maxManagers ?? 0;
  const currentCount = managers?.length ?? 0;
  const canAddManager = maxManagers === -1 || currentCount < maxManagers;
  const planBlocksManagers = maxManagers === 0;
  const atLimit = !planBlocksManagers && maxManagers !== -1 && currentCount >= maxManagers;

  const handleInviteClick = () => {
    if (planBlocksManagers || atLimit) {
      setUpgradeOpen(true);
    } else {
      setOpen(true);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addManager.mutate({
      data: {
        managerName: formData.name,
        managerEmail: formData.email,
        ownerEmail: "owner@example.com"
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
    if (confirm("Retirer l'accès de ce gestionnaire ?")) {
      removeManager.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Accès révoqué" });
          queryClient.invalidateQueries({ queryKey: getListManagersQueryKey() });
        }
      });
    }
  };

  const getStatusBadge = (status: ManagerStatus) => {
    switch (status) {
      case "verified": return <Badge className="bg-green-100 text-green-800 rounded-none"><ShieldCheck className="w-3 h-3 mr-1" /> Actif</Badge>;
      case "pending":  return <Badge className="bg-orange-100 text-orange-800 rounded-none"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800 rounded-none"><XCircle className="w-3 h-3 mr-1" /> Refusé</Badge>;
      default: return null;
    }
  };

  return (
    <ProLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Équipe de gestion</h1>
          <p className="text-gray-500">Déléguez l'administration de vos propriétés.</p>
          {!subLoading && maxManagers !== -1 && (
            <p className="text-sm text-gray-400 mt-1">
              {planBlocksManagers
                ? "Votre forfait actuel n'inclut pas de gestionnaires."
                : `${currentCount} / ${maxManagers} gestionnaire${maxManagers > 1 ? "s" : ""} utilisé${maxManagers > 1 ? "s" : ""}`
              }
            </p>
          )}
        </div>

        <Button
          className="bg-[#f57c00] hover:bg-[#e65100] text-white rounded-none"
          onClick={handleInviteClick}
        >
          {planBlocksManagers || atLimit
            ? <><Lock className="mr-2 h-4 w-4" /> Inviter</>
            : <><Plus className="mr-2 h-4 w-4" /> Inviter</>
          }
        </Button>
      </div>

      {/* Upgrade gate modal */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="rounded-none border-gray-200 max-w-md p-0 overflow-hidden">
          <div className="bg-[#1a237e] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">
                  {planBlocksManagers ? "Fonctionnalité non incluse" : "Limite de gestionnaires atteinte"}
                </h2>
                <p className="text-white/70 text-sm">
                  {planBlocksManagers
                    ? `Forfait ${plan?.name ?? "Gratuit"} · 0 gestionnaire`
                    : `${currentCount} / ${maxManagers} gestionnaires`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {planBlocksManagers
                ? <>Votre forfait actuel <strong className="text-[#1a237e]">{plan?.name ?? "Gratuit"}</strong> ne permet pas d'inviter des gestionnaires. Passez à un forfait supérieur ou achetez un siège à la carte pour débloquer cette fonctionnalité.</>
                : <>Vous avez atteint la limite de <strong className="text-[#1a237e]">{maxManagers} gestionnaire{maxManagers > 1 ? "s" : ""}</strong> inclus dans votre forfait. Achetez un siège supplémentaire ou passez au forfait Entreprise pour plus de flexibilité.</>
              }
            </p>

            {/* Quick add option */}
            <div className="border border-dashed border-[#1a237e]/30 bg-[#EEF0FF] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#1a237e]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <UserPlus className="w-4 h-4 text-[#1a237e]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1a237e] text-sm">Siège gestionnaire à la carte</p>
                    <p className="text-xs text-gray-500 mt-0.5">1 place · Valide 30 jours · Sans engagement</p>
                    {plan?.addonDiscount > 0 && (
                      <p className="text-xs text-green-700 font-medium mt-1">
                        {plan.addonDiscount} % de rabais avec votre forfait {plan.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {plan?.addonDiscount > 0 ? (
                    <>
                      <div className="text-xs text-gray-400 line-through">15 CAD</div>
                      <div className="text-base font-extrabold text-[#1a237e]">
                        {Math.round(15 * (1 - plan.addonDiscount / 100))} CAD
                      </div>
                    </>
                  ) : (
                    <div className="text-base font-extrabold text-[#1a237e]">15 CAD</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                className="w-full h-11 rounded-none font-bold bg-[#1a237e] hover:bg-[#111b60] text-white"
                onClick={() => { setUpgradeOpen(false); navigate("/pro/subscription"); }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Voir les forfaits & services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 rounded-none text-sm border-gray-200 text-gray-600"
                onClick={() => setUpgradeOpen(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
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
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="rounded-none focus-visible:ring-[#f57c00]"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="rounded-none focus-visible:ring-[#f57c00]"
              />
            </div>
            <Button type="submit" disabled={addManager.isPending} className="w-full bg-[#1a237e] hover:bg-[#0d47a1] rounded-none">
              {addManager.isPending ? "Envoi..." : "Envoyer l'invitation"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading || subLoading ? (
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
