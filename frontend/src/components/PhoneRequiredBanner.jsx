import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PhoneRequiredBanner() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user?.phoneVerified) return null;

  return (
    <div className="phone-required-banner">
      <div className="phone-required-content">
        <div className="phone-required-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <div className="phone-required-text">
          <strong>Phone verification required</strong>
          <span>Verify your phone to create trips, match, and message.</span>
        </div>
        <button className="phone-required-btn" onClick={() => navigate('/settings')}>
          Verify Now
        </button>
      </div>
    </div>
  );
}
