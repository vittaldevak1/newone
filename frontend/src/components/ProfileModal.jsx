import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import '../styles/dashboard.css';

const TRAVEL_STYLES = {
  'budget': { icon: '🎒', label: 'Budget' },
  'mid-range': { icon: '🏨', label: 'Mid-Range' },
  'luxury': { icon: '✨', label: 'Luxury' },
  'backpacker': { icon: '🗺️', label: 'Backpacker' },
  'family-friendly': { icon: '👨‍👩‍👧‍👦', label: 'Family' },
};

export default function ProfileModal({ user, onClose }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const travel = user?.travelStyle ? TRAVEL_STYLES[user.travelStyle] : null;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Your Profile</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-profile-top">
            <div className="modal-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            <h3 className="modal-name">{user.name}</h3>
            <p className="modal-email">{user.email}</p>
            <div className="modal-tags">
              {user.nationality && <span className="modal-tag">{user.nationality}</span>}
              {travel && <span className="modal-tag">{travel.icon} {travel.label}</span>}
            </div>
          </div>

          {user.bio && (
            <div className="modal-section">
              <div className="modal-section-label">Bio</div>
              <p className="modal-bio">{user.bio}</p>
            </div>
          )}

          {user.languages && user.languages.length > 0 && (
            <div className="modal-section">
              <div className="modal-section-label">Languages</div>
              <div className="modal-chips">
                {user.languages.map((l) => <span key={l} className="modal-chip">{l}</span>)}
              </div>
            </div>
          )}

          {user.interests && user.interests.length > 0 && (
            <div className="modal-section">
              <div className="modal-section-label">Interests</div>
              <div className="modal-chips">
                {user.interests.map((i) => <span key={i} className="modal-chip">{i}</span>)}
              </div>
            </div>
          )}

          {user.visitedPlaces && user.visitedPlaces.length > 0 && (
            <div className="modal-section">
              <div className="modal-section-label">Visited</div>
              <div className="modal-chips">
                {user.visitedPlaces.map((p) => <span key={p} className="modal-chip modal-chip-visited">{p}</span>)}
              </div>
            </div>
          )}

          {user.wishlist && user.wishlist.length > 0 && (
            <div className="modal-section">
              <div className="modal-section-label">Wishlist</div>
              <div className="modal-chips">
                {user.wishlist.map((w) => <span key={w} className="modal-chip modal-chip-wish">{w}</span>)}
              </div>
            </div>
          )}

          {!user.profileComplete && (
            <div className="modal-incomplete">
              Your profile is incomplete. Complete it to get better matches!
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn-secondary" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          <button className="modal-btn-primary" onClick={() => { onClose(); navigate('/profile-setup'); }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
