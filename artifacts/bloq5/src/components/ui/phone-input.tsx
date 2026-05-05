import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface CountryCode {
  flag: string;
  name: string;
  dial: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { flag: "🇨🇦", name: "Canada",           dial: "+1" },
  { flag: "🇺🇸", name: "États-Unis",        dial: "+1" },
  { flag: "🇫🇷", name: "France",            dial: "+33" },
  { flag: "🇧🇪", name: "Belgique",          dial: "+32" },
  { flag: "🇨🇭", name: "Suisse",            dial: "+41" },
  { flag: "🇱🇺", name: "Luxembourg",        dial: "+352" },
  { flag: "🇬🇧", name: "Royaume-Uni",       dial: "+44" },
  { flag: "🇩🇪", name: "Allemagne",         dial: "+49" },
  { flag: "🇪🇸", name: "Espagne",           dial: "+34" },
  { flag: "🇮🇹", name: "Italie",            dial: "+39" },
  { flag: "🇵🇹", name: "Portugal",          dial: "+351" },
  { flag: "🇳🇱", name: "Pays-Bas",          dial: "+31" },
  { flag: "🇸🇪", name: "Suède",             dial: "+46" },
  { flag: "🇳🇴", name: "Norvège",           dial: "+47" },
  { flag: "🇩🇰", name: "Danemark",          dial: "+45" },
  { flag: "🇵🇱", name: "Pologne",           dial: "+48" },
  { flag: "🇷🇴", name: "Roumanie",          dial: "+40" },
  { flag: "🇺🇦", name: "Ukraine",           dial: "+380" },
  { flag: "🇷🇺", name: "Russie",            dial: "+7" },
  { flag: "🇹🇷", name: "Turquie",           dial: "+90" },
  { flag: "🇱🇧", name: "Liban",             dial: "+961" },
  { flag: "🇲🇦", name: "Maroc",             dial: "+212" },
  { flag: "🇩🇿", name: "Algérie",           dial: "+213" },
  { flag: "🇹🇳", name: "Tunisie",           dial: "+216" },
  { flag: "🇸🇳", name: "Sénégal",           dial: "+221" },
  { flag: "🇨🇮", name: "Côte d'Ivoire",     dial: "+225" },
  { flag: "🇨🇲", name: "Cameroun",          dial: "+237" },
  { flag: "🇨🇩", name: "R.D. Congo",        dial: "+243" },
  { flag: "🇲🇬", name: "Madagascar",        dial: "+261" },
  { flag: "🇲🇺", name: "Maurice",           dial: "+230" },
  { flag: "🇭🇹", name: "Haïti",             dial: "+509" },
  { flag: "🇲🇽", name: "Mexique",           dial: "+52" },
  { flag: "🇧🇷", name: "Brésil",            dial: "+55" },
  { flag: "🇨🇴", name: "Colombie",          dial: "+57" },
  { flag: "🇦🇷", name: "Argentine",         dial: "+54" },
  { flag: "🇦🇺", name: "Australie",         dial: "+61" },
  { flag: "🇮🇳", name: "Inde",              dial: "+91" },
  { flag: "🇨🇳", name: "Chine",             dial: "+86" },
  { flag: "🇯🇵", name: "Japon",             dial: "+81" },
  { flag: "🇰🇷", name: "Corée du Sud",      dial: "+82" },
  { flag: "🇸🇦", name: "Arabie Saoudite",   dial: "+966" },
  { flag: "🇦🇪", name: "Émirats Arabes",    dial: "+971" },
];

interface PhoneInputProps {
  value: string;
  dialCode: string;
  onChange: (value: string, dialCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  dialCode,
  onChange,
  placeholder = "000 000 0000",
  disabled = false,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = COUNTRY_CODES.find(c => c.dial === dialCode && c.flag === COUNTRY_CODES.find(x => x.dial === dialCode)?.flag)
    ?? COUNTRY_CODES.find(c => c.dial === dialCode)
    ?? COUNTRY_CODES[0];

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search)
      )
    : COUNTRY_CODES;

  function select(c: CountryCode) {
    onChange(value, c.dial);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="relative flex items-center border border-gray-200 focus-within:border-[#F5A623] rounded-xl h-12 transition-colors overflow-visible">
      {/* Country selector button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 h-full border-r border-gray-200 shrink-0 hover:bg-gray-50 transition-colors rounded-l-xl"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-sm font-semibold text-gray-700">{selected.dial}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {/* Number input */}
      <input
        type="tel"
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value.replace(/[^\d\s\-().+]/g, ""), dialCode)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 px-3 h-full"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un pays…"
              className="w-full text-sm outline-none px-2 py-1 rounded-lg bg-gray-50 placeholder:text-gray-400"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.map((c, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => select(c)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 text-gray-800">{c.name}</span>
                  <span className="text-gray-400 font-medium">{c.dial}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">Aucun résultat</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
