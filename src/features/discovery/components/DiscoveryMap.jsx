"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { formatPrice } from "@/features/shared/lib/format";
import { getSportEmoji, DISCOVERY_CONFIG } from "../config/discovery.constants";
import { getMapCenter } from "../lib/geo";

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [map, points]);

  return null;
}

function buildMarkerIcon(count, sport) {
  const emoji = getSportEmoji(sport);
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#ffffff;border:2px solid #16a34a;box-shadow:0 6px 16px rgba(15,23,42,.22);font-size:17px;">
        ${emoji}
        ${
          count > 1
            ? `<span style="position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 4px;border-radius:9999px;background:#16a34a;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;">${count}</span>`
            : ""
        }
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -38],
  });
}

function groupByCourt(matches) {
  const groups = new Map();

  for (const match of matches) {
    if (match.court?.latitude == null || match.court?.longitude == null) continue;
    const key = `${match.court.latitude.toFixed(5)},${match.court.longitude.toFixed(5)}`;
    if (!groups.has(key)) {
      groups.set(key, {
        court: match.court,
        latitude: match.court.latitude,
        longitude: match.court.longitude,
        matches: [],
      });
    }
    groups.get(key).matches.push(match);
  }

  return [...groups.values()];
}

function MatchPopupBody({ match }) {
  return (
    <>
      <span className="block font-semibold text-foreground">{match.title}</span>
      <span className="block text-muted-foreground">
        {match.dateLabel} · {match.timeLabel} · {formatPrice(match.pricePerSlot)}
      </span>
      <span className="block text-primary">
        {match.slotsLeft === 0 ? "Sin cupos" : `${match.slotsLeft} cupos libres`}
      </span>
    </>
  );
}

/**
 * OSM map of available matches. Grouped by court so overlapping starts stay
 * usable. Loaded through a dynamic wrapper to keep Leaflet client-only.
 */
export function DiscoveryMap({
  matches = [],
  location = null,
  height = 520,
  onSelectMatch = null,
}) {
  const markers = useMemo(() => groupByCourt(matches), [matches]);
  const center = useMemo(
    () => location || getMapCenter(matches),
    [location, matches]
  );
  const points = useMemo(
    () => markers.map((marker) => ({ latitude: marker.latitude, longitude: marker.longitude })),
    [markers]
  );

  return (
    <div
      className="relative overflow-hidden rounded-3xl border bg-card shadow-sm"
      style={{ height }}
    >
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {location && (
          <Circle
            center={[location.latitude, location.longitude]}
            radius={350}
            pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.12, weight: 1 }}
          />
        )}

        {markers.map((marker) => (
          <Marker
            key={`${marker.latitude}-${marker.longitude}`}
            position={[marker.latitude, marker.longitude]}
            icon={buildMarkerIcon(marker.matches.length, marker.matches[0]?.sport)}
          >
            <Popup>
              <div className="min-w-52 space-y-2">
                <div>
                  <p className="font-semibold">{marker.court?.name || "Cancha"}</p>
                  {marker.court?.address && (
                    <p className="text-xs text-muted-foreground">{marker.court.address}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  {marker.matches.slice(0, 4).map((match) =>
                    onSelectMatch ? (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => onSelectMatch(match)}
                        className="block w-full rounded-lg border p-2 text-left text-xs transition-colors hover:bg-muted"
                      >
                        <MatchPopupBody match={match} />
                      </button>
                    ) : (
                      <Link
                        key={match.id}
                        href={`${DISCOVERY_CONFIG.PATHS.MATCHES}/${match.id}`}
                        className="block rounded-lg border p-2 text-xs transition-colors hover:bg-muted"
                      >
                        <MatchPopupBody match={match} />
                      </Link>
                    )
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds points={points} />
      </MapContainer>

      <div className="pointer-events-none absolute right-3 top-3 z-[400] flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium shadow">
        <MapPin className="size-3.5 text-primary" />
        {DISCOVERY_CONFIG.UI.MAP.LEGEND}
      </div>
    </div>
  );
}
