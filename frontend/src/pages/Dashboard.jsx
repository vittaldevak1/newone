import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import MatchList from '../components/MatchList';
import TripList from '../components/TripList';
import ProfileModal from '../components/ProfileModal';
import Explore from '../components/Explore';
import MessagesPanel from '../components/MessagesPanel';
import ReviewsPanel from '../components/ReviewsPanel';
import Notifications from '../components/Notifications';
import '../styles/auth.css';
import '../styles/dashboard.css';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: 'trips',
    label: 'My Trips',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
  },
  {
    id: 'matches',
    label: 'Matches',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const TRAVEL_STYLES = {
  'budget': { icon: '🎒', label: 'Budget' },
  'mid-range': { icon: '🏨', label: 'Mid-Range' },
  'luxury': { icon: '✨', label: 'Luxury' },
  'backpacker': { icon: '🗺️', label: 'Backpacker' },
  'family-friendly': { icon: '👨‍👩‍👧‍👦', label: 'Family' },
};

const STATS = [
  { id: 'trips', label: 'Trips', value: 0, icon: '✈️', color: '#6c5ce7' },
  { id: 'matches', label: 'Matches', value: 0, icon: '🤝', color: '#fd79a8' },
  { id: 'messages', label: 'Messages', value: 0, icon: '💬', color: '#0984e3' },
  { id: 'reviews', label: 'Reviews', value: 0, icon: '⭐', color: '#e17055' },
];

export default function Dashboard() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);

  const handleNotifNavigate = (nav) => setActiveNav(nav);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const path = location.pathname.replace('/', '');
    if (NAV_ITEMS.find(n => n.id === path)) {
      setActiveNav(path);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const travel = user?.travelStyle ? TRAVEL_STYLES[user.travelStyle] : null;

  // Profile completion calculation
  const getProfileCompletion = () => {
    const fields = [
      !!user.avatar,
      !!user.age,
      !!user.nationality,
      user.languages?.length > 0,
      !!user.travelStyle,
      user.interests?.length > 0,
      !!user.bio,
      user.visitedPlaces?.length > 0,
      user.wishlist?.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profilePercent = getProfileCompletion();

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '22px', height: '22px' }}>
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5z" fill="white" />
            </svg>
          </div>
          <span className="sidebar-brand-text">WireUs</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-nav-item" onClick={() => navigate('/settings')}>
            <span className="sidebar-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span className="sidebar-nav-label">Settings</span>
          </button>
          <button className="sidebar-nav-item sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="sidebar-nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        {/* Top Bar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <h1 className="dash-greeting">
              Hey, {user.name.split(' ')[0]} <span className="wave">👋</span>
            </h1>
            <p className="dash-subtitle">Here's what's happening with your travels</p>
          </div>
          <div className="dash-topbar-right">
            <Notifications onNavigate={handleNotifNavigate} />
            <button className="dash-topbar-btn" onClick={() => navigate('/settings')} title="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button className="dash-topbar-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
            <div className="dash-avatar-sm" onClick={() => setShowProfile(true)}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dash-content">
          {activeNav === 'dashboard' && (
            <>
              {/* Stats Row */}
              <div className="dash-stats">
                {STATS.map((stat) => (
                  <div key={stat.id} className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                      {stat.icon}
                    </div>
                    <div className="dash-stat-info">
                      <span className="dash-stat-value">{stat.value}</span>
                      <span className="dash-stat-label">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Two Column Layout */}
              <div className="dash-grid">
                {/* Left Column - Profile Card */}
                <div className="dash-panel">
                  <div className="dash-panel-header">
                    <h2 className="dash-panel-title">Your Profile</h2>
                    <button className="dash-panel-action" onClick={() => setShowProfile(true)}>View All</button>
                  </div>
                  <div className="dash-profile-card">
                    {/* Profile Completion */}
                    {profilePercent < 100 && (
                      <div className="profile-completion">
                        <div className="profile-completion-header">
                          <span className="profile-completion-label">Profile {profilePercent}% complete</span>
                          <button className="profile-completion-btn" onClick={() => navigate('/profile-setup')}>Complete</button>
                        </div>
                        <div className="profile-completion-bar">
                          <div className="profile-completion-fill" style={{ width: `${profilePercent}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="dash-avatar-lg">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{getInitials(user.name)}</span>
                      )}
                    </div>
                    <h3 className="dash-profile-name">{user.name}</h3>
                    <p className="dash-profile-email">{user.email}</p>
                    <div className="dash-profile-tags">
                      {user.nationality && <span className="dash-tag">{user.nationality}</span>}
                      {travel && <span className="dash-tag">{travel.icon} {travel.label}</span>}
                    </div>
                    {user.bio && <p className="dash-profile-bio">{user.bio}</p>}
                    {user.interests && user.interests.length > 0 && (
                      <div className="dash-profile-interests">
                        {user.interests.slice(0, 5).map((i) => (
                          <span key={i} className="dash-chip-sm">{i}</span>
                        ))}
                        {user.interests.length > 5 && (
                          <span className="dash-chip-sm dash-chip-more">+{user.interests.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Activity */}
                <div className="dash-panel">
                  <div className="dash-panel-header">
                    <h2 className="dash-panel-title">Recent Activity</h2>
                  </div>
                  <div className="dash-activity-list">
                    <div className="dash-empty-state">
                      <div className="dash-empty-icon">🌍</div>
                      <h3 className="dash-empty-title">No activity yet</h3>
                      <p className="dash-empty-desc">Create your first trip to start matching with fellow travelers!</p>
                      <button className="dash-empty-btn" onClick={() => setActiveNav('trips')}>
                        Create a Trip
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <h2 className="dash-panel-title">Quick Actions</h2>
                </div>
                <div className="dash-quick-actions">
                  <button className="dash-action-btn" onClick={() => setActiveNav('trips')}>
                    <span className="dash-action-icon">✈️</span>
                    <span className="dash-action-text">
                      <span className="dash-action-title">Create Trip</span>
                      <span className="dash-action-desc">Plan a new adventure</span>
                    </span>
                  </button>
                  <button className="dash-action-btn" onClick={() => setActiveNav('matches')}>
                    <span className="dash-action-icon">🔍</span>
                    <span className="dash-action-text">
                      <span className="dash-action-title">Find Matches</span>
                      <span className="dash-action-desc">Discover travel buddies</span>
                    </span>
                  </button>
                  <button className="dash-action-btn" onClick={() => setActiveNav('messages')}>
                    <span className="dash-action-icon">💬</span>
                    <span className="dash-action-text">
                      <span className="dash-action-title">Messages</span>
                      <span className="dash-action-desc">Chat with your matches</span>
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeNav === 'trips' && <TripList />}

          {activeNav === 'matches' && <MatchList />}

          {activeNav === 'explore' && <Explore />}

          {activeNav === 'messages' && <MessagesPanel />}

          {activeNav === 'reviews' && <ReviewsPanel />}
        </div>
      </main>

      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => setActiveNav(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
