import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { reviewApi, matchApi, tripApi } from '../services/api';

const StarRating = ({ rating, onRate, interactive = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`review-star ${star <= (hover || rating) ? 'filled' : ''}`}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default function ReviewsPanel() {
  const { user } = useContext(AuthContext);
  const myId = user.id || user._id;

  const [tab, setTab] = useState('received');
  const [reviews, setReviews] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [connections, setConnections] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [form, setForm] = useState({ revieweeId: '', tripId: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [myId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getUserReviews(myId);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = async () => {
    setShowForm(true);
    setError(null);
    setSuccess(null);
    try {
      const [conns, trips] = await Promise.all([
        matchApi.getConnections(),
        tripApi.getUserTrips(),
      ]);
      setConnections(conns);
      setMyTrips(trips);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!form.revieweeId || !form.tripId) {
      setError('Please select a person and a trip');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await reviewApi.create(form.revieweeId, form.tripId, form.rating, form.comment);
      setSuccess('Review submitted!');
      setShowForm(false);
      setForm({ revieweeId: '', tripId: '', rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewApi.delete(reviewId);
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherUserFromMatch = (match) => {
    if (!match.user1 || !match.user2) return null;
    return match.user1._id === myId ? match.user2 : match.user1;
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dash-panel">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">Reviews</h2>
        </div>
        <div className="dash-loading-inline"><div className="dash-spinner" /></div>
      </div>
    );
  }

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <h2 className="dash-panel-title">Reviews</h2>
        <button className="dash-panel-action" onClick={openForm}>+ Write Review</button>
      </div>

      {/* Stats */}
      <div className="review-stats">
        <div className="review-stat-main">
          <span className="review-stat-number">{reviews.averageRating || '—'}</span>
          <StarRating rating={Math.round(reviews.averageRating)} />
          <span className="review-stat-count">{reviews.totalReviews} review{reviews.totalReviews !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="review-tabs">
        <button className={`review-tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>Received</button>
        <button className={`review-tab ${tab === 'given' ? 'active' : ''}`} onClick={() => setTab('given')}>Given</button>
      </div>

      {/* Success message */}
      {success && <div className="review-success">{success}</div>}

      {/* Review Form Modal */}
      {showForm && (
        <div className="review-form-overlay" onClick={() => setShowForm(false)}>
          <div className="review-form-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="review-form-title">Write a Review</h3>
            {error && <div className="review-form-error">{error}</div>}

            <div className="review-field">
              <label className="review-label">Who are you reviewing?</label>
              <select
                className="review-select"
                value={form.revieweeId}
                onChange={(e) => setForm({ ...form, revieweeId: e.target.value })}
              >
                <option value="">Select a travel buddy</option>
                {connections.map((match) => {
                  const other = getOtherUserFromMatch(match);
                  if (!other) return null;
                  return (
                    <option key={other._id} value={other._id}>
                      {other.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="review-field">
              <label className="review-label">Which trip?</label>
              <select
                className="review-select"
                value={form.tripId}
                onChange={(e) => setForm({ ...form, tripId: e.target.value })}
              >
                <option value="">Select a trip</option>
                {myTrips.map((trip) => (
                  <option key={trip._id} value={trip._id}>
                    {trip.destination} — {formatDate(trip.startDate)}
                  </option>
                ))}
              </select>
            </div>

            <div className="review-field">
              <label className="review-label">Rating</label>
              <StarRating rating={form.rating} onRate={(r) => setForm({ ...form, rating: r })} interactive />
            </div>

            <div className="review-field">
              <label className="review-label">Comment <span className="review-optional">(optional)</span></label>
              <textarea
                className="review-textarea"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="How was your experience traveling with them?"
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="review-form-actions">
              <button className="review-cancel-btn" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</button>
              <button className="review-submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="review-list">
        {reviews.reviews.length === 0 ? (
          <div className="dash-empty-state">
            <div className="dash-empty-icon">⭐</div>
            <h3 className="dash-empty-title">No reviews yet</h3>
            <p className="dash-empty-desc">
              {tab === 'received'
                ? 'Complete a trip with a travel buddy to get reviews!'
                : 'Write a review for someone you traveled with!'}
            </p>
          </div>
        ) : (
          reviews.reviews
            .filter((r) => tab === 'received' ? r.reviewee._id === myId : r.reviewer._id === myId)
            .map((review) => {
              const reviewer = review.reviewer;
              const isMine = review.reviewer._id === myId;
              return (
                <div key={review._id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-card-avatar">
                      {reviewer.avatar ? (
                        <img src={reviewer.avatar} alt="" />
                      ) : (
                        <span>{getInitials(reviewer.name)}</span>
                      )}
                    </div>
                    <div className="review-card-info">
                      <span className="review-card-name">{isMine ? 'You' : reviewer.name}</span>
                      <span className="review-card-date">{formatDate(review.createdAt)}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    {isMine && (
                      <button className="review-delete-btn" onClick={() => handleDelete(review._id)} title="Delete review">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {review.trip && (
                    <div className="review-card-trip">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                      </svg>
                      {review.trip.destination}
                    </div>
                  )}
                  {review.comment && <p className="review-card-comment">{review.comment}</p>}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
