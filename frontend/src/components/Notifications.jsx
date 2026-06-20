import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { matchApi, messageApi } from '../services/api';

export default function Notifications({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const { socket } = useSocket();
  const myId = user.id || user._id;
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const unread = await messageApi.getUnreadCount();
        setUnreadCount(unread.unreadCount || 0);
      } catch (err) {
        // silently fail
      }
    };
    fetchInitial();
  }, []);

  // Socket listeners for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewMatch = ({ match }) => {
      const other = match.user1._id === myId ? match.user2 : match.user1;
      setNotifications((prev) => [{
        id: `match-${match._id}`,
        type: 'match',
        text: `${other.name} wants to connect with you!`,
        time: match.createdAt,
        read: false,
      }, ...prev].slice(0, 20));
    };

    const handleMatchAccepted = ({ match }) => {
      const other = match.user1._id === myId ? match.user2 : match.user1;
      setNotifications((prev) => [{
        id: `accepted-${match._id}`,
        type: 'match',
        text: `${other.name} accepted your connection!`,
        time: new Date().toISOString(),
        read: false,
      }, ...prev].slice(0, 20));
    };

    const handleMatchDeclined = ({ matchId }) => {
      setNotifications((prev) => [{
        id: `declined-${matchId}`,
        type: 'match',
        text: 'A connection request was removed',
        time: new Date().toISOString(),
        read: false,
      }, ...prev].slice(0, 20));
    };

    const handleMessageReceived = ({ matchId, message } = {}) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => {
        const now = Date.now();
        // Check if the most recent notification is a message within 5 minutes
        if (
          prev.length > 0 &&
          prev[0].type === 'message' &&
          !prev[0].read &&
          now - new Date(prev[0].time).getTime() < 5 * 60 * 1000
        ) {
          const updated = { ...prev[0], count: (prev[0].count || 1) + 1 };
          return [updated, ...prev.slice(1)].slice(0, 20);
        }
        return [{
          id: `msg-${Date.now()}`,
          type: 'message',
          text: 'You have a new message',
          time: new Date().toISOString(),
          read: false,
          count: 1,
        }, ...prev].slice(0, 20);
      });
    };

    socket.on('match:new', handleNewMatch);
    socket.on('match:accepted', handleMatchAccepted);
    socket.on('match:declined', handleMatchDeclined);
    socket.on('message:receive', handleMessageReceived);
    socket.on('message:notification', handleMessageReceived);

    return () => {
      socket.off('match:new', handleNewMatch);
      socket.off('match:accepted', handleMatchAccepted);
      socket.off('match:declined', handleMatchDeclined);
      socket.off('message:receive', handleMessageReceived);
      socket.off('message:notification', handleMessageReceived);
    };
  }, [socket, myId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (notif) => {
    if (notif.type === 'match') {
      onNavigate?.('matches');
    } else if (notif.type === 'message') {
      onNavigate?.('messages');
    }
    setOpen(false);
  };

  const totalUnread = notifications.reduce((sum, n) => sum + (!n.read ? (n.count || 1) : 0), 0);

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button className="dash-topbar-btn notif-bell" onClick={() => setOpen(!open)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="notif-mark-read" onClick={() => { markAllRead(); setUnreadCount(0); }}>Mark all read</button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <span>🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  className={`notif-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleClick(notif)}
                >
                  <div className={`notif-icon notif-icon--${notif.type}`}>
                    {notif.type === 'match' ? '🤝' : '💬'}
                  </div>
                  <div className="notif-content">
                    <p className="notif-text">
                      {notif.type === 'message' && notif.count > 1
                        ? `You have ${notif.count} new messages`
                        : notif.text}
                    </p>
                    <span className="notif-time">{formatTime(notif.time)}</span>
                  </div>
                  {!notif.read && <div className="notif-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
