import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DestinationCard from '../components/DestinationCard';
import { categories } from '../data/mockData';
import { searchDestinations } from '../api/destinations.js';

export default function Explore() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');

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
    // Simple debounce could go here, but for now fetch on change
    const timer = setTimeout(loadDestinations, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = destinations
    .filter(d => {
      const matchCat = activeCategory === 'all' || d.category === activeCategory;
      return matchCat;
    })
    .sort((a, b) => {
      // averageRating or rating (fallback for older mock data)
      const aRating = a.averageRating ?? a.rating ?? 0;
      const bRating = b.averageRating ?? b.rating ?? 0;
      const aCost = a.estimatedCost ?? a.costPerDay ?? 0;
      const bCost = b.estimatedCost ?? b.costPerDay ?? 0;

      if (sortBy === 'rating') return bRating - aRating;
      if (sortBy === 'cost-low') return aCost - bCost;
      if (sortBy === 'cost-high') return bCost - aCost;
      return a.name.localeCompare(b.name);
    });

  if (loading && destinations.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Navbar />
        <div style={{ padding: 40, textAlign: 'center' }}>Loading destinations...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div className="page-content">
        <div className="section-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="section-title">🌍 Explore Destinations</h1>
            <p className="text-muted text-sm mt-1">Discover {destinations.length} amazing places across Sri Lanka</p>
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
                <option value="rating">⭐ Top Rated</option>
                <option value="cost-low">💰 Price: Low to High</option>
                <option value="cost-high">💰 Price: High to Low</option>
                <option value="name">🔤 A-Z</option>
              </select>
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
            Showing {filtered.length} Results
          </span>
          <div className="glow-line" style={{ flex: 1, margin: 0 }}></div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
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
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>No matches found</h3>
            <p className="text-muted">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
