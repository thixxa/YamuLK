import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createTrip } from '../api/trips.js';
import { updateBudget } from '../api/budget.js';
import { saveItem } from '../api/savedItems.js';
import { getAreaCategoryRates } from '../utils/areaCosts.js';
import './Budget.css';

const DEFAULT_ITEMS = [
  { id: 'transport', label: 'Transport', emoji: '🚌', amount: 4000 },
  { id: 'accommodation', label: 'Accommodation', emoji: '🏨', amount: 6000 },
  { id: 'food', label: 'Food & Drinks', emoji: '🍽️', amount: 2800 },
  { id: 'entrance', label: 'Entrance Fees', emoji: '🎟️', amount: 1500 },
  { id: 'activities', label: 'Activities', emoji: '🤿', amount: 2000 },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', amount: 1000 },
  { id: 'emergency', label: 'Emergency Fund', emoji: '🆘', amount: 500 },
];

// Full mapping from TripPlanner transport IDs → backend enum values
const TRANSPORT_MAP = {
  bus: 'Bus',
  train: 'Train',
  car: 'Car',
  motorcycle: 'Motorcycle',
  bicycle: 'Bicycle',
  walk: 'Walk',
  other: 'Other',
};

export default function Budget() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state?.trip;

  const totalBudget = tripData?.budget || 15000;

  // Calculate trip duration in days (default to 1 if dates are invalid)
  const tripDays = (() => {
    if (tripData?.date && tripData?.endDate) {
      const start = new Date(tripData.date);
      const end = new Date(tripData.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    }
    return 1;
  })();

  // Compute area-specific benchmark rates
  const areaRates = getAreaCategoryRates(
    tripData?.destinationData,
    tripData?.accommodation || 'hotel',
    tripData?.transport || 'bus'
  );

  const getInitialItems = () => {
    const initial = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
    if (!tripData) return initial;
    
    const people = tripData.people || 2;
    const rooms = Math.ceil(people / 2);
    const isPrivateVehicle = ['car', 'motorcycle'].includes(tripData.transport);

    return initial.map(item => {
      let amount = item.amount;
      switch (item.id) {
        case 'accommodation':
          amount = areaRates.accRate * tripDays * rooms;
          break;
        case 'transport':
          amount = isPrivateVehicle 
            ? areaRates.transRate * tripDays 
            : areaRates.transRate * tripDays * people;
          break;
        case 'food':
          amount = areaRates.foodPerDay * tripDays * people;
          break;
        case 'entrance':
          amount = areaRates.entrancePerPerson * people;
          break;
        case 'activities':
          amount = areaRates.activityPerPerson * people;
          break;
        case 'shopping':
          amount = areaRates.shoppingPerPerson * people;
          break;
        case 'emergency':
          amount = areaRates.emergencyPerDayPerson * tripDays * people;
          break;
      }
      return { ...item, amount };
    });
  };

  const [items, setItems] = useState(getInitialItems);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const totalSpend = items.reduce((sum, item) => sum + item.amount, 0);
  const remaining = totalBudget - totalSpend;
  const percent = Math.min(Math.round((totalSpend / totalBudget) * 100), 100);
  const isOver = totalSpend > totalBudget;

  const updateAmount = (id, val) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, amount: Math.max(0, val) } : item
    ));
  };

  const saveTrip = async () => {
    if (!tripData) {
      setStatusMsg({ type: 'error', text: 'No trip data found. Please start from the planner.' });
      return;
    }
    setSaving(true);
    setStatusMsg({ type: '', text: '' });
    try {
      // 1. Create Trip
      const destId = tripData.destinationData?._id || tripData.destination;

      // Map transport mode ID to backend enum (full mapping)
      const transportMode = TRANSPORT_MAP[tripData.transport?.toLowerCase()] || 'Other';

      const tripPayload = {
        destinationId: destId,
        travelDate: tripData.date || new Date().toISOString(),
        returnDate: tripData.endDate || new Date(Date.now() + 86400000).toISOString(),
        people: tripData.people,
        transportMode,
        accommodationType: tripData.accommodation,
        totalBudget: totalBudget,
        specialNotes: tripData.notes || '',
      };
      
      const tripRes = await createTrip(tripPayload);
      const tripId = tripRes.trip._id;

      // 2. Create/Update Budget
      const budgetPayload = {
        transport: items.find(i => i.id === 'transport')?.amount || 0,
        accommodation: items.find(i => i.id === 'accommodation')?.amount || 0,
        food: items.find(i => i.id === 'food')?.amount || 0,
        other: (items.find(i => i.id === 'entrance')?.amount || 0) +
               (items.find(i => i.id === 'activities')?.amount || 0) +
               (items.find(i => i.id === 'shopping')?.amount || 0) +
               (items.find(i => i.id === 'emergency')?.amount || 0),
        userBudget: totalBudget
      };
      await updateBudget(tripId, budgetPayload);

      // 3. Save to SavedTrips
      await saveItem('trip', tripId);

      setStatusMsg({ type: 'success', text: '✅ Trip saved successfully!' });
      setTimeout(() => navigate('/saved'), 1500);
    } catch (error) {
      console.error("Error saving trip:", error);
      setStatusMsg({ type: 'error', text: '❌ Failed to save trip: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="budget-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">💰 Budget Calculator</h1>
            <p className="text-muted text-sm mt-1">
              {tripData?.destinationData?.name || 'Your Trip'} · {tripData?.people || 2} people · {tripDays} day{tripDays !== 1 ? 's' : ''}
            </p>
            {tripData?.destinationData && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '0.8rem',
                fontWeight: 500
              }}>
                <span>📍 Estimated using <strong>{tripData.destinationData.name}</strong> regional cost benchmarks ({areaRates.areaTierName})</span>
              </div>
            )}
          </div>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/planner', { state: { trip: tripData } })}
            id="btn-back-planner"
          >
            ← Edit Plan
          </button>
        </div>

        {/* Status message */}
        {statusMsg.text && (
          <div
            className={`budget-status-msg ${statusMsg.type}`}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16,
              background: statusMsg.type === 'success' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
              border: `1px solid ${statusMsg.type === 'success' ? '#4CAF50' : '#f44336'}`,
              color: statusMsg.type === 'success' ? '#4CAF50' : '#f44336',
              fontWeight: 600,
            }}
          >
            {statusMsg.text}
          </div>
        )}

        <div className="budget-layout">
          {/* Left: Summary */}
          <div className="budget-summary-card">
            <div className="budget-gradient-bg">
              <div className="summary-label">TOTAL BUDGET</div>
              <div className="summary-budget">Rs. {totalBudget.toLocaleString()}</div>
              <div className="summary-divider"></div>
              <div className="summary-label">ESTIMATED SPEND</div>
              <div className="summary-spend">Rs. {totalSpend.toLocaleString()}</div>

              {/* Progress ring */}
              <div className="budget-ring-wrap">
                <svg className="budget-ring" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={isOver ? '#ff6b6b' : 'rgba(255,255,255,0.9)'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - percent / 100)}`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                  <text x="60" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="800">{percent}%</text>
                  <text x="60" y="75" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">used</text>
                </svg>
              </div>

              <div className={`status-pill ${isOver ? 'over' : 'ok'}`}>
                {isOver ? `⚠️ Over by Rs. ${(totalSpend - totalBudget).toLocaleString()}` : `✓ Rs. ${remaining.toLocaleString()} remaining`}
              </div>
            </div>

            {/* Per person breakdown */}
            <div className="per-person-box">
              <div className="per-person-item">
                <span>Per Person</span>
                <span className="font-bold">Rs. {Math.round(totalSpend / (tripData?.people || 2)).toLocaleString()}</span>
              </div>
              <div className="per-person-item">
                <span>Per Day ({tripDays} day{tripDays !== 1 ? 's' : ''})</span>
                <span className="font-bold">Rs. {Math.round(totalSpend / tripDays).toLocaleString()}</span>
              </div>
            </div>

            {/* Mini bar chart */}
            <div className="spend-bars">
              {items.map(item => (
                <div key={item.id} className="spend-bar-row">
                  <span className="spend-bar-label">{item.emoji} {item.label}</span>
                  <div className="spend-bar-track">
                    <div
                      className="spend-bar-fill"
                      style={{ width: `${Math.min((item.amount / totalSpend) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="spend-bar-val">Rs. {item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Input form */}
          <div className="budget-inputs-card">
            <h3 className="font-bold text-lg mb-4">Expense Breakdown</h3>
            <div className="budget-items">
              {items.map(item => (
                <div key={item.id} className="budget-item" id={`budget-item-${item.id}`}>
                  <div className="budget-item-left">
                    <span className="budget-item-emoji">{item.emoji}</span>
                    <span className="budget-item-label">{item.label}</span>
                  </div>
                  <div className="budget-item-input-wrap">
                    <span className="budget-currency">Rs.</span>
                    <input
                      type="number"
                      className="budget-input"
                      id={`input-${item.id}`}
                      value={item.amount}
                      min="0"
                      step="100"
                      onChange={e => updateAmount(item.id, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="budget-total-row">
              <span className="font-bold">Total</span>
              <span className={`budget-total-val ${isOver ? 'text-danger' : 'text-primary'}`}>
                Rs. {totalSpend.toLocaleString()}
              </span>
            </div>

            <div className="budget-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/route', { state: { trip: tripData, destination: tripData?.destinationData, budgetItems: items } })}
                id="btn-view-route"
              >
                🗺️ View Route
              </button>
              <button className="btn btn-outline" id="btn-save-budget" onClick={saveTrip} disabled={saving}>
                {saving ? '⏳ Saving...' : '💾 Save Plan'}
              </button>
              <button className="btn btn-ghost" id="btn-reset-budget" onClick={() => setItems(getInitialItems())}>
                🔄 Reset
              </button>
            </div>

            {/* Tips */}
            <div className="budget-tips">
              <h4>💡 Money-saving Tips</h4>
              <ul>
                <li>🚆 Trains are more scenic and affordable than buses</li>
                <li>🏠 Guest houses near popular spots offer great value</li>
                <li>🍛 Local rice & curry costs Rs. 150–300 per meal</li>
                <li>🎟️ Book entrance tickets online to avoid queues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
