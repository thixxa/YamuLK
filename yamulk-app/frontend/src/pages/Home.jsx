import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DestinationCard from '../components/DestinationCard';
import { categories } from '../data/mockData';
import { searchDestinations } from '../api/destinations.js';
import './Home.css';

const SUPABASE_URL = import.meta.env.VITE_API_URL
  ? 'https://oflwzkgjuqmvgnlclljh.supabase.co'
  : 'https://oflwzkgjuqmvgnlclljh.supabase.co';

const HOME_SLIDES = Array.from({ length: 6 }, (_, i) =>
  `${SUPABASE_URL}/storage/v1/object/public/destination-images/home/home-${i + 1}.JPEG`
);

export default function Home() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await searchDestinations('');
        setDestinations(data.destinations || []);
      } catch (err) {
        console.error("Failed to load destinations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, []);

  // Auto-advance hero slide every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(i => (i + 1) % HOME_SLIDES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const filtered = destinations.filter(d => {
    const matchCategory = activeCategory === 'all' || d.category === activeCategory;
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.province.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const recommended = destinations.slice(0, 3);
  const historical = destinations.filter(d => d.category === 'historical');

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Banner */}
      <div className="home-hero">
        {/* ── Sliding background photos ── */}
        <div className="hero-slides">
          {HOME_SLIDES.map((url, i) => (
            <div
              key={i}
              className={`hero-slide ${i === slideIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
          {/* Dark overlay so text stays readable */}
          <div className="hero-slide-overlay" />
        </div>

        <div className="home-hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>
        <div className="home-hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Sri Lankan Travel Platform
          </div>
          <h1 className="hero-title">Where do you want to<br /><span className="grad-text">explore next?</span></h1>
          <p className="hero-sub">Discover hidden beaches, mystic waterfalls, epic mountains &amp; ancient heritage — all in one place</p>

          {/* Search */}
          <div className="search-bar" id="main-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search destinations e.g. Ella, Mirissa, Sigiriya..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="search-input"
            />
            <button
              className="search-btn"
              onClick={() => {}}
              id="btn-search"
            >
              Search
            </button>
          </div>

          {/* Quick stats */}
          <div className="hero-stats">
            {[`${destinations.length}+ Destinations`, '9 Provinces', 'Budget Planner', 'Route Maps'].map(s => (
              <span key={s} className="hero-stat-item"><span className="hero-stat-dot"></span>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Category Filters */}
        <div className="section-header">
          <h2 className="section-title">Browse by Category</h2>
        </div>
        <div className="category-grid" id="category-grid">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`cat-card ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              id={`cat-${cat.id}`}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Results or Recommended */}
        {search || activeCategory !== 'all' ? (
          <>
            <div className="section-header mt-8">
              <h2 className="section-title">
                {filtered.length} Result{filtered.length !== 1 ? 's' : ''} Found
              </h2>
              {(search || activeCategory !== 'all') && (
                <button
                  className="section-link"
                  onClick={() => { setSearch(''); setActiveCategory('all'); }}
                >
                  Clear filters
                </button>
              )}
            </div>
            {filtered.length > 0 ? (
              <div className="grid-3" id="search-results">
                {filtered.map(d => <DestinationCard key={d._id || d.id} destination={d} />)}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <p>No destinations found for "<strong>{search}</strong>"</p>
                <button className="btn btn-outline mt-4" onClick={() => { setSearch(''); setActiveCategory('all'); }}>
                  Browse All
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Recommended */}
            <div className="section-header mt-8">
              <h2 className="section-title">Recommended for You</h2>
              <span className="section-link" onClick={() => navigate('/explore')}>See all</span>
            </div>
            <div className="grid-3" id="recommended-grid">
              {recommended.map(d => <DestinationCard key={d._id || d.id} destination={d} />)}
            </div>

            {/* Historical Sites */}
            <div className="section-header mt-8">
              <h2 className="section-title">🏛️ Popular Historical Sites</h2>
              <span className="section-link" onClick={() => setActiveCategory('historical')}>View all</span>
            </div>
            <div className="grid-3" id="historical-grid">
              {historical.map(d => <DestinationCard key={d._id || d.id} destination={d} />)}
            </div>

            {/* CTA Banner */}
            <div className="cta-banner mt-8">
              <div className="cta-content">
                <h3>🗺️ Ready to start planning?</h3>
                <p>Use our AI-powered trip planner to create your perfect Sri Lanka itinerary</p>
                <button className="cta-btn" onClick={() => navigate('/planner')} id="btn-start-planning">
                  Start Planning →
                </button>
              </div>
              <div className="cta-emojis">🏖️ 💧 ⛰️ 🏛️</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

