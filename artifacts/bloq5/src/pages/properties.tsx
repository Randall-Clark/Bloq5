import { useState } from "react";
import { Link } from "wouter";
import { useListProperties } from "@workspace/api-client-react";
import { useLocation_ } from "@/context/location-context";
import { countryPrep } from "@/data/countries";
import { PublicNavbar } from "@/components/public-navbar";
import {
  Search, Bell, ChevronDown, ChevronLeft, ChevronRight,
  Bed, Bath, Maximize2, MapPin, Home, Building2, Users,
  Briefcase, Store, LayoutGrid,
} from "lucide-react";

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
function PropCard({ idx, city, price, area, rooms, baths, arrond, title, currency }: {
  idx: number; city: string; price: number; area: number; rooms: number;
  baths: number; arrond: string; title: string; currency: string;
}) {
  const status = cardStatus(idx);
  const isOccupied = status === "occupied";

  return (
    <Link href={`/properties/${idx + 1}`}>
      <div
        className="rounded-lg overflow-hidden bg-white cursor-pointer group transition-shadow hover:shadow-lg"
        style={{ border: "1px solid #E8E8E8" }}
      >
        {/* Photo */}
        <div className="relative" style={{ height: 170 }}>
          <StatusBadge status={status} idx={idx} />
          <img
            src={`https://picsum.photos/seed/prop${idx + 1}/370/170`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Body */}
        <div className="p-3">
          <h3 className="font-semibold text-sm mb-2 line-clamp-1" style={{ color: "#1A1A1A", fontSize: 14 }}>
            {title} — location {rooms > 1 ? "meublée" : "meublée"}
          </h3>

          {/* Characteristics */}
          <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "#555" }}>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" style={{ color: YELLOW }} />
              {area} m²
            </span>
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" style={{ color: YELLOW }} />
              {rooms} pièce{rooms > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" style={{ color: YELLOW }} />
              {baths} sdb
            </span>
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
                {price.toLocaleString("fr-FR")} <span className="text-xs font-normal text-gray-400">{currency}/mois cc</span>
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
  const cityFromUrl = getSearchParam("city");
  const typeFromUrl = getSearchParam("type");
  const city = cityFromUrl || country.cities[0]?.name || "Montréal";

  const [searchInput, setSearchInput] = useState(city);
  const [filterType,  setFilterType]  = useState(typeFromUrl || "all");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12; /* 4 lignes × 3 colonnes */

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
  const { data } = useListProperties({
    city: cityFromUrl || undefined,
    type: (filterType !== "all" ? filterType : undefined) as any,
    limit: ITEMS_PER_PAGE,
    page: currentPage,
  });

  /* Merge API data with static fallbacks */
  const apiProps   = data?.data ?? [];
  const total      = data?.total ?? 100;
  const totalPages = data?.totalPages ?? Math.ceil(total / ITEMS_PER_PAGE);

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

  const displayCards = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => {
    const ap = apiProps[i];
    return {
      idx:   i,
      title: ap?.title       ?? TYPES[i % TYPES.length],
      price: ap?.price       ?? PRICES[i % PRICES.length],
      area:  ap?.area        ?? AREAS[i % AREAS.length],
      rooms: ap?.bedrooms    ?? ROOMS[i % ROOMS.length],
      baths: ap?.bathrooms   ?? BATHS[i % BATHS.length],
      arrond: ap?.city       ?? ARRONDISSEMENTS[i % ARRONDISSEMENTS.length],
    };
  });

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
      <div className="bg-white sticky top-16 z-40" style={{ borderBottom: "1px solid #E8E8E8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Search input */}
          <div className="flex items-stretch flex-1 min-w-0 max-w-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="flex items-center px-3 bg-white">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ville, quartier…"
              className="flex-1 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none bg-white min-w-0"
            />
            <button
              className="px-3 sm:px-4 flex items-center"
              style={{ background: YELLOW }}
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set("city", searchInput);
                window.history.replaceState({}, "", url.toString());
                window.location.reload();
              }}
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Filter pills — hide some on mobile */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {[
              { label: "Type de bien", value: "type" },
              { label: "Meublé ?", value: "furnished" },
              { label: "Loyer", value: "price" },
              { label: "Nb de pièces", value: "rooms" },
            ].map((f) => (
              <button key={f.value} className="filter-btn">{f.label} <ChevronDown className="w-3 h-3 inline" /></button>
            ))}
          </div>
          <button className="sm:hidden filter-btn flex items-center gap-1">
            <ChevronDown className="w-3 h-3" /> Filtres
          </button>

          {/* Alert button */}
          <button
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-full px-3 sm:px-4 py-2 ml-auto flex-shrink-0"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Créer une alerte</span>
            <span className="sm:hidden">Alerte</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-gray-600">Accueil</Link>
          <span>›</span>
          <Link href="/cities" className="hover:text-gray-600">Locations en {country.name}</Link>
          <span>›</span>
          <span className="hover:text-gray-600 cursor-pointer">Locations à {city}</span>
          <span>›</span>
          <span style={{ color: YELLOW }}>Locations à {city} (toute la ville)</span>
        </nav>

        {/* Results header */}
        <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <h1 className="text-lg sm:text-2xl font-extrabold leading-tight" style={{ color: "#1A1A1A" }}>
            Locations à <span>{city}</span>{" "}
            <span className="text-sm font-normal text-gray-400 block sm:inline">(toute la ville)</span>
          </h1>
          <span className="text-sm font-bold flex-shrink-0" style={{ color: YELLOW }}>
            {total} biens
          </span>
        </div>

        {/* Category quick-filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { icon: Home,       label: "Maisons",      v: "house" },
            { icon: Building2,  label: "Appartements", v: "apartment" },
            { icon: LayoutGrid, label: "Condos",        v: "condo" },
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

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {displayCards.map((card) => (
            <PropCard
              key={card.idx}
              {...card}
              city={city}
              currency={country.currency.symbol}
            />
          ))}
        </div>

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

      {/* ─── MAIN FOOTER ─── */}
      <footer style={{ background: "#1A1A1A", color: "#ccc" }} className="relative pt-14 pb-8 overflow-hidden">
        <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.03)", transform: "translate(-50%, 40%)" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="text-2xl font-black text-white mb-2">BLOQ<span style={{ color: YELLOW }}>5</span></div>
              <p className="text-xs text-gray-500 leading-relaxed">Carte professionnelle :<br />n°CPI 6901 2019 000 039 604</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Nos services</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Gestion locative", "Gestion de colocations", "Gestion nourrice", "BLOQ5 ULTRA", "Tarifs"].map(l => (
                  <li key={l}><a href="#" className="hover:text-yellow-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Nos outils</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Estimation de loyer", "Générateur d'avis d'échéance", "Générateur de quittance", "Aide / FAQ"].map(l => (
                  <li key={l}><a href="#" className="hover:text-yellow-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Société</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Partenaires", "Presse", "Recrutement", "Politique cookies", "Politique confidentialité", "Mentions légales", "Conditions générales d'utilisation"].map(l => (
                  <li key={l}><a href="#" className="hover:text-yellow-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
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
