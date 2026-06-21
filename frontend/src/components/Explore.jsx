import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { matchApi, tripApi } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import '../styles/dashboard.css';

const PAGE_SIZE = 20;

const TRAVEL_STYLES = [
  { value: 'budget', icon: '🎒', label: 'Budget' },
  { value: 'mid-range', icon: '🏨', label: 'Mid-Range' },
  { value: 'luxury', icon: '✨', label: 'Luxury' },
  { value: 'backpacker', icon: '🗺️', label: 'Backpacker' },
  { value: 'family-friendly', icon: '👨‍👩‍👧‍👦', label: 'Family' },
];

const BUDGET_OPTIONS = [
  { value: 'budget', icon: '💰', label: 'Budget' },
  { value: 'mid-range', icon: '💳', label: 'Mid-Range' },
  { value: 'luxury', icon: '💎', label: 'Luxury' },
  { value: 'flexible', icon: '🔄', label: 'Flexible' },
];

const TRAVEL_PACE_OPTIONS = [
  { value: 'relaxed', icon: '🏖️', label: 'Relaxed' },
  { value: 'balanced', icon: '⚖️', label: 'Balanced' },
  { value: 'fast-paced', icon: '⚡', label: 'Fast-Paced' },
];

const INTERESTS = [
  'Hiking', 'Photography', 'Food & Dining', 'Nightlife', 'History',
  'Museums', 'Beach', 'Adventure Sports', 'Shopping', 'Nature',
  'Camping', 'Wildlife', 'Architecture', 'Surfing', 'Cycling',
  'Trekking', 'Street Food', 'Road Trips', 'Music Festivals', 'Art',
];

