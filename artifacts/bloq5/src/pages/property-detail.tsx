import { useRoute, Link, useLocation } from "wouter";
import {
  useGetProperty, useCreateRentalRequest, useGetPropertyAvailableDates,
  getGetPropertyAvailableDatesQueryKey
} from "@workspace/api-client-react";
import { useState } from "react";
import { useUser } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { useLocation_ } from "@/context/location-context";
import { PublicNavbar } from "@/components/public-navbar";
import {
  MapPin, Bed, Bath, Heart, Printer, Share2,
  ChevronDown, ChevronRight, ChevronLeft, X, Send,
  FileText, Download, Car,
  Flame, Wifi, Droplets, Zap, Trash2, Wind,
  AlertCircle, HeartPulse, Key, Camera, Shirt, Layers, Wand2, Tv, Snowflake, Coffee,
  GraduationCap, BookOpen, Train, ShoppingCart, Dumbbell, Store, TreePine,
  CheckCircle, Info, ArrowLeft, ArrowRight, type LucideProps
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const YELLOW = "#F5A623";


function FloorPlanSVG() {
  return (
    <svg viewBox="0 0 400 280" className="w-full" style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 8 }}>
      <rect x="20" y="20" width="360" height="240" fill="none" stroke="#1A1A1A" strokeWidth="3"/>
      <rect x="20" y="120" width="55" height="60" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="47" y="154" textAnchor="middle" fontSize="9" fill="#555">Entrée</text>
      <rect x="75" y="20" width="150" height="120" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="150" y="84" textAnchor="middle" fontSize="10" fill="#555">Salon / Séjour</text>
      <rect x="225" y="20" width="155" height="80" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="302" y="64" textAnchor="middle" fontSize="10" fill="#555">Cuisine</text>
      <rect x="75" y="140" width="110" height="120" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="130" y="204" textAnchor="middle" fontSize="10" fill="#555">Chambre 1</text>
      <rect x="185" y="140" width="105" height="120" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="237" y="204" textAnchor="middle" fontSize="10" fill="#555">Chambre 2</text>
      <rect x="290" y="100" width="90" height="80" fill="#E8F4FD" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="335" y="144" textAnchor="middle" fontSize="9" fill="#555">Salle de bain</text>
      <text x="200" y="270" textAnchor="middle" fontSize="8" fill="#9CA3AF">← 12,5 m →</text>
      <text x="8" y="140" textAnchor="middle" fontSize="8" fill="#9CA3AF" transform="rotate(-90,8,140)">← 8,2 m →</text>
    </svg>
  );
}

type IconComp = React.ComponentType<LucideProps>;
const AMENITY_ICON_MAP: Record<string, IconComp> = {
  "Détecteur de fumée": Flame,
  "Détecteur de CO": AlertCircle,
  "Trousse premiers soins": HeartPulse,
  "Entrée autonome / boîte à clés": Key,
  "Caméras sécurité extérieures": Camera,
  "Cintres": Shirt,
  "Literie fournie": Bed,
  "Oreillers & couvertures": Layers,
  "Fer à repasser": Wand2,
  "Téléviseur câble standard": Tv,
  "Réfrigérateur": Snowflake,
  "Micro-ondes": Zap,
  "Lave-vaisselle": Droplets,
  "Machine à café": Coffee,
};

const NEARBY_ITEMS = [
  { label: "École", val: "0,5 km", icon: GraduationCap },
  { label: "Hôpital", val: "1,2 km", icon: HeartPulse },
  { label: "Université", val: "0,8 km", icon: BookOpen },
  { label: "Station de métro", val: "0,3 km", icon: Train },
  { label: "Épicerie", val: "0,2 km", icon: ShoppingCart },
  { label: "Gym / Bien-être", val: "0,9 km", icon: Dumbbell },
  { label: "Marché", val: "0,7 km", icon: Store },
  { label: "Parc", val: "0,4 km", icon: TreePine },
];

