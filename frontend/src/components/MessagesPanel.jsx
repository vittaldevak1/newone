import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { matchApi, messageApi } from '../services/api';
import EmojiPicker from './EmojiPicker';
import GifPicker from './GifPicker';
import StickerPicker from './StickerPicker';
import '../styles/dashboard.css';
import '../styles/chat.css';

const SELF_CONVO = { _id: 'self', type: 'self' };

export default function MessagesPanel() {
  const { user } = useContext(AuthContext);
  const { socket, isUserOnline } = useSocket();
  const myId = user.id || user._id;

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevMatchId = useRef(null);

  const isSelf = activeConvo?._id === 'self';

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await matchApi.getConnections();
        setConversations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when conversation opens (initial load only)
  useEffect(() => {
    if (!activeConvo || isSelf) return;

    const fetchMessages = async () => {
      try {
        const data = messageApi.getForMatch ? await messageApi.getForMatch(activeConvo._id) : [];
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [activeConvo, isSelf]);

  // Self-chat messages (initial load)
  useEffect(() => {
    if (!isSelf) return;
    const fetchMessages = async () => {
      try {
        const data = await messageApi.getSelfMessages();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeConvo, isSelf]);

  // Socket: join/leave match rooms, listen for messages & typing
  useEffect(() => {
    if (!socket) return;

    // Leave previous match room
    if (prevMatchId.current && !isSelf) {
      socket.emit('leave-match', { matchId: prevMatchId.current });
    }

    if (!activeConvo || isSelf) {
      prevMatchId.current = null;
      return;
    }

    const matchId = activeConvo._id;
    prevMatchId.current = matchId;

    // Join match room
    socket.emit('join-match', { matchId });

    // Listen for new messages in this match
    const handleMessage = ({ message, matchId: msgMatchId }) => {
      if (msgMatchId === matchId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    // Listen for typing
    const handleTypingStart = ({ matchId: typingMatchId, userId: typingUserId }) => {
      if (typingMatchId === matchId && typingUserId !== myId) {
        setOtherTyping(true);
      }
    };

    const handleTypingStop = ({ matchId: typingMatchId, userId: typingUserId }) => {
      if (typingMatchId === matchId && typingUserId !== myId) {
        setOtherTyping(false);
      }
    };

    socket.on('message:receive', handleMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:receive', handleMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.emit('leave-match', { matchId });
    };
  }, [activeConvo, socket, isSelf, myId]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherUser = (match) => {
    if (!match.user1 || !match.user2) return null;
    return match.user1._id === myId ? match.user2 : match.user1;
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const handleSend = async (content) => {
    if (!content.trim() || !activeConvo || sending) return;
    if (!user?.avatar) return;

    try {
      setSending(true);

      if (isSelf) {
        const msg = await messageApi.sendSelf(content.trim());
        setMessages((prev) => [...prev, msg]);
      } else if (socket) {
        // Send via socket
        socket.emit('message:send', { matchId: activeConvo._id, content: content.trim() });
        // Stop typing indicator
        socket.emit('typing:stop', { matchId: activeConvo._id });
      }

      setInput('');
      setShowEmoji(false);
      setShowGif(false);
      setShowSticker(false);
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Send typing indicator via socket
    if (!isSelf && activeConvo && socket) {
      socket.emit('typing:start', { matchId: activeConvo._id });

      // Auto-stop typing after 3 seconds of inactivity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { matchId: activeConvo._id });
      }, 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const shouldShowDate = (msg, index) => {
    if (index === 0) return true;
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();
    const curDate = new Date(msg.createdAt).toDateString();
    return prevDate !== curDate;
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const otherActive = isSelf ? null : (activeConvo ? getOtherUser(activeConvo) : null);

  const openSelfChat = () => {
    setActiveConvo(SELF_CONVO);
    setSearchOpen(false);
    setSearchQuery('');
    setShowEmoji(false);
    setShowGif(false);
    setShowSticker(false);
    setOtherTyping(false);
  };

  const openConvo = (match) => {
    setActiveConvo(match);
    setSearchOpen(false);
    setSearchQuery('');
    setShowEmoji(false);
    setShowGif(false);
    setShowSticker(false);
    setOtherTyping(false);
  };

  const renderMessage = (msg, i) => {
    if (!msg.sender) return null;
    const isGif = msg.content?.startsWith('https://') && (msg.content.includes('.gif') || msg.content.includes('giphy'));
    const isSticker = msg.content?.startsWith('sticker:');
    const stickerId = isSticker ? msg.content.replace('sticker:', '') : null;
    const senderId = msg.sender._id || msg.sender;
    const isMe = isSelf || senderId === myId || senderId.toString() === myId.toString();

    return (
      <div key={msg._id}>
        {shouldShowDate(msg, i) && (
          <div className="chat-date-divider">
            <span>{formatDate(msg.createdAt)}</span>
          </div>
        )}
        <div className={`chat-msg ${isMe ? 'mine' : 'theirs'}`}>
          {!isMe && (
            <div className="chat-msg-avatar">
              {msg.sender.avatar ? (
                <img src={msg.sender.avatar} alt="" />
              ) : (
                <span>{getInitials(msg.sender.name)}</span>
              )}
            </div>
          )}
          <div className="chat-msg-bubble">
            {isGif ? (
              <img src={msg.content} alt="GIF" className="chat-msg-gif" />
            ) : isSticker ? (
              <span className="chat-msg-sticker">{getStickerEmoji(stickerId)}</span>
            ) : (
              <span className="chat-msg-text">{msg.content}</span>
            )}
            <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="dash-spinner" />
      </div>
    );
  }

  return (
    <div className="chat-layout">
      {/* Conversations Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3 className="chat-sidebar-title">Messages</h3>
        </div>
        <div className="chat-convo-list">
          <button
            className={`chat-convo-item chat-convo-self ${isSelf ? 'active' : ''}`}
            onClick={openSelfChat}
          >
            <div className="chat-convo-avatar chat-convo-self-avatar">
              <span>{getInitials(user.name)}</span>
            </div>
            <div className="chat-convo-info">
              <span className="chat-convo-name">Message Yourself</span>
              <span className="chat-convo-preview">Your private notebook</span>
            </div>
          </button>

          {conversations.map(match => {
            const other = getOtherUser(match);
            if (!other) return null;
            const isActive = activeConvo?._id === match._id;
            const online = isUserOnline(other._id);
            return (
              <button
                key={match._id}
                className={`chat-convo-item ${isActive ? 'active' : ''}`}
                onClick={() => openConvo(match)}
              >
                <div className="chat-convo-avatar" style={{ position: 'relative' }}>
                  {other.avatar ? (
                    <img src={other.avatar} alt={other.name} />
                  ) : (
                    <span>{getInitials(other.name)}</span>
                  )}
                  {online && (
                    <span style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      border: '2px solid var(--card-bg)',
                    }} />
                  )}
                </div>
                <div className="chat-convo-info">
                  <span className="chat-convo-name">{other.name}</span>
                  <span className="chat-convo-preview">Tap to start chatting</span>
                </div>
              </button>
            );
          })}

          {conversations.length === 0 && (
            <div className="chat-empty-convo">
              <span>Accept a match to start chatting with others</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-main">
        {!activeConvo ? (
          <div className="chat-no-active">
            <div className="chat-no-active-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Pick a connection to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-avatar" style={{ position: 'relative' }}>
                {isSelf ? (
                  <span>{getInitials(user.name)}</span>
                ) : otherActive?.avatar ? (
                  <img src={otherActive.avatar} alt="" />
                ) : (
                  <span>{getInitials(otherActive?.name)}</span>
                )}
                {!isSelf && otherActive && isUserOnline(otherActive._id) && (
                  <span style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid var(--card-bg)',
                  }} />
                )}
              </div>
              <div className="chat-header-info">
                <span className="chat-header-name">
                  {isSelf ? 'Message Yourself' : otherActive?.name}
                </span>
                <span className="chat-header-status">
                  {otherTyping ? 'typing...' : isSelf ? 'Private notes' : (otherActive && isUserOnline(otherActive._id)) ? 'Online' : 'Connected'}
                </span>
              </div>
              {!isSelf && (
                <button
                  className={`chat-header-btn ${searchOpen ? 'active' : ''}`}
                  onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(''); }}
                  title="Search messages"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Bar */}
            {searchOpen && (
              <div className="chat-search-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="chat-search-input"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button className="chat-search-clear" onClick={() => setSearchQuery('')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
                <span className="chat-search-count">
                  {filteredMessages.length} of {messages.length}
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="chat-messages">
              {filteredMessages.length === 0 && (
                <div className="chat-empty-messages">
                  <p>{searchQuery ? 'No messages match your search' : (isSelf ? 'Write yourself a note! ✍️' : 'Say hello! 👋')}</p>
                </div>
              )}
              {filteredMessages.map((msg, i) => renderMessage(msg, i))}
              {otherTyping && !isSelf && (
                <div className="chat-typing-indicator">
                  <div className="chat-typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>
          </>
        )}

        {/* Pickers + Input */}
        {activeConvo && (
          <>
            {showEmoji && (
              <EmojiPicker
                onSelect={(emoji) => { setInput(prev => prev + emoji); inputRef.current?.focus(); }}
                onClose={() => setShowEmoji(false)}
              />
            )}
            {showGif && (
              <GifPicker
                onSelect={(gifUrl) => { handleSend(gifUrl); }}
                onClose={() => setShowGif(false)}
              />
            )}
            {showSticker && (
              <StickerPicker
                onSelect={(stickerId) => { handleSend('sticker:' + stickerId); }}
                onClose={() => setShowSticker(false)}
              />
            )}

            <form className="chat-input-bar" onSubmit={handleSubmit}>
              <div className="chat-input-actions-left">
                <button type="button" className={`chat-tool-btn ${showEmoji ? 'active' : ''}`} onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); setShowSticker(false); }} title="Emoji">
                  😊
                </button>
                <button type="button" className={`chat-tool-btn ${showGif ? 'active' : ''}`} onClick={() => { setShowGif(!showGif); setShowEmoji(false); setShowSticker(false); }} title="GIF">
                  GIF
                </button>
                <button type="button" className={`chat-tool-btn ${showSticker ? 'active' : ''}`} onClick={() => { setShowSticker(!showSticker); setShowEmoji(false); setShowGif(false); }} title="Stickers">
                  🎨
                </button>
              </div>
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={!user?.avatar ? "Upload a photo to chat..." : isSelf ? "Write a note to yourself..." : "Type a message..."}
                maxLength={2000}
                disabled={!isSelf && !user?.avatar}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!input.trim() || sending || (!isSelf && !user?.avatar)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function getStickerEmoji(id) {
  const stickers = {
    'wave': '👋', 'thumbsup': '👍', 'heart': '❤️', 'fire': '🔥', 'star': '⭐',
    'clap': '👏', 'party': '🎉', 'laugh': '😂', 'cool': '😎', 'thinking': '🤔',
    'hug': '🤗', 'peace': '✌️', 'pray': '🙏', 'rocket': '🚀', 'sparkles': '✨',
    'rainbow': '🌈', 'sun': '☀️', 'moon': '🌙', 'coffee': '☕', 'pizza': '🍕',
  };
  return stickers[id] || '⭐';
}
