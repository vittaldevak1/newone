import { useState, useEffect } from 'react';
import { tripApi } from '../services/api';
import DestinationAutocomplete from './DestinationAutocomplete';
import { ACTIVITIES } from '../data/destinations';

const ACTIVITIES_OPTIONS = ACTIVITIES;

const DURATIONS = [
  { label: 'Just today', days: 0 },
  { label: '2–3 days', days: 2 },
  { label: 'This week', days: 6 },
  { label: '2 weeks', days: 13 },
];

const BUDGET_OPTIONS = [
  { value: 'budget', icon: '💰', label: 'Budget' },
  { value: 'mid-range', icon: '💳', label: 'Mid-Range' },
  { value: 'luxury', icon: '💎', label: 'Luxury' },
  { value: 'flexible', icon: '🔄', label: 'Flexible' },
];

export default function TripForm({ onClose, onTripCreated }) {
  const [mode, setMode] = useState(null); // null | 'immediate' | 'planned'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);

  const [destination, setDestination] = useState('');
  const [activities, setActivities] = useState([]);
  const [lookingFor, setLookingFor] = useState('travel-buddies');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (mode === 'immediate') {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
    }
  }, [mode, duration]);

  const toggleActivity = (activity) => {
    setActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleSubmit = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    if (mode === 'planned' && (!startDate || !endDate)) {
      setError('Please select start and end dates');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let payload = {
        destination: destination.trim(),
        activities,
        lookingFor,
        budget,
        description,
        tripType: mode,
      };

      if (mode === 'immediate') {
        const today = new Date();
        const end = new Date(today);
        end.setDate(end.getDate() + duration);
        payload.startDate = today.toISOString();
        payload.endDate = end.toISOString();
      } else {
        payload.startDate = new Date(startDate).toISOString();
        payload.endDate = new Date(endDate).toISOString();
      }

      const result = await tripApi.create(payload);
      setCreatedResult(result);
      onTripCreated?.(result);
      setTimeout(() => onClose(), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!mode) {
    return (
      <div className="trip-form-overlay" onClick={onClose}>
        <div className="trip-form-modal" onClick={(e) => e.stopPropagation()}>
          <button className="trip-form-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="trip-form-header">
            <h2 className="trip-form-title">Start a Trip</h2>
            <p className="trip-form-subtitle">How would you like to travel?</p>
          </div>

          <div className="trip-mode-options">
            <button className="trip-mode-card" onClick={() => setMode('immediate')}>
              <div className="trip-mode-icon trip-mode-icon--now">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="trip-mode-info">
                <h3 className="trip-mode-name">Going Now</h3>
                <p className="trip-mode-desc">I'm heading out right now and want to find companions nearby</p>
              </div>
              <svg className="trip-mode-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button className="trip-mode-card" onClick={() => setMode('planned')}>
              <div className="trip-mode-icon trip-mode-icon--planned">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="trip-mode-info">
                <h3 className="trip-mode-name">Plan a Trip</h3>
                <p className="trip-mode-desc">I'm planning a future trip and want to find travel buddies</p>
              </div>
              <svg className="trip-mode-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-form-overlay" onClick={onClose}>
      <div className="trip-form-modal trip-form-modal--expanded" onClick={(e) => e.stopPropagation()}>
        <button className="trip-form-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {createdResult ? (
          <div className="trip-success-screen">
            <div className="trip-success-icon">🎉</div>
            <h3 className="trip-success-title">Trip Created!</h3>
            <p className="trip-success-dest">{destination}</p>
            {createdResult.newMatches > 0 ? (
              <p className="trip-success-matches">
                We found <strong>{createdResult.newMatches}</strong> potential travel {createdResult.newMatches === 1 ? 'buddy' : 'buddies'}!
              </p>
            ) : (
              <p className="trip-success-matches">No immediate matches found — check back as new travelers join!</p>
            )}
          </div>
        ) : (
        <>
        <div className="trip-form-header">
          <button className="trip-form-back" onClick={() => { setMode(null); setError(null); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h2 className="trip-form-title">
              {mode === 'immediate' ? 'Going Now' : 'Plan a Trip'}
            </h2>
            <p className="trip-form-subtitle">
              {mode === 'immediate' ? 'Where are you headed right now?' : 'Where do you want to go?'}
            </p>
          </div>
        </div>

        {error && (
          <div className="trip-form-error">{error}</div>
        )}

        <div className="trip-form-body">
          {/* Destination */}
          <div className="trip-field">
            <label className="trip-label">Destination</label>
            <DestinationAutocomplete
              value={destination}
              onChange={(val) => setDestination(val)}
              placeholder="e.g. Bali, Paris, Goa..."
              disabled={saving}
            />
          </div>

          {/* Budget */}
          <div className="trip-field">
            <label className="trip-label">Budget <span className="trip-optional">(optional)</span></label>
            <div className="trip-budget-grid">
              {BUDGET_OPTIONS.map((b) => (
                <button
                  key={b.value}
                  className={`trip-budget-btn ${budget === b.value ? 'active' : ''}`}
                  onClick={() => setBudget(budget === b.value ? '' : b.value)}
                  disabled={saving}
                >
                  <span>{b.icon}</span>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration (immediate) or Dates (planned) */}
          {mode === 'immediate' ? (
            <div className="trip-field">
              <label className="trip-label">How long?</label>
              <div className="trip-duration-grid">
                {DURATIONS.map((d) => (
                  <button
                    key={d.days}
                    className={`trip-duration-btn ${duration === d.days ? 'active' : ''}`}
                    onClick={() => setDuration(d.days)}
                    disabled={saving}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="trip-field">
              <label className="trip-label">Dates</label>
              <div className="trip-date-row">
                <div className="trip-date-input">
                  <label className="trip-date-sublabel">Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={saving}
                    min={new Date().toISOString().split('T')[0]}
                    className="trip-input"
                  />
                </div>
                <span className="trip-date-sep">→</span>
                <div className="trip-date-input">
                  <label className="trip-date-sublabel">End</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={saving}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="trip-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Activities */}
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

          {/* Looking For */}
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

          {/* Description */}
          <div className="trip-field">
            <label className="trip-label">Description <span className="trip-optional">(optional)</span></label>
            <textarea
              placeholder="Tell others about your trip plan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
              className="trip-textarea"
            />
          </div>
        </div>

        <div className="trip-form-footer">
          <button className="trip-cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="trip-submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : mode === 'immediate' ? 'Find Companions Now' : 'Create Trip'}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
