import { useState, useRef, useEffect } from "react";
import ProLayout from "@/components/layout/pro-layout";
import { useCreateProperty, getGetDashboardPropertiesQueryKey, useListSubscriptionPlans } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Megaphone, X, Plus, Trash2, Video, MapPin, Camera, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

const YELLOW = "#F5A623";
const NAVY   = "#1A237E";

/* ─── Constants ─────────────────────────────────────────────── */
const AMENITY_GROUPS = [
  {
    label: "Services inclus",
    items: [
      { id: "wifi",        label: "WiFi" },
      { id: "heating",     label: "Chauffage" },
      { id: "hot_water",   label: "Eau chaude" },
      { id: "electricity", label: "Électricité" },
      { id: "cable_tv",    label: "Câble / TV" },
      { id: "ac",          label: "Climatisation" },
    ],
  },
  {
    label: "Électroménagers",
    items: [
      { id: "washer",      label: "Machine à laver" },
      { id: "dryer",       label: "Sèche-linge" },
      { id: "dishwasher",  label: "Lave-vaisselle" },
      { id: "fridge",      label: "Réfrigérateur" },
      { id: "stove",       label: "Cuisinière" },
      { id: "microwave",   label: "Micro-ondes" },
    ],
  },
  {
    label: "Espaces extérieurs",
    items: [
      { id: "balcony",     label: "Balcon" },
      { id: "terrace",     label: "Terrasse" },
      { id: "backyard",    label: "Cour arrière" },
      { id: "pool",        label: "Piscine" },
      { id: "bbq",         label: "BBQ" },
    ],
  },
  {
    label: "Bâtiment",
    items: [
      { id: "parking",     label: "Stationnement inclus" },
      { id: "ev_charger",  label: "Borne de recharge VÉ" },
      { id: "elevator",    label: "Ascenseur" },
      { id: "gym",         label: "Salle de gym" },
      { id: "storage",     label: "Casier de rangement" },
      { id: "common_room", label: "Salle commune" },
    ],
  },
  {
    label: "Sécurité & Politique",
    items: [
      { id: "alarm",       label: "Système d'alarme" },
      { id: "intercom",    label: "Interphone" },
      { id: "furnished",   label: "Meublé" },
      { id: "pets",        label: "Animaux acceptés" },
      { id: "smoking",     label: "Fumeurs acceptés" },
      { id: "accessible",  label: "Accessible PMR" },
    ],
  },
];

