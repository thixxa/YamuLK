import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { destinations, reviews } from '../data/mockData';
import './DestinationDetail.css';

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const dest = destinations.find(d => d.id === id) || destinations[0];
  const destReviews = reviews.filter(r => r.destination === dest.id);

  return (
    <div className="detail-page">
      <Navbar />
      <div className="page-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/home')} className="breadcrumb-link">Home</span>
          <span>›</span>
          <span onClick={() => navigate('/explore')} className="breadcrumb-link">Explore</span>
          <span>›</span>
          <span className="breadcrumb-current">{dest.name}</span>
        </div>

        <div className="detail-grid">
          {/* Left column */}
          <div className="detail-left">
            {/* Hero image */}
            <div
              className="detail-hero"
              style={!dest.imageURLs?.[activePhoto] ? { background: dest.color } : {}}
            >
              {dest.imageURLs?.[activePhoto] ? (
                <img
                  src={dest.imageURLs[activePhoto]}
                  alt={dest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span className="detail-hero-emoji">{dest.photos?.[activePhoto] || dest.emoji}</span>
              )}
              <button
                className={`fav-btn ${saved ? 'saved' : ''}`}
                onClick={() => setSaved(!saved)}
                id="btn-save"
                title="Save destination"
              >
                {saved ? '❤️' : '🤍'}
              </button>
              <div className="detail-badge badge badge-primary">{dest.category}</div>
            </div>

            {/* Photo thumbnails */}
            <div className="photo-thumbs">
              {(dest.imageURLs?.length > 0 ? dest.imageURLs : dest.photos || []).map((item, i) => (
                <div
                  key={i}
                  className={`photo-thumb ${activePhoto === i ? 'active' : ''}`}
                  onClick={() => setActivePhoto(i)}
                >
                  {dest.imageURLs?.[i] ? (
                    <img
                      src={dest.imageURLs[i]}
                      alt={`${dest.name} photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : (
                    item
                  )}
                </div>
              ))}
            </div>

            {/* Title & meta */}
            <h1 className="detail-title">{dest.name}</h1>
            <div className="detail-meta">
              <span className="rating">⭐ <strong>{dest.averageRating ?? dest.rating}</strong>
                {dest.reviews && ` (${dest.reviews.toLocaleString()} reviews)`}
              </span>
              {dest.distance && <span>📍 {dest.distance}</span>}
              <span>☀️ Best: {dest.bestTime || 'Year-round'}</span>
            </div>

            {/* Tags */}
            <div className="detail-tags">
              {dest.tags.map(tag => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>

            {/* Description */}
            <p className="detail-desc">{dest.description}</p>

            {/* Highlights */}
            <h3 className="nearby-title">✨ Highlights</h3>
            <div className="highlights-grid">
              {dest.highlights.map((h, i) => (
                <div key={i} className="highlight-item">
                  <span className="highlight-check">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="action-row">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/planner', { state: { destination: dest } })}
                id="btn-plan-trip"
              >
                🗺️ Plan Trip
              </button>
              <button className="btn btn-outline" onClick={() => setSaved(!saved)} id="btn-save2">
                {saved ? '❤️ Saved' : '🤍 Save'}
              </button>
              <button className="btn btn-outline" id="btn-share">📤 Share</button>
            </div>

            {/* Reviews */}
            {destReviews.length > 0 && (
              <>
                <h3 className="nearby-title mt-8">💬 Traveller Reviews</h3>
                <div className="reviews-list">
                  {destReviews.map(rev => (
                    <div key={rev.id} className="review-card">
                      <div className="review-header">
                        <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{rev.avatar}</div>
                        <div>
                          <div className="review-user">{rev.user}</div>
                          <div className="review-date text-xs text-muted">{rev.date}</div>
                        </div>
                        <div className="review-stars">{'⭐'.repeat(rev.rating)}</div>
                      </div>
                      <p className="review-text">{rev.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right panel */}
          <div className="detail-right">
            <div className="info-panel">
              <h3 className="info-panel-title">Trip Info</h3>
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">ESTIMATED COST</div>
                  <div className="info-value">
                    Rs. {(dest.estimatedCost ?? dest.costPerDay)?.toLocaleString()}/day
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-label">WEATHER</div>
                  <div className="info-value">{dest.weather.emoji} {dest.weather.temp}°C</div>
                </div>
                <div className="info-card">
                  <div className="info-label">PROVINCE</div>
                  <div className="info-value" style={{ fontSize: 13 }}>{dest.province}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">DISTANCE</div>
                  <div className="info-value" style={{ fontSize: 13 }}>{dest.distance.split(' ')[0]}</div>
                </div>
              </div>

              {/* Nearby Hotels */}
              <h4 className="nearby-title">🏨 Nearby Hotels</h4>
              {dest.nearby.hotels.map(h => (
                <div key={h} className="nearby-chip">
                  <span>🏨</span> {h}
                  <span className="nearby-arrow">›</span>
                </div>
              ))}

              {/* Nearby Restaurants */}
              <h4 className="nearby-title">🍽️ Restaurants</h4>
              {dest.nearby.restaurants.map(r => (
                <div key={r} className="nearby-chip">
                  <span>🍽️</span> {r}
                  <span className="nearby-arrow">›</span>
                </div>
              ))}

              {/* Nearby Attractions */}
              <h4 className="nearby-title">🌟 Nearby Attractions</h4>
              {dest.nearby.attractions.map(a => (
                <div key={a} className="nearby-chip">
                  <span>📍</span> {a}
                  <span className="nearby-arrow">›</span>
                </div>
              ))}

              <button
                className="btn btn-primary btn-block mt-6"
                onClick={() => navigate('/weather')}
                id="btn-check-weather"
              >
                🌤️ Check Weather
              </button>
              <button
                className="btn btn-outline btn-block mt-3"
                onClick={() => navigate('/route')}
                id="btn-get-route"
              >
                🗺️ Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
