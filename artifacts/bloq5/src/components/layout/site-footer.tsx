import { useState } from "react";
import { Link } from "wouter";
import { useLocation_ } from "@/context/location-context";
import { FooterProModal } from "@/components/footer-pro-modal";

const YELLOW = "#F5A623";

const SERVICES = [
  "Gestion locative résidentielle",
  "Gestion locative commerciale",
  "Location longue durée",
  "BLOQ5 Pro",
];

export function SiteFooter() {
  const { country } = useLocation_();
  const [showProModal, setShowProModal] = useState(false);
  const allCityNames   = country.cities.map((c) => c.name);
  const footerCityCols = [0, 1, 2, 3].map((i) => allCityNames.filter((_, idx) => idx % 4 === i));

  return (
    <>
      {showProModal && <FooterProModal onClose={() => setShowProModal(false)} />}

      <footer style={{ background: "#1A1A1A", color: "#ccc" }} className="pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="text-2xl font-black text-white mb-2">BLOQ<span style={{ color: YELLOW }}>5</span></div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                La plateforme de gestion immobilière locative — résidentiel et commercial.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Nos services</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {SERVICES.map(l => (
                  <li key={l}>
                    <Link href="/services-pro" className="hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setShowProModal(true)}
                    className="hover:text-white transition-colors text-left"
                  >
                    Pro Access
                  </button>
                </li>
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
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="/articles" className="hover:text-white transition-colors">Articles</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Presse</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recrutement</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {["Location maison", "Location appartement", "Location colocation", "Location bureau"].map((title, colIdx) => (
              <div key={title}>
                <h5 className="text-xs font-semibold text-gray-400 mb-2">{title}</h5>
                <ul className="space-y-1">
                  {footerCityCols[colIdx]?.map((cityName) => (
                    <li key={cityName}>
                      <Link href={`/properties?city=${encodeURIComponent(cityName)}`} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                        {cityName}
                      </Link>
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
    </>
  );
}
