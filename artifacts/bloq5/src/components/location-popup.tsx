import { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useLocation as useWouterLocation } from "wouter";
import { useLocation_ } from "@/context/location-context";
import { COUNTRIES, isActiveCountry } from "@/data/countries";

const YELLOW = "#F5A623";

export function LocationPopup() {
  const { showPopup, confirm } = useLocation_();
  const [, navigate]          = useWouterLocation();
  const [countryCode, setCountryCode] = useState("FR");
  const [postalCode, setPostalCode]   = useState("");
  const [error, setError]             = useState("");
  const [visible, setVisible]         = useState(false);

  /* Fade-in after mount */
  useEffect(() => {
    if (!showPopup) return;
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [showPopup]);

  if (!showPopup) return null;

  function handleSubmit() {
    if (!postalCode.trim()) {
      setError("Veuillez entrer votre code postal.");
      return;
    }
    setError("");
    confirm(countryCode, postalCode.trim());
    if (!isActiveCountry(countryCode)) {
      navigate("/coming-soon");
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "rgba(0,0,0,0.45)",
        transition: "opacity .3s",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Modal card */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "transform .35s cubic-bezier(.22,.68,0,1.2)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: YELLOW }} />

        <div className="px-8 py-8">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "#FEF9EE" }}
          >
            <MapPin className="w-7 h-7" style={{ color: YELLOW }} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-extrabold text-center mb-1" style={{ color: "#1A1A1A" }}>
            Aidez-nous à vous orienter
          </h2>
          <p className="text-sm text-center text-gray-500 mb-7">
            Sélectionnez votre pays et entrez votre code postal pour personnaliser votre expérience.
          </p>

          {/* Form row: country + postal code */}
          <div className="flex gap-3 mb-2">
            {/* Country select */}
            <div className="relative flex-1">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-3 pr-8 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer"
                style={{ focusRingColor: YELLOW } as React.CSSProperties}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Postal code */}
            <input
              type="text"
              value={postalCode}
              onChange={(e) => { setPostalCode(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Code postal"
              maxLength={10}
              className="w-32 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2"
              style={{ flexShrink: 0 }}
            />
          </div>

          {/* Error */}
          {error && <p className="text-xs text-red-500 mb-3 ml-1">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-85"
            style={{ background: YELLOW, color: "#1A1A1A" }}
          >
            Confirmer ma localisation
          </button>

          <p className="text-xs text-center text-gray-400 mt-4">
            Ces informations sont stockées localement sur votre appareil.
          </p>
        </div>
      </div>
    </div>
  );
}
