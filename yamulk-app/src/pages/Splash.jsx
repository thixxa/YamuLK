import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';
import logo from '../assets/YamuLK_logo.png';

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 50);

    const timer = setTimeout(() => navigate('/login'), 3000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [navigate]);

  return (
    <div className="splash-page">
      {/* Ambient blobs */}
      <div className="splash-blob splash-blob-1" />
      <div className="splash-blob splash-blob-2" />
      <div className="splash-blob splash-blob-3" />

      {/* Main content */}
      <div className="splash-content">
        {/* Logo */}
        <div className="splash-logo">
          <img src={logo} alt="YamuLK" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* Brand */}
        <div className="splash-brand">
          <div className="splash-name">YamuLK</div>
          <div className="splash-tagline">Explore Sri Lanka, Your Way</div>
        </div>

        {/* Feature pills */}
        <div className="splash-features">
          {['🏖️ Beaches', '💧 Waterfalls', '⛰️ Mountains', '🏛️ Heritage'].map((f, i) => (
            <div key={f} className="splash-pill" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              {f}
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="splash-progress-wrap">
          <div className="splash-progress-track">
            <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="splash-progress-text">
            {progress < 100 ? 'Loading your journey...' : 'Ready ✨'}
          </div>
        </div>
      </div>
    </div>
  );
}
