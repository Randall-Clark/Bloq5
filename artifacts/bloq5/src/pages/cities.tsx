import { Link, useLocation, useSearch } from "wouter";
import { MapPin, Plus } from "lucide-react";
import { useLocation_ } from "@/context/location-context";
import { countryPrep } from "@/data/countries";
import { PublicNavbar } from "@/components/public-navbar";

const YELLOW = "#F5A623";

/* Decorative diamond images */
const DIAMONDS = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&q=80",
  "https://images.unsplash.com/photo-1569949261756-48d5e02a9e8b?w=300&q=80",
  "https://images.unsplash.com/photo-1588515724527-074a7a56616c?w=300&q=80",
  "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=300&q=80",
];

function BuildingIllustration() {
  return (
    <svg viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Ground */}
      <ellipse cx="110" cy="185" rx="90" ry="10" fill="#E8E8E8" />
      {/* Main building body */}
      <rect x="45" y="60" width="90" height="120" rx="3" fill={YELLOW} />
      {/* Building front shade */}
      <rect x="45" y="60" width="30" height="120" rx="3" fill="rgba(0,0,0,0.12)" />
      {/* Roof */}
      <polygon points="45,60 90,30 135,60" fill="#E8940A" />
      {/* Windows row 1 */}
      {[55,75,95,115].map(x => (
        <rect key={x} x={x} y="75" width="14" height="18" rx="2" fill="white" opacity="0.85" />
      ))}
      {/* Windows row 2 */}
      {[55,75,95,115].map(x => (
        <rect key={x} x={x} y="105" width="14" height="18" rx="2" fill="white" opacity="0.85" />
      ))}
      {/* Windows row 3 */}
      {[55,75,95,115].map(x => (
        <rect key={x} x={x} y="135" width="14" height="18" rx="2" fill="white" opacity="0.55" />
      ))}
      {/* Door */}
      <rect x="80" y="148" width="20" height="32" rx="2" fill="#E8940A" />
      {/* Door knob */}
      <circle cx="97" cy="165" r="2" fill={YELLOW} />
      {/* Left small building */}
      <rect x="5" y="100" width="38" height="80" rx="2" fill="#FFD07A" />
      <rect x="5" y="100" width="12" height="80" fill="rgba(0,0,0,0.08)" />
      <polygon points="5,100 24,82 43,100" fill="#E8B84B" />
      {[12,24].map(x => [110,127,144].map(y => (
        <rect key={`${x}-${y}`} x={x} y={y} width="9" height="12" rx="1" fill="white" opacity="0.75" />
      )))}
      {/* Right small building */}
      <rect x="137" y="108" width="42" height="72" rx="2" fill="#FFD07A" />
      <rect x="137" y="108" width="14" height="72" fill="rgba(0,0,0,0.08)" />
      <polygon points="137,108 158,88 179,108" fill="#E8B84B" />
      {[144,158].map(x => [118,134,150].map(y => (
        <rect key={`${x}-${y}`} x={x} y={y} width="10" height="12" rx="1" fill="white" opacity="0.75" />
      )))}
      {/* People */}
      <circle cx="68" cy="183" r="5" fill="#1A1A1A" />
      <rect x="64" y="188" width="8" height="10" rx="2" fill="#1A1A1A" />
      <circle cx="148" cy="183" r="5" fill="#555" />
      <rect x="144" y="188" width="8" height="10" rx="2" fill="#555" />
      {/* Tree */}
      <rect x="197" y="165" width="4" height="20" fill="#8B6914" />
      <circle cx="199" cy="158" r="14" fill="#4CAF50" opacity="0.8" />
    </svg>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  apartment: "Appartements",
  house: "Maisons",
  "co-living": "Colocations",
  office: "Bureaux",
  commercial: "Locaux commerciaux",
};

