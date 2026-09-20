import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWeather } from '../api/weather.js';
import { searchDestinations } from '../api/destinations.js';
import SkeletonLoader from '../components/SkeletonLoader';
import { getWeatherEmoji, getWeatherGradient } from '../utils/weatherUtils.js';
import './Weather.css';

export default function Weather() {
  const location = useLocation();
  const [selectedDest, setSelectedDest] = useState(location.state?.destinationId || null);
  const [destinations, setDestinations] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load all destinations for dropdown
  useEffect(() => {
    async function init() {
      try {
        const dRes = await searchDestinations('');
        const dests = dRes.destinations || [];
        setDestinations(dests);

        // Only fall back to the first destination if NO destinationId was passed
        // via navigation state. Reading location.state directly avoids the
        // stale-closure issue where selectedDest still reads as null.
        const passedId = location.state?.destinationId;
        if (!passedId && dests.length > 0) {
          setSelectedDest(dests[0]._id);
        } else if (passedId) {
          // Ensure the passed ID actually exists in the loaded list
          const exists = dests.some(d => d._id === passedId);
          if (!exists && dests.length > 0) {
            setSelectedDest(dests[0]._id); // passedId not found, fall back
          }
          // else: selectedDest is already set correctly from useState initialiser
        }
      } catch (err) {
        console.error("Failed to load destinations for weather:", err);
      }
    }
    init();
  }, []);

  // Fetch weather when selected destination changes
  useEffect(() => {
    if (!selectedDest) return;
    async function loadWeather() {
      setLoading(true);
      try {
        const wRes = await getWeather(selectedDest);
        setWeatherData(wRes);
      } catch (err) {
        console.error("Failed to load weather:", err);
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, [selectedDest]);

  const dest = destinations.find(d => d._id === selectedDest) || null;
  const currentCode = weatherData?.currentWeather?.weatherCode;

  const weather = weatherData ? {
    location: `${dest?.name}, ${dest?.province}`,
    temp: weatherData.currentWeather?.temperature || 28,
    emoji: getWeatherEmoji(currentCode),
    condition: weatherData.currentWeather?.weatherCode !== undefined
      ? (weatherData.forecast?.[0]?.weather || 'Clear sky')
      : 'Sunny',
    feelsLike: weatherData.currentWeather?.feelsLike || 30,
    rainProb: weatherData.forecast?.[0]?.rainProbability || 0,
    humidity: weatherData.currentWeather?.humidity ?? '--',
    windSpeed: weatherData.currentWeather?.windSpeed || 0,
    // Use current UV if daytime; fall back to today's daily max at night
    uvIndex: weatherData.currentWeather?.uvIndex > 0
      ? Math.round(weatherData.currentWeather.uvIndex * 10) / 10
      : (weatherData.forecast?.[0]?.uvIndexMax
          ? Math.round(weatherData.forecast[0].uvIndexMax * 10) / 10
          : '--'),
    // Sunrise/sunset from today's forecast
    sunrise: weatherData.forecast?.[0]?.sunrise
      ? new Date(weatherData.forecast[0].sunrise).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
      : '--',
    sunset: weatherData.forecast?.[0]?.sunset
      ? new Date(weatherData.forecast[0].sunset).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
      : '--',
  } : null;

  if (loading) {
    return (
      <div className="weather-page">
        <Navbar />
        <div style={{ paddingTop: 80 }}>
          <SkeletonLoader type="page" count={1} />
        </div>
      </div>
    );
  }

  return (
    <div className="weather-page">
      <Navbar />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">🌤️ Weather Forecast</h1>
            <p className="text-muted text-sm mt-1">Real-time conditions for your destination</p>
          </div>
        </div>

        {/* Location selector */}
        <div className="weather-location-bar">
          <span>📍 View weather for:</span>
          <select
            className="weather-select"
            id="weather-dest-select"
            value={selectedDest}
            onChange={e => setSelectedDest(e.target.value)}
          >
            {destinations.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="weather-layout">
          {/* Current weather hero */}
          <div className="weather-hero-col">
            <div className="weather-hero-card" style={{ background: getWeatherGradient(currentCode) }}>
              <div className="weather-orb-1"></div>
              <div className="weather-orb-2"></div>
              <div className="weather-hero-content">
                <div className="weather-loc">{weather.location}</div>
                <div className="weather-emoji-big">{weather.emoji}</div>
                <div className="weather-temp-big">{weather.temp}°C</div>
                <div className="weather-cond">{weather.condition} · Feels like {weather.feelsLike}°C</div>
              </div>
            </div>

            {/* 7-day Forecast */}
            <div className="forecast-card">
              <h3 className="font-bold mb-4">7-Day Forecast</h3>
              <div className="forecast-row">
                {(weatherData?.forecast || []).slice(0, 7).map((day, i) => {
                  const dayName = day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }) : `Day ${i+1}`;
                  const emoji = getWeatherEmoji(day.weatherCode);
                  return (
                    <div key={i} className={`forecast-day ${i === 0 ? 'today' : ''}`}>
                      <div className="forecast-day-name">{dayName}</div>
                      <div className="forecast-emoji">{emoji}</div>
                      <div className="forecast-temps">
                        <span className="forecast-high">{Math.round(day.maxTemperature)}°</span>
                        <span className="forecast-low">{Math.round(day.minTemperature)}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Weather details */}
          <div className="weather-details-col">
            <h3 className="font-bold mb-4">Current Conditions</h3>
            <div className="weather-detail-grid">
              <div className="wd-card">
                <div className="wd-icon">🌡️</div>
                <div className="wd-val">{weather.temp}°C</div>
                <div className="wd-lbl">Temperature</div>
              </div>
              <div className="wd-card">
                <div className="wd-icon">🌧️</div>
                <div className="wd-val">{weather.rainProb}%</div>
                <div className="wd-lbl">Rain Chance</div>
              </div>
              <div className="wd-card">
                <div className="wd-icon">💧</div>
                <div className="wd-val">{weather.humidity}%</div>
                <div className="wd-lbl">Humidity</div>
              </div>
              <div className="wd-card">
                <div className="wd-icon">💨</div>
                <div className="wd-val">{weather.windSpeed} km/h</div>
                <div className="wd-lbl">Wind Speed</div>
              </div>
              <div className="wd-card">
                <div className="wd-icon">☀️</div>
                <div className="wd-val">{weather.uvIndex}</div>
                <div className="wd-lbl">UV Index</div>
              </div>
              <div className="wd-card">
                <div className="wd-icon">🌅</div>
                <div className="wd-val">{weather.sunrise}</div>
                <div className="wd-lbl">Sunrise</div>
              </div>
              <div className="wd-card">
                <div className="wd-icon">🌇</div>
                <div className="wd-val">{weather.sunset}</div>
                <div className="wd-lbl">Sunset</div>
              </div>
            </div>

            {/* Travel advisory */}
            <div className={`travel-advisory ${weather.rainProb < 30 ? 'good' : weather.rainProb < 60 ? 'moderate' : 'poor'}`}>
              <div className="advisory-icon">
                {weather.rainProb < 30 ? '✅' : weather.rainProb < 60 ? '⚠️' : '🌧️'}
              </div>
              <div>
                <div className="advisory-title">
                  {weather.rainProb < 30 ? 'Great day to travel!' : weather.rainProb < 60 ? 'Moderate conditions' : 'Possible rain — plan accordingly'}
                </div>
                <div className="advisory-sub">
                  {weather.rainProb < 30
                    ? 'Perfect weather for outdoor activities and sightseeing.'
                    : weather.rainProb < 60
                    ? 'Carry an umbrella. Some activities may be affected.'
                    : 'Bring rain gear. Check with local guides before hiking.'}
                </div>
              </div>
            </div>

            {/* Best time banner */}
            <div className="best-time-card">
              <h4>🗓️ Best Time to Visit {dest.name}</h4>
              <p>{dest.bestTime}</p>
              <div className="best-time-bar">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <div key={m} className={`month-cell ${i < 4 || i > 9 ? 'good' : 'fair'}`}>
                    {m}
                  </div>
                ))}
              </div>
            </div>

            <div className="weather-actions">
              <button className="btn btn-primary" onClick={() => navigate('/planner')} id="btn-plan-from-weather">
                📅 Plan Trip
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/route', { state: { destination: dest } })} id="btn-route-from-weather">
                🗺️ Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
