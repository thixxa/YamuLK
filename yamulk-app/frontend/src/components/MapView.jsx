import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix Leaflet's broken default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * MapView — reusable Leaflet map component
 *
 * Tiles: OpenStreetMap (truly free, no API key, no watermark).
 *        A CSS filter is applied to render them in dark mode.
 *
 * Props:
 *   center      [lat, lng]
 *   zoom        number
 *   height      string              CSS height  (default '480px')
 *   markers     Array<{ lat, lng, label, emoji, color, type, sub, onClick }>
 *   route       Array<[lat, lng]>   — road geometry from OSRM (optional)
 *   interactive boolean
 */
export default function MapView({
  center = [7.8731, 80.7718],
  zoom = 7,
  height = '480px',
  markers = [],
  route = [],
  interactive = true,
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // ── Create map ───────────────────────────────────────────────────────
    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      touchZoom: interactive,
      attributionControl: true,
    });

    // ── OpenStreetMap tiles — FREE, no API key, no watermark ever ────────
    // CSS filter on the tile pane makes them appear dark (see MapView.css)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // ── Markers ──────────────────────────────────────────────────────────
    const validMarkers = markers.filter(m => m.lat != null && m.lng != null);

    validMarkers.forEach((m, i) => {
      const pinColor = m.color || getPinColor(m.type, i);
      const icon = L.divIcon({
        className: '',
        html: `<div class="yamulk-pin" style="background:${pinColor}">
                 <span class="yamulk-pin-emoji">${m.emoji || '📍'}</span>
               </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

      if (m.label) {
        marker.bindPopup(
          `<div class="yamulk-popup">
             <div class="yamulk-popup-emoji">${m.emoji || '📍'}</div>
             <div class="yamulk-popup-title">${m.label}</div>
             ${m.sub  ? `<div class="yamulk-popup-sub">${m.sub}</div>` : ''}
             ${m.onClick ? `<button class="yamulk-popup-btn" id="popup-btn-${i}">View Details →</button>` : ''}
           </div>`,
          { maxWidth: 220, className: 'yamulk-popup-wrap' }
        );
        if (m.onClick) {
          marker.on('popupopen', () => {
            const btn = document.getElementById(`popup-btn-${i}`);
            if (btn) btn.addEventListener('click', m.onClick);
          });
        }
      }
    });

    // ── Fit bounds ────────────────────────────────────────────────────────
    if (validMarkers.length > 1) {
      map.fitBounds(
        L.latLngBounds(validMarkers.map(m => [m.lat, m.lng])),
        { padding: [50, 50], maxZoom: 12 }
      );
    } else if (validMarkers.length === 1) {
      map.setView([validMarkers[0].lat, validMarkers[0].lng], zoom);
    }

    // ── Route polyline (real road geometry from OSRM) ─────────────────────
    if (route.length > 1) {
      // Wide glow layer
      L.polyline(route, {
        color: 'rgba(52,211,153,0.25)',
        weight: 12,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Solid line on top
      L.polyline(route, {
        color: '#34d399',
        weight: 4,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => { map.remove(); };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mapview-wrapper" style={{ height }}>
      <div ref={mapRef} className="mapview-container" style={{ height }} />
    </div>
  );
}

function getPinColor(type, index) {
  if (type === 'start')    return '#34d399';
  if (type === 'end')      return '#f87171';
  if (type === 'waypoint') return '#fbbf24';
  const palette = ['#38bdf8', '#a78bfa', '#fb923c', '#34d399', '#f472b6', '#facc15', '#4ade80'];
  return palette[index % palette.length];
}
