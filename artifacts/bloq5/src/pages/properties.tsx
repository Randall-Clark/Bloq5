import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useListProperties } from "@workspace/api-client-react";
import { useLocation_ } from "@/context/location-context";
import { authClient } from "@/lib/auth-client";
import { countryPrep } from "@/data/countries";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  Search, Bell, ChevronDown, ChevronLeft, ChevronRight, Map, List, X,
  SlidersHorizontal, Check,
  Bed, Bath, Maximize2, MapPin, Home, Building2, Users,
  Briefcase, Store, LayoutGrid,
} from "lucide-react";

const PropertiesMapView = lazy(() => import("@/components/properties-map-view"));

const YELLOW = "#F5A623";

/* ── Helpers ── */
function getSearchParam(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

type Status = "available" | "soon" | "occupied";

const STATUS_DATES = ["15/06", "01/07", "20/06", "10/07"];

function cardStatus(idx: number): Status {
  const r = idx % 7;
  if (r < 4) return "available";
  if (r < 6) return "soon";
  return "occupied";
}

function StatusBadge({ status, idx }: { status: Status; idx: number }) {
  if (status === "available")
    return (
      <span className="absolute top-2 left-2 z-10 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
        ● Disponible
      </span>
    );
  if (status === "soon")
    return (
      <span className="absolute top-2 left-2 z-10 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#E65100" }}>
        ⏰ Dispo le {STATUS_DATES[idx % STATUS_DATES.length]}
      </span>
    );
  return (
    <span className="absolute top-2 left-2 z-10 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#FFEBEE", color: "#C62828" }}>
      ● Occupé
    </span>
  );
}

/* ── Building SVG (same as cities page) ── */
function BuildingIllustration() {
  return (
    <svg viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="110" cy="185" rx="90" ry="10" fill="#E8E8E8" />
      <rect x="45" y="60" width="90" height="120" rx="3" fill={YELLOW} />
      <rect x="45" y="60" width="30" height="120" rx="3" fill="rgba(0,0,0,0.12)" />
      <polygon points="45,60 90,30 135,60" fill="#E8940A" />
      {[55,75,95,115].map(x => <rect key={x} x={x} y="75" width="14" height="18" rx="2" fill="white" opacity="0.85" />)}
      {[55,75,95,115].map(x => <rect key={x} x={x} y="105" width="14" height="18" rx="2" fill="white" opacity="0.85" />)}
      {[55,75,95,115].map(x => <rect key={x} x={x} y="135" width="14" height="18" rx="2" fill="white" opacity="0.55" />)}
      <rect x="80" y="148" width="20" height="32" rx="2" fill="#E8940A" />
      <circle cx="97" cy="165" r="2" fill={YELLOW} />
      <rect x="5" y="100" width="38" height="80" rx="2" fill="#FFD07A" />
      <rect x="5" y="100" width="12" height="80" fill="rgba(0,0,0,0.08)" />
      <polygon points="5,100 24,82 43,100" fill="#E8B84B" />
      <rect x="137" y="108" width="42" height="72" rx="2" fill="#FFD07A" />
      <rect x="137" y="108" width="14" height="72" fill="rgba(0,0,0,0.08)" />
      <polygon points="137,108 158,88 179,108" fill="#E8B84B" />
      <circle cx="68" cy="183" r="5" fill="#1A1A1A" />
      <rect x="64" y="188" width="8" height="10" rx="2" fill="#1A1A1A" />
      <circle cx="148" cy="183" r="5" fill="#555" />
      <rect x="144" y="188" width="8" height="10" rx="2" fill="#555" />
      <rect x="197" y="165" width="4" height="20" fill="#8B6914" />
      <circle cx="199" cy="158" r="14" fill="#4CAF50" opacity="0.8" />
    </svg>
  );
}

/* ── Static fallback cards ── */
const TYPES = ["Appartement 4½", "Maison unifamiliale", "Appartement 3½", "Appartement meublé", "Appartement 5½", "Chambre en colocation", "Bureau open-space", "Local commercial – rez-de-chaussée", "Entrepôt industriel", "Appartement 2 chambres", "Local d'activité mixte", "Bureau cloisonné"];
const AREAS = [72, 185, 55, 48, 105, 20, 210, 120, 850, 68, 380, 145];
const ROOMS = [2, 4, 1, 1, 3, 1, 0, 0, 0, 2, 0, 0];
const BATHS = [1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2];