const CHARGES_ITEMS = [
  { icon: Flame, label: "Chauffage" },
  { icon: Zap, label: "Électricité" },
  { icon: Trash2, label: "Taxes ordures" },
  { icon: Droplets, label: "Eau chaude" },
  { icon: Wind, label: "Eau courante" },
  { icon: Wifi, label: "Internet Fibre" },
];

const STATIC_AMENITIES = [
  "Détecteur de fumée", "Détecteur de CO", "Trousse premiers soins",
  "Entrée autonome / boîte à clés", "Caméras sécurité extérieures", "Cintres",
  "Literie fournie", "Oreillers & couvertures", "Fer à repasser",
  "Téléviseur câble standard", "Réfrigérateur", "Micro-ondes",
  "Lave-vaisselle", "Machine à café",
];

function getEarliestVisitDate(): Date {
  const now = new Date();
  const cutoff = 17;
  const daysToAdd = now.getHours() >= cutoff ? 2 : 1;
  const d = new Date(now);
  d.setDate(d.getDate() + daysToAdd);
  d.setHours(0, 0, 0, 0);
  return d;
}

function VisitSchedulerDialog({ availableDates }: { availableDates?: string[] }) {
  const [step, setStep] = useState<"intro" | "calendar" | "confirmed">("intro");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [howOpen, setHowOpen] = useState(false);
  const { toast } = useToast();

  const earliest = getEarliestVisitDate();
  const now = new Date();
  const cutoffPassed = now.getHours() >= 17;

  const hasPreset = availableDates && availableDates.length > 0;

  function isDateDisabled(date: Date): boolean {
    if (date < earliest) return true;
    if (hasPreset) {
      const ds = date.toISOString().split("T")[0];
      return !availableDates!.some(d => d.startsWith(ds));
    }
    return false;
  }

  function handleConfirmDate() {
    if (!selectedDate) return;
    toast({ title: "Visite planifiée !", description: `Votre visite est réservée pour le ${selectedDate.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.` });
    setStep("confirmed");
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-base font-bold" style={{ color: "#1A1A1A" }}>Planifier une visite physique</DialogTitle>
      </DialogHeader>

      {step === "intro" && (
        <div className="space-y-4 pt-1">
          <p className="text-sm text-gray-600 leading-relaxed">
            La visite virtuelle ne vous convainc pas vraiment ? Planifiez dès maintenant une rencontre en physique avec un de nos agents ou l'agent en charge du logement afin de vous rendre sur place ou échanger sur vos préoccupations.
          </p>
          <button
            onClick={() => setStep("calendar")}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            Planifier une date
          </button>
          <button
            onClick={() => setHowOpen(!howOpen)}
            className="w-full flex items-center justify-between text-xs font-medium py-2 px-3 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Comment fonctionne la planification ?</span>
            {howOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {howOpen && (
            <div className="text-xs text-gray-500 leading-relaxed px-3 py-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
              <p>📅 <strong>Délai minimum :</strong> Toute demande de visite doit être effectuée <strong>la veille avant 17h</strong> pour que l'agent en charge puisse être informé à temps.</p>
              <p>🕔 Si vous faites votre demande <strong>aujourd'hui avant 17h</strong>, vous pouvez choisir une visite <strong>dès demain</strong>.</p>
              <p>🕔 Si vous faites votre demande <strong>après 17h</strong>, la première date disponible est <strong>dans deux jours</strong>.</p>
              {hasPreset
                ? <p>📋 Le propriétaire a <strong>défini des disponibilités spécifiques</strong>. Vous ne pouvez choisir que parmi ces créneaux.</p>
                : <p>📋 Aucun créneau spécifique n'a été défini : vous pouvez choisir n'importe quelle date, dans le respect des délais ci-dessus.</p>
              }
            </div>
          )}
        </div>
      )}

      {step === "calendar" && (
        <div className="space-y-4 pt-1">
          <p className="text-xs text-gray-500">
            {cutoffPassed
              ? "Il est après 17h — la première date disponible est dans 2 jours."
              : "Vous pouvez choisir une visite dès demain (demande avant 17h)."}
            {hasPreset && " Seuls les créneaux définis par le propriétaire sont disponibles."}
          </p>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              fromDate={earliest}
              className="rounded-xl border border-gray-100"
            />
          </div>
          {selectedDate && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
              📅 Visite sélectionnée : <strong>{selectedDate.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setStep("intro")} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Retour
            </button>
            <button
              onClick={handleConfirmDate}
              disabled={!selectedDate}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: YELLOW, color: "#1A1A1A" }}
            >
              Confirmer
            </button>
          </div>
          <button
            onClick={() => setHowOpen(!howOpen)}
            className="w-full flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="w-3 h-3" /> Comment ça marche ?
          </button>
          {howOpen && (
            <div className="text-xs text-gray-500 leading-relaxed px-3 py-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
              <p>📅 Délai minimum : la veille avant 17h pour que l'agent soit informé.</p>
              {hasPreset
                ? <p>📋 Seuls les créneaux définis par le propriétaire sont disponibles.</p>
                : <p>📋 Aucun créneau fixé : toute date respectant le délai est accessible.</p>
              }
            </div>
          )}
        </div>
      )}

      {step === "confirmed" && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <CheckCircle className="w-7 h-7 text-green-500" />
          </div>
          <p className="text-base font-bold" style={{ color: "#1A1A1A" }}>Visite confirmée !</p>
          <p className="text-sm text-gray-500 text-center">
            Un agent vous contactera pour confirmer les détails de votre visite.
          </p>
        </div>
      )}
    </DialogContent>
  );
}

