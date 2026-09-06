import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserTrips } from '../api/trips.js';
import { getSavedItems } from '../api/savedItems.js';
import { api } from '../api/api.js';
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

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    name: user?.name || 'Traveller',
    oldPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Real stats
  const [stats, setStats] = useState({ trips: 0, destinations: 0, favourites: 0 });
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    async function loadStats() {
      try {
        // Load trips and saved items in parallel
        const [tripsRes, savedRes] = await Promise.allSettled([
          getUserTrips(),
          getSavedItems(),
        ]);

        const trips = tripsRes.status === 'fulfilled' ? (tripsRes.value.trips || []) : [];
        const savedItems = savedRes.status === 'fulfilled' ? (savedRes.value.savedItems || []) : [];

        const savedTrips = savedItems.filter(i => i.itemType === 'trip');
        const savedDests = savedItems.filter(i => i.itemType === 'destination');

        setStats({
          trips: trips.length,
          destinations: savedDests.length,
          favourites: savedTrips.length,
        });

        // Show up to 3 recent trips from real data
        const recent = trips.slice(0, 3).map(t => ({
          name: t.destinationId?.name || 'Unknown Trip',
          emoji: t.destinationId?.emoji || '🗺️',
          date: t.travelDate ? new Date(t.travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
          color: t.destinationId?.color || 'linear-gradient(135deg, #4fc3d1, #0e7c86)',
        }));
        setRecentTrips(recent);
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    }
    if (token) loadStats();
  }, [token]);

  const handleSaveProfile = async () => {
    if (userForm.password && userForm.password !== userForm.confirmPassword) {
      setSaveMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (userForm.password && userForm.password.length < 6) {
      setSaveMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setSavingProfile(true);
    setSaveMsg({ type: '', text: '' });
    try {
      const payload = {};
      if (userForm.name) payload.name = userForm.name;
      if (userForm.password) {
        payload.oldPassword = userForm.oldPassword;
        payload.password = userForm.password;
      }

      const res = await api.patch('/user/updateProfile', payload);
      setSaveMsg({ type: 'success', text: '✅ ' + (res.message || 'Profile updated!') });
      setEditing(false);
      // Reset password fields
      setUserForm(f => ({ ...f, oldPassword: '', password: '', confirmPassword: '' }));
    } catch (err) {
      setSaveMsg({ type: 'error', text: '❌ ' + (err.message || 'Update failed.') });
    } finally {
      setSavingProfile(false);
    }
  };

  const statItems = [
    { val: stats.trips.toString(), lbl: 'Trips', icon: '🗺️' },
    { val: stats.destinations.toString(), lbl: 'Favourites', icon: '❤️' },
    { val: stats.favourites.toString(), lbl: 'Saved', icon: '📋' },
  ];

  return (
    <div className="profile-page">
      <Navbar />
      <div className="page-content">
        <h1 className="section-title mb-6">My Profile</h1>

        {/* Status message */}
        {saveMsg.text && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16,
              background: saveMsg.type === 'success' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
              border: `1px solid ${saveMsg.type === 'success' ? '#4CAF50' : '#f44336'}`,
              color: saveMsg.type === 'success' ? '#4CAF50' : '#f44336',
              fontWeight: 600,
            }}
          >
            {saveMsg.text}
          </div>
        )}

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
              <div className="profile-username">@{userForm.name.toLowerCase().replace(/\s+/g, '')}</div>
              <div className="profile-email">{user?.email || 'No email set'}</div>
              <button
                className="btn btn-outline btn-block mt-4"
                onClick={() => { setEditing(!editing); setSaveMsg({ type: '', text: '' }); }}
                id="btn-edit-profile"
              >
                {editing ? '✕ Cancel' : '✏️ Edit Profile'}
              </button>
            </div>

            {/* Stats */}
            <div className="profile-stats-card">
              {statItems.map(stat => (
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
                    <label>Email (read-only)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <hr style={{ margin: '16px 0', borderColor: 'var(--border)' }} />
                <h4 className="font-bold mb-3" style={{ fontSize: 14 }}>Change Password (optional)</h4>
                <div className="grid-2">
                  <div className="field-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      id="edit-old-password"
                      value={userForm.oldPassword}
                      onChange={e => setUserForm({ ...userForm, oldPassword: e.target.value })}
                      placeholder="Leave blank to keep password"
                    />
                  </div>
                  <div className="field-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      id="edit-new-password"
                      value={userForm.password}
                      onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div className="field-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      id="edit-confirm-password"
                      value={userForm.confirmPassword}
                      onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    id="btn-save-profile"
                    disabled={savingProfile}
                  >
                    {savingProfile ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => { setEditing(false); setSaveMsg({ type: '', text: '' }); }}>
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
                {recentTrips.length > 0 ? (
                  <div className="recent-trip-row">
                    {recentTrips.map((t, i) => (
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
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 14 }}>
                    No trips yet. <span className="section-link" onClick={() => navigate('/planner')}>Plan one!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
