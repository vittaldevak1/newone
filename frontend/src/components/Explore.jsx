import { useState, useEffect, useCallback, useRef } from 'react';
import { matchApi } from '../services/api';
import '../styles/dashboard.css';

const PAGE_SIZE = 20;

const TRAVEL_STYLES = [
  { value: 'budget', icon: '🎒', label: 'Budget' },
  { value: 'mid-range', icon: '🏨', label: 'Mid-Range' },
  { value: 'luxury', icon: '✨', label: 'Luxury' },
  { value: 'backpacker', icon: '🗺️', label: 'Backpacker' },
  { value: 'family-friendly', icon: '👨‍👩‍👧‍👦', label: 'Family' },
];

const INTERESTS = [
  'Hiking', 'Photography', 'Food & Dining', 'Nightlife', 'History',
  'Museums', 'Beach', 'Adventure Sports', 'Shopping', 'Nature',
  'Camping', 'Wildlife', 'Architecture', 'Surfing', 'Cycling',
  'Trekking', 'Street Food', 'Road Trips', 'Music Festivals', 'Art',
];

export default function Explore() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(null);
  const [filters, setFilters] = useState({
    travelStyle: '',
    interest: '',
    nationality: '',
  });
  const [search, setSearch] = useState('');
  const [sentIds, setSentIds] = useState(new Set());
  const sentinelRef = useRef(null);

  const fetchUsers = useCallback(async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const params = { page: pageNum, limit: PAGE_SIZE };
      if (filters.travelStyle) params.travelStyle = filters.travelStyle;
      if (filters.interest) params.interest = filters.interest;
      if (filters.nationality) params.nationality = filters.nationality;

      const data = await matchApi.discover(params);
      const newUsers = data.users || [];

      if (append) {
        setUsers(prev => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }
      setHasMore(newUsers.length >= PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchUsers(1, false);
  }, [fetchUsers]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchUsers(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => { if (sentinel) observer.unobserve(sentinel); };
  }, [hasMore, loading, loadingMore, page, fetchUsers]);

  const handleConnect = async (userId) => {
    try {
      setSending(userId);
      await matchApi.connect(userId);
      setSentIds(prev => new Set([...prev, userId]));
    } catch (err) {
      console.error(err);
    } finally {
      setSending(null);
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.nationality?.toLowerCase().includes(q) ||
      u.interests?.some(i => i.toLowerCase().includes(q))
    );
  });

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h2 className="explore-title">Explore Travelers</h2>
        <p className="explore-subtitle">Find people with shared interests</p>
      </div>

      {/* Search */}
      <div className="explore-search-wrap">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="explore-search"
          placeholder="Search by name, country, or interest..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="explore-filters">
        <div className="explore-filter-group">
          <label className="explore-filter-label">Travel Style</label>
          <div className="explore-chip-row">
            <button
              className={`explore-chip ${!filters.travelStyle ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, travelStyle: '' })}
            >
              All
            </button>
            {TRAVEL_STYLES.map(s => (
              <button
                key={s.value}
                className={`explore-chip ${filters.travelStyle === s.value ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, travelStyle: filters.travelStyle === s.value ? '' : s.value })}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="explore-filter-group">
          <label className="explore-filter-label">Interests</label>
          <div className="explore-chip-row">
            {INTERESTS.map(i => (
              <button
                key={i}
                className={`explore-chip ${filters.interest === i ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, interest: filters.interest === i ? '' : i })}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="explore-loading">
          <div className="dash-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="explore-empty">
          <div className="explore-empty-icon">🌍</div>
          <h3>No travelers found</h3>
          <p>Try adjusting your filters or search</p>
        </div>
      ) : (
        <>
          <div className="explore-grid">
            {filtered.map(u => (
              <div key={u._id} className="explore-card">
                <div className="explore-card-top">
                  <div className="explore-card-avatar">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} />
                    ) : (
                      <span>{getInitials(u.name)}</span>
                    )}
                  </div>
                  <div className="explore-card-score">
                    <span className="explore-score-value">{u.compatibility}%</span>
                    <span className="explore-score-label">match</span>
                  </div>
                </div>

                <h3 className="explore-card-name">{u.name}</h3>
                <div className="explore-card-meta">
                  {u.nationality && <span>{u.nationality}</span>}
                  {u.age && <span>· {u.age}</span>}
                  {u.travelStyle && (
                    <span>· {TRAVEL_STYLES.find(s => s.value === u.travelStyle)?.icon} {TRAVEL_STYLES.find(s => s.value === u.travelStyle)?.label}</span>
                  )}
                </div>

                {u.bio && <p className="explore-card-bio">{u.bio}</p>}

                {u.sharedInterests && u.sharedInterests.length > 0 && (
                  <div className="explore-card-shared">
                    <span className="explore-shared-label">Shared:</span>
                    {u.sharedInterests.slice(0, 3).map(i => (
                      <span key={i} className="explore-shared-chip">{i}</span>
                    ))}
                    {u.sharedInterests.length > 3 && (
                      <span className="explore-shared-chip">+{u.sharedInterests.length - 3}</span>
                    )}
                  </div>
                )}

                {u.interests && u.interests.length > 0 && (
                  <div className="explore-card-interests">
                    {u.interests.slice(0, 4).map(i => (
                      <span key={i} className="explore-interest-chip">{i}</span>
                    ))}
                    {u.interests.length > 4 && (
                      <span className="explore-interest-chip">+{u.interests.length - 4}</span>
                    )}
                  </div>
                )}

                <button
                  className={`explore-connect-btn ${sentIds.has(u._id) ? 'sent' : ''}`}
                  onClick={() => handleConnect(u._id)}
                  disabled={sentIds.has(u._id) || sending === u._id}
                >
                  {sending === u._id ? (
                    'Sending...'
                  ) : sentIds.has(u._id) ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Request Sent
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                      Connect
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="explore-sentinel">
            {loadingMore && <div className="dash-spinner" />}
            {!hasMore && filtered.length > 0 && (
              <p className="explore-end-text">You've seen all travelers</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
