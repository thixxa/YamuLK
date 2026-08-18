import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { routes, transportModes } from '../data/mockData';
import './RoutePlanner.css';

export default function RoutePlanner() {
  const navigate = useNavigate();
  const route = routes[0];
  const [selectedMode, setSelectedMode] = useState('bus');
  const modeData = route.modes[selectedMode];

  return (
    <div className="route-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">🗺️ Route Planner</h1>
            <p className="text-muted text-sm mt-1">Plan your journey across Sri Lanka</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/weather')} id="btn-check-weather-route">
            🌤️ Check Weather
          </button>
        </div>

        <div className="route-layout">
          {/* Map area */}
          <div className="map-area">
            <div className="map-label">📍 Route Preview</div>

            {/* Stylized Sri Lanka map SVG */}
            <div className="map-visual">
              <svg viewBox="0 0 400 500" className="sri-lanka-svg">
                {/* Simplified Sri Lanka outline */}
                <ellipse cx="200" cy="260" rx="130" ry="190" fill="#c8e6e8" opacity="0.4" />
                <ellipse cx="200" cy="260" rx="120" ry="180" fill="#a8d5d8" opacity="0.3" />

                {/* Roads (stylized) */}
                <path d="M 140 140 Q 200 200 220 280 Q 240 340 230 400"
                  fill="none" stroke="rgba(14,124,134,0.3)" strokeWidth="8" strokeLinecap="round" />
                <path d="M 140 140 Q 200 200 220 280 Q 240 340 230 400"
                  fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="12 8" />

                {/* Waypoint dots */}
                {route.waypoints.map((wp, i) => {
                  const positions = [
                    { x: 140, y: 135 },
                    { x: 165, y: 215 },
                    { x: 205, y: 330 },
                    { x: 225, y: 395 },
                  ];
                  const pos = positions[i];
                  return (
                    <g key={i}>
                      <circle cx={pos.x} cy={pos.y} r="14"
                        fill={i === 0 ? '#0e7c86' : i === route.waypoints.length - 1 ? '#e2543a' : '#ff8a3d'}
                        stroke="white" strokeWidth="3"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                      <text x={pos.x + 18} y={pos.y + 4} fontSize="11" fill="#1c2b2e" fontWeight="600">
                        {wp.emoji} {wp.name}
                      </text>
                    </g>
                  );
                })}

                {/* Distance labels */}
                <text x="250" y="270" fontSize="10" fill="#6b7c7f">168 km total</text>
              </svg>

              <div className="map-overlay-badge">
                <span>🛣️</span>
                <div>
                  <div className="font-bold">{route.distance}</div>
                  <div className="text-xs text-muted">Total distance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="route-side">
            {/* Route info */}
            <div className="route-info-card">
              <h3 className="font-bold mb-4">Route Details</h3>
              <div className="route-points">
                <div className="route-point start">
                  <div className="route-dot start-dot"></div>
                  <div>
                    <div className="route-point-name">{route.start}</div>
                    <div className="text-xs text-muted">Starting Point</div>
                  </div>
                </div>
                {route.waypoints.slice(1, -1).map((wp, i) => (
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
                    <div className="route-point-name">{route.end}</div>
                    <div className="text-xs text-muted">Destination</div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="route-metrics">
                <div className="metric-box">
                  <div className="metric-val">{route.distance}</div>
                  <div className="metric-lbl">Distance</div>
                </div>
                <div className="metric-box">
                  <div className="metric-val">{modeData.duration}</div>
                  <div className="metric-lbl">Est. Time</div>
                </div>
                <div className="metric-box">
                  <div className="metric-val">{modeData.cost}</div>
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
                    <span className="transport-cost text-xs text-muted">{route.modes[m.id].cost}</span>
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
