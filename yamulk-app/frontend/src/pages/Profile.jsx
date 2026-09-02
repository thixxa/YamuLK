import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext.jsx';
import './Profile.css';

const menuItems = [
  { icon: '👤', label: 'User Details', sub: 'Personal information' },
  { icon: '⚙️', label: 'Preferences', sub: 'Language, currency, theme' },
  { icon: '🧳', label: 'Saved Trips', sub: 'View your travel plans', action: '/saved' },
  { icon: '🔔', label: 'Notifications', sub: 'Manage alerts & updates' },
  { icon: '🔒', label: 'Privacy & Security', sub: 'Password, data settings' },
  { icon: '❓', label: 'Help & Support', sub: 'FAQs, contact us' },
  { icon: '⭐', label: 'Rate the App', sub: 'Share your feedback' },
];

const stats = [
  { val: '12', lbl: 'Trips Planned', icon: '🗺️' },
  { val: '8', lbl: 'Destinations', icon: '📍' },
  { val: '4', lbl: 'Reviews', icon: '⭐' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    name: user?.name || 'Traveller',
    email: '',
    username: user?.name || 'user',
    phone: '',
    city: '',
  });

  return (
    <div className="profile-page">
      <Navbar />
      <div className="page-content">
        <h1 className="section-title mb-6">My Profile</h1>

        <div className="profile-layout">
          {/* Left sidebar */}
          <div className="profile-sidebar">
            {/* Avatar card */}
            <div className="profile-avatar-card">
              <div className="profile-avatar-ring">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="avatar avatar-xl">
                    {userForm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <button className="avatar-edit-btn" id="btn-edit-avatar">📷</button>
              </div>
              <div className="profile-name">{userForm.name}</div>
              <div className="profile-username">@{userForm.username}</div>
              <div className="profile-email">{userForm.email || user?.email || 'No email set'}</div>
              <button
                className="btn btn-outline btn-block mt-4"
                onClick={() => setEditing(!editing)}
                id="btn-edit-profile"
              >
                {editing ? '✓ Save Changes' : '✏️ Edit Profile'}
              </button>
            </div>

            {/* Stats */}
            <div className="profile-stats-card">
              {stats.map(stat => (
                <div key={stat.lbl} className="profile-stat">
                  <div className="profile-stat-icon">{stat.icon}</div>
                  <div className="profile-stat-val">{stat.val}</div>
                  <div className="profile-stat-lbl">{stat.lbl}</div>
                </div>
              ))}
            </div>

            {/* Member since */}
            <div className="profile-member-card">
              <span>🌿</span>
              <div>
                <div className="font-semibold" style={{ fontSize: 13 }}>YamuLK Explorer</div>
                <div className="text-xs text-muted">Member since Jan 2025</div>
              </div>
            </div>
          </div>

          {/* Right main area */}
          <div className="profile-main">
            {editing ? (
              /* Edit form */
              <div className="profile-edit-card">
                <h3 className="font-bold text-lg mb-5">Edit Profile</h3>
                <div className="grid-2">
                  <div className="field-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      id="edit-name"
                      value={userForm.name}
                      onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>
                  <div className="field-group">
                    <label>Username</label>
                    <input
                      type="text"
                      id="edit-username"
                      value={userForm.username}
                      onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                    />
                  </div>
                  <div className="field-group">
                    <label>Email</label>
                    <input
                      type="email"
                      id="edit-email"
                      value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  <div className="field-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      id="edit-phone"
                      value={userForm.phone}
                      onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="field-group">
                    <label>City</label>
                    <input
                      type="text"
                      id="edit-city"
                      value={userForm.city}
                      onChange={e => setUserForm({ ...userForm, city: e.target.value })}
                    />
                  </div>
                  <div className="field-group">
                    <label>Province</label>
                    <select id="edit-province">
                      <option>Western Province</option>
                      <option>Central Province</option>
                      <option>Southern Province</option>
                      <option>Northern Province</option>
                      <option>Eastern Province</option>
                      <option>North Western Province</option>
                      <option>North Central Province</option>
                      <option>Uva Province</option>
                      <option>Sabaragamuwa Province</option>
                    </select>
                  </div>
                </div>
                <div className="profile-edit-actions">
                  <button className="btn btn-primary" onClick={() => setEditing(false)} id="btn-save-profile">
                    💾 Save Changes
                  </button>
                  <button className="btn btn-ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Menu list */
              <div className="profile-menu-card">
                {menuItems.map((item, i) => (
                  <div
                    key={i}
                    className="profile-menu-item"
                    id={`menu-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => item.action && navigate(item.action)}
                  >
                    <div className="menu-icon-wrap">{item.icon}</div>
                    <div className="menu-text">
                      <div className="menu-label">{item.label}</div>
                      <div className="menu-sub text-xs text-muted">{item.sub}</div>
                    </div>
                    <span className="menu-arrow">›</span>
                  </div>
                ))}

                {/* Logout */}
                <div
                  className="profile-menu-item logout-item"
                  id="btn-logout"
                  onClick={() => { logout(); navigate('/login'); }}
                >
                  <div className="menu-icon-wrap">🚪</div>
                  <div className="menu-text">
                    <div className="menu-label">Logout</div>
                    <div className="menu-sub text-xs">Sign out of your account</div>
                  </div>
                  <span className="menu-arrow">›</span>
                </div>
              </div>
            )}

            {/* Recent trips quick access */}
            {!editing && (
              <div className="profile-recent">
                <div className="section-header">
                  <h3 className="font-bold">Recent Trips</h3>
                  <span className="section-link" onClick={() => navigate('/saved')}>View all</span>
                </div>
                <div className="recent-trip-row">
                  {[
                    { name: 'Mirissa Weekend', emoji: '🏖️', date: 'Mar 15', color: 'linear-gradient(135deg, #4fc3d1, #0e7c86)' },
                    { name: 'Ella Hiking', emoji: '⛰️', date: 'Apr 20', color: 'linear-gradient(135deg, #a58cf0, #5a4bb0)' },
                    { name: 'Sigiriya Tour', emoji: '🏛️', date: 'May 10', color: 'linear-gradient(135deg, #e0a86a, #b5793c)' },
                  ].map((t, i) => (
                    <div key={i} className="recent-trip-chip" onClick={() => navigate('/saved')}>
                      <div className="recent-trip-thumb" style={{ background: t.color }}>
                        {t.emoji}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{t.name}</div>
                        <div className="text-xs text-muted">{t.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
