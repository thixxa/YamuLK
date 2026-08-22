import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { savedTrips, destinations } from '../data/mockData';
import './SavedTrips.css';

export default function SavedTrips() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('itineraries');
  const [trips, setTrips] = useState(savedTrips);

  const itineraries = trips.filter(t => t.type === 'itinerary');
  const favourites = trips.filter(t => t.type === 'favourite');

  const removeTrip = (id) => {
    setTrips(trips.filter(t => t.id !== id));
  };

  return (
    <div className="saved-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">🧳 Saved Trips</h1>
            <p className="text-muted text-sm mt-1">{itineraries.length} itineraries · {favourites.length} favourites</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/planner')} id="btn-new-trip">
            + New Trip
          </button>
        </div>

        {/* Tabs */}
        <div className="tab-bar mb-6" style={{ maxWidth: 400 }} id="saved-tabs">
          <div
            className={`tab-item ${activeTab === 'itineraries' ? 'active' : ''}`}
            onClick={() => setActiveTab('itineraries')}
            id="tab-itineraries"
          >
            📋 Saved Itineraries
          </div>
          <div
            className={`tab-item ${activeTab === 'favourites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favourites')}
            id="tab-favourites"
          >
            ❤️ Favourites
          </div>
        </div>

        {activeTab === 'itineraries' ? (
          itineraries.length > 0 ? (
            <div className="saved-grid">
              {itineraries.map(trip => (
                <div key={trip.id} className="saved-itinerary-card" id={`itinerary-${trip.id}`}>
                  <div className="saved-card-thumb" style={{ background: trip.color }}>
                    <span>{trip.emoji}</span>
                  </div>
                  <div className="saved-card-info">
                    <div className="saved-card-name">{trip.name}</div>
                    <div className="saved-card-meta">
                      <span>👥 {trip.people} people</span>
                      <span>📅 {trip.days} days</span>
                    </div>
                    <div className="saved-card-budget">
                      💰 Rs. {trip.budget.toLocaleString()}
                    </div>
                    {trip.date && (
                      <div className="saved-card-date text-xs text-muted">
                        🗓️ {new Date(trip.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  <div className="saved-card-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate('/planner')}
                      id={`btn-edit-trip-${trip.id}`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeTrip(trip.id)}
                      id={`btn-delete-trip-${trip.id}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="saved-empty">
              <div className="saved-empty-icon">📋</div>
              <h3>No saved itineraries yet</h3>
              <p>Start planning your first Sri Lanka adventure!</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/planner')}>
                Plan a Trip
              </button>
            </div>
          )
        ) : (
          favourites.length > 0 ? (
            <div className="saved-grid">
              {favourites.map(fav => (
                <div
                  key={fav.id}
                  className="saved-fav-card"
                  id={`fav-${fav.id}`}
                  onClick={() => navigate(`/destination/${fav.destination}`)}
                >
                  <div className="saved-card-thumb" style={{ background: fav.color }}>
                    <span>{fav.emoji}</span>
                  </div>
                  <div className="saved-card-info">
                    <div className="saved-card-name">{fav.name}</div>
                    <div className="text-xs text-muted">📍 {fav.province}</div>
                  </div>
                  <div className="fav-heart">❤️</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="saved-empty">
              <div className="saved-empty-icon">❤️</div>
              <h3>No favourite destinations yet</h3>
              <p>Explore destinations and tap the heart to save your favourites!</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/home')}>
                Explore Destinations
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
