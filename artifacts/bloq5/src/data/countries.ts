export interface CountryData {
  code: string;
  name: string;
  flag: string;
  currency: { symbol: string; code: string };
  cities: { name: string; slug: string }[];
}

export const COUNTRIES: CountryData[] = [
  {
    code: "FR", name: "France", flag: "🇫🇷",
    currency: { symbol: "€", code: "EUR" },
    cities: [
      { name: "Paris", slug: "Paris" }, { name: "Lyon", slug: "Lyon" },
      { name: "Lille", slug: "Lille" }, { name: "Bordeaux", slug: "Bordeaux" },
      { name: "Toulouse", slug: "Toulouse" }, { name: "Angoulême", slug: "Angouleme" },
      { name: "Caen", slug: "Caen" }, { name: "Tours", slug: "Tours" },
      { name: "Angers", slug: "Angers" }, { name: "Grenoble", slug: "Grenoble" },
      { name: "Bourgoin-Jaillieu", slug: "BourgoinJaillieu" }, { name: "Mulhouse", slug: "Mulhouse" },
      { name: "Avignon", slug: "Avignon" }, { name: "Chambéry", slug: "Chambery" },
      { name: "Pau", slug: "Pau" }, { name: "Nice", slug: "Nice" },
      { name: "Marseille", slug: "Marseille" }, { name: "Annemasse", slug: "Annemasse" },
    ],
  },
  {
    code: "BE", name: "Belgique", flag: "🇧🇪",
    currency: { symbol: "€", code: "EUR" },
    cities: [
      { name: "Bruxelles", slug: "Bruxelles" }, { name: "Liège", slug: "Liege" },
      { name: "Gand", slug: "Gand" }, { name: "Anvers", slug: "Anvers" },
      { name: "Namur", slug: "Namur" }, { name: "Mons", slug: "Mons" },
      { name: "Bruges", slug: "Bruges" }, { name: "Louvain", slug: "Louvain" },
    ],
  },
  {
    code: "CH", name: "Suisse", flag: "🇨🇭",
    currency: { symbol: "CHF", code: "CHF" },
    cities: [
      { name: "Zurich", slug: "Zurich" }, { name: "Genève", slug: "Geneve" },
      { name: "Berne", slug: "Berne" }, { name: "Lausanne", slug: "Lausanne" },
      { name: "Bâle", slug: "Bale" }, { name: "Lucerne", slug: "Lucerne" },
    ],
  },
  {
    code: "CA", name: "Canada", flag: "🇨🇦",
    currency: { symbol: "CA$", code: "CAD" },
    cities: [
      { name: "Montréal", slug: "Montreal" }, { name: "Québec", slug: "Quebec" },
      { name: "Toronto", slug: "Toronto" }, { name: "Ottawa", slug: "Ottawa" },
      { name: "Vancouver", slug: "Vancouver" }, { name: "Calgary", slug: "Calgary" },
    ],
  },
  {
    code: "US", name: "États-Unis", flag: "🇺🇸",
    currency: { symbol: "$", code: "USD" },
    cities: [
      { name: "New York", slug: "NewYork" }, { name: "Los Angeles", slug: "LosAngeles" },
      { name: "Chicago", slug: "Chicago" }, { name: "Miami", slug: "Miami" },
      { name: "Houston", slug: "Houston" }, { name: "San Francisco", slug: "SanFrancisco" },
    ],
  },
  {
    code: "GB", name: "Royaume-Uni", flag: "🇬🇧",
    currency: { symbol: "£", code: "GBP" },
    cities: [
      { name: "Londres", slug: "London" }, { name: "Manchester", slug: "Manchester" },
      { name: "Birmingham", slug: "Birmingham" }, { name: "Leeds", slug: "Leeds" },
      { name: "Glasgow", slug: "Glasgow" }, { name: "Liverpool", slug: "Liverpool" },
    ],
  },
  {
    code: "MA", name: "Maroc", flag: "🇲🇦",
    currency: { symbol: "MAD", code: "MAD" },
    cities: [
      { name: "Casablanca", slug: "Casablanca" }, { name: "Rabat", slug: "Rabat" },
      { name: "Marrakech", slug: "Marrakech" }, { name: "Fès", slug: "Fes" },
      { name: "Tanger", slug: "Tanger" }, { name: "Agadir", slug: "Agadir" },
    ],
  },
  {
    code: "SN", name: "Sénégal", flag: "🇸🇳",
    currency: { symbol: "FCFA", code: "XOF" },
    cities: [
      { name: "Dakar", slug: "Dakar" }, { name: "Saint-Louis", slug: "SaintLouis" },
      { name: "Thiès", slug: "Thies" }, { name: "Kaolack", slug: "Kaolack" },
    ],
  },
  {
    code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮",
    currency: { symbol: "FCFA", code: "XOF" },
    cities: [
      { name: "Abidjan", slug: "Abidjan" }, { name: "Bouaké", slug: "Bouake" },
      { name: "Yamoussoukro", slug: "Yamoussoukro" }, { name: "Korhogo", slug: "Korhogo" },
    ],
  },
  {
    code: "CM", name: "Cameroun", flag: "🇨🇲",
    currency: { symbol: "FCFA", code: "XAF" },
    cities: [
      { name: "Yaoundé", slug: "Yaounde" }, { name: "Douala", slug: "Douala" },
      { name: "Bafoussam", slug: "Bafoussam" }, { name: "Garoua", slug: "Garoua" },
    ],
  },
  {
    code: "TN", name: "Tunisie", flag: "🇹🇳",
    currency: { symbol: "DT", code: "TND" },
    cities: [
      { name: "Tunis", slug: "Tunis" }, { name: "Sfax", slug: "Sfax" },
      { name: "Sousse", slug: "Sousse" }, { name: "Monastir", slug: "Monastir" },
    ],
  },
  {
    code: "DZ", name: "Algérie", flag: "🇩🇿",
    currency: { symbol: "DA", code: "DZD" },
    cities: [
      { name: "Alger", slug: "Alger" }, { name: "Oran", slug: "Oran" },
      { name: "Constantine", slug: "Constantine" }, { name: "Annaba", slug: "Annaba" },
    ],
  },
  {
    code: "LU", name: "Luxembourg", flag: "🇱🇺",
    currency: { symbol: "€", code: "EUR" },
    cities: [
      { name: "Luxembourg-Ville", slug: "Luxembourg" }, { name: "Esch-sur-Alzette", slug: "Esch" },
      { name: "Differdange", slug: "Differdange" }, { name: "Dudelange", slug: "Dudelange" },
    ],
  },
  {
    code: "MQ", name: "Martinique", flag: "🇲🇶",
    currency: { symbol: "€", code: "EUR" },
    cities: [
      { name: "Fort-de-France", slug: "FortDeFrance" }, { name: "Le Lamentin", slug: "Lamentin" },
      { name: "Saint-Joseph", slug: "SaintJoseph" }, { name: "Le Robert", slug: "LeRobert" },
    ],
  },
  {
    code: "GP", name: "Guadeloupe", flag: "🇬🇵",
    currency: { symbol: "€", code: "EUR" },
    cities: [
      { name: "Pointe-à-Pitre", slug: "PointeAPitre" }, { name: "Basse-Terre", slug: "BasseTerre" },
      { name: "Les Abymes", slug: "LesAbymes" }, { name: "Le Gosier", slug: "LeGosier" },
    ],
  },
];

export const COUNTRY_MAP: Record<string, CountryData> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
);

export function getCountryByCode(code: string): CountryData {
  return COUNTRY_MAP[code] ?? COUNTRY_MAP["CA"];
}

/** Countries that have full platform support */
export const ACTIVE_COUNTRY_CODES = new Set(["CA"]);

export function isActiveCountry(code: string): boolean {
  return ACTIVE_COUNTRY_CODES.has(code);
}

/** Returns the correct French preposition for a country ("au", "en", "aux", etc.) */
const COUNTRY_PREPS: Record<string, string> = {
  CA: "au", LU: "au", CM: "au", SN: "au", MA: "au",
};
export function countryPrep(code: string): string {
  return COUNTRY_PREPS[code] ?? "en";
}
