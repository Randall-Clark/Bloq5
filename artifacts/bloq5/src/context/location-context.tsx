import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { COUNTRIES, COUNTRY_MAP, getCountryByCode, type CountryData } from "@/data/countries";

const LS_KEY = "bloq5_location";
const LS_DETECTED = "bloq5_detected_country";

interface LocationState {
  country: CountryData;
  postalCode: string;
  isReady: boolean;          // true once popup filled or data loaded from LS
  showPopup: boolean;        // first-load popup
  detectedCountry: CountryData | null;   // from IP geolocation (if different from saved)
  showChangePrompt: boolean; // country-changed banner
}

interface LocationContextValue extends LocationState {
  confirm: (countryCode: string, postalCode: string) => void;
  acceptDetected: () => void;
  rejectDetected: () => void;
  changeCountry: (countryCode: string, postalCode?: string) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function useLocation_() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation_ must be used inside LocationProvider");
  return ctx;
}

async function detectCountryFromIP(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data.country_code ?? null;
  } catch {
    return null;
  }
}

function loadSaved(): { countryCode: string; postalCode: string } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePref(countryCode: string, postalCode: string) {
  localStorage.setItem(LS_KEY, JSON.stringify({ countryCode, postalCode }));
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const saved = loadSaved();

  const [state, setState] = useState<LocationState>({
    country: saved ? getCountryByCode(saved.countryCode) : getCountryByCode("CA"),
    postalCode: saved?.postalCode ?? "",
    isReady: !!saved,
    showPopup: !saved,
    detectedCountry: null,
    showChangePrompt: false,
  });

  /* IP geolocation check */
  useEffect(() => {
    if (!saved) return; // popup is showing, skip geolocation for now
    detectCountryFromIP().then((code) => {
      if (!code) return;
      const detected = getCountryByCode(code);
      const lastDetected = localStorage.getItem(LS_DETECTED);
      // If detected country differs from saved AND differs from last prompt
      if (detected.code !== saved.countryCode && lastDetected !== code) {
        setState((s) => ({ ...s, detectedCountry: detected, showChangePrompt: true }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirm = useCallback((countryCode: string, postalCode: string) => {
    const country = getCountryByCode(countryCode);
    savePref(countryCode, postalCode);
    // After popup confirm, run geolocation check
    detectCountryFromIP().then((code) => {
      if (code && code !== countryCode) {
        const detected = getCountryByCode(code);
        setState((s) => ({ ...s, country, postalCode, isReady: true, showPopup: false, detectedCountry: detected, showChangePrompt: true }));
      } else {
        setState((s) => ({ ...s, country, postalCode, isReady: true, showPopup: false, detectedCountry: null, showChangePrompt: false }));
      }
    });
  }, []);

  const acceptDetected = useCallback(() => {
    setState((s) => {
      if (!s.detectedCountry) return s;
      savePref(s.detectedCountry.code, "");
      localStorage.setItem(LS_DETECTED, s.detectedCountry.code);
      return { ...s, country: s.detectedCountry!, postalCode: "", detectedCountry: null, showChangePrompt: false };
    });
  }, []);

  const rejectDetected = useCallback(() => {
    setState((s) => {
      if (s.detectedCountry) localStorage.setItem(LS_DETECTED, s.detectedCountry.code);
      return { ...s, detectedCountry: null, showChangePrompt: false };
    });
  }, []);

  const changeCountry = useCallback((countryCode: string, postalCode = "") => {
    const country = getCountryByCode(countryCode);
    savePref(countryCode, postalCode);
    setState((s) => ({ ...s, country, postalCode }));
  }, []);

  return (
    <LocationContext.Provider value={{ ...state, confirm, acceptDetected, rejectDetected, changeCountry }}>
      {children}
    </LocationContext.Provider>
  );
}

export { COUNTRIES, COUNTRY_MAP };
