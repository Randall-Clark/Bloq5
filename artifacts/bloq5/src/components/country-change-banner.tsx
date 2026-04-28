import { Globe, X } from "lucide-react";
import { useLocation_ } from "@/context/location-context";

const YELLOW = "#F5A623";

export function CountryChangeBanner() {
  const { showChangePrompt, country, detectedCountry, acceptDetected, rejectDetected } = useLocation_();

  if (!showChangePrompt || !detectedCountry) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9998] w-full max-w-lg px-4"
      style={{ transform: "translateX(-50%)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{ animation: "slideUp .35s cubic-bezier(.22,.68,0,1.2)" }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Accent bar */}
        <div className="h-1" style={{ background: YELLOW }} />

        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
              style={{ background: "#FEF9EE" }}
            >
              <Globe className="w-5 h-5" style={{ color: YELLOW }} />
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Nouveau pays détecté
              </p>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Nous avons remarqué que votre emplacement a changé. Souhaitez-vous continuer avec le nouveau pays{" "}
                <span className="font-semibold text-gray-700">
                  {detectedCountry.flag} {detectedCountry.name}
                </span>{" "}
                ou rester sur{" "}
                <span className="font-semibold text-gray-700">
                  {country.flag} {country.name}
                </span>{" "}?
              </p>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={acceptDetected}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-opacity hover:opacity-85"
                  style={{ background: YELLOW, color: "#1A1A1A", minWidth: 120 }}
                >
                  Passer à {detectedCountry.flag} {detectedCountry.name}
                </button>
                <button
                  onClick={rejectDetected}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  style={{ minWidth: 120 }}
                >
                  Rester sur {country.flag} {country.name}
                </button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={rejectDetected}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
