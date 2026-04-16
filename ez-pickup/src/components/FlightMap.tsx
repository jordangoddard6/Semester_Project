// Leaflet map shown only for active flights with live coordinates (State D success / active)

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Props {
  lat: number;
  lng: number;
  direction: number | null;
  altitude: number | null;
  speedHorizontal: number | null;
}

export default function FlightMap({ lat, lng, direction, altitude, speedHorizontal }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep references so we can update position without tearing down the whole map.
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialise the map once the container div is mounted.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true }).setView([lat, lng], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Use a rotatable div icon so the airplane points in its heading direction.
    const marker = L.marker([lat, lng], { icon: buildIcon(direction) });
    marker.addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Only runs once on mount — position updates handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position + heading whenever live data changes (e.g. after a retry).
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const latlng: L.LatLngExpression = [lat, lng];
    markerRef.current.setLatLng(latlng);
    markerRef.current.setIcon(buildIcon(direction));
    mapRef.current.panTo(latlng);
  }, [lat, lng, direction]);

  const tooltipLines = [
    altitude != null ? `Altitude: ${altitude.toLocaleString()} ft` : null,
    speedHorizontal != null ? `Speed: ${Math.round(speedHorizontal)} km/h` : null,
    direction != null ? `Heading: ${Math.round(direction)}°` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        {tooltipLines.map((line) => (
          <span key={line} className="bg-slate-100 px-2 py-1 rounded">{line}</span>
        ))}
      </div>
      {/* The map container must have an explicit height for Leaflet to render. */}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-slate-200"
        style={{ height: '320px' }}
      />
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds a Leaflet DivIcon with an inline SVG airplane that points true north
 * at 0°. The SVG nose is at the top of the viewBox, so rotating by the API's
 * `direction` value directly aligns the marker with the aircraft's heading.
 */
function buildIcon(direction: number | null): L.DivIcon {
  const deg = direction ?? 0;
  // Top-down airplane silhouette pointing north (up) at 0°:
  //   • Fuselage: narrow vertical ellipse running the full height
  //   • Wings:    wide horizontal ellipse across the mid-section
  //   • Tail:     smaller horizontal ellipse near the bottom
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <ellipse cx="16" cy="16" rx="2.5" ry="13" fill="#0284c7"/>
      <ellipse cx="16" cy="15" rx="13"  ry="2.5" fill="#0284c7"/>
      <ellipse cx="16" cy="25" rx="5.5" ry="1.8" fill="#0284c7"/>
    </svg>`;
  return L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;transform:rotate(${deg}deg);transform-origin:center;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))">${svg}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}
