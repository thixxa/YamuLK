import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import { getDestinationById } from '../api/destinations.js';
import { getAllReviews } from '../api/reviews.js';
import { saveItem, removeSavedItemByItemId } from '../api/savedItems.js';
import { destinations as mockDestinations } from '../data/mockData';
import './DestinationDetail.css';

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [dest, setDest] = useState(null);
  const [destReviews, setDestReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const destData = await getDestinationById(id);
        setDest(destData);
        
        try {
          const reviewData = await getAllReviews(id);
          setDestReviews(reviewData.reviews || []);
        } catch {
          // Reviews are optional — don't fail the whole page
          setDestReviews([]);
        }
      } catch (error) {
        console.error("Failed to load destination details:", error);
        setError("Destination not found.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // ── Lightbox helpers ─────────────────────────────────────────────────────────
  const photos = dest?.imageURLs?.length > 0 ? dest.imageURLs : dest?.photos || [];

  const openLightbox = useCallback((index) => {
    setActivePhoto(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const lightboxPrev = useCallback(() =>
    setActivePhoto(p => (p - 1 + photos.length) % photos.length), [photos.length]
  );

  const lightboxNext = useCallback(() =>
    setActivePhoto(p => (p + 1) % photos.length), [photos.length]
  );

  // Escape / arrow key listener
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

  // Toggle save/unsave destination
  const handleSave = async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    try {
      if (saved) {
        await removeSavedItemByItemId(id);
        setSaved(false);
      } else {
        await saveItem('destination', id);
        setSaved(true);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ padding: 40, textAlign: 'center' }}>Loading destination...</div>
      </div>
    );
  }

  if (error || !dest) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <p>{error || 'Destination not found.'}</p>
          <button className="btn btn-outline mt-4" onClick={() => navigate('/explore')}>Back to Explore</button>
        </div>
      </div>
    );
  }

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
                  className="detail-hero-img"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                  onClick={() => openLightbox(activePhoto)}
                  title="Click to view fullscreen"
                />
              ) : (
                <span className="detail-hero-emoji">{dest.photos?.[activePhoto] || dest.emoji}</span>
              )}
              <button
                className={`fav-btn ${saved ? 'saved' : ''}`}
                onClick={handleSave}
                id="btn-save"
                title={saved ? 'Remove from saved' : 'Save destination'}
                disabled={saveLoading}
              >
                {saveLoading ? '⏳' : saved ? '❤️' : '🤍'}
              </button>
              <div className="detail-badge badge badge-primary">{dest.category}</div>
            </div>

            {/* Photo thumbnails */}
            <div className="photo-thumbs">
              {(dest.imageURLs?.length > 0 ? dest.imageURLs : dest.photos || []).map((item, i) => (
                <div
                  key={i}
                  className={`photo-thumb ${activePhoto === i ? 'active' : ''}`}
                  onClick={() => { setActivePhoto(i); }}
                  onDoubleClick={() => openLightbox(i)}
                  title="Click to select · Double-click for fullscreen"
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
              <span className="rating">⭐ <strong>{dest.averageRating ?? dest.rating ?? 0}</strong>
                {destReviews.length > 0 && ` (${destReviews.length} reviews)`}
              </span>
              {dest.distance && <span>📍 {dest.distance}</span>}
              <span>☀️ Best: {dest.bestTime || 'Year-round'}</span>
            </div>

            {/* Tags */}
            <div className="detail-tags">
              {(dest.tags || []).map(tag => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>

            {/* Description */}
            <p className="detail-desc">{dest.description}</p>

            {/* Highlights */}
            <h3 className="nearby-title">✨ Highlights</h3>
            <div className="highlights-grid">
              {(dest.highlights || []).map((h, i) => (
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
              <button className="btn btn-outline" onClick={handleSave} id="btn-save2" disabled={saveLoading}>
                {saveLoading ? '⏳' : saved ? '❤️ Saved' : '🤍 Save'}
              </button>

              <button className="btn btn-outline" id="btn-share">📤 Share</button>
            </div>

            {/* Reviews */}
            {destReviews.length > 0 && (
              <>
                <h3 className="nearby-title mt-8">💬 Traveller Reviews</h3>
                <div className="reviews-list">
                  {destReviews.map(rev => (
                    <div key={rev._id || rev.id} className="review-card">
                      <div className="review-header">
                        <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{rev.userId?.name?.charAt(0) || "U"}</div>
                        <div>
                          <div className="review-user">{rev.userId?.name || "Unknown User"}</div>
                          <div className="review-date text-xs text-muted">{new Date(rev.createdAt || rev.date).toLocaleDateString()}</div>
                        </div>
                        <div className="review-stars">{'⭐'.repeat(rev.rating)}</div>
                      </div>
                      <p className="review-text">{rev.comment || rev.text}</p>
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
                  <div className="info-value">{dest.weather?.emoji || "☀️"} {dest.weather?.temp || "28"}°C</div>
                </div>
                <div className="info-card">
                  <div className="info-label">PROVINCE</div>
                  <div className="info-value" style={{ fontSize: 13 }}>{dest.province}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">DISTANCE</div>
                  <div className="info-value" style={{ fontSize: 13 }}>{dest.distance?.split(' ')[0] || "Unknown"}</div>
                </div>
              </div>

              {/* Nearby Hotels */}
              <h4 className="nearby-title">🏨 Nearby Hotels</h4>
              {(dest.nearby?.hotels || []).map(h => (
                <div key={h} className="nearby-chip">
                  <span>🏨</span> {h}
                  <span className="nearby-arrow">›</span>
                </div>
              ))}

              {/* Nearby Restaurants */}
              <h4 className="nearby-title">🍽️ Restaurants</h4>
              {(dest.nearby?.restaurants || []).map(r => (
                <div key={r} className="nearby-chip">
                  <span>🍽️</span> {r}
                  <span className="nearby-arrow">›</span>
                </div>
              ))}

              {/* Nearby Attractions */}
              <h4 className="nearby-title">🌟 Nearby Attractions</h4>
              {(dest.nearby?.attractions || []).map(a => (
                <div key={a} className="nearby-chip">
                  <span>📍</span> {a}
                  <span className="nearby-arrow">›</span>
                </div>
              ))}

              <button
                className="btn btn-primary btn-block mt-6"
                onClick={() => navigate(`/weather`, { state: { destinationId: id } })}
                id="btn-check-weather"
              >
                🌤️ Check Weather
              </button>
              <button
                className="btn btn-outline btn-block mt-3"
                onClick={() => navigate('/route', { state: { destination: dest } })}
                id="btn-get-route"
              >
                🗺️ Get Directions
              </button>

              {/* Mini map — resolve coords from API or mockData fallback */}
              {(() => {
                const apiLat = dest.latitude;
                const apiLng = dest.longitude;
                const hasApiCoords = apiLat != null && apiLng != null && apiLat !== 0 && apiLng !== 0;
                const mock = mockDestinations.find(
                  d => d.name.toLowerCase() === dest.name?.toLowerCase() ||
                       d.id === dest._id || d.id === dest.id
                );
                const lat = hasApiCoords ? apiLat : mock?.lat;
                const lng = hasApiCoords ? apiLng : mock?.lng;
                if (!lat || !lng) return null;
                return (
                  <div className="detail-mini-map">
                    <div className="detail-mini-map-label">📍 Location on Map</div>
                    <MapView
                      key={`${dest._id || dest.id}-map`}
                      center={[lat, lng]}
                      zoom={12}
                      height="220px"
                      markers={[{
                        lat,
                        lng,
                        label: dest.name,
                        emoji: dest.emoji || '📍',
                        sub: dest.province,
                        type: 'pin',
                      }]}
                      interactive={false}
                    />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true">
          {/* Stop click on inner content from closing */}
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>

            {/* Close button */}
            <button className="lightbox-close" onClick={closeLightbox} title="Close (Esc)">✕</button>

            {/* Counter */}
            <div className="lightbox-counter">{activePhoto + 1} / {photos.length}</div>

            {/* Prev arrow */}
            {photos.length > 1 && (
              <button className="lightbox-arrow lightbox-prev" onClick={lightboxPrev} title="Previous (←)">‹</button>
            )}

            {/* Photo */}
            <img
              src={dest.imageURLs?.[activePhoto] || ''}
              alt={`${dest.name} — photo ${activePhoto + 1}`}
              className="lightbox-img"
            />

            {/* Next arrow */}
            {photos.length > 1 && (
              <button className="lightbox-arrow lightbox-next" onClick={lightboxNext} title="Next (→)">›</button>
            )}

            {/* Thumbnail strip */}
            <div className="lightbox-thumbstrip">
              {dest.imageURLs?.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`thumb ${i + 1}`}
                  className={`lightbox-thumb ${i === activePhoto ? 'active' : ''}`}
                  onClick={() => setActivePhoto(i)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
