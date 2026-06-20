import { useState, useEffect } from 'react';
import { matchApi } from '../services/api';
import MatchCard from './MatchCard';

export default function MatchList() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchApi.getMy();
      console.log("Matches data:", data);
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch matches error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    try {
      const updated = await matchApi.accept(matchId);
      setMatches(matches.map(m => m._id === matchId ? updated : m));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecline = async (matchId) => {
    try {
      await matchApi.decline(matchId);
      setMatches(matches.filter(m => m._id !== matchId));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return m.status === 'pending';
    if (filter === 'connected') return m.status === 'accepted';
    return true;
  });

  const pendingCount = matches.filter(m => m.status === 'pending').length;
  const connectedCount = matches.filter(m => m.status === 'accepted').length;

  if (loading) {
    return (
      <div className="match-loading">
        <div className="dash-spinner" />
      </div>
    );
  }

  return (
    <div className="match-list-container">
      <div className="match-list-header">
        <h2 className="match-list-title">Your Matches</h2>
        <div className="match-list-stats">
          <span className="match-stat">{pendingCount} pending</span>
          <span className="match-stat-sep">·</span>
          <span className="match-stat">{connectedCount} connected</span>
        </div>
      </div>

      <div className="match-filter-bar">
        <button
          className={`match-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({matches.length})
        </button>
        <button
          className={`match-filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`match-filter-btn ${filter === 'connected' ? 'active' : ''}`}
          onClick={() => setFilter('connected')}
        >
          Connected ({connectedCount})
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444',
          fontSize: '14px', textAlign: 'center', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <div className="match-empty">
          <div className="match-empty-icon">🔍</div>
          <h3 className="match-empty-title">
            {filter === 'all' && 'No matches yet'}
            {filter === 'pending' && 'No pending requests'}
            {filter === 'connected' && 'No connections yet'}
          </h3>
          <p className="match-empty-desc">
            {filter === 'all' && 'Go to Explore to find travel buddies!'}
            {filter === 'pending' && 'All caught up!'}
            {filter === 'connected' && 'Accept requests to start connecting.'}
          </p>
        </div>
      ) : (
        <div className="match-grid">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match._id}
              match={match}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
