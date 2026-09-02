import './DestinationCard.css';
import { useNavigate } from 'react-router-dom';

export default function DestinationCard({ destination, variant = 'default' }) {
  const navigate = useNavigate();
  const firstImage = destination.imageURLs?.[0];

  return (
    <div
      className={`dest-card ${variant}`}
      onClick={() => navigate(`/destination/${destination._id || destination.id}`)}
    >
      <div className="dest-card-img" style={!firstImage ? { background: destination.color } : {}}>
        {firstImage ? (
          <img
            src={firstImage}
            alt={destination.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="dest-emoji">{destination.emoji}</span>
        )}
        <div className="dest-badge">
          <span>⭐</span> {destination.averageRating ?? destination.rating}
        </div>
      </div>
      <div className="dest-card-body">
        <div className="dest-name">{destination.name}</div>
        <div className="dest-meta">
          <span>📍 {destination.province}</span>
        </div>
        <div className="dest-footer">
          <span className="dest-cost">
            Rs. {(destination.estimatedCost ?? destination.costPerDay)?.toLocaleString()}/day
          </span>
          {destination.weather && (
            <span className="dest-weather">{destination.weather.emoji} {destination.weather.temp}°C</span>
          )}
        </div>
      </div>
    </div>
  );
}
