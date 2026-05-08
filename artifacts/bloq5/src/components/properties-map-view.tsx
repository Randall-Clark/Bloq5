import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

const YELLOW = "#F5A623";

const CITY_CENTERS: Record<string, [number, number]> = {
  "Montréal":  [45.5017, -73.5673],
  "Montreal":  [45.5017, -73.5673],
  "Québec":    [46.8139, -71.2080],
  "Quebec":    [46.8139, -71.2080],
  "Toronto":   [43.6532, -79.3832],
  "Vancouver": [49.2827, -123.1207],
  "Calgary":   [51.0447, -114.0719],
  "Ottawa":    [45.4215, -75.6972],
  "Edmonton":  [53.5461, -113.4938],
  "Winnipeg":  [49.8951, -97.1384],
  "Halifax":   [44.6488, -63.5752],
  "default":   [45.5017, -73.5673],
};

function seededOffset(seed: number, range: number): number {
  const x = Math.sin(seed) * 10000;
  return (x - Math.floor(x)) * range * 2 - range;
}

const yellowIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:${YELLOW};transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid white;
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const centerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:#1A1A1A;
    box-shadow:0 0 0 3px white,0 0 0 5px rgba(0,0,0,0.15);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export interface MapProperty {
  id: number;
  title: string;
  price: number;
  city: string;
  type: string;
  status: string;
  currency: string;
}

interface PropertiesMapViewProps {
  properties: MapProperty[];
  city: string;
  radiusKm?: number;
}

const TYPE_LABELS: Record<string, string> = {
  apartment:   "Appartement",
  house:       "Maison",
  condo:       "Condo",
  "co-living": "Colocation",
  office:      "Bureau",
  commercial:  "Commercial",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible",    color: "#22C55E" },
  soon:      { label: "Bientôt dispo", color: "#F97316" },
  occupied:  { label: "Occupé",        color: "#EF4444" },
};

export default function PropertiesMapView({ properties, city, radiusKm }: PropertiesMapViewProps) {
  const center: [number, number] = CITY_CENTERS[city] ?? CITY_CENTERS["default"];
  const radiusMeters = radiusKm ? radiusKm * 1000 : undefined;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: 540 }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Radius circle overlay */}
        {radiusMeters && (
          <>
            <Circle
              center={center}
              radius={radiusMeters}
              pathOptions={{
                color: YELLOW,
                fillColor: YELLOW,
                fillOpacity: 0.08,
                weight: 2,
                dashArray: "6 4",
              }}
            />
            <Marker position={center} icon={centerIcon}>
              <Popup>
                <div className="text-xs font-semibold" style={{ color: "#1A1A1A" }}>
                  Centre de recherche<br />
                  <span className="text-gray-500 font-normal">Rayon : {radiusKm} km</span>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {properties.map((prop) => {
          const lat = center[0] + seededOffset(prop.id * 7, 0.03);
          const lng = center[1] + seededOffset(prop.id * 13, 0.05);
          const st = STATUS_LABELS[prop.status] ?? STATUS_LABELS.available;
          const typeLabel = TYPE_LABELS[prop.type] ?? prop.type ?? "Bien";
          return (
            <Marker key={prop.id} position={[lat, lng]} icon={yellowIcon}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>
                    {typeLabel}
                  </div>
                  <div className="text-base font-extrabold mb-1" style={{ color: YELLOW }}>
                    {prop.price.toLocaleString("fr-CA")} {prop.currency}/mois
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: st.color }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.color, display: "inline-block" }} />
                    {st.label}
                  </div>
                  <a
                    href={`/properties/${prop.id}`}
                    className="block mt-2 text-xs font-semibold underline"
                    style={{ color: "#1A1A1A" }}
                  >
                    Voir l'annonce →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
