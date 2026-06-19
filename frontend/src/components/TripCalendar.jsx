import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function TripCalendar({ trips }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTripsForDate = (date) => {
    return trips.filter(trip => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const d = new Date(date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });
  };

  const selectedTrips = selectedDate ? getTripsForDate(selectedDate) : [];

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  return (
    <div className="trip-calendar">
      <div className="trip-cal-header">
        <button className="trip-cal-nav" onClick={prevMonth}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h3 className="trip-cal-title">{MONTHS[month]} {year}</h3>
        <button className="trip-cal-nav" onClick={nextMonth}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="trip-cal-grid">
        {DAYS.map(day => (
          <div key={day} className="trip-cal-dayname">{day}</div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="trip-cal-day trip-cal-day--empty" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const dayTrips = getTripsForDate(date);
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const todayClass = isToday(date);
          const pastClass = isPast(date);

          return (
            <button
              key={day}
              className={`trip-cal-day ${todayClass ? 'trip-cal-day--today' : ''} ${isSelected ? 'trip-cal-day--selected' : ''} ${pastClass ? 'trip-cal-day--past' : ''} ${dayTrips.length > 0 ? 'trip-cal-day--has-trip' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="trip-cal-daynum">{day}</span>
              {dayTrips.length > 0 && (
                <div className="trip-cal-dots">
                  {dayTrips.slice(0, 3).map((trip, idx) => (
                    <span
                      key={idx}
                      className={`trip-cal-dot ${trip.tripType === 'immediate' ? 'trip-cal-dot--now' : ''}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="trip-cal-detail">
          <h4 className="trip-cal-detail-title">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h4>
          {selectedTrips.length === 0 ? (
            <p className="trip-cal-empty">No trips on this day</p>
          ) : (
            <div className="trip-cal-trips">
              {selectedTrips.map(trip => (
                <div key={trip._id} className={`trip-cal-trip-card ${trip.tripType === 'immediate' ? 'trip-cal-trip--now' : ''}`}>
                  <div className="trip-cal-trip-dest">{trip.destination}</div>
                  <div className="trip-cal-trip-meta">
                    {trip.tripType === 'immediate' ? (
                      <span className="trip-badge trip-badge--now">⚡ Going Now</span>
                    ) : (
                      <span>
                        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' — '}
                        {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {trip.activities && trip.activities.length > 0 && (
                    <div className="trip-cal-trip-activities">
                      {trip.activities.slice(0, 3).map(a => (
                        <span key={a} className="trip-cal-trip-activity">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