export default function PropertyDetailPage() {
  const [, params] = useRoute("/properties/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const { country } = useLocation_();
  const { isSignedIn } = useUser();
  const [, navigate] = useLocation();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [floorOpen, setFloorOpen] = useState(true);
  const [honorairesOpen, setHonorairesOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  function openVisitScheduler() {
    if (!isSignedIn) {
      navigate(`/sign-in?redirect=/properties/${id}`);
      return;
    }
    setVisitOpen(true);
  }

  const { data: property, isLoading } = useGetProperty(id, {
    query: { enabled: !!id, queryKey: ["getProperty", id] as const }
  });
  const { data: availableDates } = useGetPropertyAvailableDates(id, {
    query: { enabled: !!id, queryKey: getGetPropertyAvailableDatesQueryKey(id) }
  });

  if (isLoading) {
    return (
      <>
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
          <div className="h-[280px] sm:h-[480px] bg-gray-100 rounded-xl mb-10" />
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-[1.85] space-y-4">
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
            <div className="w-full lg:w-80 h-48 lg:h-96 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#1A1A1A" }}>Bien introuvable</h2>
          <Link href="/properties">
            <button className="px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: YELLOW, color: "#1A1A1A" }}>
              ← Retour aux annonces
            </button>
          </Link>
        </div>
      </>
    );
  }

  const ref = `BLQ-${String(property.id).padStart(4, "0")}`;
  const isAvailable = property.status === "available";
  const city = property.city || "Montréal";
  const price = property.price ?? 1390;
  const area = property.area ?? 65;
  const beds = property.bedrooms ?? 2;
  const baths = property.bathrooms ?? 1;
  const addr = `102, Rue Sainte-Catherine O, ${city}, QC H2X 1Z3`;

  const imgs = Array.from({ length: 5 }, (_, i) =>
    property.images?.[i] || `https://picsum.photos/seed/prop${property.id}${i + 1}/800/500`
  );
  const allImgs = imgs;

  const amenities: string[] = property.amenities?.length ? property.amenities : STATIC_AMENITIES;

  const selectedCity = country.cities?.[0]?.name || city;

  return (
    <div className="bg-white min-h-screen">
      <PublicNavbar />

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightboxOpen(false)}>
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 rounded-full p-2"
            onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + allImgs.length) % allImgs.length); }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img
            src={allImgs[lightboxIdx]}
            alt={`Photo ${lightboxIdx + 1}`}
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 rounded-full p-2"
            onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % allImgs.length); }}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImgs.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setLightboxIdx(i); }}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === lightboxIdx ? YELLOW : "rgba(255,255,255,0.4)" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">Accueil</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/properties" className="hover:text-gray-600">Annonces</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 font-medium truncate max-w-[160px] sm:max-w-xs">{property.title}</span>
      </div>

      {/* Gallery — single photo on mobile, asymmetric mosaic on md+ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 md:mb-10">
        {/* Mobile: single photo */}
        <div className="md:hidden relative rounded-xl overflow-hidden cursor-pointer" style={{ height: 240 }}
          onClick={() => { setLightboxIdx(0); setLightboxOpen(true); }}>
          <img src={imgs[0]} alt="Photo principale" className="w-full h-full object-cover" />
          <button
            className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow"
            onClick={e => { e.stopPropagation(); setLightboxIdx(0); setLightboxOpen(true); }}
          >
            📷 {allImgs.length} photos
          </button>
        </div>
        {/* Desktop: asymmetric mosaic */}
        <div className="hidden md:flex relative gap-2 rounded-xl overflow-hidden" style={{ height: 480 }}>
          <div className="relative flex-[1.6] rounded-xl overflow-hidden cursor-pointer" onClick={() => { setLightboxIdx(0); setLightboxOpen(true); }}>
            <img src={imgs[0]} alt="Photo principale" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
            <button
              className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-white transition-colors"
              onClick={e => { e.stopPropagation(); setLightboxIdx(0); setLightboxOpen(true); }}
            >
              📷 {allImgs.length} photos
            </button>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[imgs[1], imgs[2]].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden flex-1 cursor-pointer" onClick={() => { setLightboxIdx(i + 1); setLightboxOpen(true); }}>
                <img src={src} alt={`Photo ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[imgs[3], imgs[4]].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden flex-1 cursor-pointer" onClick={() => { setLightboxIdx(i + 3); setLightboxOpen(true); }}>
                <img src={src} alt={`Photo ${i + 4}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      {isAvailable && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-lg">
          <div className="flex-1">
            <span className="text-xl font-extrabold" style={{ color: "#1A1A1A" }}>{price} CA$</span>
            <span className="text-gray-400 text-xs">/mois</span>
          </div>
          <Link href={`/properties/${id}/dossier`} className="flex-shrink-0">
            <button className="py-3 px-5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85" style={{ background: YELLOW, color: "#1A1A1A" }}>
              Déposer ma candidature
            </button>
          </Link>
        </div>
      )}

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 lg:pb-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

          {/* ═══ LEFT COL ═══ */}
          <div className="flex-[1.85] min-w-0">

            {/* Title + actions */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold mb-1.5 leading-tight" style={{ color: "#1A1A1A" }}>
                  {property.title}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {addr}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  {beds > 0 ? `${beds} Ch.` : ""}{beds > 0 && baths > 0 ? " · " : ""}{baths > 0 ? `${baths} Sdb` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "#F5F5F5", color: "#555" }}>Réf : {ref}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                {[{ icon: Heart, title: "Favori" }, { icon: Printer, title: "Imprimer" }, { icon: Share2, title: "Partager" }].map(({ icon: Icon, title }) => (
                  <button key={title} title={title} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 mb-8" />

            {/* Description (merged) */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: "#1A1A1A" }}>Description</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  {property.description ||
                    `BLOQ5 vous présente ce logement de ${area} m² idéalement situé au cœur de ${city}. Ce bien dispose de ${beds} chambre${beds > 1 ? "s" : ""} lumineuse${beds > 1 ? "s" : ""}, d'un salon spacieux et d'une cuisine entièrement équipée (réfrigérateur, micro-ondes, plaques de cuisson). La salle de bain privative est dotée d'une douche. Le chauffage et la connexion Internet fibre sont inclus.`
                  }
                </p>
                <p>
                  L'unité est accessible par escalier depuis l'entrée principale sécurisée. Une buanderie commune est disponible au sous-sol. Stationnement intérieur disponible.
                </p>
                <p>
                  Situé en plein cœur du Quartier des Spectacles, ce logement bénéficie d'une localisation exceptionnelle à deux pas de l'UQAM, de la station de métro Place-des-Arts (ligne Verte), de nombreux commerces, épiceries, restaurants et cafés.
                </p>
              </div>
              {/* Publié par BLOQ5 badge */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 w-fit mt-5">
                <span className="text-sm font-black" style={{ color: "#1A1A1A" }}>BLOQ<span style={{ color: YELLOW }}>5</span></span>
                <span className="text-xs text-gray-400">Annonce publiée et vérifiée par BLOQ5</span>
              </div>
            </section>

            {/* Informations détaillées */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A1A" }}>Informations détaillées</h2>
              {/* Info items grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: MapPin, label: `${area} m²`, sublabel: "Superficie" },
                  { icon: Bed, label: `${beds} chambre${beds > 1 ? "s" : ""}`, sublabel: "Chambres" },
                  { icon: Bath, label: `${baths} salle${baths > 1 ? "s" : ""}`, sublabel: "Salle de bain" },
                  { icon: ChevronRight, label: "3e étage", sublabel: "Étage" },
                  { icon: Car, label: "1 inclus", sublabel: "Stationnement" },
                  { icon: Wand2, label: id % 2 === 1 ? "Meublé" : "Non meublé", sublabel: "Ameublement" },
                ].map(({ icon: Icon, label, sublabel }) => (
                  <div key={sublabel} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: YELLOW }} />
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{label}</div>
                      <div className="text-[10px] text-gray-400">{sublabel}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Ce qui est inclus */}
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Ce qui est inclus</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CHARGES_ITEMS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: YELLOW }} />
                    <span className="text-xs font-medium text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Équipements */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A1A" }}>Équipements et commodités</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {amenities.map((a: string) => {
                  const Icon = AMENITY_ICON_MAP[a] ?? CheckCircle;
                  return (
                    <div key={a} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: YELLOW }} />
                      {a}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Plans d'étage */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A1A" }}>Plans d'étage</h2>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setFloorOpen(!floorOpen)}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold"
                  style={{ background: "#F5F5F5", color: "#1A1A1A" }}
                >
                  <span>{floorOpen ? "∧" : "∨"} Premier étage</span>
                  <span className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{beds} Chambre{beds > 1 ? "s" : ""}</span>
                    <span>🚿 {baths} Salle de bain</span>
                  </span>
                </button>
                {floorOpen && (
                  <div className="p-5"><FloorPlanSVG /></div>
                )}
              </div>
            </section>

            {/* DPE */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: "#1A1A1A" }}>Diagnostic de performance énergétique</h2>
              <p className="text-sm text-gray-500 mb-5">
                Montant estimé des dépenses annuelles : entre 400 CA$ et 700 CA$ par an (estimation basée sur les données 2022–2023).
              </p>
              <div className="relative h-3 rounded-full overflow-hidden mb-2" style={{ background: "linear-gradient(to right, #4CAF50, #8BC34A, #CDDC39, #FFC107, #FF5722, #F44336)" }}>
                <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md" style={{ left: "28%", background: YELLOW }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-4">
                <span>Très économe (A)</span>
                <span>Très énergivore (G)</span>
              </div>
              <button className="text-xs font-semibold flex items-center gap-1" style={{ color: YELLOW }}>
                Voir le détail de performance énergétique <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* Visite virtuelle */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>Visite virtuelle</h2>
              <p className="text-sm text-gray-500 mb-4">Visualisez le bien en 3D et projetez-vous comme si vous y étiez !</p>
              <div className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{ background: "#1A1A1A", aspectRatio: "16/9" }}>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${imgs[1]})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div className="relative z-10">
                  <button className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                    <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1"><polygon points="5,3 19,12 5,21" /></svg>
                  </button>
                </div>
                <div className="absolute bottom-3 left-4 text-xs text-white/70">102 Rue Sainte-Catherine O, {city} – {beds} Ch. – Appartement</div>
                <div className="absolute bottom-3 right-4 bg-white text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">Matterport</div>
              </div>
            </section>

            {/* Carte */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>Votre futur quartier</h2>
              <p className="text-sm text-gray-500 mb-4">
                Les informations sur les risques auxquels le bien est exposé sont disponibles auprès des autorités locales compétentes.
              </p>
              <iframe
                title="Carte"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-73.58,45.49,-73.55,45.52&layer=mapnik"
                className="w-full rounded-xl border"
                style={{ height: 300, borderColor: "#E8E8E8" }}
              />
            </section>

            {/* À proximité */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-1" style={{ color: "#1A1A1A" }}>À proximité</h2>
              <p className="text-sm text-gray-400 mb-5">Découvrez les commodités à proximité pour bien évaluer l'emplacement et la qualité de vie offerte.</p>
              <div className="grid grid-cols-2 gap-0 rounded-xl overflow-hidden border border-gray-100">
                {NEARBY_ITEMS.map(({ label, val, icon: Icon }, i) => (
                  <div key={label} className="flex items-center justify-between py-3 px-4 text-sm" style={{ borderBottom: "1px solid #F0F0F0", background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                    <span className="flex items-center gap-2 font-semibold text-xs" style={{ color: YELLOW }}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </span>
                    <span className="text-gray-500 text-xs">{val}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Pièces jointes */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A1A" }}>Pièces jointes</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Bail-Logement.pdf", iconBg: "#EBF5FB", iconColor: "#1565C0", label: "PDF" },
                  { name: "Règlement-Immeuble.pdf", iconBg: "#E0F7FA", iconColor: "#00838F", label: "DOC" },
                ].map(f => (
                  <div key={f.name} className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background: "#F5F5F5" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: f.iconBg, color: f.iconColor }}>{f.label}</div>
                      <span className="text-xs font-medium text-gray-700">{f.name}</span>
                    </div>
                    <button className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors">
                      <Download className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ═══ RIGHT COL sticky — hidden on mobile (bottom bar shows instead) ═══ */}
          <div className="hidden lg:block w-80 shrink-0 sticky top-20">
            <div className="rounded-2xl border border-gray-200 shadow-lg bg-white p-6">
              {/* Price */}
              <div className="mb-1">
                <span className="text-3xl font-extrabold" style={{ color: "#1A1A1A" }}>{price} CA$</span>
                <span className="text-gray-400 text-sm">/mois</span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5 mb-5">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${isAvailable ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: isAvailable ? "#22C55E" : "#EF4444" }} />
                  {isAvailable ? "Disponible" : "Loué"}
                </span>
              </div>

              {/* CTA candidature */}
              {isAvailable ? (
                <Link href={`/properties/${id}/dossier`}>
                  <button className="w-full py-4 rounded-xl font-semibold text-sm mb-3 transition-opacity hover:opacity-85" style={{ background: YELLOW, color: "#1A1A1A" }}>
                    Je dépose ma candidature
                  </button>
                </Link>
              ) : (
                <button disabled className="w-full py-4 rounded-xl font-semibold text-sm mb-3 opacity-50 cursor-not-allowed bg-gray-200 text-gray-500">
                  Bien indisponible
                </button>
              )}

              {/* Planifier visite */}
              <button
                onClick={openVisitScheduler}
                className="w-full py-3 rounded-xl font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                📅 Planifier une visite physique
              </button>
              <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
                <VisitSchedulerDialog availableDates={availableDates?.map(d => typeof d === "string" ? d : String(d))} />
              </Dialog>

              <div className="border-t border-gray-100 my-4" />

              {/* Honoraires with expand */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500 flex items-center gap-1.5"><FileText className="w-4 h-4" />Honoraires locataire</span>
                  <span className="font-semibold" style={{ color: "#1A1A1A" }}>375 CA$</span>
                </div>
                <button
                  onClick={() => setHonorairesOpen(!honorairesOpen)}
                  className="flex items-center gap-1 text-xs font-medium transition-colors"
                  style={{ color: YELLOW }}
                >
                  {honorairesOpen ? "Masquer le détail" : "Voir le détail"}
                  <ChevronDown className={`w-3 h-3 transition-transform ${honorairesOpen ? "rotate-180" : ""}`} />
                </button>
                {honorairesOpen && (
                  <div className="mt-2 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-xs text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Constitution du bail</span>
                      <span className="font-semibold">185 CA$</span>
                    </div>
                    <div className="flex justify-between">
                      <span>État des lieux d'entrée</span>
                      <span className="font-semibold">190 CA$</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 text-gray-400">
                      Ces honoraires sont facturés une seule fois à la signature du bail, à la charge du locataire, conformément à la réglementation en vigueur au Québec.
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 my-4" />

              {/* Aide badge */}
              <div className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                <CheckCircle className="w-3.5 h-3.5" />
                Éligible aux aides au logement (RGI, PHAP)
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SEO Footer */}
      <div className="border-t border-gray-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-gray-500">
          <div>
            <h5 className="font-semibold text-gray-700 mb-3">Types de bien à {selectedCity}</h5>
            {["Location appartement", "Location meublée", "Colocation", "Coliving"].map(l => (
              <a key={l} href="#" className="block mb-1.5 hover:text-gray-800 transition-colors">{l}</a>
            ))}
          </div>
          <div>
            <h5 className="font-semibold text-gray-700 mb-3">Locations à proximité</h5>
            {["Laval", "Longueuil", "Brossard", "Saint-Lambert", "Verdun"].map(l => (
              <a key={l} href="#" className="block mb-1.5 hover:text-gray-800 transition-colors">{l}</a>
            ))}
          </div>
          <div>
            <h5 className="font-semibold text-gray-700 mb-3">Régions à proximité</h5>
            {["Locations Montérégie", "Locations Laurentides", "Locations Lanaudière"].map(l => (
              <a key={l} href="#" className="block mb-1.5 hover:text-gray-800 transition-colors">{l}</a>
            ))}
          </div>
          <div>
            <h5 className="font-semibold text-gray-700 mb-3">Principales villes</h5>
            {["Location Montréal", "Location Québec", "Location Toronto", "Location Ottawa", "Location Calgary", "Location Vancouver"].map(l => (
              <a key={l} href="#" className="block mb-1.5 hover:text-gray-800 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer style={{ background: "#1A1A1A", color: "#ccc" }} className="pt-14 pb-8 relative overflow-hidden">
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-5" style={{ background: YELLOW }} />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="text-2xl font-black text-white mb-2">BLOQ<span style={{ color: YELLOW }}>5</span></div>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">La plateforme de gestion immobilière locative — résidentiel, commercial et industriel.</p>
              <p className="text-xs text-gray-600">Carte professionnelle : n°CPI 6901 2019 000 039 604</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Nos services</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Gestion locative résidentielle", "Gestion locative commerciale", "Espaces industriels & logistique", "Location longue durée", "BLOQ5 Pro"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Nos outils</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Générateur de bail", "État des lieux digital"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Société</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["À propos", "Presse", "Recrutement", "Politique cookies", "Mentions légales", "CGU"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-gray-600 text-center">
            Copyright © 2026. Tous droits réservés. Fait avec ❤ à Montréal.
          </div>
        </div>
      </footer>
    </div>
  );
}
