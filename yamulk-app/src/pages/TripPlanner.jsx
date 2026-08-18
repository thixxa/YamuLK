import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { destinations, transportModes } from '../data/mockData';
import './TripPlanner.css';

export default function TripPlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.destination;

  const [form, setForm] = useState({
    destination: prefill?.id || 'mirissa-beach',
    date: '',
    endDate: '',
    people: 2,
    budget: 15000,
    transport: 'bus',
    accommodation: 'hotel',
    notes: '',
  });

  const selectedDest = destinations.find(d => d.id === form.destination) || destinations[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/budget', { state: { trip: { ...form, destinationData: selectedDest } } });
  };

  return (
    <div className="planner-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">🗺️ Trip Planner</h1>
            <p className="text-muted text-sm mt-1">Plan your perfect Sri Lanka adventure</p>
          </div>
        </div>

        <div className="planner-layout">
          {/* Main form */}
          <div className="planner-form-card">
            <form onSubmit={handleSubmit} id="trip-planner-form">
              {/* Destination selector */}
              <div className="field-group">
                <label>📍 Destination</label>
                <select
                  id="planner-destination"
                  value={form.destination}
                  onChange={e => setForm({ ...form, destination: e.target.value })}
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.province}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid-2">
                <div className="field-group">
                  <label>📅 Travel Date</label>
                  <input
                    type="date"
                    id="planner-start-date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="field-group">
                  <label>📅 Return Date</label>
                  <input
                    type="date"
                    id="planner-end-date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* People & Budget */}
              <div className="grid-2">
                <div className="field-group">
                  <label>👥 Number of People</label>
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
                  <label>💰 Total Budget (Rs.)</label>
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
                <label>🚌 Transport Method</label>
                <div className="transport-grid" id="transport-grid">
                  {transportModes.map(m => (
                    <div
                      key={m.id}
                      className={`transport-opt ${form.transport === m.id ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, transport: m.id })}
                      id={`transport-${m.id}`}
                    >
                      <span className="transport-emoji">{m.emoji}</span>
                      <span className="transport-label">{m.label}</span>
                      <span className="transport-desc">{m.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accommodation */}
              <div className="field-group">
                <label>🏨 Accommodation Type</label>
                <select
                  id="planner-accommodation"
                  value={form.accommodation}
                  onChange={e => setForm({ ...form, accommodation: e.target.value })}
                >
                  <option value="hotel">Hotel (Rs. 5,000 – 15,000/night)</option>
                  <option value="guesthouse">Guest House (Rs. 2,000 – 5,000/night)</option>
                  <option value="homestay">Homestay (Rs. 1,500 – 3,000/night)</option>
                  <option value="hostel">Hostel (Rs. 800 – 2,000/night)</option>
                  <option value="resort">Resort (Rs. 15,000+/night)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="field-group">
                <label>📝 Special Notes</label>
                <textarea
                  id="planner-notes"
                  placeholder="Any special requirements, dietary needs, accessibility needs..."
                  rows="3"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" id="btn-generate-plan">
                ✨ Generate Plan
              </button>
            </form>
          </div>

          {/* Destination preview */}
          <div className="planner-preview">
            <div className="preview-hero" style={{ background: selectedDest.color }}>
              <span className="preview-emoji">{selectedDest.emoji}</span>
            </div>
            <div className="preview-body">
              <h3 className="preview-name">{selectedDest.name}</h3>
              <p className="text-muted text-sm">{selectedDest.province}</p>

              <div className="preview-stats">
                <div className="preview-stat">
                  <span className="preview-stat-val">⭐ {selectedDest.rating}</span>
                  <span className="preview-stat-lbl">Rating</span>
                </div>
                <div className="preview-stat">
                  <span className="preview-stat-val">Rs. {selectedDest.costPerDay.toLocaleString()}</span>
                  <span className="preview-stat-lbl">per day</span>
                </div>
                <div className="preview-stat">
                  <span className="preview-stat-val">{selectedDest.weather.emoji} {selectedDest.weather.temp}°C</span>
                  <span className="preview-stat-lbl">Weather</span>
                </div>
              </div>

              <p className="preview-desc">{selectedDest.description.slice(0, 120)}...</p>

              <div className="preview-tags">
                {selectedDest.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="chip">{tag}</span>
                ))}
              </div>

              <div className="preview-best-time">
                <span>🗓️</span>
                <span><strong>Best time to visit:</strong> {selectedDest.bestTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
