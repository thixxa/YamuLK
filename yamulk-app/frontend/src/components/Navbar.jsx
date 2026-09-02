import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/YamuLK_logo.png';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Get initials from name, e.g. "Kasun Perera" → "KP"
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';


  const navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/explore', label: 'Explore' },
    { path: '/saved', label: 'Saved Trips' },
    { path: '/planner', label: 'Trip Planner' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="navbar-brand">
          <div className="brand-logo" style={{ overflow: 'hidden', padding: 4 }}>
            <img src={logo} alt="YamuLK" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className="brand-name">YamuLK</span>
        </Link>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <button className="btn-icon nav-icon-btn" title="Notifications">
            <span>🔔</span>
          </button>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            <div className="theme-toggle-track">
              <span>🌙</span>
              <span>☀️</span>
            </div>
            <div className="theme-toggle-thumb" />
          </button>

          <Link to="/profile" className="nav-avatar">
            <div className="avatar">{initials}</div>
          </Link>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
