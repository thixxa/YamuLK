import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getSavedItems, removeSavedItem } from '../api/savedItems.js';
import { useSettings } from '../context/SettingsContext.jsx';
import ItineraryModal from '../components/ItineraryModal';
import SkeletonLoader from '../components/SkeletonLoader';
import './SavedTrips.css';

export default function SavedTrips() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('itineraries');
  
  const [trips, setTrips] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useSettings();
  
  // Itinerary Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      const { savedItems } = await getSavedItems();
      // split into itineraries (trips) and favourites (destinations)
      const tTrips = savedItems.filter(item => item.itemType === 'trip');
      const f = savedItems.filter(item => item.itemType === 'destination');
      setTrips(tTrips);
      setFavourites(f);
    } catch (err) {
      console.error("Error fetching saved items:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeTrip = async (savedId) => {
    try {
      await removeSavedItem(savedId);
      setTrips(trips.filter(t => t._id !== savedId));
    } catch (err) {
      console.error("Error removing trip:", err);
    }
  };

  const removeFavourite = async (savedId) => {
    try {
      await removeSavedItem(savedId);
      setFavourites(favourites.filter(f => f._id !== savedId));
    } catch (err) {
      console.error("Error removing favourite:", err);
    }
  };

  if (loading) {
    return (
      <div className="saved-page">
        <Navbar />
        <div style={{ paddingTop: 80 }}>
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">{t('savedTripsTitle')}</h1>
            <p className="text-muted text-sm mt-1">{trips.length} {t('savedItineraries').replace('📋 ', '').toLowerCase()} · {favourites.length} {t('favTab').replace('❤️ ', '').toLowerCase()}</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/planner')} id="btn-new-trip">
            {t('newTrip')}
          </button>
        </div>

        {/* Tabs */}
        <div className="tab-bar mb-6" style={{ maxWidth: 400 }} id="saved-tabs">
          <div
            className={`tab-item ${activeTab === 'itineraries' ? 'active' : ''}`}
            onClick={() => setActiveTab('itineraries')}
            id="tab-itineraries"
          >
            {t('savedItineraries')}
          </div>
          <div
            className={`tab-item ${activeTab === 'favourites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favourites')}
            id="tab-favourites"
          >
            {t('favTab')}
          </div>
        </div>

        {activeTab === 'itineraries' ? (
          trips.length > 0 ? (
            <div className="saved-grid">
              {trips.map(savedObj => {
                const trip = savedObj.itemId;
                if (!trip) return null;
                const dest = trip.destinationId;
                return (
                  <div key={savedObj._id} className="saved-itinerary-card" id={`itinerary-${savedObj._id}`}>
                    <div className="saved-card-thumb" style={{ background: dest?.color || 'var(--primary)' }}>
                      <span>{dest?.emoji || '🗺️'}</span>
                    </div>
                    <div className="saved-card-info">
                      <div className="saved-card-name">{dest?.name || 'Unknown Trip'}</div>
                      <div className="saved-card-meta">
                        <span>👥 {trip.people || 1} {t('people')}</span>
                      </div>
                      <div className="saved-card-budget">
                        💰 Rs. {(trip.totalBudget || 0).toLocaleString()}
                      </div>
                      {trip.travelDate && (
                        <div className="saved-card-date text-xs text-muted">
                          🗓️ {new Date(trip.travelDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <div className="saved-card-actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setSelectedItinerary(trip.itinerary || 'No itinerary generated for this trip.');
                          setModalTitle(`Itinerary for ${dest?.name || 'Trip'}`);
                          setIsModalOpen(true);
                        }}
                        title="View Itinerary"
                      >
                        📄 View
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          // Map saved trip back to TripPlanner form format
                          const TRANSPORT_REVERSE = {
                            'Bus': 'bus', 'Train': 'train', 'Car': 'car',
                            'Motorcycle': 'motorcycle', 'Bicycle': 'bicycle',
                            'Walk': 'walk', 'Other': 'other',
                          };
                          navigate('/planner', {
                            state: {
                              trip: {
                                destination: dest?._id || '',
                                destinationData: dest,
                                date: trip.travelDate ? new Date(trip.travelDate).toISOString().slice(0, 10) : '',
                                endDate: trip.returnDate ? new Date(trip.returnDate).toISOString().slice(0, 10) : '',
                                people: trip.people || 2,
                                budget: trip.totalBudget || 15000,
                                transport: TRANSPORT_REVERSE[trip.transportMode] || 'bus',
                                accommodation: trip.accommodationType || 'hotel',
                                notes: trip.specialNotes || '',
                                tripId: trip._id,  // so Budget knows to update, not create
                              },
                            },
                          });
                        }}
                        id={`btn-edit-trip-${savedObj._id}`}
                      >
                        {t('edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeTrip(savedObj._id)}
                        id={`btn-delete-trip-${savedObj._id}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="saved-empty">
              <div className="saved-empty-icon">📋</div>
              <h3>{t('noSavedItineraries')}</h3>
              <p>{t('startPlanningFirst')}</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/planner')}>
                {t('planATrip')}
              </button>
            </div>
          )
        ) : (
          favourites.length > 0 ? (
            <div className="saved-grid">
              {favourites.map(favObj => {
                const fav = favObj.itemId;
                if (!fav) return null;
                return (
                  <div
                    key={favObj._id}
                    className="saved-fav-card"
                    id={`fav-${favObj._id}`}
                    onClick={() => navigate(`/destination/${fav._id}`)}
                  >
                    <div className="saved-card-thumb" style={{ background: fav.color || 'var(--primary)' }}>
                      <span>{fav.emoji || '📍'}</span>
                    </div>
                    <div className="saved-card-info">
                      <div className="saved-card-name">{fav.name}</div>
                      <div className="text-xs text-muted">📍 {fav.province}</div>
                    </div>
                    <div className="fav-heart" onClick={(e) => { e.stopPropagation(); removeFavourite(favObj._id); }}>❤️</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="saved-empty">
              <div className="saved-empty-icon">❤️</div>
              <h3>{t('noFavsYet')}</h3>
              <p>{t('exploreAndHeart')}</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/explore')}>
                {t('exploreDestinations')}
              </button>
            </div>
          )
        )}
      </div>

      <ItineraryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        markdownText={selectedItinerary}
        title={modalTitle}
      />
    </div>
  );
}