/* Country-aware prices and neighborhoods */
const PRICES_MAP: Record<string, number[]> = {
  FR: [1100, 2800, 850, 690, 1650, 520, 4200, 2400, 6800, 1300, 5500, 3800],
  CA: [1800, 4200, 1350, 1050, 2600, 850, 6500, 3800, 9500, 2100, 8200, 5800],
};
const NEIGHBORHOODS_MAP: Record<string, string[]> = {
  FR: ["Plateau historique", "Banlieue résidentielle", "Quartier étudiant", "Centre-ville", "Quartier familial", "Campus universitaire", "Quartier d'affaires", "Artère commerciale", "Zone industrielle Est", "Quartier mixte", "Parc d'activités", "Tour de bureaux"],
  CA: ["Plateau Mont-Royal", "Banlieue de Toronto", "Côte-des-Neiges", "Centre-ville Montréal", "Quartier familial", "Vieux-Québec", "Downtown Vancouver", "Rue Sainte-Catherine", "Zone industrielle Saint-Laurent", "Quartier mixte Griffintown", "Parc industriel de Calgary", "Tour de bureaux Downtown"],
};
const NEARBY_REGIONS_MAP: Record<string, string[]> = {
  FR: ["Locations Hauts-de-Seine (92)", "Locations Seine-Saint-Denis (93)", "Locations Val-de-Marne (94)"],
  CA: ["Locations Montérégie", "Locations Laurentides", "Locations Lanaudière"],
};

