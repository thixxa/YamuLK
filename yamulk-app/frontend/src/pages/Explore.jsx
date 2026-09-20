import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DestinationCard from '../components/DestinationCard';
import MapView from '../components/MapView';
import { categories } from '../data/mockData';
import { searchDestinations } from '../api/destinations.js';
import { useSettings } from '../context/SettingsContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Explore() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const { t } = useSettings();

  useEffect(() => {
    async function loadDestinations() {
      setLoading(true);
      try {
        const data = await searchDestinations(search);
        setDestinations(data.destinations || []);
      } catch (err) {
        console.error("Failed to load destinations:", err);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(loadDestinations, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = destinations
    .filter(d => {
      const matchCat = activeCategory === 'all' || d.category === activeCategory;
      return matchCat;
    })
    .sort((a, b) => {
      const aRating = a.averageRating ?? a.rating ?? 0;
      const bRating = b.averageRating ?? b.rating ?? 0;
      const aCost = a.estimatedCost ?? a.costPerDay ?? 0;
      const bCost = b.estimatedCost ?? b.costPerDay ?? 0;
      if (sortBy === 'rating') return bRating - aRating;
      if (sortBy === 'cost-low') return aCost - bCost;
      if (sortBy === 'cost-high') return bCost - aCost;
      return a.name.localeCompare(b.name);
    });

  // Build markers for map view
  const mapMarkers = filtered
    .filter(d => (d.lat || d.latitude) && (d.lng || d.longitude))
    .map(d => ({
      lat: d.latitude ?? d.lat,
      lng: d.longitude ?? d.lng,
      label: d.name,
      emoji: d.emoji || '📍',
      sub: `${d.province} · ⭐ ${d.averageRating ?? d.rating ?? 0}`,
      type: 'pin',
      onClick: () => navigate(`/destination/${d._id || d.id}`),
    }));

  if (loading && destinations.length === 0) {
    return (
      <div className="explore-page">
        <Navbar />
        <div style={{ paddingTop: 80 }}>
          <SkeletonLoader type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div className="page-content">
        <div className="section-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="section-title">{t('exploreTitle')}</h1>
            <p className="text-muted text-sm mt-1">{t('exploreSub')}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <input
                type="text"
                placeholder="🔍 Search destinations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ width: 180, cursor: 'pointer' }}
              >
                <option value="rating">{t('topRated')}</option>
                <option value="cost-low">{t('priceLowHigh')}</option>
                <option value="cost-high">{t('priceHighLow')}</option>
                <option value="name">{t('az')}</option>
              </select>
            </div>
            {/* View toggle */}
            <div className="explore-view-toggle" id="explore-view-toggle">
              <button
                className={`explore-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                id="btn-grid-view"
                title="Grid View"
              >
                {t('gridView')}
              </button>
              <button
                className={`explore-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
                id="btn-map-view"
                title="Map View"
              >
                {t('mapView')}
              </button>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="tab-bar" style={{ display: 'inline-flex', marginBottom: 32, flexWrap: 'wrap', background: 'var(--bg-surface)' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`tab-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{ minWidth: 225 }}
            >
              <span style={{ fontSize: 16, marginRight: 6 }}>{cat.emoji}</span>
              {cat.label}
            </div>
          ))}
        </div>

        {/* Results count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div className="glow-line" style={{ flex: 1, margin: 0 }}></div>
          <span className="badge badge-primary">
            {t('showingResults').replace('Results', filtered.length + ' Results')}
          </span>
          <div className="glow-line" style={{ flex: 1, margin: 0 }}></div>
        </div>

        {/* Map View */}
        {viewMode === 'map' ? (
          <div className="explore-map-container">
            {mapMarkers.length > 0 ? (
              <MapView
                center={[7.8731, 80.7718]}
                zoom={7}
                height="600px"
                markers={mapMarkers}
                interactive={true}
              />
            ) : (
              <div className="explore-map-empty">
                <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
                <p className="text-muted">{t('noMapCoords')}</p>
              </div>
            )}
            <p className="explore-map-hint">{t('clickPin')}</p>
          </div>
        ) : (
          /* Grid */
          filtered.length > 0 ? (
            <div className="grid-3 stagger-children">
              {filtered.map((d, i) => (
                <div key={d._id || d.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <DestinationCard destination={d} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card card-lg" style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 60, marginBottom: 16, filter: 'drop-shadow(0 0 16px rgba(0,212,255,0.3))' }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{t('noMatches')}</h3>
              <p className="text-muted">{t('tryAdjusting')}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
