import { useLocation } from "wouter";
import { Construction } from "lucide-react";

const LABELS: Record<string, { title: string; description: string }> = {
  "/admin/contacts/providers":      { title: "Services Providers",  description: "Gérez vos prestataires de services : plombiers, électriciens, notaires, photographes, etc." },
  "/admin/contacts/groups":         { title: "Groups",              description: "Regroupez vos contacts par catégorie : propriétaires vérifiés, étudiants, agences partenaires, etc." },
  "/admin/contacts/company-leads":  { title: "Company Leads",       description: "Prospects entreprises : agences immobilières, sociétés de gestion, promoteurs, etc." },
  "/admin/contacts/leads-provider": { title: "Leads Provider",      description: "Sources d'acquisition : Facebook Ads, Google Ads, TikTok, SEO, partenariats, etc." },
  "/admin/contacts/import-export":  { title: "Import / Export",     description: "Importez ou exportez des données : propriétés, utilisateurs, contrats, CSV/Excel/PDF, etc." },
  "/admin/contacts/playbook":       { title: "Playbook",            description: "Workflows et automatisations : onboarding, validation de propriété, support client, matching locataire, etc." },
};

export default function AdminComingSoonPage() {
  const [location] = useLocation();
  const info = LABELS[location] ?? { title: "En construction", description: "Cette section sera disponible prochainement." };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
        <Construction className="h-8 w-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{info.title}</h1>
      <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">{info.description}</p>
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        En développement — disponible prochainement
      </span>
    </div>
  );
}
