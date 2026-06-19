import { useState, useEffect } from 'react';
import { tripApi } from '../services/api';
import TripCard from './TripCard';
import TripCalendar from './TripCalendar';
import TripForm from './TripForm';

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getUserTrips();
      setTrips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTripCreated = (result) => {
    setTrips(prev => [result.trip, ...prev]);
  };

  const handleTripDeleted = (tripId) => {
    setTrips(prev => prev.filter(t => t._id !== tripId));
  };

  const handleTripUpdated = (updated) => {
    setTrips(prev => prev.map(t => t._id === updated._id ? { ...t, ...updated } : t));
  };

  const activeTrips = trips.filter(t => t.status === 'active');
  const pastTrips = trips.filter(t => t.status !== 'active');

  if (loading) {
    return (
      <div className="trip-loading">
        <div className="dash-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-error">
        <p>{error}</p>
        <button onClick={fetchTrips} className="match-retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="trip-list-container">
      <div className="trip-list-header">
        <div className="trip-list-title-row">
          <h2 className="trip-list-title">My Trips</h2>
          <span className="trip-count">{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="trip-list-actions">
          <div className="trip-view-toggle">
            <button
              className={`trip-view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              List
            </button>
            <button
              className={`trip-view-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Calendar
            </button>
          </div>
          <button className="trip-create-btn" onClick={() => setShowForm(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Trip
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <>
          {trips.length === 0 ? (
            <div className="trip-empty">
              <div className="trip-empty-icon">✈️</div>
              <h3 className="trip-empty-title">No trips yet</h3>
              <p className="trip-empty-desc">Create your first trip to start finding travel companions!</p>
              <button className="trip-empty-btn" onClick={() => setShowForm(true)}>
                Create a Trip
              </button>
            </div>
          ) : (
            <div className="trip-list">
              {activeTrips.length > 0 && (
                <div className="trip-section">
                  <h3 className="trip-section-title">Active ({activeTrips.length})</h3>
                  <div className="trip-cards">
                    {activeTrips.map(trip => (
                      <TripCard key={trip._id} trip={trip} onDelete={handleTripDeleted} onTripUpdated={handleTripUpdated} />
                    ))}
                  </div>
                </div>
              )}

              {pastTrips.length > 0 && (
                <div className="trip-section">
                  <h3 className="trip-section-title">Past ({pastTrips.length})</h3>
                  <div className="trip-cards">
                    {pastTrips.map(trip => (
                      <TripCard key={trip._id} trip={trip} onDelete={handleTripDeleted} onTripUpdated={handleTripUpdated} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <TripCalendar trips={trips} />
      )}

      {showForm && (
        <TripForm
          onClose={() => setShowForm(false)}
          onTripCreated={handleTripCreated}
        />
      )}
    </div>
  );
}
