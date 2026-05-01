import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetFeaturedProperties } from "@workspace/api-client-react";
import { useLocation_ } from "@/context/location-context";
import { PublicNavbar } from "@/components/public-navbar";
import {
  Search, ChevronDown, Bed, Bath, Maximize2, MapPin,
  CheckCircle, FileText, PenLine, ClipboardList, ChevronRight,
  SlidersHorizontal, Home, Building2, Users, Briefcase, Store,
  X, Wifi, Zap, Flame, Droplets, Wind, Car, PawPrint,
  LayoutGrid, ChevronUp, Factory
} from "lucide-react";

const YELLOW = "#F5A623";


/* ── Budget slider: logarithmic scale 0 → 1 000 000 ── */
const BUDGET_MAX = 1_000_000;
const BUDGET_STEPS = 1000;
function sliderToBudget(v: number) {
  if (v === 0) return 0;
  if (v >= BUDGET_STEPS) return BUDGET_MAX;
  return Math.round(Math.pow(BUDGET_MAX, v / BUDGET_STEPS));
}
function formatBudget(v: number, symbol: string) {
  if (v >= BUDGET_MAX) return `Sans limite`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} k${symbol}/mois`;
  return `${v} ${symbol}/mois`;
}

/* ── Static fallback data — per country ── */
type StaticProp = { title: string; city: string; price: number; bedrooms: number; bathrooms: number; area: number; img: string };

const STATIC_PROPS_MAP: Record<string, StaticProp[]> = {
  FR: [
    { title: "Appartement T3 – centre historique",  city: "Lyon",        price: 1350, bedrooms: 2, bathrooms: 1, area: 68,  img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80" },
    { title: "Maison individuelle – jardin privé",  city: "Bordeaux",    price: 2200, bedrooms: 4, bathrooms: 2, area: 145, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80" },
    { title: "Bureau clé en main – 12 postes",      city: "Paris",       price: 5200, bedrooms: 0, bathrooms: 2, area: 210, img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80" },
    { title: "Local commercial – pied d'immeuble",  city: "Toulouse",    price: 1900, bedrooms: 0, bathrooms: 1, area: 85,  img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80" },
    { title: "Entrepôt logistique – accès A62",     city: "Bordeaux",    price: 3800, bedrooms: 0, bathrooms: 2, area: 600, img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80" },
    { title: "Colocation – 4 chambres meublées",    city: "Nice",        price: 680,  bedrooms: 1, bathrooms: 1, area: 22,  img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80" },
  ],
  CA: [
    { title: "Appartement 4½ – Plateau Mont-Royal", city: "Montréal",    price: 2100, bedrooms: 2, bathrooms: 1, area: 72,  img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80" },
    { title: "Maison unifamiliale – banlieue sud",  city: "Toronto",     price: 3900, bedrooms: 4, bathrooms: 2, area: 180, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80" },
    { title: "Bureau moderne – Downtown core",      city: "Vancouver",   price: 7200, bedrooms: 0, bathrooms: 2, area: 240, img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80" },
    { title: "Local commercial – rue Sainte-Cath.", city: "Montréal",    price: 3200, bedrooms: 0, bathrooms: 1, area: 110, img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80" },
    { title: "Entrepôt industriel – zone logistique",city: "Calgary",    price: 5500, bedrooms: 0, bathrooms: 2, area: 850, img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80" },
    { title: "Colocation – chambre privée meublée", city: "Québec",      price: 950,  bedrooms: 1, bathrooms: 1, area: 20,  img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80" },
  ],
};

type Article = { category: string; title: string; img: string };
const ARTICLES_MAP: Record<string, Article[]> = {
  FR: [
    { category: "Guide propriétaire", title: "Gestion locative : comment déléguer efficacement ?",  img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80" },
    { category: "Marché commercial",  title: "Louer un local commercial : les clauses à connaître", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80" },
    { category: "Immobilier industriel", title: "Entrepôts et ateliers : le marché locatif en 2025", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80" },
  ],
  CA: [
    { category: "Guide propriétaire", title: "Gestion locative au Canada : déléguer en toute sérénité", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80" },
    { category: "Marché commercial",  title: "Bail commercial au Québec : ce que tout propriétaire doit savoir", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80" },
    { category: "Industriel & Logistique", title: "Espaces industriels au Canada : tendances et opportunités 2025", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80" },
  ],
};

const CATEGORIES = [
  { icon: Building2, label: "Appartements", type: "apartment" },
  { icon: Home,      label: "Maisons",      type: "house" },
  { icon: Users,     label: "Colocations",  type: "co-living" },
  { icon: Briefcase, label: "Bureaux",      type: "office" },
  { icon: Store,     label: "Commerciales", type: "commercial" },
  { icon: Factory,   label: "Industriel",   type: "industrial" },
];

/* ── Pill selector helper ── */
function PillGroup({ options, value, onChange }: { options: (string | number)[]; value: string | number; onChange: (v: string | number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
          style={value === opt
            ? { background: YELLOW, borderColor: YELLOW, color: "#1A1A1A" }
            : { background: "white", borderColor: "#D1D5DB", color: "#4B5563" }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ── Toggle chip ── */
function Chip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
      style={checked
        ? { background: YELLOW, borderColor: YELLOW, color: "#1A1A1A" }
        : { background: "white", borderColor: "#D1D5DB", color: "#4B5563" }}
    >
      {checked && <CheckCircle className="w-3 h-3" />}
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { country } = useLocation_();
  const currency = country.currency;
  const { data: featured } = useGetFeaturedProperties();

  /* Country-aware static data */
  const STATIC_PROPS = STATIC_PROPS_MAP[country.code] ?? STATIC_PROPS_MAP.FR;
  const ARTICLES     = ARTICLES_MAP[country.code]     ?? ARTICLES_MAP.FR;

  /* Footer SEO: distribute cities across 4 columns */
  const allCityNames   = country.cities.map((c) => c.name);
  const footerCityCols = [0, 1, 2, 3].map((i) => allCityNames.filter((_, idx) => idx % 4 === i));

  /* Search state */
  const [budgetSlider, setBudgetSlider] = useState(BUDGET_STEPS);
  const [showFilters, setShowFilters] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState("");
  const [, navigate] = useLocation();

  function handleSearch() {
    const q = new URLSearchParams();
    if (searchCity.trim()) q.set("city", searchCity.trim());
    if (searchType) q.set("type", searchType);
    if (budgetSlider < BUDGET_STEPS) q.set("maxPrice", String(budgetSlider * 50));
    navigate(`/properties?${q.toString()}`);
  }

  /* Filter state */
  const [bedrooms,    setBedrooms]    = useState<string | number>("Tout");
  const [bathrooms,   setBathrooms]   = useState<string | number>("Tout");
  const [diningRooms, setDiningRooms] = useState<string | number>("Tout");
  const [areaMin,     setAreaMin]     = useState(0);
  const [areaMax,     setAreaMax]     = useState(500);
  const [furnished,   setFurnished]   = useState("Tout");
  const [amenities,   setAmenities]   = useState<Set<string>>(new Set());
  const [garage,      setGarage]      = useState(false);
  const [parking,     setParking]     = useState(false);
  const [pets,        setPets]        = useState(false);

  function toggleAmenity(key: string) {
    setAmenities((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const AMENITY_LIST = [
    { key: "electricity", label: "Électricité",    icon: Zap },
    { key: "heating",     label: "Chauffage",      icon: Flame },
    { key: "internet",    label: "Internet / WiFi", icon: Wifi },
    { key: "hot_water",   label: "Eau chaude",     icon: Droplets },
    { key: "ac",          label: "Climatisation",  icon: Wind },
  ];

  const budget = sliderToBudget(budgetSlider);

  const displayProps = (featured && featured.length > 0)
    ? featured.slice(0, 6).map((p, i) => ({
        title:     p.title,
        city:      p.city,
        price:     p.price,
        bedrooms:  p.bedrooms  ?? 1,
        bathrooms: p.bathrooms ?? 1,
        area:      p.area      ?? 20,
        img:       p.images?.[0] ?? STATIC_PROPS[i % STATIC_PROPS.length].img,
        id:        p.id,
      }))
    : STATIC_PROPS.map((p, i) => ({ ...p, id: i + 1 }));

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .script-yellow { font-family: 'Dancing Script', cursive; color: ${YELLOW}; font-weight: 700; }
        .btn-yellow { background: ${YELLOW}; color: #1A1A1A; font-weight: 600; border-radius: 6px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 6px; transition: opacity .2s; border: none; cursor: pointer; }
        .btn-yellow:hover { opacity: 0.88; }
        .btn-outline-yellow { background: transparent; color: ${YELLOW}; border: 1.5px solid ${YELLOW}; font-weight: 600; border-radius: 6px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: background .2s, color .2s; }
        .btn-outline-yellow:hover { background: ${YELLOW}; color: #1A1A1A; }
        .btn-outline-dark { background: transparent; color: #1A1A1A; border: 1.5px solid #1A1A1A; font-weight: 600; border-radius: 6px; padding: 10px 20px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: background .2s; }
        .btn-outline-dark:hover { background: #f0f0f0; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 4px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${YELLOW}; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,.3); }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <PublicNavbar />

      {/* ─── HERO ─── */}
      <section
        className="relative flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1800&q=85)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "600px",
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14 text-center">
          {/* Badge */}
          <p className="text-white/80 text-sm font-medium mb-5">
            <span style={{ color: YELLOW }} className="mr-1 text-base">✳</span>
            BLOQ5 — La gestion immobilière locative, simplifiée
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-8">
            Tous vos biens, une seule{" "}
            <span className="script-yellow" style={{ fontSize: "1.1em" }}>Plateforme</span>
          </h1>

          {/* ── Search bar ── */}
          <div className="max-w-4xl mx-auto mb-4">
            {/* Desktop: horizontal bar */}
            <div className="hidden md:flex items-stretch bg-white rounded-xl overflow-hidden shadow-2xl">
              {/* Localisation */}
              <div className="flex items-center flex-1 px-5 py-4 border-r border-gray-200">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">Localisation</p>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="Ville, quartier, code postal…"
                    className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                  />
                </div>
              </div>
              {/* Type */}
              <div className="flex items-center px-5 py-4 border-r border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">Type de bien</p>
                  <select
                    value={searchType}
                    onChange={e => setSearchType(e.target.value)}
                    className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer pr-4"
                  >
                    <option value="">Tous types</option>
                    <option value="house">Maison</option>
                    <option value="apartment">Appartement</option>
                    <option value="condo">Condo</option>
                    <option value="co-living">Colocation</option>
                    <option value="office">Bureau</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
              {/* Budget slider */}
              <div className="flex items-center px-5 py-4 border-r border-gray-200 min-w-[180px]">
                <div className="w-full text-left">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide leading-none">Budget max.</p>
                    <span className="text-xs font-bold" style={{ color: YELLOW }}>{formatBudget(budget, currency.symbol)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={BUDGET_STEPS}
                    value={budgetSlider}
                    onChange={(e) => setBudgetSlider(Number(e.target.value))}
                    className="w-full"
                    style={{ background: `linear-gradient(to right, ${YELLOW} 0%, ${YELLOW} ${(budgetSlider / BUDGET_STEPS) * 100}%, #E5E7EB ${(budgetSlider / BUDGET_STEPS) * 100}%, #E5E7EB 100%)` }}
                  />
                </div>
              </div>
              {/* Filtres toggle */}
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="flex items-center gap-2 px-5 py-4 border-r border-gray-200 text-sm font-semibold transition-colors"
                style={showFilters ? { background: YELLOW, color: "#1A1A1A" } : { color: "#374151" }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
                {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {/* Search CTA */}
              <button onClick={handleSearch} className="flex items-center gap-2 px-7 text-sm font-bold transition-opacity hover:opacity-85 flex-shrink-0" style={{ background: YELLOW, color: "#1A1A1A" }}>
                <Search className="w-5 h-5" />
                Rechercher
              </button>
            </div>

            {/* Mobile: stacked card */}
            <div className="md:hidden bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Ville, quartier, code postal…"
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <select
                  value={searchType}
                  onChange={e => setSearchType(e.target.value)}
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                >
                  <option value="">Tous types de bien</option>
                  <option value="house">Maison</option>
                  <option value="apartment">Appartement</option>
                  <option value="condo">Condo</option>
                  <option value="co-living">Colocation</option>
                  <option value="office">Bureau</option>
                  <option value="commercial">Commercial</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Budget max.</p>
                  <span className="text-xs font-bold" style={{ color: YELLOW }}>{formatBudget(budget, currency.symbol)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={BUDGET_STEPS}
                  value={budgetSlider}
                  onChange={(e) => setBudgetSlider(Number(e.target.value))}
                  className="w-full"
                  style={{ background: `linear-gradient(to right, ${YELLOW} 0%, ${YELLOW} ${(budgetSlider / BUDGET_STEPS) * 100}%, #E5E7EB ${(budgetSlider / BUDGET_STEPS) * 100}%, #E5E7EB 100%)` }}
                />
              </div>
              <div className="flex items-center gap-2 p-3">
                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 flex-1 justify-center"
                  style={showFilters ? { background: YELLOW, color: "#1A1A1A", borderColor: YELLOW } : { color: "#374151" }}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtres
                </button>
                <button onClick={handleSearch} className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-85" style={{ background: YELLOW, color: "#1A1A1A" }}>
                  <Search className="w-4 h-4" />
                  Rechercher
                </button>
              </div>
            </div>

            {/* ── Expanded filter panel ── */}
            {showFilters && (
              <div className="bg-white rounded-xl shadow-2xl mt-2 p-6 text-left border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-base" style={{ color: "#1A1A1A" }}>Filtres avancés</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Chambres */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Chambres</p>
                    <PillGroup options={["Tout", 1, 2, 3, 4, "5+"]} value={bedrooms} onChange={setBedrooms} />
                  </div>

                  {/* Salles de bains */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Salles de bains</p>
                    <PillGroup options={["Tout", 1, 2, 3, "4+"]} value={bathrooms} onChange={setBathrooms} />
                  </div>

                  {/* Salles à manger */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Salles à manger / séjour</p>
                    <PillGroup options={["Tout", 1, 2, "3+"]} value={diningRooms} onChange={setDiningRooms} />
                  </div>

                  {/* Surface */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Surface — {areaMin} à {areaMax >= 500 ? "500+" : areaMax} m² / ft²
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min={0} max={500} step={5} value={areaMin}
                        onChange={(e) => setAreaMin(Math.min(Number(e.target.value), areaMax - 5))}
                        className="flex-1"
                        style={{ background: `linear-gradient(to right, #E5E7EB 0%, #E5E7EB ${(areaMin / 500) * 100}%, ${YELLOW} ${(areaMin / 500) * 100}%, ${YELLOW} ${(areaMax / 500) * 100}%, #E5E7EB ${(areaMax / 500) * 100}%, #E5E7EB 100%)` }}
                      />
                      <input
                        type="range" min={0} max={500} step={5} value={areaMax}
                        onChange={(e) => setAreaMax(Math.max(Number(e.target.value), areaMin + 5))}
                        className="flex-1"
                        style={{ background: `linear-gradient(to right, #E5E7EB 0%, #E5E7EB ${(areaMax / 500) * 100}%, ${YELLOW} ${(areaMax / 500) * 100}%, ${YELLOW} 100%)` }}
                      />
                    </div>
                  </div>

                  {/* Ameublement */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ameublement</p>
                    <PillGroup options={["Tout", "Meublé", "Semi-meublé", "Non meublé"]} value={furnished} onChange={(v) => setFurnished(String(v))} />
                  </div>

                  {/* Options booléennes */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Options</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip label="Garage" checked={garage} onChange={() => setGarage((v) => !v)} />
                      <Chip label="Parking" checked={parking} onChange={() => setParking((v) => !v)} />
                      <Chip label="Animaux acceptés" checked={pets} onChange={() => setPets((v) => !v)} />
                    </div>
                  </div>
                </div>

                {/* Aménités */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Aménités incluses</p>
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_LIST.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => toggleAmenity(a.key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                        style={amenities.has(a.key)
                          ? { background: YELLOW, borderColor: YELLOW, color: "#1A1A1A" }
                          : { background: "white", borderColor: "#D1D5DB", color: "#4B5563" }}
                      >
                        <a.icon className="w-3.5 h-3.5" />
                        {a.label}
                      </button>
                    ))}
                    <button
                      onClick={() => toggleAmenity("garage_car")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                      style={amenities.has("garage_car")
                        ? { background: YELLOW, borderColor: YELLOW, color: "#1A1A1A" }
                        : { background: "white", borderColor: "#D1D5DB", color: "#4B5563" }}
                    >
                      <Car className="w-3.5 h-3.5" /> Garage / Voiture
                    </button>
                    <button
                      onClick={() => toggleAmenity("pets")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                      style={amenities.has("pets")
                        ? { background: YELLOW, borderColor: YELLOW, color: "#1A1A1A" }
                        : { background: "white", borderColor: "#D1D5DB", color: "#4B5563" }}
                    >
                      <PawPrint className="w-3.5 h-3.5" /> Animaux
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex gap-3 justify-end">
                  <button
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                    onClick={() => {
                      setBedrooms("Tout"); setBathrooms("Tout"); setDiningRooms("Tout");
                      setAreaMin(0); setAreaMax(500); setFurnished("Tout");
                      setGarage(false); setParking(false); setPets(false);
                      setAmenities(new Set());
                    }}
                  >
                    Réinitialiser
                  </button>
                  <button className="btn-yellow text-sm px-6 py-2.5" onClick={() => setShowFilters(false)}>
                    Appliquer les filtres
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Category tiles ── */}
          <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
            {CATEGORIES.map((cat) => (
              <Link key={cat.type} href={`/cities?type=${cat.type}`}>
                <div className="flex flex-col items-center gap-1.5 bg-white rounded-xl px-5 py-3 shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 min-w-[90px]">
                  <cat.icon className="w-6 h-6" style={{ color: YELLOW }} />
                  <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NOS DERNIERS BIENS ─── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-3">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "#1A1A1A" }}>
              Nos derniers biens à{" "}
              <span className="script-yellow">louer</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Appartements, maisons, bureaux, locaux commerciaux et espaces industriels — des biens gérés et vérifiés par BLOQ5.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            {displayProps.map((prop, i) => (
              <Link key={i} href={`/properties/${prop.id}`}>
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group bg-white">
                  <div className="relative h-44 overflow-hidden">
                    <span className="absolute top-2.5 left-2.5 z-10 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">● Disponible</span>
                    <img src={prop.img} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-1">{prop.title}</h3>
                    <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                      {prop.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{prop.bedrooms} ch.</span>}
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{prop.bathrooms} sdb</span>
                      <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{prop.area} m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{prop.city}</span>
                      <span className="text-sm font-bold rounded-md px-3 py-1" style={{ background: YELLOW, color: "#1A1A1A" }}>
                        {prop.price} {currency.symbol}/mois
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/cities">
              <button className="btn-outline-yellow text-sm px-8 py-3">
                Des milliers de biens disponibles — Voir toutes les annonces <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className="py-14" style={{ background: "#F8F8F8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="md:flex md:gap-16 items-start">
            <div className="md:w-1/3 mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Comment ça marche ?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                BLOQ5 gère l'ensemble du cycle locatif pour tout type de bien — résidentiel, commercial ou industriel. Propriétaires et locataires, tout se fait en ligne.
              </p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Search,        color: "#E3F2FD", iconColor: "#1565C0", step: "Trouvez le bien adapté",      desc: "Appartements, maisons, bureaux, locaux commerciaux ou entrepôts industriels — filtrez par type, superficie et loyer." },
                { icon: FileText,      color: "#FFF3E0", iconColor: "#E65100", step: "Déposez votre dossier",       desc: "Dossier locataire ou bail commercial en quelques minutes, directement depuis l'application." },
                { icon: PenLine,       color: "#E8F5E9", iconColor: "#2E7D32", step: "Signez vos documents",        desc: "Signature électronique sécurisée : bail résidentiel, bail commercial, état des lieux et quittances." },
                { icon: ClipboardList, color: "#F3E5F5", iconColor: "#6A1B9A", step: "BLOQ5 gère pour vous",        desc: "Suivi des paiements, gestion des incidents, renouvellement de bail — nous nous occupons de tout." },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: s.color }}>
                    <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>{s.step}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── VILLES ─── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
            Nos villes <span style={{ color: YELLOW }}>coup de cœur</span>
          </h2>
          <p className="text-gray-500 text-sm mb-10">
            BLOQ5 est disponible dans les plus grandes métropoles {country.flag && <span>{country.flag} </span>}{country.name}.
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4 mb-8">
            {country.cities.slice(0, 8).map((city) => (
              <Link key={city.name} href={`/properties?city=${city.name}`}>
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg transition-shadow">
                    <img
                      src={`https://picsum.photos/seed/${city.slug}/160/160`}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{city.name}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/cities">
            <button className="btn-outline-yellow text-sm px-8 py-3">Voir toutes les villes</button>
          </Link>
        </div>
      </section>

      {/* ─── DOUBLE CTA ─── */}
      <section className="py-14" style={{ background: "#F8F8F8" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-8 flex flex-col" style={{ background: "#FEF9EE" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: YELLOW }}>✳ BLOQ5 Locataire</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Trouvez le bien qui correspond à votre activité.</h3>
            <p className="text-sm text-gray-500 mb-5">
              Appartement, maison, bureau, local commercial ou espace industriel — accédez à des milliers d'annonces vérifiées et postulez en ligne sans paperasse.
            </p>
            <ul className="space-y-2 mb-7">
              {["Résidentiel, commercial et industriel", "Dossier locataire ou bail commercial en ligne", "Visite virtuelle et signature électronique"].map((txt) => (
                <li key={txt} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#22C55E" }} />
                  {txt}
                </li>
              ))}
            </ul>
            <button className="btn-yellow self-start text-sm">Rechercher un bien</button>
          </div>

          <div className="rounded-2xl p-8 flex flex-col" style={{ background: YELLOW }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#7a4a00" }}>✳ BLOQ5 Propriétaire</div>
            <h3 className="text-xl font-bold mb-2 text-white">Publiez votre annonce et gérez votre bien sans effort.</h3>
            <p className="text-sm text-white/80 mb-5">
              Appartement, maison, bureau, local commercial ou entrepôt — confiez la gestion locative de tous vos biens à BLOQ5 : mise en location rapide, locataires qualifiés, suivi en temps réel.
            </p>
            <ul className="space-y-2 mb-7">
              {["Tous types de biens : résidentiel, commercial, industriel", "Bail résidentiel ou commercial rédigé et signé en ligne", "Gestion complète, tableaux de bord en temps réel"].map((txt) => (
                <li key={txt} className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-white" />
                  {txt}
                </li>
              ))}
            </ul>
            <button className="self-start text-sm font-semibold rounded-md px-5 py-2.5 transition-opacity hover:opacity-85" style={{ background: "#1A1A1A", color: "#fff" }}>
              Déposer mon annonce
            </button>
          </div>
        </div>
      </section>

      {/* ─── BIEN ENTOURÉE ─── */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="md:flex items-center gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>BLOQ5 bien entourée</h2>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Reconnu parmi les plateformes PropTech les plus innovantes au Canada, BLOQ5 simplifie la gestion locative de tous types de biens — appartements, maisons, bureaux, locaux commerciaux et espaces industriels — pour les propriétaires et les locataires.
              </p>
              <button className="btn-outline-dark text-sm px-6 py-2.5">En savoir +</button>
            </div>
            <div className="md:w-1/2 flex items-center justify-center gap-8 flex-wrap">
              {[
                { name: "bpifrance",      color: "#003189" },
                { name: "La French Tech", color: "#e03531" },
                { name: "Real Estech",    color: "#1A1A1A" },
              ].map((p) => (
                <div key={p.name} className="font-black text-lg" style={{ color: p.color }}>{p.name}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ARTICLES ─── */}
      <section className="py-14" style={{ background: "#F8F8F8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Nos articles</p>
              <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>L'actu immobilière de BLOQ5</h2>
            </div>
            <button className="btn-yellow text-sm px-5 py-2">Tous les articles</button>
          </div>
          <p className="text-sm text-gray-500 mb-8">Conseils, guides et tendances pour propriétaires et locataires — résidentiel, commercial et industriel.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.map((a, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="relative h-40 overflow-hidden">
                  <img src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: YELLOW }}>{a.category}</span>
                  <h4 className="font-semibold text-sm mt-1 leading-snug" style={{ color: "#1A1A1A" }}>{a.title}</h4>
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 font-medium">
                    Lire l'article <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#1A1A1A", color: "#ccc" }} className="pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="text-2xl font-black text-white mb-2">BLOQ<span style={{ color: YELLOW }}>5</span></div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">La plateforme de gestion immobilière locative — résidentiel, commercial et industriel.<br />Carte professionnelle : n°CIN 4567 219-005-539-504</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Nos services</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Gestion locative résidentielle", "Gestion locative commerciale", "Espaces industriels & logistique", "Location longue durée", "BLOQ5 Pro", "Tarifs"].map(l => (
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

          <div className="border-t border-gray-800 pt-8 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {["Location maison", "Location appartement", "Location colocation", "Location bureau"].map((title, colIdx) => (
              <div key={title}>
                <h5 className="text-xs font-semibold text-gray-400 mb-2">{title}</h5>
                <ul className="space-y-1">
                  {footerCityCols[colIdx].map((cityName) => (
                    <li key={cityName}>
                      <a href={`/properties?city=${encodeURIComponent(cityName)}`} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                        {cityName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-3">
            <p>© {new Date().getFullYear()} BLOQ5. Tous droits réservés.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-400">Mentions légales</a>
              <a href="#" className="hover:text-gray-400">Politique de confidentialité</a>
              <a href="#" className="hover:text-gray-400">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
