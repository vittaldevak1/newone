import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PhotoRequiredBanner() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user?.avatar) return null;

  return (
    <div className="photo-required-banner">
      <div className="photo-required-content">
        <div className="photo-required-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <div className="photo-required-text">
          <strong>Photo required</strong>
          <span>Upload a profile photo to create trips, match, and message.</span>
        </div>
        <button className="photo-required-btn" onClick={() => navigate('/settings')}>
          Add Photo
        </button>
      </div>
    </div>
  );
}