export default function Explore() {
  const { user } = useContext(AuthContext);
  const hasPhoto = !!user?.avatar;
  const [activeTab, setActiveTab] = useState('travelers');

  // Travelers tab state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(null);
  const [filters, setFilters] = useState({
    travelStyle: '',
    budget: '',
    travelPace: '',
    interest: '',
  });
  const [search, setSearch] = useState('');
  const [sentIds, setSentIds] = useState(new Set());
  const [viewingProfile, setViewingProfile] = useState(null);
  const sentinelRef = useRef(null);

  // Trips Near Me tab state
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsPage, setTripsPage] = useState(1);
  const [tripsHasMore, setTripsHasMore] = useState(true);
  const [tripsLoadingMore, setTripsLoadingMore] = useState(false);
  const [userTripsCount, setUserTripsCount] = useState(0);
  const tripsSentinelRef = useRef(null);

  // Fetch users for travelers tab
  const fetchUsers = useCallback(async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const params = { page: pageNum, limit: PAGE_SIZE };
      if (filters.travelStyle) params.travelStyle = filters.travelStyle;
      if (filters.budget) params.budget = filters.budget;
      if (filters.travelPace) params.travelPace = filters.travelPace;
      if (filters.interest) params.interest = filters.interest;

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

  // Fetch trips for Trips Near Me tab
  const fetchTrips = useCallback(async (pageNum, append = false) => {
    try {
      if (append) setTripsLoadingMore(true);
      else setTripsLoading(true);

      const data = await tripApi.getDiscover({ page: pageNum, limit: PAGE_SIZE });
      const newTrips = data || [];

      if (append) {
        setTrips(prev => [...prev, ...newTrips]);
      } else {
        setTrips(newTrips);
      }
      setTripsHasMore(newTrips.length >= PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      setTripsLoading(false);
      setTripsLoadingMore(false);
    }
  }, []);

  // Fetch user's own trip count to show correct empty state
  useEffect(() => {
    const fetchUserTripCount = async () => {
      try {
        const myTrips = await tripApi.getUserTrips();
        const activeTrips = (myTrips || []).filter(t => t.status === 'active');
        setUserTripsCount(activeTrips.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserTripCount();
  }, []);

  useEffect(() => {
    if (activeTab === 'travelers') {
      setPage(1);
      setHasMore(true);
      fetchUsers(1, false);
    } else {
      setTripsPage(1);
      setTripsHasMore(true);
      fetchTrips(1, false);
    }
  }, [activeTab, fetchUsers, fetchTrips]);

  // Infinite scroll for travelers
  useEffect(() => {
    if (activeTab !== 'travelers' || !hasMore || loading || loadingMore) return;
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
  }, [hasMore, loading, loadingMore, page, fetchUsers, activeTab]);

  // Infinite scroll for trips
  useEffect(() => {
    if (activeTab !== 'trips' || !tripsHasMore || tripsLoading || tripsLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && tripsHasMore && !tripsLoading && !tripsLoadingMore) {
          const nextPage = tripsPage + 1;
          setTripsPage(nextPage);
          fetchTrips(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    const sentinel = tripsSentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => { if (sentinel) observer.unobserve(sentinel); };
  }, [tripsHasMore, tripsLoading, tripsLoadingMore, tripsPage, fetchTrips, activeTab]);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatBudget = (b) => {
    return BUDGET_OPTIONS.find(opt => opt.value === b)?.label || b;
  };

  const formatPace = (p) => {
    return TRAVEL_PACE_OPTIONS.find(opt => opt.value === p)?.label || p;
  };

  const formatStyle = (s) => {
    return TRAVEL_STYLES.find(opt => opt.value === s);
  };

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h2 className="explore-title">Discover</h2>
        <p className="explore-subtitle">Find travelers and trips</p>
      </div>

      {/* Tabs */}
      <div className="explore-tabs">
        <button
          className={`explore-tab ${activeTab === 'travelers' ? 'active' : ''}`}
          onClick={() => setActiveTab('travelers')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Explore Travelers
        </button>
        <button
          className={`explore-tab ${activeTab === 'trips' ? 'active' : ''}`}
          onClick={() => setActiveTab('trips')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
          Trips Near Me
        </button>
      </div>

      {/* Travelers Tab */}
      {activeTab === 'travelers' && (
        <>
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
              <label className="explore-filter-label">Budget</label>
              <div className="explore-chip-row">
                <button
                  className={`explore-chip ${!filters.budget ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, budget: '' })}
                >
                  All
                </button>
                {BUDGET_OPTIONS.map(b => (
                  <button
                    key={b.value}
                    className={`explore-chip ${filters.budget === b.value ? 'active' : ''}`}
                    onClick={() => setFilters({ ...filters, budget: filters.budget === b.value ? '' : b.value })}
                  >
                    {b.icon} {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="explore-filter-group">
              <label className="explore-filter-label">Travel Pace</label>
              <div className="explore-chip-row">
                <button
                  className={`explore-chip ${!filters.travelPace ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, travelPace: '' })}
                >
                  All
                </button>
                {TRAVEL_PACE_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    className={`explore-chip ${filters.travelPace === p.value ? 'active' : ''}`}
                    onClick={() => setFilters({ ...filters, travelPace: filters.travelPace === p.value ? '' : p.value })}
                  >
                    {p.icon} {p.label}
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
              <div className="explore-grid explore-grid--people">
                {filtered.map(u => {
                  const style = formatStyle(u.travelStyle);
                  return (
                    <div key={u._id} className="explore-card explore-card--person">
                      <div className="explore-card-photo" onClick={() => setViewingProfile(u)} style={{ cursor: 'pointer' }}>
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} />
                        ) : (
                          <div className="explore-card-avatar-fallback">
                            {getInitials(u.name)}
                          </div>
                        )}
                      </div>

                      <div className="explore-card-body">
                        <div className="explore-card-name-row">
                          <h3 className="explore-card-name">{u.name}{u.age ? `, ${u.age}` : ''}</h3>
                        </div>
                        {u.nationality && (
                          <p className="explore-card-location">{u.nationality}</p>
                        )}

                        <div className="explore-card-score">
                          <span className="explore-score-value">{u.compatibility}%</span>
                          <span className="explore-score-label">
                            {u.scoreType === 'trip' ? 'Trip Match' : 'Profile Match'}
                          </span>
                        </div>

                        <div className="explore-card-tags">
                          {style && (
                            <span className="explore-tag">{style.icon} {style.label}</span>
                          )}
                          {u.budget && (
                            <span className="explore-tag">{formatBudget(u.budget)}</span>
                          )}
                          {u.travelPace && (
                            <span className="explore-tag">{formatPace(u.travelPace)}</span>
                          )}
                        </div>

                        {u.sharedInterests?.length > 0 && (
                          <div className="explore-card-shared">
                            {u.sharedInterests.slice(0, 3).map(i => (
                              <span key={i} className="explore-shared-chip">{i}</span>
                            ))}
                            {u.sharedInterests.length > 3 && (
                              <span className="explore-shared-chip">+{u.sharedInterests.length - 3}</span>
                            )}
                          </div>
                        )}

                        {u.prompts?.idealTrip && (
                          <p className="explore-card-prompt">"{u.prompts.idealTrip}"</p>
                        )}

                        <div className="explore-card-actions">
                          <button
                            className="explore-btn-view"
                            onClick={() => setViewingProfile(u)}
                          >
                            View Profile
                          </button>
                          <button
                            className={`explore-btn-connect ${sentIds.has(u._id) ? 'sent' : ''}`}
                            onClick={() => hasPhoto ? handleConnect(u._id) : null}
                            disabled={!hasPhoto || sentIds.has(u._id) || sending === u._id}
                            style={!hasPhoto ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            {sending === u._id ? 'Sending...' : sentIds.has(u._id) ? 'Sent' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div ref={sentinelRef} className="explore-sentinel">
                {loadingMore && <div className="dash-spinner" />}
                {!hasMore && filtered.length > 0 && (
                  <p className="explore-end-text">You've seen all travelers</p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Trips Near Me Tab */}
      {activeTab === 'trips' && (
        <>
          {tripsLoading ? (
            <div className="explore-loading">
              <div className="dash-spinner" />
            </div>
          ) : trips.length === 0 ? (
            <div className="explore-empty">
              <div className="explore-empty-icon">✈️</div>
              {userTripsCount > 0 ? (
                <>
                  <h3>No trips near you</h3>
                  <p>No other travelers have trips that match yours yet. Check back later or explore travelers directly!</p>
                </>
              ) : (
                <>
                  <h3>No trips yet</h3>
                  <p>Create a trip to start matching with travel buddies!</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="explore-grid explore-grid--trips">
                {trips.map(trip => {
                  const style = formatStyle(trip.user?.travelStyle);
                  return (
                    <div key={trip._id} className="explore-card explore-card--trip">
                      <div className="explore-card-dest">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {trip.destination}
                      </div>

                      <div className="explore-card-dates">
                        {trip.tripType === 'immediate' ? 'Today' : `${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}`}
                      </div>

                      {trip.activities?.length > 0 && (
                        <div className="explore-card-trip-activities">
                          {trip.activities.slice(0, 3).map(a => (
                            <span key={a} className="explore-trip-activity-chip">{a}</span>
                          ))}
                          {trip.activities.length > 3 && (
                            <span className="explore-trip-activity-chip">+{trip.activities.length - 3}</span>
                          )}
                        </div>
                      )}

                      {trip.budget && (
                        <div className="explore-card-trip-budget">
                          {formatBudget(trip.budget)}
                        </div>
                      )}

                      {trip.user && (
                        <div className="explore-card-trip-user">
                          <div className="explore-trip-user-avatar">
                            {trip.user.avatar ? (
                              <img src={trip.user.avatar} alt={trip.user.name} />
                            ) : (
                              <span>{getInitials(trip.user.name)}</span>
                            )}
                          </div>
                          <div>
                            <div className="explore-trip-user-name">{trip.user.name}</div>
                            <div className="explore-trip-user-looking">{trip.lookingFor === 'travel-buddies' ? 'Looking for buddies' : trip.lookingFor === 'local-guide' ? 'Looking for local guide' : 'Open to anyone'}</div>
                          </div>
                        </div>
                      )}

                      <div className="explore-card-actions">
                        <button
                          className="explore-btn-connect"
                          onClick={() => hasPhoto ? handleConnect(trip.user?._id) : null}
                          disabled={!hasPhoto || sentIds.has(trip.user?._id) || sending === trip.user?._id}
                          style={!hasPhoto ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          {sending === trip.user?._id ? 'Sending...' : sentIds.has(trip.user?._id) ? 'Sent' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div ref={tripsSentinelRef} className="explore-sentinel">
                {tripsLoadingMore && <div className="dash-spinner" />}
                {!tripsHasMore && trips.length > 0 && (
                  <p className="explore-end-text">No more trips</p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {viewingProfile && (
        <ProfileModal user={viewingProfile} onClose={() => setViewingProfile(null)} isOtherUser={true} />
      )}
    </div>
  );
}
