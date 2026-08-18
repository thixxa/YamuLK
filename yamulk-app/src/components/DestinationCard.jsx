import './DestinationCard.css';
import { useNavigate } from 'react-router-dom';

export default function DestinationCard({ destination, variant = 'default' }) {
  const navigate = useNavigate();

  return (
    <div
      className={`dest-card ${variant}`}
      onClick={() => navigate(`/destination/${destination.id}`)}
    >
      <div className="dest-card-img" style={{ background: destination.color }}>
        <span className="dest-emoji">{destination.emoji}</span>
        <div className="dest-badge">
          <span>⭐</span> {destination.rating}
        </div>
      </div>
      <div className="dest-card-body">
        <div className="dest-name">{destination.name}</div>
        <div className="dest-meta">
          <span>📍 {destination.province}</span>
        </div>
        <div className="dest-footer">
          <span className="dest-cost">Rs. {destination.costPerDay.toLocaleString()}/day</span>
          <span className="dest-weather">{destination.weather.emoji} {destination.weather.temp}°C</span>
        </div>
      </div>
    </div>
  );
}
