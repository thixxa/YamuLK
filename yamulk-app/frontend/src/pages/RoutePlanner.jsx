import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import { routes, transportModes, destinations as mockDestinations } from '../data/mockData';
import './RoutePlanner.css';

// ── Starting point: Colombo Fort ──────────────────────────────────────────
const COLOMBO = { name: 'Colombo Fort', emoji: '🏙️', lat: 6.9344, lng: 79.8428, km: 0, type: 'start' };

/**
 * Resolve GPS coordinates for a destination.
 * Priority: API latitude/longitude → mockData lat/lng → name lookup in mockData
 */
function resolveCoords(dest) {
  const apiLat = dest?.latitude;
  const apiLng = dest?.longitude;
  if (apiLat != null && apiLng != null && apiLat !== 0 && apiLng !== 0) {
    return { lat: apiLat, lng: apiLng };
  }
  if (dest?.lat != null && dest?.lng != null) {
    return { lat: dest.lat, lng: dest.lng };
  }
  const match = mockDestinations.find(
    d =>
      d.name.toLowerCase() === dest?.name?.toLowerCase() ||
      d.id === dest?._id ||
      d.id === dest?.id
  );
  return match ? { lat: match.lat, lng: match.lng } : null;
}

/**
 * Fetch real road route from OSRM public API (free, no API key).
 * Returns { distanceKm, durationMin, coordinates: [[lat,lng], ...] }
 */
async function fetchOSRMRoute(start, end) {
  try {
    // OSRM expects [lng, lat]
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start.lng},${start.lat};${end.lng},${end.lat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM request failed');
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No route found');

    const r = data.routes[0];
    // GeoJSON coordinates are [lng, lat] — flip to Leaflet's [lat, lng]
    const coordinates = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distanceKm = Math.round(r.distance / 1000);
    const durationMin = Math.round(r.duration / 60);

    return { distanceKm, durationMin, coordinates };
  } catch {
    return null; // Caller will fall back to straight line
  }
}

