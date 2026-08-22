import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
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

export default function Budget() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state?.trip;

  const totalBudget = tripData?.budget || 15000;

  const [items, setItems] = useState(DEFAULT_ITEMS);

  const totalSpend = items.reduce((sum, item) => sum + item.amount, 0);
  const remaining = totalBudget - totalSpend;
  const percent = Math.min(Math.round((totalSpend / totalBudget) * 100), 100);
  const isOver = totalSpend > totalBudget;

  const updateAmount = (id, val) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, amount: Math.max(0, val) } : item
    ));
  };

  return (
    <div className="budget-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">💰 Budget Calculator</h1>
            <p className="text-muted text-sm mt-1">
              {tripData?.destinationData?.name || 'Your Trip'} · {tripData?.people || 2} people
            </p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/planner')}
            id="btn-back-planner"
          >
            ← Edit Plan
          </button>
        </div>

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
                <span>Per Day (estimate)</span>
                <span className="font-bold">Rs. {Math.round(totalSpend / 2).toLocaleString()}</span>
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
                onClick={() => navigate('/route')}
                id="btn-view-route"
              >
                🗺️ View Route
              </button>
              <button className="btn btn-outline" id="btn-save-budget">
                💾 Save Plan
              </button>
              <button className="btn btn-ghost" id="btn-reset-budget" onClick={() => setItems(DEFAULT_ITEMS)}>
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
