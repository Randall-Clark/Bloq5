import { Link } from "wouter";
import { MapPin, Clock, Bell, ArrowLeft } from "lucide-react";
import { useLocation_ } from "@/context/location-context";

const YELLOW = "#F5A623";

export default function ComingSoonPage() {
  const { country, showPopup: _sp, confirm: _c, ...ctx } = useLocation_();

  function handleChangeCountry() {
    localStorage.removeItem("bloq5_location");
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col" style={{ color: "#1A1A1A" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .float { animation: float 3.5s ease-in-out infinite; }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: .7; }
          70%  { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
        .pulse-ring { animation: pulse-ring 2.5s ease-out infinite; }
      `}</style>

      {/* Navbar */}
      <nav className="border-b border-gray-100 shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight" style={{ color: "#1A1A1A" }}>
            BLOQ<span style={{ color: YELLOW }}>5</span>
          </Link>
          <button
            onClick={handleChangeCountry}
            className="flex items-center gap-2 text-sm font-semibold border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Changer de pays
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Decorative circles */}
        <div className="relative mb-10">
          <div
            className="pulse-ring absolute inset-0 rounded-full border-4"
            style={{ borderColor: YELLOW, opacity: 0.3 }}
          />
          <div
            className="float relative w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white"
            style={{ background: "#FEF9EE" }}
          >
            {country.flag}
          </div>
        </div>

        {/* Clock badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6 border"
          style={{ background: "#FEF9EE", borderColor: "#FFD9A0", color: YELLOW }}
        >
          <Clock className="w-3.5 h-3.5" />
          Bientôt disponible
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 max-w-lg leading-tight">
          Nous envisageons d'arriver{" "}
          <span style={{ color: YELLOW }}>bientôt</span>{" "}
          en&nbsp;{country.name}&nbsp;{country.flag}
        </h1>

        <p className="text-gray-500 text-base max-w-md leading-relaxed mb-10">
          BLOQ5 se développe progressivement dans de nouvelles métropoles. Votre pays est dans notre viseur — restez à l'affût, l'annonce arrive très bientôt !
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {[
            { value: "2 pays",   label: "Déjà disponibles" },
            { value: "40+",      label: "Villes couvertes" },
            { value: "8 000+",   label: "Lots gérés" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold" style={{ color: YELLOW }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            onClick={handleChangeCountry}
            className="flex items-center gap-2 text-sm font-bold rounded-xl px-6 py-3 transition-opacity hover:opacity-85"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            <MapPin className="w-4 h-4" />
            Choisir un autre pays
          </button>
          <Link href="/">
            <button className="flex items-center gap-2 text-sm font-semibold border border-gray-300 rounded-xl px-6 py-3 hover:bg-gray-50 transition-colors text-gray-600">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </button>
          </Link>
        </div>

        {/* Active countries hint */}
        <p className="text-xs text-gray-400 mt-10">
          Actuellement disponible au{" "}
          <span className="font-semibold text-gray-600">🇨🇦 Canada</span>.
        </p>
      </div>

      {/* Footer minimal */}
      <footer className="border-t border-gray-100 py-5 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} BLOQ5 — La location simplifiée pour tous.
      </footer>
    </div>
  );
}
