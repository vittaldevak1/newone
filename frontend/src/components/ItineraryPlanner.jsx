import { useState } from 'react';
import '../styles/dashboard.css';

export default function ItineraryPlanner({ trip, onSave, onClose }) {
  const totalDays = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1);
  const [days, setDays] = useState(() => {
    const existing = trip.itinerary || [];
    const result = [];
    for (let i = 1; i <= totalDays; i++) {
      const found = existing.find(d => d.day === i);
      result.push(found || { day: i, title: `Day ${i}`, activities: [''], notes: '' });
    }
    return result;
  });
  const [saving, setSaving] = useState(false);

  const updateDay = (dayIndex, field, value) => {
    setDays(prev => prev.map((d, i) => i === dayIndex ? { ...d, [field]: value } : d));
  };

  const addActivity = (dayIndex) => {
    setDays(prev => prev.map((d, i) => i === dayIndex ? { ...d, activities: [...d.activities, ''] } : d));
  };

  const updateActivity = (dayIndex, actIndex, value) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIndex) return d;
      const acts = [...d.activities];
      acts[actIndex] = value;
      return { ...d, activities: acts };
    }));
  };

  const removeActivity = (dayIndex, actIndex) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIndex) return d;
      const acts = d.activities.filter((_, j) => j !== actIndex);
      return { ...d, activities: acts.length ? acts : [''] };
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const cleaned = days.map(d => ({
        ...d,
        activities: d.activities.filter(a => a.trim()),
      }));
      await onSave(cleaned);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="itinerary-modal-overlay" onClick={onClose}>
      <div className="itinerary-modal" onClick={e => e.stopPropagation()}>
        <div className="itinerary-header">
          <div>
            <h2 className="itinerary-title">Trip Itinerary</h2>
            <p className="itinerary-subtitle">{trip.destination} — {totalDays} day{totalDays > 1 ? 's' : ''}</p>
          </div>
          <button className="itinerary-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="itinerary-body">
          {days.map((day, di) => (
            <div key={day.day} className="itinerary-day">
              <div className="itinerary-day-header">
                <span className="itinerary-day-badge">Day {day.day}</span>
                <input
                  className="itinerary-day-title"
                  value={day.title}
                  onChange={e => updateDay(di, 'title', e.target.value)}
                  placeholder="Title (e.g. Arrival Day)"
                />
              </div>

              <div className="itinerary-activities">
                {day.activities.map((act, ai) => (
                  <div key={ai} className="itinerary-activity-row">
                    <span className="itinerary-activity-dot" />
                    <input
                      className="itinerary-activity-input"
                      value={act}
                      onChange={e => updateActivity(di, ai, e.target.value)}
                      placeholder="What's planned?"
                    />
                    {day.activities.length > 1 && (
                      <button className="itinerary-activity-remove" onClick={() => removeActivity(di, ai)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button className="itinerary-add-activity" onClick={() => addActivity(di)}>
                  + Add activity
                </button>
              </div>

              <textarea
                className="itinerary-notes"
                value={day.notes}
                onChange={e => updateDay(di, 'notes', e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
              />
            </div>
          ))}
        </div>

        <div className="itinerary-footer">
          <button className="trip-cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="trip-submit-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Itinerary'}
          </button>
        </div>
      </div>
    </div>
  );
}
