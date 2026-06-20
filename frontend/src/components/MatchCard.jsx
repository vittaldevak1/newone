import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const TRAVEL_STYLES = {
  'budget': { icon: '🎒', label: 'Budget' },
  'mid-range': { icon: '🏨', label: 'Mid-Range' },
  'luxury': { icon: '✨', label: 'Luxury' },
  'backpacker': { icon: '🗺️', label: 'Backpacker' },
  'family-friendly': { icon: '👨‍👩‍👧‍👦', label: 'Family' },
};

export default function MatchCard({ match, onAccept, onDecline, onViewProfile }) {
  const { user } = useContext(AuthContext);

  if (!match || !user) return null;

  const myId = user._id || user.id;

  if (!match.user1 || !match.user2) return null;

  const user1Id = match.user1._id || match.user1;
  const user2Id = match.user2._id || match.user2;

  const otherUser = user1Id.toString() === myId.toString() ? match.user2 : match.user1;

  if (!otherUser || !otherUser.name) return null;

  const initiatedById = match.initiatedBy?._id
    || (typeof match.initiatedBy === 'string' ? match.initiatedBy : match.initiatedBy?.toString?.() || '');

  const iSentIt = initiatedById && myId && initiatedById.toString() === myId.toString();

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const travel = otherUser.travelStyle ? TRAVEL_STYLES[otherUser.travelStyle] : null;

  const scoreColor =
    match.compatibilityScore >= 80 ? '#10b981' :
    match.compatibilityScore >= 60 ? '#f59e0b' :
    match.compatibilityScore >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="match-card">
      <div className="match-card-header" onClick={() => onViewProfile?.(otherUser)} style={{ cursor: 'pointer' }}>
        <div className="match-card-avatar">
          {otherUser.avatar ? (
            <img src={otherUser.avatar} alt={otherUser.name} />
          ) : (
            <span>{getInitials(otherUser.name)}</span>
          )}
        </div>
        <div className="match-card-user-info">
          <h3 className="match-card-name">{otherUser.name}</h3>
          <div className="match-card-tags">
            {otherUser.nationality && <span className="match-tag">{otherUser.nationality}</span>}
            {travel && <span className="match-tag">{travel.icon} {travel.label}</span>}
          </div>
        </div>
        <div className="match-card-score" style={{ borderColor: scoreColor }}>
          <span className="score-value" style={{ color: scoreColor }}>{match.compatibilityScore}%</span>
          <span className="score-label">Match</span>
        </div>
      </div>

      {otherUser.interests && otherUser.interests.length > 0 && (
        <div className="match-card-interests">
          {otherUser.interests.slice(0, 4).map((interest) => (
            <span key={interest} className="match-interest-chip">{interest}</span>
          ))}
          {otherUser.interests.length > 4 && (
            <span className="match-interest-chip match-interest-more">+{otherUser.interests.length - 4}</span>
          )}
        </div>
      )}

      {/* THEY sent me a request → I can Accept or Decline */}
      {match.status === 'pending' && !iSentIt && (
        <div className="match-card-actions">
          <button className="match-btn match-btn-accept" onClick={() => onAccept(match._id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Accept
          </button>
          <button className="match-btn match-btn-decline" onClick={() => onDecline(match._id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Decline
          </button>
        </div>
      )}

      {/* I sent the request → show Requested + Cancel */}
      {match.status === 'pending' && iSentIt && (
        <div className="match-card-actions">
          <div className="match-card-status match-status-pending">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Requested
          </div>
          <button className="match-btn match-btn-cancel" onClick={() => onDecline(match._id)}>
            Cancel
          </button>
        </div>
      )}

      {/* Connected */}
      {match.status === 'accepted' && (
        <div className="match-card-actions">
          <div className="match-card-status match-status-accepted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Connected
          </div>
        </div>
      )}
    </div>
  );
}
