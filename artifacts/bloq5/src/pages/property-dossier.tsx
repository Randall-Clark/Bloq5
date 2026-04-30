import { useRoute, Link } from "wouter";
import { useGetProperty, useCreateRentalRequest } from "@workspace/api-client-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, MapPin, Bed, Bath, Send, ArrowLeft, CheckCircle } from "lucide-react";

const YELLOW = "#F5A623";

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span className="text-2xl font-black" style={{ color: "#1A1A1A" }}>
              BLOQ<span style={{ color: YELLOW }}>5</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/properties" className="hover:text-gray-900 transition-colors">Biens à louer</Link>
            <a href="#" className="hover:text-gray-900 transition-colors">À propos</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Articles</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm font-semibold text-gray-700 border border-gray-400 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
            Se connecter
          </Link>
          <Link href="/sign-up">
            <button className="text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-1" style={{ background: YELLOW, color: "#1A1A1A" }}>
              Vous êtes propriétaire <ChevronDown className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function PropertyDossierPage() {
  const [, params] = useRoute("/properties/:id/dossier");
  const id = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    message: "",
  });

  const { data: property, isLoading } = useGetProperty(id, {
    query: { enabled: !!id, queryKey: ["getProperty", id] as const }
  });
  const createRequest = useCreateRentalRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate(
      { data: { propertyId: id, ...formData } },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast({ title: "Candidature envoyée avec succès !" });
        },
        onError: () => {
          toast({ title: "Erreur lors de l'envoi", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link href={`/properties/${id}`}>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour à l'annonce
          </button>
        </Link>

        {/* Property summary card */}
        {!isLoading && property && (
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 mb-8">
            <img
              src={property.images?.[0] || `https://picsum.photos/seed/prop${property.id}1/400/300`}
              alt={property.title}
              className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold truncate" style={{ color: "#1A1A1A" }}>{property.title}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {property.city}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                {property.bedrooms != null && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms} Ch.</span>}
                {property.bathrooms != null && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms} Sdb</span>}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-base font-extrabold" style={{ color: "#1A1A1A" }}>{property.price} CA$</div>
              <div className="text-xs text-gray-400">/mois</div>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#F0FDF4" }}>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>Candidature envoyée !</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Votre dossier a bien été transmis. Le propriétaire ou l'agent en charge du logement vous contactera dans les plus brefs délais.
            </p>
            <Link href={`/properties/${id}`}>
              <button className="mt-4 px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85" style={{ background: YELLOW, color: "#1A1A1A" }}>
                Retour à l'annonce
              </button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#1A1A1A" }}>Déposer ma candidature</h1>
            <p className="text-sm text-gray-500 mb-8">Remplissez le formulaire ci-dessous. Votre dossier sera transmis directement au propriétaire ou à l'agent en charge.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">Nom complet *</Label>
                  <Input
                    required
                    placeholder="Jean Tremblay"
                    value={formData.applicantName}
                    onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">Email *</Label>
                  <Input
                    type="email"
                    required
                    placeholder="jean@exemple.com"
                    value={formData.applicantEmail}
                    onChange={e => setFormData({ ...formData, applicantEmail: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Téléphone</Label>
                <Input
                  type="tel"
                  placeholder="+1 514 000 0000"
                  value={formData.applicantPhone}
                  onChange={e => setFormData({ ...formData, applicantPhone: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Présentez votre situation *</Label>
                <Textarea
                  required
                  placeholder="Décrivez votre situation professionnelle, votre nombre d'occupants, vos revenus mensuels, etc."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl min-h-[140px]"
                />
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">📋 Conseil :</strong> Un dossier complet augmente vos chances d'être sélectionné. Mentionnez votre situation professionnelle, votre revenu mensuel, le nombre d'occupants prévus, et toute information pertinente pour le propriétaire.
              </div>

              <button
                type="submit"
                disabled={createRequest.isPending}
                className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                {createRequest.isPending
                  ? "Envoi en cours…"
                  : <><Send className="w-4 h-4" /> Envoyer ma candidature</>
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
