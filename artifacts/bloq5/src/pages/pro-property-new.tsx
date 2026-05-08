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
import { ArrowLeft, CheckCircle2, Megaphone, X, Plus, Video, MapPin, Camera, Check, Paperclip, FileText, Zap, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const YELLOW = "#F5A623";
const NAVY   = "#1A237E";

/* ─── Constants ─────────────────────────────────────────────── */
const AMENITY_GROUPS = [
  {
    label: "Services inclus",
    items: [
      { id: "wifi",              label: "WiFi" },
      { id: "heating",           label: "Chauffage" },
      { id: "hot_water",         label: "Eau chaude" },
      { id: "electricity",       label: "Électricité" },
      { id: "cable_tv",          label: "Câble / TV" },
      { id: "ac",                label: "Climatisation" },
      { id: "garbage_tax",       label: "Taxe ordures incluse" },
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
      { id: "parking_free",  label: "Stationnement gratuit" },
      { id: "parking_paid",  label: "Stationnement payant" },
      { id: "ev_charger",    label: "Borne de recharge VÉ" },
      { id: "elevator",      label: "Ascenseur" },
      { id: "gym",           label: "Salle de gym" },
      { id: "storage_free",  label: "Casier de rangement gratuit" },
      { id: "storage_paid",  label: "Casier de rangement payant" },
      { id: "common_room",   label: "Salle commune" },
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

const DPE_CLASSES = ["A", "B", "C", "D", "E", "F", "G"] as const;
const DPE_COLORS: Record<string, string> = {
  A: "#009900", B: "#33CC00", C: "#99CC00", D: "#FFCC00", E: "#FF9900", F: "#FF6600", G: "#CC0000",
};

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

/* ─── Overpass / nearby places ───────────────────────────────── */
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000, r = (x: number) => x * Math.PI / 180;
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function fmtDist(m: number): string {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}

const OVERPASS_LABELS: Record<string, string> = {
  supermarket: "Supermarché", convenience: "Dépanneur", grocery: "Épicerie",
  pharmacy: "Pharmacie", school: "École", college: "Cégep", university: "Université",
  hospital: "Hôpital", clinic: "Clinique", restaurant: "Restaurant",
  cafe: "Café", fast_food: "Restauration rapide",
  station: "Station de métro", subway_entrance: "Entrée de métro",
  bus_stop: "Arrêt d'autobus", park: "Parc", fitness_centre: "Centre de fitness",
  library: "Bibliothèque", bank: "Banque",
};

async function fetchNearbyFromOverpass(lat: number, lon: number): Promise<string[]> {
  const q = `[out:json][timeout:15];
(
  node["shop"~"^(supermarket|convenience|grocery)$"](around:800,${lat},${lon});
  node["amenity"~"^(pharmacy|school|college|university|hospital|clinic|restaurant|cafe|fast_food|library|bank)$"](around:800,${lat},${lon});
  node["railway"~"^(station|subway_entrance)$"](around:800,${lat},${lon});
  node["highway"="bus_stop"]["name"](around:500,${lat},${lon});
  node["leisure"~"^(park|fitness_centre)$"](around:800,${lat},${lon});
  way["leisure"="park"]["name"](around:800,${lat},${lon});
);out center;`;

  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(q)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!resp.ok) throw new Error("overpass");
  const json = await resp.json();

  type OsmEl = { tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } };
  const elements: OsmEl[] = json.elements ?? [];

  type R = { name: string; category: string; dist: number };
  const results: R[] = [];

  for (const el of elements) {
    const name = el.tags?.name;
    if (!name) continue;
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (elLat == null || elLon == null) continue;
    const dist = haversineM(lat, lon, elLat, elLon);
    const cat = el.tags?.amenity ?? el.tags?.shop ?? el.tags?.railway ?? el.tags?.highway ?? el.tags?.leisure ?? "";
    results.push({ name, category: cat, dist });
  }

  results.sort((a, b) => a.dist - b.dist);

  const seen = new Set<string>();
  const perCat: Record<string, number> = {};
  const MAX_CAT = 2, MAX_TOTAL = 12;
  const out: string[] = [];

  for (const r of results) {
    const key = r.name.toLowerCase();
    if (seen.has(key)) continue;
    if ((perCat[r.category] ?? 0) >= MAX_CAT) continue;
    seen.add(key);
    perCat[r.category] = (perCat[r.category] ?? 0) + 1;
    const label = OVERPASS_LABELS[r.category] ?? r.category;
    out.push(`${r.name} · ${label} (${fmtDist(r.dist)})`);
    if (out.length >= MAX_TOTAL) break;
  }
  return out;
}

/* ─── Types & Schema ─────────────────────────────────────────── */
const propertySchema = z.object({
  title:            z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description:      z.string().min(20, "La description est trop courte"),
  type:             z.enum(["house", "apartment", "co-living", "commercial", "office"]),
  address:          z.string().min(5, "L'adresse est requise"),
  city:             z.string().min(2, "La ville est requise"),
  country:          z.string().min(2, "Le pays est requis"),
  price:            z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
  bedrooms:         z.coerce.number().optional().nullable(),
  bathrooms:        z.coerce.number().optional().nullable(),
  area:             z.coerce.number().optional().nullable(),
  floor:            z.coerce.number().int().optional().nullable(),
  virtualTourUrl:   z.string().optional().nullable(),
  apartmentNumber:  z.string().optional().nullable(),
  buildingFloors:   z.coerce.number().int().optional().nullable(),
  housingAidEligible: z.boolean().optional().default(false),
  dpeClass:         z.string().optional().nullable(),
  dpeAnnualCostMin: z.coerce.number().int().optional().nullable(),
  dpeAnnualCostMax: z.coerce.number().int().optional().nullable(),
  floorPlan:        z.string().optional().nullable(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

type Attachment = { name: string; url: string };

const RESIDENTIAL = ["house", "apartment", "co-living"] as const;
const isResidential = (t: string) => RESIDENTIAL.includes(t as any);

/* ─── Helpers ────────────────────────────────────────────────── */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── Section card wrapper ───────────────────────────────────── */
function Section({ icon: Icon, title, subtitle, children }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60 rounded-t-2xl">
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

type GeoStatus = "idle" | "loading" | "valid" | "not_found";

function AddressInput({ value, onChange, onSelect, onGeocode }: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: AddressSuggestion) => void;
  onGeocode?: (lat: number, lon: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const ref = useRef<HTMLDivElement>(null);
  const onGeocodeRef = useRef(onGeocode);
  onGeocodeRef.current = onGeocode;

  const q = value.trim().toLowerCase();
  const filtered = q.length >= 1
    ? ADDRESS_SUGGESTIONS.filter(s =>
        s.street.toLowerCase().includes(q) ||
        s.postalCode.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        s.city.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q)
      ).slice(0, 6)
    : [];

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Nominatim geocoding — debounce 600ms, min 10 chars */
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 10) {
      setGeoStatus("idle");
      return;
    }
    setGeoStatus("loading");
    const timer = setTimeout(async () => {
      try {
        const encoded = encodeURIComponent(trimmed);
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encoded}&countrycodes=ca`,
          { headers: { "Accept-Language": "fr-CA,fr;q=0.9,en;q=0.8" } }
        );
        if (!resp.ok) { setGeoStatus("idle"); return; }
        const data = await resp.json();
        if (data.length > 0) {
          setGeoStatus("valid");
          onGeocodeRef.current?.(parseFloat(data[0].lat), parseFloat(data[0].lon));
        } else {
          setGeoStatus("not_found");
        }
      } catch {
        setGeoStatus("idle");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onFocus={() => { setFocused(true); if (filtered.length > 0) setOpen(true); }}
          onBlur={() => setFocused(false)}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          placeholder="Ex: 3500 Boulevard de Maisonneuve O, Montréal"
          className="w-full bg-white border focus:outline-none rounded-xl h-11 pl-10 pr-10 text-sm transition-colors"
          style={{
            borderColor: focused
              ? geoStatus === "valid"   ? "#22C55E"
              : geoStatus === "not_found" ? "#EF4444"
              : YELLOW
              : geoStatus === "valid"   ? "#22C55E"
              : geoStatus === "not_found" ? "#EF4444"
              : "#E5E7EB",
          }}
          autoComplete="off"
        />
        {/* Geocoding status indicator */}
        <span className="absolute right-3 flex items-center justify-center w-5 h-5">
          {geoStatus === "loading" && (
            <span className="w-4 h-4 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
          )}
          {geoStatus === "valid" && (
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {geoStatus === "not_found" && (
            <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      </div>
      {/* Geocoding hint */}
      {geoStatus === "valid" && (
        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Adresse reconnue sur la carte
        </p>
      )}
      {geoStatus === "not_found" && (
        <p className="mt-1 text-xs text-red-400">
          Adresse introuvable — vérifiez l'orthographe ou saisissez une adresse plus précise.
        </p>
      )}
      {open && filtered.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {filtered.map((s, i) => (
            <button key={i} type="button"
              className="w-full text-left flex items-start gap-2.5 px-4 py-3 hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-b-0"
              onMouseDown={e => {
                e.preventDefault();
                onSelect(s);
                setOpen(false);
                setGeoStatus("valid");
              }}>
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-800 font-medium">{highlightMatch(s.street, value)}</p>
                <p className="text-xs text-gray-400">{s.city}, {s.province} · {s.postalCode}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Image row preview ──────────────────────────────────────── */
function ImageRow({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
      <img src={url} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0 border border-gray-200" />
      <span className="flex-1 text-xs text-gray-500 truncate">{url.startsWith("data:") ? "Photo importée depuis l'appareil" : url}</span>
      <button type="button" onClick={onRemove}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Floor stepper ─────────────────────────────────────────── */
function floorLabel(v: number | null | undefined, mode: "floor" | "building"): string {
  if (v == null) return "—";
  if (mode === "floor") {
    if (v === -1) return "Sous-sol";
    if (v === 0)  return "Rez-de-chaussée";
    return `${v}${v === 1 ? "er" : "e"} étage`;
  } else {
    if (v === -1) return "Sous-sol + RDC";
    if (v === 0)  return "RDC seulement";
    return `${v} étage${v > 1 ? "s" : ""}`;
  }
}

function FloorStepper({ value, onChange, mode, min = -1, max }: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  mode: "floor" | "building";
  min?: number;
  max: number;
}) {
  const current = value ?? null;
  const dec = () => {
    if (current === null) { onChange(max); return; }
    if (current <= min) { onChange(null); return; }
    onChange(current - 1);
  };
  const inc = () => {
    if (current === null) { onChange(min); return; }
    if (current >= max) return;
    onChange(current + 1);
  };
  return (
    <div className="flex items-center gap-0 rounded-xl border border-gray-200 h-11 overflow-hidden focus-within:border-[#F5A623] transition-colors">
      <button type="button" onClick={dec}
        className="flex items-center justify-center w-10 h-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors shrink-0 border-r border-gray-100">
        <ChevronDown className="w-4 h-4" />
      </button>
      <span className="flex-1 text-center text-sm font-medium text-gray-800 select-none px-2 truncate">
        {floorLabel(current, mode)}
      </span>
      <button type="button" onClick={inc}
        className="flex items-center justify-center w-10 h-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors shrink-0 border-l border-gray-100">
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Visit availability scheduler ──────────────────────────── */
type VisitSlot = { date: string; times: string[] };

const VISIT_TIMES = ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const MONTHS_FR   = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR     = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
const DAY_NAMES   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

function VisitScheduler({ value, onChange }: {
  value: VisitSlot[];
  onChange: (s: VisitSlot[]) => void;
}) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  /* Build grid cells (Mon-first) */
  const firstDow   = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const toKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const selectedDates = new Set(value.map(s => s.date));

  const toggleDate = (day: number) => {
    const key = toKey(day);
    if (new Date(year, month, day) < today) return;
    if (selectedDates.has(key)) {
      onChange(value.filter(s => s.date !== key));
      if (editingDate === key) setEditingDate(null);
    } else {
      onChange([...value, { date: key, times: [] }]);
      setEditingDate(key);
    }
  };

  const removeDate = (key: string) => {
    onChange(value.filter(s => s.date !== key));
    if (editingDate === key) setEditingDate(null);
  };

  const toggleTime = (date: string, t: string) => {
    onChange(value.map(s => {
      if (s.date !== date) return s;
      const has = s.times.includes(t);
      return { ...s, times: has ? s.times.filter(x => x !== t) : [...s.times, t].sort() };
    }));
  };

  const editingSlot = value.find(s => s.date === editingDate);

  const formatLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return `${DAY_NAMES[dt.getDay()]} ${d} ${MONTHS_FR[m - 1].toLowerCase()}`;
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-sm font-semibold text-gray-800">{MONTHS_FR[month]} {year}</span>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/40">
        {DAYS_FR.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1.5 uppercase tracking-wide">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-gray-100">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="bg-white h-9" />;
          const key     = toKey(day);
          const isPast  = new Date(year, month, day) < today;
          const isSel   = selectedDates.has(key);
          const isEdit  = editingDate === key;
          const hasTimes = (value.find(s => s.date === key)?.times.length ?? 0) > 0;
          return (
            <button key={i} type="button" disabled={isPast} onClick={() => toggleDate(day)}
              className={`relative bg-white h-9 flex flex-col items-center justify-center text-xs font-medium transition-colors
                ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-amber-50 cursor-pointer"}
                ${isSel && !isEdit ? "bg-amber-50 font-semibold" : ""}
                ${isEdit ? "ring-2 ring-inset ring-[#F5A623]" : ""}`}
              style={isSel ? { color: YELLOW } : {}}>
              {day}
              {isSel && hasTimes && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F5A623]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Time slot editor for selected date */}
      {editingDate && editingSlot && (
        <div className="border-t border-amber-100 px-4 py-3 bg-amber-50/40">
          <p className="text-xs font-semibold text-gray-600 mb-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Créneaux horaires — {formatLabel(editingDate)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {VISIT_TIMES.map(t => {
              const active = editingSlot.times.includes(t);
              return (
                <button key={t} type="button" onClick={() => toggleTime(editingDate, t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                    ${active
                      ? "border-[#F5A623] bg-[#FEF9EE] text-[#D97706]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
                  {t}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-gray-400">Cliquez sur les horaires pour les activer / désactiver</p>
        </div>
      )}

      {/* Summary */}
      {value.length > 0 ? (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Récapitulatif des disponibilités</p>
          <div className="space-y-1.5">
            {[...value].sort((a,b) => a.date.localeCompare(b.date)).map(s => (
              <div key={s.date} className="flex items-start gap-2 text-xs">
                <button type="button" onClick={() => removeDate(s.date)}
                  className="mt-0.5 text-gray-300 hover:text-red-400 transition-colors shrink-0">
                  <X className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => setEditingDate(s.date === editingDate ? null : s.date)}
                  className="font-semibold text-gray-700 hover:text-[#F5A623] transition-colors min-w-[80px] text-left shrink-0">
                  {formatLabel(s.date)}
                </button>
                {s.times.length > 0
                  ? <span className="text-gray-500">{s.times.join(", ")}</span>
                  : <span className="text-amber-400 italic">Aucun créneau sélectionné</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Cliquez sur une date pour définir vos disponibilités</p>
        </div>
      )}
    </div>
  );
}

/* ─── Nearby place chip ──────────────────────────────────────── */
function PlaceChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 text-gray-700">
      {label}
      <button type="button" onClick={onRemove} className="text-gray-400 hover:text-gray-600">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function ProPropertyNew() {
  const [, setLocation]    = useLocation();
  const queryClient        = useQueryClient();
  const { toast }          = useToast();
  const createProperty     = useCreateProperty();
  const [showPricing, setShowPricing] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  /* Amenities */
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const toggleAmenity = (id: string) =>
    setSelectedAmenities(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* Images */
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const addImage = () => setImageUrls(p => [...p, ""]);
  const removeImage = (i: number) => setImageUrls(p => p.filter((_, j) => j !== i));
  const updateImage = (i: number, v: string) => setImageUrls(p => p.map((u, j) => j === i ? v : u));
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
    setImageUrls(prev => {
      const withoutEmpty = prev.filter(u => u.trim());
      return [...withoutEmpty, ...dataUrls];
    });
    e.target.value = "";
  };

  /* Floor plan */
  const [floorPlanUrl, setFloorPlanUrl] = useState("");
  const floorPlanFileRef = useRef<HTMLInputElement>(null);
  const handleFloorPlanFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setFloorPlanUrl(dataUrl);
    e.target.value = "";
  };

  /* Attachments */
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const attachmentFileRef = useRef<HTMLInputElement>(null);
  const handleAttachmentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newAttachments = await Promise.all(files.map(async f => ({
      name: f.name,
      url:  await readFileAsDataUrl(f),
    })));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = "";
  };
  const removeAttachment = (i: number) => setAttachments(p => p.filter((_, j) => j !== i));

  /* Co-living rooms */
  type CoLivingRoom = { price: string; status: "available" | "rented" | "soon"; availableFrom: string };
  const [coLivingRooms, setCoLivingRooms] = useState<CoLivingRoom[]>([]);
  const [samePriceForAll, setSamePriceForAll] = useState(false);

  /* Visit availability */
  const [visitSlots, setVisitSlots] = useState<VisitSlot[]>([]);

  /* Nearby places loading */
  const [nearbyLoading, setNearbyLoading] = useState(false);

  /* Nearby places */
  const [nearbyPlaces, setNearbyPlaces] = useState<string[]>([]);

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
      floor: undefined, virtualTourUrl: "",
      apartmentNumber: "", buildingFloors: undefined,
      housingAidEligible: false,
      dpeClass: undefined, dpeAnnualCostMin: undefined, dpeAnnualCostMax: undefined,
      floorPlan: "",
    },
  });

  const watchType     = form.watch("type");
  const watchBedrooms = form.watch("bedrooms");
  const watchDpeClass = form.watch("dpeClass");
  const watchHousingAid = form.watch("housingAidEligible");

  /* For co-living: enforce min 2 bedrooms */
  useEffect(() => {
    if (watchType === "co-living") {
      const beds = Number(form.getValues("bedrooms")) || 0;
      if (beds < 2) form.setValue("bedrooms", 2 as any);
    }
  }, [watchType]);

  /* Sync coLivingRooms with bedroom count */
  useEffect(() => {
    if (watchType === "co-living") {
      const count = Math.max(2, Number(watchBedrooms) || 2);
      setCoLivingRooms(prev =>
        Array.from({ length: count }, (_, i) => prev[i] ?? { price: "", status: "available" as const, availableFrom: "" })
      );
    }
  }, [watchBedrooms, watchType]);

  /* Fetch nearby places from Overpass when address is geocoded */
  const handleGeocode = async (lat: number, lon: number) => {
    setNearbyLoading(true);
    setNearbyPlaces([]);
    try {
      const places = await fetchNearbyFromOverpass(lat, lon);
      setNearbyPlaces(places);
    } catch {
      // silently fall back to empty
    } finally {
      setNearbyLoading(false);
    }
  };

  const onSubmit = (data: PropertyFormValues) => {
    const validImages = imageUrls.filter(u => u.trim());
    if (validImages.length === 0) {
      setImageError("Au moins une photo est requise.");
      return;
    }
    setImageError(null);

    const amenitiesArr = Array.from(selectedAmenities).map(id => {
      for (const group of AMENITY_GROUPS) {
        const item = group.items.find(i => i.id === id);
        if (item) return item.label;
      }
      return id;
    });
    const roomsPayload = watchType === "co-living"
      ? coLivingRooms.map((r, i) => ({
          number: i + 1,
          price: r.price ? Number(r.price) : null,
          status: r.status,
          ...(r.status === "soon" && r.availableFrom ? { availableFrom: r.availableFrom } : {}),
        }))
      : [];
    const fullAddress = postalCode
      ? `${data.address}, ${postalCode}`
      : data.address;

    const effectiveFloorPlan = data.floorPlan?.trim() || floorPlanUrl || null;

    const payload = {
      ...data,
      address: fullAddress,
      amenities: amenitiesArr,
      nearbyPlaces,
      images: validImages,
      rooms: roomsPayload,
      floor: data.floor ?? null,
      apartmentNumber: data.apartmentNumber?.trim() || null,
      buildingFloors: data.buildingFloors ?? null,
      housingAidEligible: data.housingAidEligible ?? false,
      dpeClass: data.dpeClass ?? null,
      dpeAnnualCostMin: data.dpeAnnualCostMin ?? null,
      dpeAnnualCostMax: data.dpeAnnualCostMax ?? null,
      floorPlan: effectiveFloorPlan,
      attachments,
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

  const InfoIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>;
  const RulerIcon   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16L16 2l6 6L8 22 2 16z"/><path d="M8 8l8 8"/><path d="M6 10l2 2"/><path d="M10 6l2 2"/></svg>;
  const SparkleIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
  const CameraIcon  = () => <Camera className="w-4 h-4" />;
  const VideoIcon2  = () => <Video className="w-4 h-4" />;
  const MapPinIcon  = () => <MapPin className="w-4 h-4" />;
  const ZapIcon     = () => <Zap className="w-4 h-4" />;
  const FileIcon    = () => <FileText className="w-4 h-4" />;
  const PaperclipIcon = () => <Paperclip className="w-4 h-4" />;

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
              <div className={`grid gap-4 ${isResidential(watchType) ? "grid-cols-1 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
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

                <FormField control={form.control} name="floor" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Étage</FormLabel>
                    <FormControl>
                      <FloorStepper
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                        mode="floor"
                        min={-1}
                        max={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {isResidential(watchType) && (
                  <FormField control={form.control} name="bedrooms" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Chambres</FormLabel>
                      <FormControl>
                        <Input type="number" min={watchType === "co-living" ? 2 : 0} {...field} value={field.value ?? ""} placeholder="2"
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

              {/* Co-living rooms */}
              {watchType === "co-living" && coLivingRooms.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">Détail des chambres</p>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span
                        onClick={() => {
                          const next = !samePriceForAll;
                          setSamePriceForAll(next);
                          if (next && coLivingRooms.length > 0) {
                            const ref = coLivingRooms[0].price;
                            setCoLivingRooms(p => p.map(r => ({ ...r, price: ref })));
                          }
                        }}
                        className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                        style={{ background: samePriceForAll ? YELLOW : "white", borderColor: samePriceForAll ? YELLOW : "#D1D5DB" }}
                      >
                        {samePriceForAll && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </span>
                      <span className="text-xs font-semibold text-amber-900">Même loyer pour toutes les chambres</span>
                    </label>
                  </div>
                  {coLivingRooms.map((room, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-amber-100 space-y-3">
                      <p className="text-sm font-bold text-gray-800">Chambre {i + 1}</p>
                      <div className={`grid gap-3 ${room.status === "soon" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Loyer (CA$/mois)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                            <input type="number" value={room.price} min={0}
                              disabled={samePriceForAll && i > 0}
                              onChange={e => {
                                const val = e.target.value;
                                setCoLivingRooms(p => samePriceForAll
                                  ? p.map(r => ({ ...r, price: val }))
                                  : p.map((r, j) => j === i ? { ...r, price: val } : r)
                                );
                              }}
                              placeholder="850"
                              className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-10 pl-7 pr-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Statut</label>
                          <select value={room.status}
                            onChange={e => setCoLivingRooms(p => p.map((r, j) => j === i ? { ...r, status: e.target.value as CoLivingRoom["status"] } : r))}
                            className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-10 px-3 text-sm transition-colors">
                            <option value="available">✅ Disponible</option>
                            <option value="rented">🔴 Loué</option>
                            <option value="soon">⏰ Disponible bientôt</option>
                          </select>
                        </div>
                        {room.status === "soon" && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Disponible à partir du</label>
                            <input type="date" value={room.availableFrom}
                              onChange={e => setCoLivingRooms(p => p.map((r, j) => j === i ? { ...r, availableFrom: e.target.value } : r))}
                              className="w-full bg-white border border-gray-200 focus:border-[#F5A623] focus:outline-none rounded-xl h-10 px-3 text-sm transition-colors" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                          onClick={() => toggleAmenity(item.id)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer select-none transition-all"
                          style={{
                            borderColor: checked ? YELLOW : "#E5E7EB",
                            background:  checked ? "#FFF8EE" : "#FAFAFA",
                          }}>
                          <span
                            className="w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-all"
                            style={{
                              background:  checked ? YELLOW : "white",
                              borderColor: checked ? YELLOW : "#D1D5DB",
                            }}
                          >
                            {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                          </span>
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 4. Médias (photos) ── */}
          <Section icon={CameraIcon} title="Photos *"
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
              <div className="flex gap-2">
                <button type="button" onClick={addImage}
                  className="flex-1 flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] justify-center transition-all">
                  <Plus className="w-4 h-4" />
                  Ajouter un lien URL
                </button>
                <button type="button"
                  onClick={() => imageFileRef.current?.click()}
                  className="flex-1 flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] justify-center transition-all">
                  <Camera className="w-4 h-4" />
                  Importer depuis l'appareil
                </button>
                <input ref={imageFileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={handleImageFileChange} />
              </div>
              {imageError && <p className="text-xs text-red-500 font-medium">{imageError}</p>}
              <p className="text-xs text-gray-400 text-center">{imageUrls.filter(u => u.trim()).length} photo(s) ajoutée(s)</p>
            </div>
          </Section>

          {/* ── 5. Visite virtuelle ── */}
          <Section icon={VideoIcon2} title="Visite virtuelle"
            subtitle="Augmentez vos candidatures avec une visite 3D immersive">
            <div className="space-y-4">
              {/* Option A: own URL */}
              <FormField control={form.control} name="virtualTourUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Mon lien de visite virtuelle</FormLabel>
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

              {/* Option B: in-person visit availability scheduler */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EFF6FF" }}>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Disponibilités pour visites sur place</p>
                    <p className="text-xs text-gray-500">Définissez vos dates et créneaux horaires — les candidats pourront les voir.</p>
                  </div>
                </div>
                <VisitScheduler value={visitSlots} onChange={setVisitSlots} />
              </div>

              {/* Option C: BLOQ5 Pro 3D scan */}
              <div className="flex items-center gap-4 py-3 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF8EE" }}>
                  <Video className="w-5 h-5" style={{ color: YELLOW }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Visite 3D Matterport par BLOQ5</p>
                  <p className="text-xs text-gray-500">Nos équipes se déplacent pour créer votre visite 3D professionnelle — inclus dans les formules Pro & Premium.</p>
                </div>
                <a href="/pro/subscription"
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-85"
                  style={{ background: YELLOW, color: "#1A1A1A" }}>
                  Voir les offres
                </a>
              </div>
            </div>
          </Section>

          {/* ── 6. Plan du bâtiment ── */}
          <Section icon={FileIcon} title="Plan du bâtiment"
            subtitle="Ajoutez le plan de l'appartement ou de l'immeuble (optionnel)">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL du plan</label>
                <FormField control={form.control} name="floorPlan" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input {...field} value={field.value ?? ""} placeholder="https://... (lien vers le plan)"
                          className="rounded-xl h-11 pl-10 focus-visible:ring-[#F5A623]"
                          onChange={e => { field.onChange(e); if (e.target.value) setFloorPlanUrl(""); }} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">ou</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <button type="button"
                onClick={() => floorPlanFileRef.current?.click()}
                className="w-full flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] justify-center transition-all">
                <FileText className="w-4 h-4" />
                Importer un plan depuis l'appareil
              </button>
              <input ref={floorPlanFileRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={handleFloorPlanFileChange} />
              {floorPlanUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                  {floorPlanUrl.startsWith("data:image") ? (
                    <img src={floorPlanUrl} alt="Plan" className="w-14 h-10 rounded-lg object-cover border border-gray-200" />
                  ) : (
                    <div className="w-14 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <span className="flex-1 text-xs text-gray-500 truncate">Plan importé depuis l'appareil</span>
                  <button type="button" onClick={() => setFloorPlanUrl("")}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </Section>

          {/* ── 7. Pièces jointes ── */}
          <Section icon={PaperclipIcon} title="Pièces jointes"
            subtitle="Documents annexes : règlement intérieur, diagnostics, etc. (optionnel)">
            <div className="space-y-3">
              {attachments.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Aucune pièce jointe — section affichée comme N/D sur l'annonce.</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="flex-1 text-sm text-gray-700 truncate">{a.name}</span>
                      <button type="button" onClick={() => removeAttachment(i)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button"
                onClick={() => attachmentFileRef.current?.click()}
                className="w-full flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#F5A623] hover:text-[#F5A623] justify-center transition-all">
                <Paperclip className="w-4 h-4" />
                Ajouter des pièces jointes
              </button>
              <input ref={attachmentFileRef} type="file" multiple className="hidden"
                onChange={handleAttachmentFileChange} />
            </div>
          </Section>

          {/* ── 8. DPE — Diagnostic de performance énergétique ── */}
          <Section icon={ZapIcon} title="Diagnostic de performance énergétique (DPE)"
            subtitle="Optionnel — renseigne la classe énergétique et le coût estimé">
            <div className="space-y-4">
              <FormField control={form.control} name="dpeClass" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Classe DPE</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {DPE_CLASSES.map(cls => {
                      const selected = field.value === cls;
                      return (
                        <button key={cls} type="button"
                          onClick={() => field.onChange(selected ? null : cls)}
                          className="w-10 h-10 rounded-xl font-extrabold text-sm border-2 transition-all flex items-center justify-center"
                          style={{
                            background:  selected ? DPE_COLORS[cls] : "#F9FAFB",
                            borderColor: selected ? DPE_COLORS[cls] : "#E5E7EB",
                            color:       selected ? "#fff" : DPE_COLORS[cls],
                          }}>
                          {cls}
                        </button>
                      );
                    })}
                    {field.value && (
                      <button type="button" onClick={() => field.onChange(null)}
                        className="px-3 h-10 rounded-xl text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 transition-colors">
                        Effacer
                      </button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              {watchDpeClass && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dpeAnnualCostMin" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Coût annuel min (CA$)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                          <Input type="number" min={0} {...field} value={field.value ?? ""} placeholder="800"
                            className="rounded-xl h-11 pl-7 focus-visible:ring-[#F5A623]" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dpeAnnualCostMax" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Coût annuel max (CA$)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                          <Input type="number" min={0} {...field} value={field.value ?? ""} placeholder="1 200"
                            className="rounded-xl h-11 pl-7 focus-visible:ring-[#F5A623]" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}
            </div>
          </Section>

          {/* ── 9. Localisation ── */}
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
                      onGeocode={handleGeocode}
                      onSelect={s => {
                        field.onChange(s.street);
                        form.setValue("city", s.city);
                        form.setValue("country", s.country);
                        setPostalCode(s.postalCode);
                        setProvince(s.province);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <FormField control={form.control} name="apartmentNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">N° appartement</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="3B"
                        className="rounded-xl h-11 focus-visible:ring-[#F5A623]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="buildingFloors" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Étages bâtiment</FormLabel>
                    <FormControl>
                      <FloorStepper
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                        mode="building"
                        min={-1}
                        max={30}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div>
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
                <div>
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
              </div>

              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Ville *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Montréal"
                      className="rounded-xl h-11 focus-visible:ring-[#F5A623]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

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
                  {nearbyLoading && (
                    <span className="flex items-center gap-1.5 text-xs text-amber-500">
                      <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin inline-block" />
                      Recherche en cours…
                    </span>
                  )}
                  {!nearbyLoading && nearbyPlaces.length > 0 && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      {nearbyPlaces.length} résultats réels · OpenStreetMap
                    </span>
                  )}
                </div>
                {nearbyLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="inline-block h-7 rounded-full bg-gray-100 animate-pulse"
                        style={{ width: `${70 + (i * 23) % 60}px` }} />
                    ))}
                  </div>
                ) : nearbyPlaces.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {nearbyPlaces.map((p, i) => (
                      <PlaceChip key={i} label={p} onRemove={() => setNearbyPlaces(prev => prev.filter((_, j) => j !== i))} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                    <MapPin className="w-4 h-4 text-gray-300" />
                    <span className="text-xs text-gray-400">
                      Saisissez l'adresse complète — les équipements réels à proximité s'afficheront automatiquement.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ── 10. Aides & conditions ── */}
          <Section icon={InfoIcon} title="Aides & conditions"
            subtitle="Informations sur l'éligibilité aux aides au logement">
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-0.5">
                  <button type="button"
                    onClick={() => form.setValue("housingAidEligible", !watchHousingAid)}
                    className="w-5 h-5 rounded flex items-center justify-center border-2 transition-all"
                    style={{
                      background:  watchHousingAid ? YELLOW : "white",
                      borderColor: watchHousingAid ? YELLOW : "#D1D5DB",
                    }}>
                    {watchHousingAid && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">Éligible aux aides au logement (RGI, PHAP)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ce logement est éligible aux aides au logement provinciaux ou fédéraux. Cette information sera affichée sur l'annonce.</p>
                </div>
              </label>
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
