import { useRoute, Link } from "wouter";
import {
  useGetProperty, useCreateRentalRequest, useGetPropertyAvailableDates,
  getGetPropertyAvailableDatesQueryKey
} from "@workspace/api-client-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Bed, Bath, Maximize2, Heart, ArrowLeftRight, Printer, Share2,
  Camera, RotateCcw, ChevronDown, ChevronUp, Send, Calendar,
  Flame, Wifi, Droplets, Zap, Trash2, Wind, CheckCircle,
  FileText, Download, Car, ChevronRight, Search, ArrowLeft
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
          <button className="hidden md:flex items-center gap-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-full px-4 py-2 hover:border-gray-400 transition-colors">
            <Search className="w-3.5 h-3.5" /> Référence
          </button>
          <Link href="/sign-in" className="text-sm font-semibold text-gray-700 border border-gray-400 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
            Se connecter
          </Link>
          <Link href="/sign-up">
            <button className="text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-1" style={{ background: YELLOW, color: "#1A1A1A" }}>
              Vous êtes propriétaire ? <ChevronDown className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function FloorPlanSVG() {
  return (
    <svg viewBox="0 0 400 280" className="w-full" style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 8 }}>
      {/* Outer walls */}
      <rect x="20" y="20" width="360" height="240" fill="none" stroke="#1A1A1A" strokeWidth="3"/>
      {/* Entrance */}
      <rect x="20" y="120" width="55" height="60" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="47" y="154" textAnchor="middle" fontSize="9" fill="#555">Entrée</text>
      {/* Living room */}
      <rect x="75" y="20" width="150" height="120" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="150" y="84" textAnchor="middle" fontSize="10" fill="#555">Salon / Séjour</text>
      {/* Kitchen */}
      <rect x="225" y="20" width="155" height="80" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="302" y="64" textAnchor="middle" fontSize="10" fill="#555">Cuisine</text>
      {/* Bedroom 1 */}
      <rect x="75" y="140" width="110" height="120" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="130" y="204" textAnchor="middle" fontSize="10" fill="#555">Chambre 1</text>
      {/* Bedroom 2 */}
      <rect x="185" y="140" width="105" height="120" fill="#F8F8F8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="237" y="204" textAnchor="middle" fontSize="10" fill="#555">Chambre 2</text>
      {/* Bathroom */}
      <rect x="290" y="100" width="90" height="80" fill="#E8F4FD" stroke="#1A1A1A" strokeWidth="1.5"/>
      <text x="335" y="144" textAnchor="middle" fontSize="9" fill="#555">Salle de bain</text>
      {/* Dimensions */}
      <text x="200" y="270" textAnchor="middle" fontSize="8" fill="#9CA3AF">← 12,5 m →</text>
      <text x="8" y="140" textAnchor="middle" fontSize="8" fill="#9CA3AF" transform="rotate(-90,8,140)">← 8,2 m →</text>
    </svg>
  );
}