type AddressSuggestion = {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

const ADDRESS_SUGGESTIONS: AddressSuggestion[] = [
  { street: "1000 Rue de la Gauchetière O",          city: "Montréal",   province: "QC", postalCode: "H3B 4W5", country: "Canada" },
  { street: "1001 Rue de la Gauchetière O",          city: "Montréal",   province: "QC", postalCode: "H3B 4W5", country: "Canada" },
  { street: "3500 Boulevard de Maisonneuve O",       city: "Montréal",   province: "QC", postalCode: "H3Z 1L9", country: "Canada" },
  { street: "3480 Boulevard de Maisonneuve O",       city: "Montréal",   province: "QC", postalCode: "H3Z 1L8", country: "Canada" },
  { street: "740 Avenue Atwater",                    city: "Montréal",   province: "QC", postalCode: "H4C 2G9", country: "Canada" },
  { street: "755 Avenue Atwater",                    city: "Montréal",   province: "QC", postalCode: "H4C 2G8", country: "Canada" },
  { street: "455 Rue Saint-Antoine O",               city: "Montréal",   province: "QC", postalCode: "H2Z 1J1", country: "Canada" },
  { street: "2100 Rue Drummond",                     city: "Montréal",   province: "QC", postalCode: "H3G 1W9", country: "Canada" },
  { street: "4800 Boulevard Côte-des-Neiges",        city: "Montréal",   province: "QC", postalCode: "H3V 1G4", country: "Canada" },
  { street: "4850 Boulevard Côte-des-Neiges",        city: "Montréal",   province: "QC", postalCode: "H3V 1G5", country: "Canada" },
  { street: "6200 Rue Sherbrooke E",                 city: "Montréal",   province: "QC", postalCode: "H1N 1C2", country: "Canada" },
  { street: "888 Boulevard De Maisonneuve E",        city: "Montréal",   province: "QC", postalCode: "H2L 1Y8", country: "Canada" },
  { street: "3700 Rue Saint-Denis",                  city: "Montréal",   province: "QC", postalCode: "H2X 3L7", country: "Canada" },
  { street: "3750 Rue Saint-Denis",                  city: "Montréal",   province: "QC", postalCode: "H2X 3L8", country: "Canada" },
  { street: "1420 Boulevard René-Lévesque O",        city: "Montréal",   province: "QC", postalCode: "H3G 1T7", country: "Canada" },
  { street: "1000 Rue Sainte-Catherine O",           city: "Montréal",   province: "QC", postalCode: "H3B 4V5", country: "Canada" },
  { street: "1200 Rue Sainte-Catherine O",           city: "Montréal",   province: "QC", postalCode: "H3G 2C7", country: "Canada" },
  { street: "5600 Rue Sherbrooke O",                 city: "Montréal",   province: "QC", postalCode: "H4A 1W4", country: "Canada" },
  { street: "320 Rue Saint-Viateur E",               city: "Montréal",   province: "QC", postalCode: "H2T 1A8", country: "Canada" },
  { street: "4025 Rue Saint-Ambroise",               city: "Montréal",   province: "QC", postalCode: "H4C 2C9", country: "Canada" },
  { street: "2000 Boulevard Saint-Joseph E",         city: "Montréal",   province: "QC", postalCode: "H2H 1E4", country: "Canada" },
  { street: "4141 Rue Sherbrooke E",                 city: "Montréal",   province: "QC", postalCode: "H1X 1E4", country: "Canada" },
  { street: "2600 Boulevard Laurier",                city: "Québec",     province: "QC", postalCode: "G1V 4T3", country: "Canada" },
  { street: "789 Avenue des Érables",                city: "Québec",     province: "QC", postalCode: "G1R 2L4", country: "Canada" },
  { street: "3000 Boulevard de la Concorde E",       city: "Laval",      province: "QC", postalCode: "H7E 2B5", country: "Canada" },
  { street: "2000 Boulevard Saint-Martin E",         city: "Laval",      province: "QC", postalCode: "H7E 4Z5", country: "Canada" },
  { street: "500 Chemin de Chambly",                 city: "Longueuil",  province: "QC", postalCode: "J4H 3L8", country: "Canada" },
  { street: "1 Yonge Street",                        city: "Toronto",    province: "ON", postalCode: "M5E 1W7", country: "Canada" },
  { street: "100 King Street W",                     city: "Toronto",    province: "ON", postalCode: "M5X 1A9", country: "Canada" },
  { street: "250 Front Street W",                    city: "Toronto",    province: "ON", postalCode: "M5V 3G5", country: "Canada" },
  { street: "789 Main Street",                       city: "Vancouver",  province: "BC", postalCode: "V6A 2V7", country: "Canada" },
  { street: "1055 Dunsmuir Street",                  city: "Vancouver",  province: "BC", postalCode: "V7X 1L4", country: "Canada" },
];

const NEARBY_BY_CITY: Record<string, string[]> = {
  montréal: [
    "Métro (500 m)", "Épicerie IGA (300 m)", "Parc (450 m)",
    "Pharmacie Jean Coutu (250 m)", "École primaire (600 m)",
    "Restaurant (150 m)", "Gym Éconofitness (900 m)", "Hôpital (1.2 km)",
  ],
  toronto: [
    "TTC Station (600 m)", "Loblaws (400 m)", "Park (350 m)",
    "Shoppers Drug Mart (500 m)", "School (700 m)", "Restaurant Row (200 m)",
    "GoodLife Fitness (1 km)",
  ],
  laval: [
    "Métro Montmorency (800 m)", "Maxi (500 m)", "Parc (300 m)",
    "Pharmacie (400 m)", "École (650 m)", "Clinique médicale (900 m)",
  ],
  default: [
    "Épicerie (500 m)", "École primaire (800 m)", "Parc (300 m)",
    "Pharmacie (400 m)", "Restaurant (200 m)", "Transport en commun (600 m)",
  ],
};

function getNearby(city: string): string[] {
  const k = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return NEARBY_BY_CITY[k] ?? NEARBY_BY_CITY.default;
}

/* ─── Types & Schema ─────────────────────────────────────────── */
const propertySchema = z.object({
  title:          z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description:    z.string().min(20, "La description est trop courte"),
  type:           z.enum(["house", "apartment", "co-living", "commercial", "office", "industrial"]),
  address:        z.string().min(5, "L'adresse est requise"),
  city:           z.string().min(2, "La ville est requise"),
  country:        z.string().min(2, "Le pays est requis"),
  price:          z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
  bedrooms:       z.coerce.number().optional().nullable(),
  bathrooms:      z.coerce.number().optional().nullable(),
  area:           z.coerce.number().optional().nullable(),
  virtualTourUrl: z.string().optional().nullable(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const RESIDENTIAL = ["house", "apartment", "co-living"] as const;
const isResidential = (t: string) => RESIDENTIAL.includes(t as any);

/* ─── Section card wrapper ───────────────────────────────────── */
function Section({ icon: Icon, title, subtitle, children }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FFF8EE" }}>
          <Icon className="w-4 h-4" style={{ color: YELLOW }} />
        </div>
        <div>
          <h3 className="font-bold text-base" style={{ color: NAVY }}>{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─── Pricing Modal ──────────────────────────────────────────── */
function PricingModal({ onConfirm, onCancel, isPending }: {
  onConfirm: () => void;
  onCancel:  () => void;
  isPending: boolean;
}) {
  const { data: plans, isLoading } = useListSubscriptionPlans();
  const [selected, setSelected]   = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>Choisissez votre forfait</h2>
            <p className="text-sm text-gray-500 mt-0.5">Sélectionnez un plan pour publier votre annonce.</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-7 py-6">
          {isLoading
            ? <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
            : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plans?.map(plan => {
                  const isSelected = selected === plan.id;
                  const isPopular  = plan.name.toLowerCase().includes("pro") && !plan.isEnterprise;
                  return (
                    <button key={plan.id} onClick={() => setSelected(plan.id)}
                      className="text-left rounded-xl border-2 p-4 transition-all"
                      style={{ borderColor: isSelected ? YELLOW : "#E5E7EB", background: isSelected ? "#FFF8EE" : "#fff" }}>
                      {isPopular && <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2" style={{ background: YELLOW }}>Le plus populaire</span>}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-bold text-sm" style={{ color: NAVY }}>{plan.name}</p>
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: YELLOW }} />}
                      </div>
                      <p className="text-2xl font-extrabold text-gray-900">
                        {plan.price !== null ? `${plan.price}$` : "Sur devis"}
                        {plan.price !== null && <span className="text-xs font-normal text-gray-400">/mois</span>}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: YELLOW }} /> {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            )
          }
        </div>
        <div className="px-7 py-5 border-t border-gray-100 flex items-center justify-between gap-3">
          <button onClick={onCancel} className="text-sm font-medium text-gray-500 hover:text-gray-700">Annuler</button>
          <Button onClick={onConfirm} disabled={!selected || isPending}
            className="gap-2 rounded-xl font-bold text-sm" style={{ background: NAVY, color: "#fff" }}>
            <Megaphone className="w-4 h-4" />
            {isPending ? "Publication..." : "Confirmer et publier"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Address autocomplete ───────────────────────────────────── */
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-amber-900 rounded-sm font-semibold not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

function AddressInput({ value, onChange, onSelect }: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: AddressSuggestion) => void;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const q = value.trim().toLowerCase();
  const filtered = q.length >= 1
    ? ADDRESS_SUGGESTIONS.filter(s =>
        s.street.toLowerCase().includes(q) ||
        s.postalCode.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        s.city.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q)
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder="Ex: 3500 Boulevard de Maisonneuve O"
          className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-11 pl-10 pr-4 text-sm transition-colors"
          style={{ borderColor: focused ? "#F5A623" : undefined }}
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Suggestions</p>
          {filtered.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-amber-50 flex items-start gap-3 transition-colors border-t border-gray-50 first:border-0"
              onMouseDown={e => { e.preventDefault(); onSelect(s); setOpen(false); }}
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-tight truncate">
                  {highlightMatch(s.street, value.trim())}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500">{s.city}, {s.province}</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
                    style={{ background: "#FFF8EE", color: "#F5A623" }}>
                    {s.postalCode}
                  </span>
                  <span className="text-xs text-gray-400">{s.country}</span>
                </div>
              </div>
            </button>
          ))}
          <p className="px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100">
            Données simulées — intégration Canada Post disponible sur abonnement Pro
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Image row ──────────────────────────────────────────────── */
function ImageRow({ url, onRemove }: { url: string; onRemove: () => void }) {
  const isValid = url.startsWith("http") || url.startsWith("/");
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
      {isValid ? (
        <img src={url} alt="" className="w-14 h-10 object-cover rounded-lg bg-gray-200 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <div className="w-14 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
          <Camera className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <span className="text-xs text-gray-600 truncate flex-1">{url || "—"}</span>
      <button type="button" onClick={onRemove} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Nearby place chip ──────────────────────────────────────── */
function PlaceChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
      {label}
      <button type="button" onClick={onRemove} className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function ProPropertyNewPage() {
  const { toast }      = useToast();
  const [, setLocation] = useLocation();
  const queryClient     = useQueryClient();
  const createProperty  = useCreateProperty();
  const [showPricing, setShowPricing]       = useState(false);
  const [pendingPayload, setPendingPayload]  = useState<Record<string, unknown> | null>(null);

  /* Amenities */
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const toggleAmenity = (id: string) =>
    setSelectedAmenities(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* Images */
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const addImage = () => setImageUrls(p => [...p, ""]);
  const removeImage = (i: number) => setImageUrls(p => p.filter((_, j) => j !== i));
  const updateImage = (i: number, v: string) => setImageUrls(p => p.map((u, j) => j === i ? v : u));

  /* Co-living room prices */
  const [sameRoomPrice, setSameRoomPrice] = useState(true);
  const [roomPriceInputs, setRoomPriceInputs] = useState<string[]>([]);

  /* Nearby places */
  const [nearbyPlaces, setNearbyPlaces] = useState<string[]>([]);
  const [nearbyAutoFilled, setNearbyAutoFilled] = useState(false);

  /* Address extras */
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince]     = useState("");

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "", description: "", type: "apartment",
      address: "", city: "", country: "Canada",
      price: undefined, bedrooms: undefined,
      bathrooms: undefined, area: undefined,
      virtualTourUrl: "",
    },
  });

  const watchType     = form.watch("type");
  const watchBedrooms = form.watch("bedrooms");
  const watchCity     = form.watch("city");

  /* Sync room price inputs when bedroom count changes */
  useEffect(() => {
    const count = Number(watchBedrooms) || 0;
    setRoomPriceInputs(p => Array.from({ length: count }, (_, i) => p[i] ?? ""));
  }, [watchBedrooms]);

  /* Auto-populate nearby places when city changes */
  useEffect(() => {
    if (watchCity && watchCity.length >= 2 && !nearbyAutoFilled) {
      setNearbyPlaces(getNearby(watchCity));
      setNearbyAutoFilled(true);
    }
    if (!watchCity) setNearbyAutoFilled(false);
  }, [watchCity, nearbyAutoFilled]);

  const onSubmit = (data: PropertyFormValues) => {
    const amenitiesArr = Array.from(selectedAmenities);
    if (watchType === "co-living" && !sameRoomPrice && roomPriceInputs.length) {
      roomPriceInputs.forEach((p, i) => {
        if (p) amenitiesArr.push(`Chambre ${i + 1} : ${p} $/mois`);
      });
    }
    const fullAddress = postalCode
      ? `${data.address}, ${postalCode}`
      : data.address;
    const payload = {
      ...data,
      address: fullAddress,
      amenities: amenitiesArr,
      nearbyPlaces,
      images: imageUrls.filter(u => u.trim()),
    };
    setPendingPayload(payload);
    setShowPricing(true);
  };

  const handleConfirm = () => {
    if (!pendingPayload) return;
    createProperty.mutate(
      { data: pendingPayload as any },
      {
        onSuccess: () => {
          toast({ title: "Propriété publiée avec succès !" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardPropertiesQueryKey() });
          setLocation("/pro/properties");
        },
        onError: () => {
          toast({ title: "Erreur lors de la publication", variant: "destructive" });
          setShowPricing(false);
        },
      }
    );
  };

  const InfoIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/>
    </svg>
  );
  const RulerIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 16L16 2l6 6L8 22 2 16z"/><path d="M8 8l8 8"/><path d="M6 10l2 2"/><path d="M10 6l2 2"/>
    </svg>
  );
  const SparkleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
  const CameraIcon = () => <Camera className="w-4 h-4" />;
  const VideoIcon2 = () => <Video className="w-4 h-4" />;
  const MapPinIcon = () => <MapPin className="w-4 h-4" />;

  return (
    <ProLayout>
      {showPricing && (
        <PricingModal
          onConfirm={handleConfirm}
          onCancel={() => setShowPricing(false)}
          isPending={createProperty.isPending}
        />
      )}

      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <Link href="/pro/properties" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: NAVY }}>Nouvelle propriété</h1>
          <p className="text-sm text-gray-500">Remplissez les informations pour publier votre annonce.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl pb-8">

          {/* ── 1. Informations principales ── */}
          <Section icon={InfoIcon} title="Informations principales">
            <div className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Titre de l'annonce *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Beau 3½ lumineux, chauffage inclus — Plateau Mont-Royal"
                      className="rounded-xl h-11 focus-visible:ring-[#F5A623]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Type de bien *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-11 focus:ring-[#F5A623]">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Appartement</SelectItem>
                        <SelectItem value="house">Maison</SelectItem>
                        <SelectItem value="co-living">Colocation</SelectItem>
                        <SelectItem value="commercial">Local commercial</SelectItem>
                        <SelectItem value="office">Bureau</SelectItem>
                        <SelectItem value="industrial">Industriel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      {watchType === "co-living" ? "Loyer mensuel — appartement complet (CA$) *" : "Loyer mensuel (CA$) *"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                        <Input type="number" {...field} value={field.value ?? ""} placeholder="1 500"
                          className="rounded-xl h-11 pl-7 focus-visible:ring-[#F5A623]" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Description *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Décrivez le logement, le quartier, les particularités…"
                      className="min-h-[140px] rounded-xl focus-visible:ring-[#F5A623] resize-none" />
                  </FormControl>
                  <p className="text-xs text-gray-400">{field.value?.length ?? 0} / 1 000 caractères recommandés</p>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          {/* ── 2. Caractéristiques ── */}
          <Section icon={RulerIcon} title="Caractéristiques"
            subtitle={watchType === "co-living" ? "Précisez les chambres et les loyers individuels si applicable" : undefined}>
            <div className="space-y-5">
              <div className={`grid gap-4 ${isResidential(watchType) ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Surface (pi²)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ""} placeholder="750"
                        className="rounded-xl h-11 focus-visible:ring-[#F5A623]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {isResidential(watchType) && (
                  <FormField control={form.control} name="bedrooms" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Chambres</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} value={field.value ?? ""} placeholder="2"
                          className="rounded-xl h-11 focus-visible:ring-[#F5A623]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {isResidential(watchType) && (
                  <FormField control={form.control} name="bathrooms" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Salles de bain</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step={0.5} {...field} value={field.value ?? ""} placeholder="1"
                          className="rounded-xl h-11 focus-visible:ring-[#F5A623]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>

              {/* Co-living room prices */}
              {watchType === "co-living" && Number(watchBedrooms) > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        checked={sameRoomPrice}
                        onCheckedChange={v => setSameRoomPrice(!!v)}
                        className="data-[state=checked]:bg-[#F5A623] data-[state=checked]:border-[#F5A623]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Le prix est le même pour toutes les chambres
                      </span>
                    </label>
                  </div>
                  {!sameRoomPrice && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {roomPriceInputs.map((rp, i) => (
                        <div key={i}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Chambre {i + 1} (CA$/mois)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                            <input type="number" value={rp} min={0}
                              onChange={e => setRoomPriceInputs(p => p.map((v, j) => j === i ? e.target.value : v))}
                              placeholder="800"
                              className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-10 pl-7 pr-4 text-sm transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* ── 3. Aménagements & inclusions ── */}
          <Section icon={SparkleIcon} title="Aménagements & inclusions"
            subtitle="Cochez tout ce qui est inclus dans la location">
            <div className="space-y-6">
              {AMENITY_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{group.label}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {group.items.map(item => {
                      const checked = selectedAmenities.has(item.id);
                      return (
                        <label key={item.id}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer select-none transition-all"
                          style={{
                            borderColor: checked ? YELLOW : "#E5E7EB",
                            background:  checked ? "#FFF8EE" : "#FAFAFA",
                          }}>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleAmenity(item.id)}
                            className="data-[state=checked]:bg-[#F5A623] data-[state=checked]:border-[#F5A623] shrink-0"
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 4. Médias ── */}
          <Section icon={CameraIcon} title="Médias"
            subtitle="4 photos par pièce recommandées (salon, chambre, cuisine, salle de bain…)">
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <Camera className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-semibold">Conseil :</span> Visez 4 photos par pièce — salon, chambres, cuisine, salle de bain, espaces communs et extérieur. Une annonce bien illustrée génère 3× plus de visites.
                </p>
              </div>
              <div className="space-y-2">
                {imageUrls.map((url, i) => (
                  url
                    ? <ImageRow key={i} url={url} onRemove={() => removeImage(i)} />
                    : (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={url}
                          onChange={e => updateImage(i, e.target.value)}
                          placeholder="https://... (lien vers la photo)"
                          className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-10 px-4 text-sm transition-colors"
                        />
                        <button type="button" onClick={() => removeImage(i)}
                          className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                ))}
              </div>
              <button type="button" onClick={addImage}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] w-full justify-center transition-all">
                <Plus className="w-4 h-4" />
                Ajouter une photo
              </button>
              <p className="text-xs text-gray-400 text-center">{imageUrls.filter(u => u.trim()).length} photo(s) ajoutée(s)</p>
            </div>
          </Section>

          {/* ── 5. Visite virtuelle ── */}
          <Section icon={VideoIcon2} title="Visite virtuelle"
            subtitle="Augmentez vos candidatures avec une visite 3D immersive">
            <div className="space-y-4">
              <FormField control={form.control} name="virtualTourUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Lien de visite virtuelle</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input {...field} value={field.value ?? ""} placeholder="https://matterport.com/..."
                        className="rounded-xl h-11 pl-10 focus-visible:ring-[#F5A623]" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex items-center gap-4 py-3 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF8EE" }}>
                  <Video className="w-5 h-5" style={{ color: YELLOW }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Vous n'avez pas de visite virtuelle ?</p>
                  <p className="text-xs text-gray-500">Nos équipes se déplacent pour créer votre visite 3D Matterport.</p>
                </div>
                <a href="/pro/subscription"
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-colors"
                  style={{ background: YELLOW }}>
                  Souscrire
                </a>
              </div>
            </div>
          </Section>

          {/* ── 6. Localisation ── */}
          <Section icon={MapPinIcon} title="Localisation"
            subtitle="L'adresse complète permet le remplissage automatique des équipements à proximité">
            <div className="space-y-5">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Adresse complète *</FormLabel>
                  <FormControl>
                    <AddressInput
                      value={field.value}
                      onChange={field.onChange}
                      onSelect={s => {
                        field.onChange(s.street);
                        form.setValue("city", s.city);
                        form.setValue("country", s.country);
                        setPostalCode(s.postalCode);
                        setProvince(s.province);
                        setNearbyPlaces(getNearby(s.city));
                        setNearbyAutoFilled(true);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Province</label>
                  <input
                    type="text"
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    placeholder="QC"
                    maxLength={3}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-11 px-4 text-sm transition-colors font-mono tracking-widest uppercase"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Code postal
                    {postalCode && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{ background: "#FFF8EE", color: "#F5A623" }}>auto</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value.toUpperCase())}
                    placeholder="H3Z 1L9"
                    maxLength={7}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-11 px-4 text-sm transition-colors font-mono tracking-widest"
                  />
                </div>
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">Ville *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Montréal"
                        className="rounded-xl h-11 focus-visible:ring-[#F5A623]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Pays *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Canada"
                      className="rounded-xl h-11 focus-visible:ring-[#F5A623]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Nearby places */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Équipements à proximité</span>
                  {nearbyPlaces.length === 0 && (
                    <span className="text-xs text-gray-400">Remplissez la ville pour auto-remplir</span>
                  )}
                </div>
                {nearbyPlaces.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {nearbyPlaces.map((p, i) => (
                      <PlaceChip key={i} label={p} onRemove={() => setNearbyPlaces(prev => prev.filter((_, j) => j !== i))} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                    <MapPin className="w-4 h-4 text-gray-300" />
                    <span className="text-xs text-gray-400">Les équipements s'afficheront automatiquement une fois la ville renseignée.</span>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ── Actions ── */}
          <div className="flex items-center justify-between pt-2">
            <Link href="/pro/properties">
              <Button type="button" variant="outline" className="rounded-xl border-gray-300 font-medium">
                Annuler
              </Button>
            </Link>
            <Button type="submit"
              className="rounded-xl gap-2 font-bold text-white px-8 h-11"
              style={{ background: YELLOW, color: "#1A1A1A" }}>
              <Megaphone className="h-4 w-4" />
              Publier l'annonce
            </Button>
          </div>
        </form>
      </Form>
    </ProLayout>
  );
}