/** Format minutes into "Xh Ym" */
function fmtMin(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function RoutePlanner() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const passedDest = location.state?.destination;

  const defaultRoute = routes[0];
  const [selectedMode, setSelectedMode] = useState('bus');

  // ── OSRM state ────────────────────────────────────────────────────────
  const [roadCoords, setRoadCoords]   = useState([]);   // [[lat,lng], ...]
  const [realDistKm, setRealDistKm]   = useState(null);
  const [realDurMin, setRealDurMin]   = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError,   setRouteError]   = useState(false);

  // Resolved destination coordinates
  const destCoords = passedDest ? resolveCoords(passedDest) : null;

  // ── Fetch real road route when destination changes ────────────────────
  useEffect(() => {
    if (!destCoords) {
      // Default route: pre-draw straight line between the mock waypoints
      setRoadCoords(defaultRoute.waypoints.map(wp => [wp.lat, wp.lng]));
      setRealDistKm(null);
      setRealDurMin(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);
    setRouteError(false);
    setRoadCoords([]);

    fetchOSRMRoute(COLOMBO, destCoords).then(result => {
      if (cancelled) return;
      if (result) {
        setRoadCoords(result.coordinates);
        setRealDistKm(result.distanceKm);
        setRealDurMin(result.durationMin);
      } else {
        // Fallback: straight line between the two points
        setRoadCoords([[COLOMBO.lat, COLOMBO.lng], [destCoords.lat, destCoords.lng]]);
        setRouteError(true);
      }
      setRouteLoading(false);
    });

    return () => { cancelled = true; };
  }, [passedDest?.name]); // re-fetch when destination name changes

  // ── Build route metadata ───────────────────────────────────────────────
  const distKm = realDistKm ?? (passedDest ? null : parseInt(defaultRoute.distance));
  const distLabel = distKm != null ? `${distKm} km` : (routeLoading ? 'Calculating...' : defaultRoute.distance);

  // Speed estimates per mode (km/h) — used to calculate time & cost from real distance
  const speedKph = { bus: 45, train: 40, car: 70, bike: 55 };
  const costPerKm = { bus: 1.5, train: 1.1, car: 24, bike: 3 };

  const buildModes = (km) => {
    if (!km) return defaultRoute.modes;
    return Object.fromEntries(
      Object.entries(speedKph).map(([mode, speed]) => {
        const travelMin = Math.round((km / speed) * 60);
        return [mode, {
          duration: fmtMin(travelMin),
          cost: `Rs. ${Math.round(km * costPerKm[mode]).toLocaleString()}`,
          stops: Math.round(km / (mode === 'bus' ? 15 : mode === 'train' ? 25 : 40)),
        }];
      })
    );
  };

  const routeModes = buildModes(realDistKm);
  const modeData = routeModes[selectedMode];

  // ── Markers ────────────────────────────────────────────────────────────
  const markers = passedDest && destCoords
    ? [
        { ...COLOMBO, label: COLOMBO.name, sub: 'Starting point' },
        {
          lat: destCoords.lat, lng: destCoords.lng,
          label: passedDest.name,
          emoji: passedDest.emoji || '📍',
          type: 'end',
          sub: `${realDistKm != null ? realDistKm + ' km by road' : 'Destination'}`,
        },
      ]
    : defaultRoute.waypoints.map(wp => ({
        lat: wp.lat, lng: wp.lng,
        label: wp.name, emoji: wp.emoji, type: wp.type,
        sub: wp.km > 0 ? `${wp.km} km from start` : 'Starting point',
      }));

  // Route description text
  const routeEnd = passedDest?.name ?? defaultRoute.end;

  return (
    <div className="route-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">🗺️ Route Planner</h1>
            <p className="text-muted text-sm mt-1">
              Colombo Fort → {routeEnd}
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/weather')} id="btn-check-weather-route">
            🌤️ Check Weather
          </button>
        </div>

        <div className="route-layout">
          {/* ── Map area ─────────────────────────────────────────────── */}
          <div className="map-area">
            <div className="map-label">
              {routeLoading ? '⏳ Loading route...' : '📍 Route Preview'}
            </div>

            {routeError && (
              <div className="route-error-banner">
                ⚠️ Could not load road data — showing approximate straight-line route
              </div>
            )}

            <MapView
              key={`${routeEnd}-${realDistKm}`}
              center={[7.2, 80.5]}
              zoom={8}
              height="480px"
              markers={markers}
              route={roadCoords}
              interactive={true}
            />

            <div className="map-overlay-badge">
              <span>🛣️</span>
              <div>
                <div className="font-bold">{distLabel}</div>
                <div className="text-xs text-muted">
                  {realDistKm ? 'Road distance' : 'Total distance'}
                </div>
              </div>
            </div>
          </div>

          {/* ── Side panel ───────────────────────────────────────────── */}
          <div className="route-side">
            {/* Route info */}
            <div className="route-info-card">
              <h3 className="font-bold mb-4">Route Details</h3>
              <div className="route-points">
                <div className="route-point start">
                  <div className="route-dot start-dot"></div>
                  <div>
                    <div className="route-point-name">Colombo Fort</div>
                    <div className="text-xs text-muted">Starting Point</div>
                  </div>
                </div>

                {/* Intermediate waypoints (default route only) */}
                {!passedDest && defaultRoute.waypoints.slice(1, -1).map((wp, i) => (
                  <div key={i} className="route-waypoint">
                    <div className="route-dot waypoint-dot"></div>
                    <div className="route-point-name">{wp.emoji} {wp.name}</div>
                    <div className="text-xs text-muted">{wp.km} km</div>
                  </div>
                ))}

                <div className="route-line"></div>
                <div className="route-point end">
                  <div className="route-dot end-dot"></div>
                  <div>
                    <div className="route-point-name">
                      {passedDest?.emoji} {routeEnd}
                    </div>
                    <div className="text-xs text-muted">Destination</div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="route-metrics">
                <div className="metric-box">
                  <div className="metric-val">
                    {routeLoading ? '...' : distLabel}
                  </div>
                  <div className="metric-lbl">Distance</div>
                </div>
                <div className="metric-box">
                  <div className="metric-val">
                    {routeLoading ? '...' : modeData?.duration ?? defaultRoute.modes[selectedMode].duration}
                  </div>
                  <div className="metric-lbl">Est. Time</div>
                </div>
                <div className="metric-box">
                  <div className="metric-val">
                    {routeLoading ? '...' : modeData?.cost ?? defaultRoute.modes[selectedMode].cost}
                  </div>
                  <div className="metric-lbl">Est. Cost</div>
                </div>
              </div>
            </div>

            {/* Transport selector */}
            <div className="transport-selector-card">
              <h3 className="font-bold mb-3">Choose Transport</h3>
              <div className="transport-mini-grid">
                {transportModes.map(m => (
                  <div
                    key={m.id}
                    className={`transport-mini-opt ${selectedMode === m.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMode(m.id)}
                    id={`route-transport-${m.id}`}
                  >
                    <span className="transport-emoji">{m.emoji}</span>
                    <span className="transport-label">{m.label}</span>
                    <span className="transport-cost text-xs text-muted">
                      {(routeModes[m.id] ?? defaultRoute.modes[m.id]).cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="route-action-card">
              <button
                className="btn btn-primary btn-block"
                id="btn-start-navigation"
                onClick={() => alert('Navigation started! (Requires GPS integration)')}
              >
                🧭 Start Navigation
              </button>
              <button
                className="btn btn-outline btn-block mt-3"
                id="btn-share-route"
                onClick={() => alert('Route link copied to clipboard!')}
              >
                📤 Share Route
              </button>
              <button
                className="btn btn-ghost btn-block mt-3"
                onClick={() => navigate('/weather')}
                id="btn-weather-route"
              >
                🌦️ Weather Along Route
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