export default function PropertyDetailPage() {
  const [, params] = useRoute("/properties/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(true);
  const [chargesTab, setChargesTab] = useState<"charges" | "forfait">("forfait");
  const [formData, setFormData] = useState({ applicantName: "", applicantEmail: "", applicantPhone: "", message: "" });

  const { data: property, isLoading } = useGetProperty(id, {
    query: { enabled: !!id, queryKey: ["getProperty", id] as const }
  });
  const { data: availableDates } = useGetPropertyAvailableDates(id, {
    query: { enabled: !!id, queryKey: getGetPropertyAvailableDatesQueryKey(id) }
  });
  const createRequest = useCreateRentalRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate({ data: { propertyId: id, ...formData } }, {
      onSuccess: () => { toast({ title: "Candidature envoyée avec succès !" }); setOpen(false); setFormData({ applicantName: "", applicantEmail: "", applicantPhone: "", message: "" }); },
      onError: () => { toast({ title: "Erreur lors de l'envoi", variant: "destructive" }); }
    });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
          <div className="h-[480px] bg-gray-100 rounded-xl mb-10" />
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
            <div className="h-96 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
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

  const imgs = Array.from({ length: 4 }, (_, i) =>
    property.images?.[i] || `https://picsum.photos/seed/prop${property.id}${i}/800/500`
  );

  const AMENITIES = [
    "Détecteur de fumée", "Détecteur de CO", "Trousse premiers soins",
    "Entrée autonome / boîte à clés", "Caméras sécurité extérieures", "Cintres",
    "Literie fournie", "Oreillers & couvertures", "Fer à repasser",
    "Téléviseur câble standard", "Réfrigérateur", "Micro-ondes",
    "Lave-vaisselle", "Machine à café"
  ];

  const CHARGES = [
    { icon: Flame, label: "Chauffage" },
    { icon: Zap, label: "Électricité" },
    { icon: Trash2, label: "Taxes ordures" },
    { icon: Droplets, label: "Eau chaude" },
    { icon: Wind, label: "Eau courante" },
    { icon: Wifi, label: "Internet Fibre" },
  ];

  const NEARBY = [
    { label: "École", val: "0,5 km" }, { label: "Hôpital", val: "1,2 km" },
    { label: "Université", val: "0,8 km" }, { label: "Station de métro", val: "0,3 km" },
    { label: "Épicerie", val: "0,2 km" }, { label: "Gym / Bien-être", val: "0,9 km" },
    { label: "Marché", val: "0,7 km" }, { label: "Parc", val: "0,4 km" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">Accueil</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/properties" className="hover:text-gray-600">Annonces</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 font-medium">{property.title}</span>
      </div>

      {/* ── Gallery ── */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="relative flex gap-2 rounded-xl overflow-hidden" style={{ height: 480 }}>
          {/* Large photo left */}
          <div className="relative flex-[1.6] rounded-xl overflow-hidden">
            <img src={imgs[0]} alt="Photo principale" className="w-full h-full object-cover" />
            {/* 360° badge */}
            <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow cursor-pointer hover:bg-white transition-colors">
              <RotateCcw className="w-4 h-4 text-gray-700" />
            </div>
            {/* Photo count */}
            <button className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-white transition-colors">
              <Camera className="w-3.5 h-3.5" /> 13 photos
            </button>
          </div>
          {/* Mosaic 2×2 right */}
          <div className="flex flex-col gap-2 flex-1">
            {[imgs[1], imgs[2]].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden flex-1">
                <img src={src} alt={`Photo ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[imgs[3], imgs[0]].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden flex-1">
                <img src={src} alt={`Photo ${i + 4}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex gap-10 items-start">

          {/* ═══ LEFT COL 65% ═══ */}
          <div className="flex-[1.85] min-w-0">

            {/* Titre + actions */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold mb-1.5 leading-tight" style={{ color: "#1A1A1A" }}>
                  {property.title}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {addr}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  {beds > 0 && `${beds} Ch.`}{beds > 0 && " · "}{baths} Sdb · {area} m²
                </p>
                <div className="flex flex-wrap gap-2">
                  {[`Réf : ${ref}`, "Logement entier", "Meublé"].map(b => (
                    <span key={b} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "#F5F5F5", color: "#555" }}>{b}</span>
                  ))}
                </div>
              </div>
              {/* Action icons */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                {[
                  { icon: Heart, title: "Favori" },
                  { icon: ArrowLeftRight, title: "Comparer" },
                  { icon: Printer, title: "Imprimer" },
                  { icon: Share2, title: "Partager" },
                ].map(({ icon: Icon, title }) => (
                  <button key={title} title={title} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 mb-8" />

            {/* Le logement */}
            <section className="mb-7">
              <h2 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>Le logement</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                BLOQ5 vous présente ce logement de {area} m² idéalement situé au 102, Rue Sainte-Catherine O à {city}. Profitez d'un espace de vie lumineux, entièrement meublé, à deux pas des transports en commun et de tous les commerces du quartier.
              </p>
            </section>

            {/* L'appartement */}
            <section className="mb-7">
              <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: "#1A1A1A" }}>
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> L'appartement
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {property.description ||
                  `Ce logement de ${area} m² dispose de ${beds} chambre${beds > 1 ? "s" : ""} lumineuse${beds > 1 ? "s" : ""}, d'un salon spacieux et d'une cuisine entièrement équipée (réfrigérateur, micro-ondes, plaques de cuisson). La salle de bain privative comprend une douche et une baignoire. Le chauffage et la connexion Internet fibre sont inclus dans les charges.`
                }
              </p>
            </section>

            {/* Accès et extérieurs */}
            <section className="mb-7">
              <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: "#1A1A1A" }}>
                <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" /> Les accès et extérieurs
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                L'unité est accessible par escalier depuis l'entrée principale sécurisée. Une buanderie commune est disponible au sous-sol de l'immeuble. Stationnement intérieur disponible en option (tarif séparé).
              </p>
            </section>

            {/* Le quartier */}
            <section className="mb-7">
              <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: "#1A1A1A" }}>
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Le quartier
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Situé en plein cœur du Quartier des Spectacles, ce logement bénéficie d'une localisation exceptionnelle :
              </p>
              <ul className="space-y-1.5 text-sm text-gray-600">
                <li className="flex items-start gap-2">🎓 <span><strong>Éducation :</strong> Université du Québec à Montréal à 8 min à pied</span></li>
                <li className="flex items-start gap-2">🚇 <span><strong>Transports :</strong> Station de métro Place-des-Arts (ligne Verte) à 3 min</span></li>
                <li className="flex items-start gap-2">🛒 <span><strong>Commodités :</strong> nombreux commerces, épiceries, restaurants, cafés à proximité immédiate</span></li>
              </ul>
            </section>

            {/* Publié par BLOQ5 */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 w-fit mb-8">
              <span className="text-sm font-black" style={{ color: "#1A1A1A" }}>BLOQ<span style={{ color: YELLOW }}>5</span></span>
              <span className="text-xs text-gray-400">Annonce publiée et vérifiée par BLOQ5</span>
            </div>

            {/* Informations essentielles */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A1A" }}>Informations essentielles</h2>
              <div className="rounded-xl overflow-hidden border border-gray-100">
                {[
                  { label: "Superficie", val: `${area} m²` },
                  { label: "Nombre de chambres", val: `${beds}` },
                  { label: "Salles de bain", val: `${baths}` },
                  { label: "Étage", val: "3e étage" },
                  { label: "Honoraires charge locataire", val: "375 CA$", sub: "Constitution du bail 185 $ · État des lieux entrée 190 $" },
                  { label: "Loyer mensuel (charges comprises)", val: `${price} CA$/mois`, highlight: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-start justify-between px-5 py-3.5 text-sm" style={{ background: row.highlight ? "#F8F8F8" : i % 2 === 0 ? "white" : "#FAFAFA" }}>
                    <span className="text-gray-500">{row.label}</span>
                    <div className="text-right">
                      <span className={`font-semibold ${row.highlight ? "text-base" : ""}`} style={{ color: "#1A1A1A" }}>{row.val}</span>
                      {row.sub && <p className="text-xs text-gray-400 mt-0.5">{row.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Détail des charges */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1A1A1A" }}>Détail des charges</h2>
              <div className="flex gap-2 mb-5">
                {(["charges", "forfait"] as const).map(t => (
                  <button key={t} onClick={() => setChargesTab(t)}
                    className="px-4 py-2 rounded-full text-xs font-semibold border transition-all"
                    style={chargesTab === t
                      ? { background: YELLOW, borderColor: YELLOW, color: "#1A1A1A" }
                      : { background: "white", borderColor: "#D1D5DB", color: "#4B5563" }}>
                    {t === "charges" ? "Charges" : "Forfait : 75 CA$/mois"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mb-4">Inclus dans les charges :</p>
              <div className="grid grid-cols-3 gap-3">
                {CHARGES.map(({ icon: Icon, label }) => (
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
                {(property.amenities?.length ? property.amenities : AMENITIES).map((a: string) => (
                  <div key={a} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: YELLOW }} />
                    {a}
                  </div>
                ))}
              </div>
            </section>

            {/* Détails de la propriété */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: "#1A1A1A" }}>Détails de la propriété</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                Logement de {area} m² situé dans le Quartier des Spectacles à {city}. L'unité comprend {beds} chambre{beds > 1 ? "s" : ""}, une cuisine entièrement équipée et un accès direct aux transports en commun. Chauffage et eau chaude inclus. Disponible immédiatement.
              </p>
              <button className="text-xs font-semibold flex items-center gap-1" style={{ color: YELLOW }}>
                Lire la suite <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="mt-5 rounded-xl overflow-hidden border border-gray-100">
                {[
                  ["ID", ref, "Chambres", `${beds}`],
                  ["Prix", `${price} CA$/mois`, "Année de construction", "2018"],
                  ["Superficie", `${area} m²`, "Type", property.type || "Appartement"],
                  ["Pièces", `${(beds || 0) + 2}`, "Statut", isAvailable ? "Disponible" : "Loué"],
                  ["Salles de bain", `${baths}`, "Stationnement", "1"],
                ].map(([lL, lV, rL, rV], i) => (
                  <div key={i} className="grid grid-cols-2 divide-x divide-gray-100 text-sm" style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", borderBottom: "1px solid #F0F0F0" }}>
                    <div className="flex justify-between px-5 py-3">
                      <span className="text-gray-400">{lL}</span>
                      <span className="font-semibold text-gray-800">{lV}</span>
                    </div>
                    <div className="flex justify-between px-5 py-3">
                      <span className="text-gray-400">{rL}</span>
                      <span className="font-semibold text-gray-800">{rV}</span>
                    </div>
                  </div>
                ))}
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
                    <span className="flex items-center gap-1">🚿 {baths} Salle de bain</span>
                  </span>
                </button>
                {floorOpen && (
                  <div className="p-5">
                    <FloorPlanSVG />
                  </div>
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
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: `url(${imgs[1]})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <button className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                    <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1"><polygon points="5,3 19,12 5,21" /></svg>
                  </button>
                </div>
                <div className="absolute bottom-3 left-4 text-xs text-white/70">
                  102 Rue Sainte-Catherine O, {city} – {beds} Ch. – Appartement
                </div>
                <div className="absolute bottom-3 right-4 bg-white text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">
                  Matterport
                </div>
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
              <div className="grid grid-cols-2 gap-0">
                {NEARBY.map(({ label, val }, i) => (
                  <div key={label} className="flex justify-between items-center py-3 px-4 text-sm" style={{ borderBottom: "1px solid #F0F0F0", background: i % 4 < 2 ? "white" : "#FAFAFA" }}>
                    <span className="font-semibold text-xs" style={{ color: YELLOW }}>{label}</span>
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
                  { name: "Bail-Logement.pdf", iconBg: "#EBF5FB", iconColor: "#1565C0", icon: "PDF" },
                  { name: "Règlement-Immeuble.pdf", iconBg: "#E0F7FA", iconColor: "#00838F", icon: "DOC" },
                ].map(f => (
                  <div key={f.name} className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background: "#F5F5F5" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: f.iconBg, color: f.iconColor }}>{f.icon}</div>
                      <span className="text-xs font-medium text-gray-700">{f.name}</span>
                    </div>
                    <button className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors">
                      <Download className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>{/* end left col */}

          {/* ═══ RIGHT COL sticky 35% ═══ */}
          <div className="w-80 shrink-0 sticky top-20">
            <div className="rounded-2xl border border-gray-200 shadow-lg bg-white p-6">
              {/* Price */}
              <div className="mb-1">
                <span className="text-3xl font-extrabold" style={{ color: "#1A1A1A" }}>{price} CA$</span>
                <span className="text-gray-400 text-sm">/mois</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">dont 75 CA$ de charges comprises</p>

              {/* Status badge */}
              <div className="flex items-center gap-1.5 mb-5">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${isAvailable ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: isAvailable ? "#22C55E" : "#EF4444" }} />
                  {isAvailable ? "Disponible" : "Loué"}
                </span>
                {availableDates && availableDates.length > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {availableDates.length} dates dispo
                  </span>
                )}
              </div>

              {/* CTA */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button
                    disabled={!isAvailable}
                    className="w-full py-4 rounded-xl font-semibold text-sm mb-4 transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: YELLOW, color: "#1A1A1A" }}
                  >
                    {isAvailable ? "Je dépose ma candidature" : "Bien indisponible"}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold" style={{ color: "#1A1A1A" }}>Dossier de location</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Nom complet</Label>
                      <Input required value={formData.applicantName} onChange={e => setFormData({ ...formData, applicantName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Email</Label>
                      <Input type="email" required value={formData.applicantEmail} onChange={e => setFormData({ ...formData, applicantEmail: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Téléphone</Label>
                      <Input value={formData.applicantPhone} onChange={e => setFormData({ ...formData, applicantPhone: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Message</Label>
                      <Textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Présentez votre situation..." className="min-h-[90px]" />
                    </div>
                    <button type="submit" disabled={createRequest.isPending}
                      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
                      style={{ background: YELLOW, color: "#1A1A1A" }}>
                      {createRequest.isPending ? "Envoi en cours…" : <><Send className="w-4 h-4" /> Envoyer ma candidature</>}
                    </button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="border-t border-gray-100 my-4" />

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><FileText className="w-4 h-4" />Honoraires locataire</span>
                  <span className="font-semibold" style={{ color: "#1A1A1A" }}>375 CA$</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><Maximize2 className="w-4 h-4" />Superficie</span>
                  <span className="font-semibold" style={{ color: "#1A1A1A" }}>{area} m²</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><Bed className="w-4 h-4" />Chambres</span>
                  <span className="font-semibold" style={{ color: "#1A1A1A" }}>{beds}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><Car className="w-4 h-4" />Stationnement</span>
                  <span className="font-semibold" style={{ color: "#1A1A1A" }}>1 inclus</span>
                </div>
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

      {/* ── SEO Footer ── */}
      <div className="border-t border-gray-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-gray-500">
          <div>
            <h5 className="font-semibold text-gray-700 mb-3">Types de bien à {city}</h5>
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

      {/* ── Main Footer ── */}
      <footer style={{ background: "#1A1A1A", color: "#ccc" }} className="pt-14 pb-8 relative overflow-hidden">
        {/* Decorative circle */}
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
                {["Générateur de bail", "Simulateur de loyer", "Générateur de quittance", "État des lieux digital"].map(l => (
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
