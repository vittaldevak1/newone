import { useState } from 'react';
import { tripApi } from '../services/api';
import TripEditModal from './TripEditModal';

const ACTIVITY_ICONS = {
  'Photography': '📸', 'Hiking': '🥾', 'Food & Dining': '🍜', 'Beach': '🏖️',
  'Culture': '🏛️', 'Nightlife': '🎶', 'Shopping': '🛍️', 'Adventure Sports': '🧗',
  'Sightseeing': '🗺️', 'Museums': '🎨', 'Nature': '🌿', 'Music': '🎵',
  'Yoga & Wellness': '🧘', 'History': '📚', 'Art': '🖼️', 'Cooking': '👨‍🍳',
  'Wildlife': '🦁', 'Camping': '⛺', 'Water Sports': '🏄', 'Cycling': '🚴'
};

export default function TripCard({ trip, onDelete, onTripUpdated }) {
  const [deleting, setDeleting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isImmediate = trip.tripType === 'immediate';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateFull = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const isActive = isToday(trip.startDate) || (new Date(trip.startDate) <= new Date() && new Date(trip.endDate) >= new Date());

  const handleDelete = async () => {
    if (!confirm('Delete this trip?')) return;
    setDeleting(true);
    try {
      await tripApi.delete(trip._id);
      onDelete?.(trip._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`trip-card ${isImmediate ? 'trip-card--immediate' : ''} ${isActive ? 'trip-card--active' : ''}`}>
      <div className="trip-card-header">
        <div className="trip-card-dest">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{trip.destination}</span>
        </div>
        <div className="trip-card-badges">
          {isImmediate && <span className="trip-badge trip-badge--now">⚡ Going Now</span>}
          {isActive && !isImmediate && <span className="trip-badge trip-badge--active">Active</span>}
          {trip.status === 'completed' && <span className="trip-badge trip-badge--completed">✅ Completed</span>}
          <button className="trip-edit-btn" onClick={() => setShowEdit(true)} title="Edit trip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="trip-delete-btn" onClick={handleDelete} disabled={deleting} title="Delete trip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="trip-card-dates">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {isImmediate ? (
          <span>Today</span>
        ) : (
          <span>{formatDate(trip.startDate)} — {formatDateFull(trip.endDate)}</span>
        )}
      </div>

      {trip.activities && trip.activities.length > 0 && (
        <div className="trip-card-activities">
          {trip.activities.slice(0, 5).map((activity) => (
            <span key={activity} className="trip-activity-chip-sm">
              <span>{ACTIVITY_ICONS[activity] || '📌'}</span>
              {activity}
            </span>
          ))}
          {trip.activities.length > 5 && (
            <span className="trip-activity-chip-sm trip-activity-more">
              +{trip.activities.length - 5}
            </span>
          )}
        </div>
      )}

      {trip.description && (
        <p className="trip-card-desc">{trip.description}</p>
      )}

      <div className="trip-card-footer">
        <span className="trip-card-looking">
          {trip.lookingFor === 'travel-buddies' && '👥 Looking for travel buddies'}
          {trip.lookingFor === 'local-guide' && '🧭 Looking for a local guide'}
          {trip.lookingFor === 'any' && '🌍 Open to anyone'}
        </span>
      </div>

      {showEdit && (
        <TripEditModal
          trip={trip}
          onClose={() => setShowEdit(false)}
          onTripUpdated={(updated) => {
            Object.assign(trip, updated);
            onTripUpdated?.(updated);
          }}
        />
      )}
    </div>
  );
}
