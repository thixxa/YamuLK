import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import { transportModes, destinations as mockDestinations } from '../data/mockData';
import { searchDestinations } from '../api/destinations.js';
import { useSettings } from '../context/SettingsContext.jsx';
import './TripPlanner.css';

export default function TripPlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.destination;
  const existingTrip = location.state?.trip;
  const { t } = useSettings();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    destination: existingTrip?.destination || existingTrip?.destinationData?._id || prefill?._id || prefill?.id || '',
    date: existingTrip?.date || '',
    endDate: existingTrip?.endDate || '',
    people: existingTrip?.people ?? 2,
    budget: existingTrip?.budget ?? 15000,
    transport: existingTrip?.transport || 'bus',
    accommodation: existingTrip?.accommodation || 'hotel',
    notes: existingTrip?.notes || '',
  });
  const [previewTab, setPreviewTab] = useState('photo'); // 'photo' | 'map'

  useEffect(() => {
    async function loadDests() {
      try {
        const data = await searchDestinations('');
        const dests = data.destinations || [];
        setDestinations(dests);
        if (!form.destination && dests.length > 0) {
          setForm(f => ({ ...f, destination: dests[0]._id }));
        }
      } catch (err) {
        console.error("Failed to load destinations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDests();
  }, []);

  const selectedDest = destinations.find(d => d._id === form.destination) || destinations[0];
  const editingTripId = existingTrip?.tripId || null; // present when editing from SavedTrips

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/budget', {
      state: {
        trip: {
          ...form,
          destinationData: selectedDest,
          ...(editingTripId ? { tripId: editingTripId } : {}),
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="planner-page">
        <Navbar />
        <div style={{ padding: 40, textAlign: 'center' }}>Loading planner...</div>
      </div>
    );
  }

  return (
    <div className="planner-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">🗺️ {t('navTripPlanner')}</h1>
            <p className="text-muted text-sm mt-1">{t('startPlanningFirst')}</p>
          </div>
        </div>

        <div className="planner-layout">
          {/* Main form */}
          <div className="planner-form-card">
            <form onSubmit={handleSubmit} id="trip-planner-form">
              {/* Destination selector */}
              <div className="field-group">
                <label>{t('destinationLabel')}</label>
                <select
                  id="planner-destination"
                  value={form.destination}
                  onChange={e => setForm({ ...form, destination: e.target.value })}
                >
                  {destinations.map(d => (
                    <option key={d._id} value={d._id}>{d.name} — {d.province}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid-2">
                <div className="field-group">
                  <label>{t('travelDateLabel')}</label>
                  <input
                    type="date"
                    id="planner-start-date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="field-group">
                  <label>{t('returnDateLabel')}</label>
                  <input
                    type="date"
                    id="planner-end-date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    required
                    min={form.date || undefined}
                  />
                </div>

              </div>

              {/* People & Budget */}
              <div className="grid-2">
                <div className="field-group">
                  <label>{t('numPeopleLabel')}</label>
                  <input
                    type="number"
                    id="planner-people"
                    min="1"
                    max="20"
                    value={form.people}
                    onChange={e => setForm({ ...form, people: parseInt(e.target.value) })}
                  />
                </div>
                <div className="field-group">
                  <label>{t('totalBudgetLabel')}</label>
                  <input
                    type="number"
                    id="planner-budget"
                    min="1000"
                    step="500"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* Transport */}
              <div className="field-group">
                <label>{t('transportMethodLabel')}</label>
                <div className="transport-grid" id="transport-grid">
                  {transportModes.map(m => (
                    <div
                      key={m.id}
                      className={`transport-opt ${form.transport === m.id ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, transport: m.id })}
                      id={`transport-${m.id}`}
                    >
                      <span className="transport-emoji">{m.emoji}</span>
                      <span className="transport-label">{t(`${m.id}Label`) || m.label}</span>
                      <span className="transport-desc">{t(`${m.id}Desc`) || m.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accommodation */}
              <div className="field-group">
                <label>{t('accommodationTypeLabel')}</label>
                <select
                  id="planner-accommodation"
                  value={form.accommodation}
                  onChange={e => setForm({ ...form, accommodation: e.target.value })}
                >
                  <option value="hotel">{t('hotel')}</option>
                  <option value="guesthouse">{t('guesthouse')}</option>
                  <option value="homestay">{t('homestay')}</option>
                  <option value="hostel">{t('hostel')}</option>
                  <option value="resort">{t('resort')}</option>
                </select>
              </div>

              {/* Notes */}
              <div className="field-group">
                <label>{t('specialNotesLabel')}</label>
                <textarea
                  id="planner-notes"
                  placeholder={t('specialNotesPlaceholder')}
                  rows="3"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" id="btn-generate-plan">
                {t('generatePlanBtn')}
              </button>
            </form>
          </div>

          {/* Destination preview */}
          {selectedDest && (
            <div className="planner-preview">
              {/* Tab bar */}
              <div className="planner-preview-tabs">
                <button
                  className={`planner-preview-tab ${previewTab === 'photo' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('photo')}
                  id="planner-tab-photo"
                >
                  {t('photosTab')}
                </button>
                <button
                  className={`planner-preview-tab ${previewTab === 'map' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('map')}
                  id="planner-tab-map"
                >
                  {t('locationTab')}
                </button>
              </div>

              {previewTab === 'photo' ? (
                <div
                  className="preview-hero"
                  style={!selectedDest.imageURLs?.[0] ? { background: selectedDest.color || 'var(--primary)' } : {}}
                >
                  {selectedDest.imageURLs?.[0] ? (
                    <img
                      src={selectedDest.imageURLs[0]}
                      alt={selectedDest.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                  ) : (
                    <span className="preview-emoji">{selectedDest.emoji || '🗺️'}</span>
                  )}
                </div>
              ) : (
                <div className="planner-preview-map-wrap">
                  {(() => {
                    // Resolve coordinates: API lat/lng → mockData fallback
                    const apiLat = selectedDest.latitude;
                    const apiLng = selectedDest.longitude;
                    const hasApiCoords = apiLat != null && apiLng != null && apiLat !== 0 && apiLng !== 0;
                    const mockMatch = !hasApiCoords && mockDestinations.find(
                      d => d.name.toLowerCase() === selectedDest.name?.toLowerCase() ||
                           d.id === selectedDest._id || d.id === selectedDest.id
                    );
                    const resolvedLat = hasApiCoords ? apiLat : (mockMatch?.lat ?? selectedDest.lat);
                    const resolvedLng = hasApiCoords ? apiLng : (mockMatch?.lng ?? selectedDest.lng);
                    const hasCoords = resolvedLat != null && resolvedLng != null && resolvedLat !== 0 && resolvedLng !== 0;

                    return hasCoords ? (
                      <MapView
                        key={selectedDest._id || selectedDest.id || selectedDest.name}
                        center={[resolvedLat, resolvedLng]}
                        zoom={11}
                        height="220px"
                        markers={[{
                          lat: resolvedLat,
                          lng: resolvedLng,
                          label: selectedDest.name,
                          emoji: selectedDest.emoji || '📍',
                          sub: selectedDest.province,
                          type: 'pin',
                        }]}
                        interactive={true}
                      />
                    ) : (
                      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 36 }}>🗺️</span>
                        <p className="text-muted text-sm">No coordinates available</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="preview-body">
                <h3 className="preview-name">{selectedDest.name}</h3>
                <p className="text-muted text-sm">{selectedDest.province}</p>

                <div className="preview-stats">
                  <div className="preview-stat">
                    <span className="preview-stat-val">⭐ {selectedDest.averageRating ?? selectedDest.rating ?? 0}</span>
                    <span className="preview-stat-lbl">{t('rating')}</span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-stat-val">Rs. {(selectedDest.estimatedCost ?? selectedDest.costPerDay ?? 0).toLocaleString()}</span>
                    <span className="preview-stat-lbl">{t('perDay').replace('/', '')}</span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-stat-val">{selectedDest.weather?.emoji || '☀️'} {selectedDest.weather?.temp || '28'}°C</span>
                    <span className="preview-stat-lbl">{t('weather')}</span>
                  </div>
                </div>

                <p className="preview-desc">{selectedDest.description?.slice(0, 120)}...</p>

                <div className="preview-tags">
                  {(selectedDest.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className="chip">{tag}</span>
                  ))}
                </div>

                <div className="preview-best-time">
                  <span>🗓️</span>
                  <span><strong>{t('bestTimeToVisit')}:</strong> {selectedDest.bestTime || 'Year-round'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

