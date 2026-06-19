import { useState } from 'react';
import { tripApi } from '../services/api';
import { ACTIVITIES } from '../data/destinations';

const ACTIVITIES_OPTIONS = ACTIVITIES;

export default function TripEditModal({ trip, onClose, onTripUpdated }) {
  const [destination, setDestination] = useState(trip.destination || '');
  const [description, setDescription] = useState(trip.description || '');
  const [lookingFor, setLookingFor] = useState(trip.lookingFor || 'travel-buddies');
  const [activities, setActivities] = useState(trip.activities || []);
  const [startDate, setStartDate] = useState(trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggleActivity = (activity) => {
    setActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleSave = async () => {
    if (!destination.trim()) {
      setError('Destination is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const updated = await tripApi.update(trip._id, {
        destination: destination.trim(),
        description,
        lookingFor,
        activities,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      onTripUpdated?.(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setSaving(true);
      const updated = await tripApi.update(trip._id, { status: 'completed' });
      onTripUpdated?.(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="trip-form-overlay" onClick={onClose}>
      <div className="trip-form-modal trip-form-modal--expanded" onClick={(e) => e.stopPropagation()}>
        <button className="trip-form-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="trip-form-header">
          <div>
            <h2 className="trip-form-title">Edit Trip</h2>
            <p className="trip-form-subtitle">{trip.destination}</p>
          </div>
        </div>

        {error && <div className="trip-form-error">{error}</div>}

        <div className="trip-form-body">
          <div className="trip-field">
            <label className="trip-label">Destination</label>
            <input
              type="text"
              className="trip-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="trip-field">
            <label className="trip-label">Dates</label>
            <div className="trip-date-row">
              <div className="trip-date-input">
                <label className="trip-date-sublabel">Start</label>
                <input
                  type="date"
                  className="trip-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={saving}
                />
              </div>
              <span className="trip-date-sep">→</span>
              <div className="trip-date-input">
                <label className="trip-date-sublabel">End</label>
                <input
                  type="date"
                  className="trip-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="trip-field">
            <label className="trip-label">Activities</label>
            <div className="trip-activities-grid">
              {ACTIVITIES_OPTIONS.map((activity) => (
                <button
                  key={activity}
                  className={`trip-activity-chip ${activities.includes(activity) ? 'active' : ''}`}
                  onClick={() => toggleActivity(activity)}
                  disabled={saving}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          <div className="trip-field">
            <label className="trip-label">Looking for</label>
            <div className="trip-looking-for">
              {[
                { value: 'travel-buddies', label: 'Travel Buddies', icon: '👥' },
                { value: 'local-guide', label: 'Local Guide', icon: '🧭' },
                { value: 'any', label: 'Anyone', icon: '🌍' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`trip-looking-btn ${lookingFor === opt.value ? 'active' : ''}`}
                  onClick={() => setLookingFor(opt.value)}
                  disabled={saving}
                >
                  <span className="trip-looking-icon">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="trip-field">
            <label className="trip-label">Description</label>
            <textarea
              className="trip-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
              placeholder="Tell others about your trip..."
            />
          </div>
        </div>

        <div className="trip-form-footer">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="trip-cancel-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            {trip.status === 'active' && (
              <button
                className="trip-cancel-btn"
                onClick={handleMarkComplete}
                disabled={saving}
                style={{ color: '#10b981', borderColor: '#10b98130' }}
              >
                Mark Complete
              </button>
            )}
          </div>
          <button className="trip-submit-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