/* ── Property card ── */
function PropCard({ id, idx, city, price, area, rooms, baths, arrond, title, currency, status: propStatus, type, image }: {
  id: number; idx: number; city: string; price: number; area: number; rooms: number;
  baths: number; arrond: string; title: string; currency: string;
  status?: string; type?: string; image?: string;
}) {
  /* Map real DB status to card badge status.
     Only fall back to the idx-based rotation when there is no real status (static fallback cards). */
  const status: "available" | "soon" | "occupied" =
    propStatus === "rented"      ? "occupied"
    : propStatus === "available"  ? "available"
    : propStatus === "maintenance" ? "soon"
    : cardStatus(idx);  // only for static fallback rows (no API data)
  const isOccupied = status === "occupied";
  const isCommercialType = type === "office" || type === "commercial";
  const isCoLiving = type === "co-living";

  const typeLabel = isCommercialType
    ? (type === "office" ? "Bureau" : "Commercial")
    : isCoLiving ? "Colocation" : type === "house" ? "Maison" : "Appartement";

  return (
    <Link href={`/properties/${id}`}>
      <div
        className="rounded-lg overflow-hidden bg-white cursor-pointer group transition-shadow hover:shadow-lg"
        style={{ border: "1px solid #E8E8E8" }}
      >
        {/* Photo */}
        <div className="relative" style={{ height: 170 }}>
          <StatusBadge status={status} idx={idx} />
          <img
            src={image || `https://picsum.photos/seed/prop${id}/370/170`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/prop${id}/370/170`; }}
          />
          {/* Type badge */}
          <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(0,0,0,0.55)", color: "white" }}>
            {typeLabel}
          </span>
        </div>

        {/* Body */}
        <div className="p-3">
          <h3 className="font-semibold text-sm mb-2 line-clamp-1" style={{ color: "#1A1A1A", fontSize: 14 }}>
            {title}
          </h3>

          {/* Characteristics */}
          <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "#555" }}>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" style={{ color: YELLOW }} />
              {area} m²
            </span>
            {!isCommercialType && rooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" style={{ color: YELLOW }} />
                {rooms} ch.
              </span>
            )}
            {baths > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" style={{ color: YELLOW }} />
                {baths} sdb
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #F0F0F0" }}>
            {isOccupied ? (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {arrond}
              </span>
            ) : (
              <span className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: YELLOW }}>
                <MapPin className="w-3 h-3" />
                {arrond}
              </span>
            )}
            {!isOccupied && (
              <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                {typeof price === "number" ? price.toLocaleString("fr-FR") : price}
                {" "}<span className="text-xs font-normal text-gray-400">{currency}/mois</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function PropertiesPage() {
  const { country } = useLocation_();
  const search = useSearch();                             // reactive search string
  const params = new URLSearchParams(search);
  const cityFromUrl = params.get("city") ?? "";
  const typeFromUrl = params.get("type") ?? "";
  const city = cityFromUrl || country.cities[0]?.name || "Montréal";

  const [searchInput, setSearchInput] = useState(city);
  const [filterType,  setFilterType]  = useState(typeFromUrl || "all");

  /* Keep searchInput in sync when city changes from URL */
  useEffect(() => { setSearchInput(city); }, [city]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterFurnished, setFilterFurnished] = useState<"all" | "yes" | "no">("all");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterBedrooms, setFilterBedrooms] = useState<number | null>(null);
  const [activeFilterPanel, setActiveFilterPanel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [radiusKm, setRadiusKm] = useState(5);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertFreq, setAlertFreq] = useState<"immediate" | "daily" | "weekly">("daily");
  const [alertSaved, setAlertSaved] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const { data: authSession } = authClient.useSession();
  const isSignedIn = !!authSession;
  const [, navigate] = useLocation();

  const ITEMS_PER_PAGE = 12;

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setActiveFilterPanel(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Réinitialise la page quand les filtres changent */
  const handleFilterType = (v: string) => {
    setFilterType(v === filterType ? "all" : v);
    setCurrentPage(1);
  };

  /* Country-aware fallback data */
  const PRICES         = PRICES_MAP[country.code]       ?? PRICES_MAP.FR;
  const ARRONDISSEMENTS = NEIGHBORHOODS_MAP[country.code] ?? NEIGHBORHOODS_MAP.FR;
  const NEARBY_REGIONS = NEARBY_REGIONS_MAP[country.code] ?? NEARBY_REGIONS_MAP.FR;

  /* API call */
  const { data, isLoading: propsLoading } = useListProperties({
    city: cityFromUrl || undefined,
    type: (filterType !== "all" ? filterType : undefined) as any,
    minPrice: filterMinPrice || undefined,
    maxPrice: filterMaxPrice || undefined,
    bedrooms: filterBedrooms !== null ? String(filterBedrooms) : undefined,
    limit: ITEMS_PER_PAGE,
    page: currentPage,
  } as Parameters<typeof useListProperties>[0]);

  /* Merge API data with static fallbacks */
  const apiProps    = data?.data ?? [];
  const hasApiData  = apiProps.length > 0;
  const apiLoaded   = data !== undefined;
  const apiTotal    = data?.total ?? 0;

  /* Determine display mode */
  // hasCategoryFilter = a specific type is selected (not "all")
  // hasFilters        = at least one filter pill is active
  // → show fallback cards when: no real API data + no filters + all categories
  // → show category empty when: no real API data + specific category + no filters
  // → show no-results when: no real API data + any filter combination is active
  const hasCategoryFilter = filterType !== "all";

  /* Active filter count badge (pill-based filters only, not type category) */
  const activeFilterCount = [
    filterFurnished !== "all",
    !!filterMinPrice || !!filterMaxPrice,
    filterBedrooms !== null,
  ].filter(Boolean).length;

  /* Any active filter = category OR pill filters */
  const hasAnyFilter = hasCategoryFilter || activeFilterCount > 0;

  /* Total to display in header */
  const total = hasApiData ? apiTotal : 0;
  const totalPages = hasApiData
    ? (data?.totalPages ?? Math.ceil(apiTotal / ITEMS_PER_PAGE))
    : 1;

  /* Dynamic filter pills based on selected type */
  const isCommercial = filterType === "office" || filterType === "commercial";
  const isResidential = !isCommercial;

  function resetAllFilters() {
    setFilterFurnished("all");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setFilterBedrooms(null);
    setCurrentPage(1);
  }

  function openAlert() {
    if (!isSignedIn) {
      navigate(`/sign-in?redirect=/properties${search ? "?" + search : ""}`);
      return;
    }
    setAlertSaved(false);
    setAlertOpen(true);
  }

  function saveAlert() {
    setAlertSaved(true);
    setTimeout(() => setAlertOpen(false), 1800);
  }

  /* Page numbers visible dans la pagination (fenêtre glissante max 5) */
  function getPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    const left  = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  }
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  /* Build display cards — only use real API data */
  const displayCards = apiProps.map((ap, i) => ({
    id:     ap.id,
    idx:    i,
    title:  ap.title,
    price:  Number(ap.price),
    area:   Number(ap.area ?? AREAS[i % AREAS.length]),
    rooms:  ap.bedrooms   ?? ROOMS[i % ROOMS.length],
    baths:  ap.bathrooms  ?? BATHS[i % BATHS.length],
    arrond: ap.city       ?? ARRONDISSEMENTS[i % ARRONDISSEMENTS.length],
    type:   ap.type,
    status: ap.status,
    image:  ap.images?.[0] || undefined,
  }));

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <style>{`
        .filter-btn { border: 1px solid #DDD; border-radius: 20px; padding: 7px 16px; font-size: 13px; color: #444; background: white; cursor: pointer; white-space: nowrap; transition: border-color .2s, background .2s; }
        .filter-btn:hover { border-color: ${YELLOW}; color: ${YELLOW}; }
        .filter-btn.active { border-color: ${YELLOW}; color: ${YELLOW}; background: #FEF9EE; }
        .seo-link { font-size: 13px; color: #666; display: block; margin-bottom: 4px; transition: color .2s; }
        .seo-link:hover { color: ${YELLOW}; }
        .page-btn { width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: transparent; transition: background .15s; }
        .page-btn:hover { background: #F5F5F5; }
        .page-btn.active { background: #FFF8E1; color: ${YELLOW}; }
        .page-btn:disabled { color: #CCC; cursor: default; }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <PublicNavbar activeItem="biens" />

      {/* ─── SECONDARY SEARCH BAR ─── */}
      <div ref={filterBarRef} className="bg-white sticky top-16 z-40" style={{ borderBottom: "1px solid #E8E8E8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Search input */}
          <div className="flex items-stretch flex-1 min-w-0 max-w-sm rounded-lg overflow-hidden border border-gray-200 focus-within:border-yellow-400 transition-colors">
            <div className="flex items-center px-3 bg-white">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = new URLSearchParams(search);
                  if (searchInput.trim()) {
                    q.set("city", searchInput.trim());
                  } else {
                    q.delete("city");
                  }
                  q.delete("page");
                  navigate(`/properties?${q.toString()}`);
                  setCurrentPage(1);
                }
                if (e.key === "Escape") {
                  setSearchInput("");
                  const q = new URLSearchParams(search);
                  q.delete("city");
                  q.delete("page");
                  navigate(`/properties?${q.toString()}`);
                  setCurrentPage(1);
                }
              }}
              placeholder="Ville, quartier, adresse…"
              className="flex-1 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none bg-white min-w-0"
            />
            {searchInput && (
              <button
                className="px-2 flex items-center text-gray-300 hover:text-gray-500 transition-colors bg-white"
                onClick={() => {
                  setSearchInput("");
                  const q = new URLSearchParams(search);
                  q.delete("city");
                  q.delete("page");
                  navigate(`/properties?${q.toString()}`);
                  setCurrentPage(1);
                }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              className="px-3 sm:px-4 flex items-center"
              style={{ background: YELLOW }}
              onClick={() => {
                const q = new URLSearchParams(search);
                if (searchInput.trim()) {
                  q.set("city", searchInput.trim());
                } else {
                  q.delete("city");
                }
                q.delete("page");
                navigate(`/properties?${q.toString()}`);
                setCurrentPage(1);
              }}
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Filter pills — desktop, dynamic per type */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap relative">

            {/* Meublé — résidentiel uniquement */}
            {isResidential && (
              <div className="relative">
                <button
                  onClick={() => setActiveFilterPanel(activeFilterPanel === "furnished" ? null : "furnished")}
                  className={`filter-btn flex items-center gap-1 ${filterFurnished !== "all" ? "active" : ""}`}
                >
                  {filterFurnished === "yes" ? "Meublé ✓" : filterFurnished === "no" ? "Non meublé ✓" : "Meublé ?"}
                  {filterFurnished !== "all"
                    ? <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); setFilterFurnished("all"); setCurrentPage(1); }} />
                    : <ChevronDown className="w-3 h-3" />}
                </button>
                {activeFilterPanel === "furnished" && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50 min-w-[170px]">
                    {[
                      { v: "all", label: "Peu importe" },
                      { v: "yes", label: "Meublé" },
                      { v: "no",  label: "Non meublé" },
                    ].map(opt => (
                      <button key={opt.v}
                        onClick={() => { setFilterFurnished(opt.v as "all" | "yes" | "no"); setActiveFilterPanel(null); setCurrentPage(1); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
                        style={filterFurnished === opt.v ? { color: YELLOW, fontWeight: 600 } : {}}
                      >
                        {opt.label}
                        {filterFurnished === opt.v && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loyer */}
            <div className="relative">
              <button
                onClick={() => setActiveFilterPanel(activeFilterPanel === "price" ? null : "price")}
                className={`filter-btn flex items-center gap-1 ${(filterMinPrice || filterMaxPrice) ? "active" : ""}`}
              >
                {filterMinPrice || filterMaxPrice
                  ? `${filterMinPrice || "0"} – ${filterMaxPrice || "∞"} CA$`
                  : isCommercial ? "Budget" : "Loyer"}
                {(filterMinPrice || filterMaxPrice)
                  ? <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); setFilterMinPrice(""); setFilterMaxPrice(""); setCurrentPage(1); }} />
                  : <ChevronDown className="w-3 h-3" />}
              </button>
              {activeFilterPanel === "price" && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 w-64">
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                    {isCommercial ? "Budget mensuel (CA$)" : "Loyer mensuel (CA$)"}
                  </p>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Min</label>
                      <input type="number" min={0} step={50} value={filterMinPrice}
                        onChange={(e) => setFilterMinPrice(e.target.value)} placeholder="0"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Max</label>
                      <input type="number" min={0} step={50} value={filterMaxPrice}
                        onChange={(e) => setFilterMaxPrice(e.target.value)} placeholder="∞"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(isCommercial ? [1500, 3000, 5000, 8000] : [800, 1200, 1600, 2000, 2500]).map(p => (
                      <button key={p} onClick={() => setFilterMaxPrice(String(p))}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filterMaxPrice === String(p) ? "border-yellow-400 bg-yellow-50" : "border-gray-200"}`}>
                        &lt;{p}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setActiveFilterPanel(null); setCurrentPage(1); }}
                    className="w-full py-2 rounded-lg text-sm font-semibold"
                    style={{ background: YELLOW, color: "#1A1A1A" }}>
                    Appliquer
                  </button>
                </div>
              )}
            </div>

            {/* Chambres — résidentiel uniquement */}
            {isResidential && (
              <div className="relative">
                <button
                  onClick={() => setActiveFilterPanel(activeFilterPanel === "rooms" ? null : "rooms")}
                  className={`filter-btn flex items-center gap-1 ${filterBedrooms !== null ? "active" : ""}`}
                >
                  {filterBedrooms !== null ? `${filterBedrooms}+ chambre${filterBedrooms > 1 ? "s" : ""} ✓` : "Chambres"}
                  {filterBedrooms !== null
                    ? <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); setFilterBedrooms(null); setCurrentPage(1); }} />
                    : <ChevronDown className="w-3 h-3" />}
                </button>
                {activeFilterPanel === "rooms" && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 w-52">
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Chambres min.</p>
                    <div className="flex gap-2 flex-wrap">
                      {[null, 1, 2, 3, 4, 5].map((n) => (
                        <button key={n ?? "any"}
                          onClick={() => { setFilterBedrooms(n); setActiveFilterPanel(null); setCurrentPage(1); }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${filterBedrooms === n ? "border-yellow-400 bg-yellow-50 font-semibold" : "border-gray-200 hover:border-gray-300"}`}
                          style={filterBedrooms === n ? { color: YELLOW } : {}}>
                          {n === null ? "Tous" : `${n}+`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* + de filtres */}
            <button
              onClick={() => { setActiveFilterPanel(null); setMoreFiltersOpen(true); }}
              className={`filter-btn flex items-center gap-1.5 ${activeFilterCount > 0 ? "active" : ""}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              + de filtres
              {activeFilterCount > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: YELLOW }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button onClick={resetAllFilters}
                className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors">
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>

          {/* Mobile: Filtres button */}
          <button
            onClick={() => setActiveFilterPanel(activeFilterPanel === "mobile" ? null : "mobile")}
            className={`sm:hidden filter-btn flex items-center gap-1 ${activeFilterCount > 0 ? "active" : ""}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtres
            {activeFilterCount > 0 && (
              <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: YELLOW }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Alert button */}
          <button
            onClick={openAlert}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-full px-3 sm:px-4 py-2 ml-auto flex-shrink-0 transition-opacity hover:opacity-85"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Créer une alerte</span>
            <span className="sm:hidden">Alerte</span>
          </button>
        </div>

        {/* Mobile filter panel */}
        {activeFilterPanel === "mobile" && (
          <div className="sm:hidden border-t border-gray-100 px-4 py-4 space-y-4">
            {isResidential && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Meublé</p>
                <div className="flex gap-2">
                  {[{ v: "all", label: "Tous" }, { v: "yes", label: "Meublé" }, { v: "no", label: "Non meublé" }].map(opt => (
                    <button key={opt.v} onClick={() => setFilterFurnished(opt.v as "all" | "yes" | "no")}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterFurnished === opt.v ? "border-yellow-400 bg-yellow-50 font-semibold" : "border-gray-200"}`}
                      style={filterFurnished === opt.v ? { color: YELLOW } : {}}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Budget (CA$/mois)</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filterMinPrice} onChange={e => setFilterMinPrice(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                <input type="number" placeholder="Max" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            {isResidential && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Chambres min.</p>
                <div className="flex gap-2 flex-wrap">
                  {[null, 1, 2, 3, 4].map(n => (
                    <button key={n ?? "any"} onClick={() => setFilterBedrooms(n)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${filterBedrooms === n ? "border-yellow-400 bg-yellow-50 font-semibold" : "border-gray-200"}`}
                      style={filterBedrooms === n ? { color: YELLOW } : {}}>
                      {n === null ? "Tous" : `${n}+`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => { setActiveFilterPanel(null); setCurrentPage(1); }}
              className="w-full py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: YELLOW, color: "#1A1A1A" }}>
              Appliquer les filtres
            </button>
          </div>
        )}
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-gray-600">Accueil</Link>
          <span>›</span>
          <Link href="/cities" className="hover:text-gray-600">Locations en {country.name}</Link>
          <span>›</span>
          <span style={{ color: YELLOW }} className="font-medium">Locations à {city}</span>
        </nav>

        {/* Results header */}
        <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold leading-tight" style={{ color: "#1A1A1A" }}>
              Locations à <span>{city}</span>
            </h1>
            {total > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                <span className="font-semibold" style={{ color: YELLOW }}>{total} bien{total > 1 ? "s" : ""}</span> trouvé{total > 1 ? "s" : ""}
                {activeFilterCount > 0 && (
                  <button onClick={resetAllFilters} className="ml-2 underline hover:text-gray-600">
                    Réinitialiser les filtres
                  </button>
                )}
              </p>
            )}
          </div>
          {/* List / Map toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5 flex-shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors`}
              style={viewMode === "list" ? { background: YELLOW, color: "#1A1A1A" } : { color: "#888" }}
            >
              <List className="w-3.5 h-3.5" /> Liste
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors`}
              style={viewMode === "map" ? { background: YELLOW, color: "#1A1A1A" } : { color: "#888" }}
            >
              <Map className="w-3.5 h-3.5" /> Carte
            </button>
          </div>
        </div>

        {/* Category quick-filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { icon: Home,       label: "Maisons",      v: "house" },
            { icon: Building2,  label: "Appartements", v: "apartment" },
            { icon: Users,      label: "Colocations",  v: "co-living" },
            { icon: Briefcase,  label: "Bureaux",      v: "office" },
            { icon: Store,      label: "Commerciales", v: "commercial" },
          ].map((cat) => (
            <button
              key={cat.v}
              onClick={() => handleFilterType(cat.v)}
              className={`filter-btn flex items-center gap-1.5 ${filterType === cat.v ? "active" : ""}`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards grid or Map */}
        {viewMode === "map" ? (
          <div className="mb-8">
            {/* Radius slider */}
            <div className="flex items-center gap-4 mb-4 px-1">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Rayon de recherche</span>
              <input
                type="range"
                min={1}
                max={50}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full outline-none cursor-pointer"
                style={{
                  accentColor: YELLOW,
                  background: `linear-gradient(to right, ${YELLOW} 0%, ${YELLOW} ${((radiusKm - 1) / 49) * 100}%, #E5E7EB ${((radiusKm - 1) / 49) * 100}%, #E5E7EB 100%)`,
                }}
              />
              <span className="text-xs font-bold min-w-[38px] text-right" style={{ color: YELLOW }}>{radiusKm} km</span>
            </div>
            <Suspense fallback={<div className="w-full rounded-xl bg-gray-100 animate-pulse" style={{ height: 540 }} />}>
              <PropertiesMapView
                city={city}
                radiusKm={radiusKm}
                properties={displayCards.map((card) => ({
                  id: card.idx + 1,
                  title: card.title,
                  price: card.price,
                  city: card.arrond,
                  type: filterType !== "all" ? filterType : "apartment",
                  status: ["available", "soon", "occupied"][card.idx % 3] as "available" | "soon" | "occupied",
                  currency: country.currency.symbol,
                }))}
              />
            </Suspense>
          </div>
        ) : propsLoading ? (
          /* ── Chargement — skeleton ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-white animate-pulse" style={{ border: "1px solid #E8E8E8" }}>
                <div className="bg-gray-200" style={{ height: 170 }} />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasApiData && hasCategoryFilter && !activeFilterCount ? (
          /* ── Catégorie vide (pas encore d'annonces dans ce type) ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "#F5F5F5" }}>
              <Building2 className="w-9 h-9 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: "#1A1A1A" }}>Rien à afficher pour le moment</h2>
            <p className="text-sm text-gray-400 max-w-xs mb-6">
              Aucune annonce dans cette catégorie à {city} pour l'instant. Revenez bientôt ou créez une alerte.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => { setFilterType("all"); setCurrentPage(1); }}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                Voir toutes les catégories
              </button>
              <button onClick={openAlert}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                <Bell className="w-4 h-4" /> Créer une alerte
              </button>
            </div>
          </div>
        ) : !hasApiData && hasAnyFilter ? (
          /* ── Aucun résultat pour la combinaison de filtres ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "#FEF9EE" }}>
              <Search className="w-9 h-9" style={{ color: YELLOW }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Aucun bien ne correspond à vos critères</h2>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Essayez d'ajuster vos filtres ou d'élargir votre zone de recherche pour découvrir plus d'annonces disponibles.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={resetAllFilters}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                Réinitialiser les filtres
              </button>
              <button onClick={openAlert}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                <Bell className="w-4 h-4" /> Créer une alerte pour cette recherche
              </button>
            </div>
          </div>
        ) : !hasApiData ? (
          /* ── Aucun bien dans la base ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "#F5F5F5" }}>
              <Home className="w-9 h-9 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Aucune annonce disponible</h2>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Il n'y a pas encore d'annonces à {city}. Revenez bientôt ou créez une alerte pour être notifié dès qu'un bien est publié.
            </p>
            <button onClick={openAlert}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
              style={{ background: YELLOW, color: "#1A1A1A" }}>
              <Bell className="w-4 h-4" /> Créer une alerte
            </button>
          </div>
        ) : (
          /* ── Grille de biens ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {displayCards.map((card) => (
              <PropCard
                key={card.id}
                {...card}
                city={city}
                currency={country.currency.symbol}
              />
            ))}
          </div>
        )}

        {/* Pagination — affichée seulement si plusieurs pages */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mb-14">
            <button
              className="page-btn flex items-center gap-0.5 px-3 text-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ color: currentPage === 1 ? "#CCC" : "#1A1A1A", width: "auto" }}
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>

            {pageNumbers.map((n, i) =>
              n === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">…</span>
              ) : (
                <button
                  key={n}
                  className={`page-btn ${n === currentPage ? "active" : ""}`}
                  onClick={() => setCurrentPage(n as number)}
                  style={n === currentPage ? { color: YELLOW } : { color: "#1A1A1A" }}
                >
                  {n}
                </button>
              )
            )}

            <button
              className="page-btn flex items-center gap-0.5 px-3 text-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ color: currentPage === totalPages ? "#CCC" : "#1A1A1A", width: "auto" }}
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ══ "+ de filtres" modal overlay ══ */}
      {moreFiltersOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setMoreFiltersOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>
                <SlidersHorizontal className="w-4 h-4 inline mr-2" style={{ color: YELLOW }} />
                Filtres avancés
              </h3>
              <button onClick={() => setMoreFiltersOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-6">
              {/* Meublé — résidentiel uniquement */}
              {isResidential && (
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: "#1A1A1A" }}>Ameublement</p>
                  <div className="flex gap-2">
                    {[{ v: "all", label: "Peu importe" }, { v: "yes", label: "Meublé" }, { v: "no", label: "Non meublé" }].map(opt => (
                      <button key={opt.v} onClick={() => setFilterFurnished(opt.v as "all" | "yes" | "no")}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${filterFurnished === opt.v ? "font-semibold" : "border-gray-200 hover:border-gray-300"}`}
                        style={filterFurnished === opt.v ? { borderColor: YELLOW, background: "#FEF9EE", color: YELLOW } : {}}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loyer */}
              <div>
                <p className="text-sm font-semibold mb-3" style={{ color: "#1A1A1A" }}>
                  {isCommercial ? "Budget mensuel (CA$)" : "Loyer mensuel (CA$)"}
                </p>
                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1.5 block">Minimum</label>
                    <input type="number" min={0} step={50} value={filterMinPrice}
                      onChange={e => setFilterMinPrice(e.target.value)} placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1.5 block">Maximum</label>
                    <input type="number" min={0} step={50} value={filterMaxPrice}
                      onChange={e => setFilterMaxPrice(e.target.value)} placeholder="Illimité"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isCommercial ? [1500, 3000, 5000, 8000, 12000] : [800, 1000, 1200, 1500, 2000, 2500]).map(p => (
                    <button key={p} onClick={() => setFilterMaxPrice(String(p))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterMaxPrice === String(p) ? "font-semibold" : "border-gray-200 hover:border-gray-300"}`}
                      style={filterMaxPrice === String(p) ? { borderColor: YELLOW, background: "#FEF9EE", color: YELLOW } : {}}>
                      &lt; {p.toLocaleString("fr-CA")} CA$
                    </button>
                  ))}
                </div>
              </div>

              {/* Chambres — résidentiel uniquement */}
              {isResidential && (
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: "#1A1A1A" }}>Nombre de chambres</p>
                  <div className="flex gap-2 flex-wrap">
                    {[null, 1, 2, 3, 4, 5].map(n => (
                      <button key={n ?? "any"} onClick={() => setFilterBedrooms(n)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${filterBedrooms === n ? "font-semibold" : "border-gray-200 hover:border-gray-300"}`}
                        style={filterBedrooms === n ? { borderColor: YELLOW, background: "#FEF9EE", color: YELLOW } : {}}>
                        {n === null ? "Tous" : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { resetAllFilters(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
                Réinitialiser
              </button>
              <button onClick={() => { setMoreFiltersOpen(false); setCurrentPage(1); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                Voir les résultats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Créer une alerte — modal ══ */}
      {alertOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setAlertOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "#1A1A1A" }}>
                <Bell className="w-4 h-4" style={{ color: YELLOW }} />
                Créer une alerte
              </h3>
              <button onClick={() => setAlertOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {alertSaved ? (
              <div className="px-6 py-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#F0FDF4" }}>
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="font-bold text-lg mb-1" style={{ color: "#1A1A1A" }}>Alerte créée !</h4>
                <p className="text-sm text-gray-400">Vous recevrez un e-mail dès qu'un bien correspond à vos critères.</p>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-5">
                {/* Résumé des critères */}
                <div className="rounded-xl p-4" style={{ background: "#FEF9EE" }}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Critères de l'alerte</p>
                  <ul className="text-sm space-y-1" style={{ color: "#1A1A1A" }}>
                    <li>📍 <strong>Ville :</strong> {city}</li>
                    {filterType !== "all" && <li>🏠 <strong>Type :</strong> {filterType}</li>}
                    {filterFurnished !== "all" && <li>🛋 <strong>Meublé :</strong> {filterFurnished === "yes" ? "Oui" : "Non"}</li>}
                    {(filterMinPrice || filterMaxPrice) && (
                      <li>💰 <strong>Budget :</strong> {filterMinPrice || "0"} – {filterMaxPrice || "∞"} CA$/mois</li>
                    )}
                    {filterBedrooms !== null && <li>🛏 <strong>Chambres :</strong> {filterBedrooms}+</li>}
                    {filterType === "all" && filterFurnished === "all" && !filterMinPrice && !filterMaxPrice && filterBedrooms === null && (
                      <li className="text-gray-400 italic">Tous les biens disponibles à {city}</li>
                    )}
                  </ul>
                </div>

                {/* Fréquence */}
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#1A1A1A" }}>Fréquence de notification</p>
                  <div className="flex gap-2">
                    {[
                      { v: "immediate", label: "Immédiate" },
                      { v: "daily",     label: "Quotidienne" },
                      { v: "weekly",    label: "Hebdomadaire" },
                    ].map(f => (
                      <button key={f.v} onClick={() => setAlertFreq(f.v as "immediate" | "daily" | "weekly")}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors`}
                        style={alertFreq === f.v ? { borderColor: YELLOW, background: "#FEF9EE", color: YELLOW } : { borderColor: "#E5E5E5" }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  Les alertes sont envoyées sur l'adresse e-mail associée à votre compte BLOQ5. Vous pouvez les gérer depuis votre espace personnel.
                </p>

                <button onClick={saveAlert}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
                  style={{ background: YELLOW, color: "#1A1A1A" }}>
                  Activer cette alerte
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── CTA PROPRIÉTAIRE ─── */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden" style={{ background: "#F5F5F5" }}>
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 p-10 md:p-12">
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
                Propriétaire, louez votre bien{" "}
                <span className="relative inline-block">
                  rapidement !
                  <span className="absolute bottom-0 left-0 w-full h-1 rounded-full" style={{ background: YELLOW }} />
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-4 mb-7 leading-relaxed max-w-md">
                Plus de 2 500 clients, propriétaires et locataires, nous recommandent pour notre réactivité et notre efficacité. Grâce à leur confiance, nous gérons aujourd'hui plus de 8 000 lots répartis dans plus de 40 métropoles {countryPrep(country.code)} {country.name}.
              </p>
              <button className="text-sm font-bold rounded-full px-6 py-3 hover:opacity-85 transition-opacity" style={{ background: YELLOW, color: "#1A1A1A" }}>
                Vous êtes propriétaire ?
              </button>
            </div>
            <div className="flex-shrink-0 w-full md:w-60 h-52 p-6">
              <BuildingIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEO FOOTER ─── */}
      <section className="bg-white py-10 px-6" style={{ borderTop: "1px solid #F0F0F0" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <h5 className="font-bold text-sm mb-3" style={{ color: "#1A1A1A" }}>Types de bien à {city}</h5>
            {["Location appartement", "Location appartement meublé", "Location appartement non-meublé", "Colocation", "Colocation meublée"].map(l => (
              <a key={l} href="#" className="seo-link">{l}</a>
            ))}
          </div>
          <div>
            <h5 className="font-bold text-sm mb-3" style={{ color: "#1A1A1A" }}>Locations à {city}</h5>
            {[`${city} (toute la ville)`, ...ARRONDISSEMENTS.slice(0, 4)].map(l => (
              <a key={l} href="#" className="seo-link">{l}</a>
            ))}
          </div>
          <div>
            <h5 className="font-bold text-sm mb-3" style={{ color: "#1A1A1A" }}>Locations à proximité</h5>
            {country.cities
              .filter((c) => c.name !== city)
              .slice(0, 7)
              .map((c) => (
                <a key={c.name} href={`/properties?city=${encodeURIComponent(c.name)}`} className="seo-link">{c.name}</a>
              ))}
          </div>
          <div>
            <h5 className="font-bold text-sm mb-3" style={{ color: "#1A1A1A" }}>Locations par région</h5>
            {NEARBY_REGIONS.map(l => (
              <a key={l} href="#" className="seo-link">{l}</a>
            ))}
          </div>
          <div>
            <h5 className="font-bold text-sm mb-3" style={{ color: "#1A1A1A" }}>Principales villes</h5>
            {country.cities.map((c) => (
              <a key={c.name} href={`/properties?city=${encodeURIComponent(c.name)}`} className="seo-link">Location {c.name}</a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