export default function CitiesPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const typeFilter = params.get("type") ?? "";

  const { country } = useLocation_();
  const cities = country.cities;

  function goToCity(cityName: string) {
    const dest = typeFilter
      ? `/properties?city=${encodeURIComponent(cityName)}&type=${encodeURIComponent(typeFilter)}`
      : `/properties?city=${encodeURIComponent(cityName)}`;
    navigate(dest);
  }

  /* Split cities: first group in 4-col grid, remainder centred */
  const cols = 4;
  const mainCount = Math.floor(cities.length / cols) * cols;
  const main = cities.slice(0, mainCount);
  const tail = cities.slice(mainCount);

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .script-yellow { font-family: 'Dancing Script', cursive; color: ${YELLOW}; font-weight: 700; }
        .btn-yellow { background: ${YELLOW}; color: #1A1A1A; font-weight: 600; border-radius: 24px; padding: 12px 24px; display: inline-flex; align-items: center; gap: 6px; transition: opacity .2s; border: none; cursor: pointer; }
        .btn-yellow:hover { opacity: 0.88; }
        .city-card:hover .city-overlay { opacity: 1; }
        .city-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-2px); }
        .city-card { transition: box-shadow .2s, transform .2s; }
        .city-overlay { opacity: 0; transition: opacity .2s; }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <PublicNavbar activeItem="biens" />

      {/* ─── HERO ─── */}
      <section className="relative bg-white overflow-hidden py-10 md:py-16 px-4 sm:px-6">
        {/* Left diamond decorations — hidden on mobile */}
        <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 flex-col gap-4 -translate-x-10 pointer-events-none select-none">
          {[DIAMONDS[0], DIAMONDS[1]].map((src, i) => (
            <div
              key={i}
              className="w-32 h-32 md:w-40 md:h-40 overflow-hidden flex-shrink-0"
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                opacity: 0.35 + i * 0.1,
              }}
            >
              <img src={src} alt="" className="w-full h-full object-cover scale-125" />
            </div>
          ))}
        </div>

        {/* Right diamond decorations — hidden on mobile */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-4 translate-x-10 pointer-events-none select-none">
          {[DIAMONDS[2], DIAMONDS[3]].map((src, i) => (
            <div
              key={i}
              className="w-32 h-32 md:w-40 md:h-40 overflow-hidden flex-shrink-0"
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                opacity: 0.35 + i * 0.1,
              }}
            >
              <img src={src} alt="" className="w-full h-full object-cover scale-125" />
            </div>
          ))}
        </div>

        {/* Text content */}
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ color: YELLOW }}>
              <MapPin className="w-3.5 h-3.5" />
              Choisissez votre ville
            </div>
            {typeFilter && CATEGORY_LABELS[typeFilter] && (
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: YELLOW, color: "#1A1A1A" }}>
                {CATEGORY_LABELS[typeFilter]} — sélectionnez une ville pour continuer
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4" style={{ color: "#1A1A1A" }}>
            {typeFilter && CATEGORY_LABELS[typeFilter]
              ? <><span style={{ color: YELLOW }}>{CATEGORY_LABELS[typeFilter]}</span> disponibles<br />{`partout ${countryPrep(country.code)} ${country.name} ${country.flag} !`}</>
              : <><span style={{ color: YELLOW }}>BLOQ5</span> vous propose des biens<br />{`partout ${countryPrep(country.code)} ${country.name} ${country.flag} !`}</>
            }
          </h1>
          <p className="text-base" style={{ color: "#666" }}>
            {typeFilter
              ? "Choisissez une ville pour voir les annonces disponibles."
              : "Une gestion locative dans les plus grandes métropoles."
            }
          </p>
        </div>
      </section>

      {/* ─── CITY GRID ─── */}
      <section className="pb-12 md:pb-16 px-4 sm:px-6">
        <div className="max-w-[720px] mx-auto">
          {/* Responsive grid: 2 cols on mobile, 3 on sm, 4 on md+ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
            {main.map((city) => (
              <CityCard key={city.name} city={city} onClick={() => goToCity(city.name)} />
            ))}
          </div>

          {/* Last row centred */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:justify-center gap-3 md:gap-4">
            {tail.map((city) => (
              <CityCard key={city.name} city={city} onClick={() => goToCity(city.name)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA PROPRIÉTAIRE ─── */}
      <section className="px-6 pb-16">
        <div
          className="max-w-5xl mx-auto rounded-2xl overflow-hidden"
          style={{ background: "#F5F5F5" }}
        >
          <div className="flex flex-col md:flex-row items-center gap-0">
            {/* Text left */}
            <div className="flex-1 p-10 md:p-12">
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
                Propriétaire, louez votre bien{" "}
                <span className="relative inline-block">
                  rapidement !
                  <span
                    className="absolute bottom-0 left-0 w-full h-1 rounded-full"
                    style={{ background: YELLOW }}
                  />
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-4 mb-7 leading-relaxed max-w-md">
                Plus de 2 500 clients, propriétaires et locataires, nous recommandent pour notre réactivité et notre efficacité. Grâce à leur confiance, nous gérons aujourd'hui plus de 8 000 lots répartis dans plus de 40 métropoles {countryPrep(country.code)} {country.name}.
              </p>
              <button className="btn-yellow text-sm">
                Vous êtes propriétaire ?
              </button>
            </div>

            {/* Illustration right */}
            <div className="flex-shrink-0 w-full md:w-64 h-56 p-6">
              <BuildingIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#1A1A1A", color: "#ccc" }} className="relative pt-14 pb-8 overflow-hidden">
        {/* Decorative circle */}
        <div
          className="absolute bottom-0 left-0 pointer-events-none"
          style={{ width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.03)", transform: "translate(-50%, 40%)" }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="text-2xl font-black text-white mb-2">
                BLOQ<span style={{ color: YELLOW }}>5</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Carte professionnelle :<br />n°CPI 6901 2019 000 039 604
              </p>
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

/* ── City Card component ── */
function CityCard({ city, onClick }: { city: { name: string; slug: string }; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <div
        className="city-card relative rounded-lg overflow-hidden border w-full"
        style={{ height: 100, borderColor: "#E8E8E8" }}
      >
        {/* Background photo */}
        <img
          src={`https://picsum.photos/seed/${city.slug}/155/100`}
          alt={city.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div
          className="city-overlay absolute inset-0 bg-black/30"
        />

        {/* + button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-white/80 hover:bg-white transition-colors z-10"
        >
          <Plus className="w-3.5 h-3.5 text-gray-700" />
        </button>
      </div>

      {/* City name */}
      <span className="text-xs font-medium text-center mt-1.5 leading-tight" style={{ color: "#1A1A1A" }}>
        {city.name}
      </span>
    </div>
  );
}
