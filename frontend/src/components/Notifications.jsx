import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { matchApi, messageApi } from '../services/api';

export default function Notifications({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const myId = user.id || user._id;
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMatchCount = useRef(0);
  const prevUnreadCount = useRef(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkNotifications = async () => {
    try {
      const [matches, unread] = await Promise.all([
        matchApi.getMy(),
        messageApi.getUnreadCount(),
      ]);

      const newNotifs = [];

      // Check for new pending requests (someone connected with me)
      const pendingForMe = matches.filter(
        (m) => m.status === 'pending' && m.user2._id === myId
      );
      if (prevMatchCount.current > 0 && pendingForMe.length > prevMatchCount.current) {
        const diff = pendingForMe.length - prevMatchCount.current;
        for (let i = 0; i < diff; i++) {
          const m = pendingForMe[i];
          if (m) {
            const other = m.user1._id === myId ? m.user2 : m.user1;
            newNotifs.push({
              id: `match-${m._id}`,
              type: 'match',
              text: `${other.name} wants to connect with you!`,
              time: m.createdAt,
              read: false,
            });
          }
        }
      }
      prevMatchCount.current = pendingForMe.length;

      // Check for unread messages
      const currentUnread = unread.unreadCount || 0;
      if (prevUnreadCount.current > 0 && currentUnread > prevUnreadCount.current) {
        const diff = currentUnread - prevUnreadCount.current;
        newNotifs.push({
          id: `msg-${Date.now()}`,
          type: 'message',
          text: `You have ${diff} new message${diff > 1 ? 's' : ''}`,
          time: new Date().toISOString(),
          read: false,
        });
      }
      prevUnreadCount.current = currentUnread;

      setUnreadCount(currentUnread);

      if (newNotifs.length > 0) {
        setNotifications((prev) => [...newNotifs, ...prev].slice(0, 20));
      }
    } catch (err) {
      // silently fail
    }
  };

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

  const totalUnread = notifications.filter((n) => !n.read).length;

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button className="dash-topbar-btn notif-bell" onClick={() => setOpen(!open)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {totalUnread > 0 && <span className="notif-badge">{totalUnread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <h3>Notifications</h3>
            {totalUnread > 0 && (
              <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>
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
                    <p className="notif-text">{notif.text}</p>
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
