import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import '../styles/auth.css';

const TRAVEL_STYLES = {
  'budget': { icon: '🎒', label: 'Budget' },
  'mid-range': { icon: '🏨', label: 'Mid-Range' },
  'luxury': { icon: '✨', label: 'Luxury' },
  'backpacker': { icon: '🗺️', label: 'Backpacker' },
  'family-friendly': { icon: '👨‍👩‍👧‍👦', label: 'Family' },
};

const labelStyle = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--label-color)',
  fontWeight: '700',
  marginBottom: '6px',
};

const valueStyle = {
  padding: '12px 16px',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: '12px',
  fontSize: '14px',
  color: 'var(--ink)',
  fontWeight: '500',
  lineHeight: '1.5',
};

const chipStyle = {
  padding: '6px 14px',
  borderRadius: '20px',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  fontSize: '13px',
  fontWeight: '500',
  color: 'var(--ink)',
};

export default function Profile() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, loading, logout } = useContext(AuthContext);
  const cardRef = useRef(null);
  const stageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;

      const layers = stageRef.current?.querySelectorAll('[data-depth]');
      layers?.forEach((el) => {
        const depth = parseFloat(el.getAttribute('data-depth'));
        el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });

      if (cardRef.current) {
        cardRef.current.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = () => {
    navigate('/profile-setup');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="stage" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--ink)', fontSize: '24px' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const travel = user.travelStyle ? TRAVEL_STYLES[user.travelStyle] : null;

  return (
    <div className="stage" ref={stageRef}>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
        {theme === 'light' ? (
          <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
          </svg>
        ) : (
          <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.6A9 9 0 1 1 11.4 3a7 7 0 0 0 9.6 9.6Z" />
          </svg>
        )}
      </button>

      <div className="sky-layer">
        <div className="blob blob1" data-depth="20"></div>
        <div className="blob blob2" data-depth="35"></div>
        <div className="blob blob3" data-depth="15"></div>
        <div className="blob blob4" data-depth="28"></div>
        <div className="cloud cloud--a" data-depth="45">
          <svg viewBox="0 0 140 60" fill="none">
            <path d="M20 45C8 45 2 36 8 28C4 18 16 10 26 14C30 4 48 2 56 12C68 6 84 12 84 24C96 22 106 30 102 40C108 48 100 56 90 54L24 54C14 54 10 50 20 45Z" opacity="0.55" />
          </svg>
        </div>
        <div className="cloud cloud--b" data-depth="55">
          <svg viewBox="0 0 140 60" fill="none">
            <path d="M20 45C8 45 2 36 8 28C4 18 16 10 26 14C30 4 48 2 56 12C68 6 84 12 84 24C96 22 106 30 102 40C108 48 100 56 90 54L24 54C14 54 10 50 20 45Z" opacity="0.4" />
          </svg>
        </div>
        <div className="cloud cloud--c" data-depth="40">
          <svg viewBox="0 0 140 60" fill="none">
            <path d="M20 45C8 45 2 36 8 28C4 18 16 10 26 14C30 4 48 2 56 12C68 6 84 12 84 24C96 22 106 30 102 40C108 48 100 56 90 54L24 54C14 54 10 50 20 45Z" opacity="0.5" />
          </svg>
        </div>
      </div>

      <div className="left" style={{ justifyContent: 'center' }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--ink-soft)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '20px',
            padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--teal-deep)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--ink-soft)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="brand" style={{ marginBottom: '24px' }}>
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5z" fill="white" />
            </svg>
          </div>
          <div className="brand-name">WireUs</div>
        </div>
        <h1 className="headline" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
          Welcome back,<br />
          <span className="hl">{user.name}</span>
        </h1>
        <p className="sub" style={{ maxWidth: '400px' }}>
          Your travel profile at a glance. Edit your details to get better matches with fellow travelers.
        </p>
      </div>

      <div className="right">
        <div className="card" ref={cardRef} style={{ padding: '40px 32px', maxWidth: '460px' }}>
          <div className="card-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Your Profile</div>
          <div className="card-sub" style={{ marginBottom: '28px' }}>Travel companion details</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', marginBottom: '28px' }}>
            {/* Name & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <div style={labelStyle}>Name</div>
                <div style={valueStyle}>{user.name}</div>
              </div>
              <div>
                <div style={labelStyle}>Email</div>
                <div style={{ ...valueStyle, fontSize: '13px', wordBreak: 'break-all' }}>{user.email}</div>
              </div>
            </div>

            {/* Age & Nationality */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <div style={labelStyle}>Age</div>
                <div style={valueStyle}>{user.age || '—'}</div>
              </div>
              <div>
                <div style={labelStyle}>Nationality</div>
                <div style={valueStyle}>{user.nationality || '—'}</div>
              </div>
            </div>

            {/* Travel Style */}
            {travel && (
              <div>
                <div style={labelStyle}>Travel Style</div>
                <div style={{
                  ...valueStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <span style={{ fontSize: '20px' }}>{travel.icon}</span>
                  <span>{travel.label}</span>
                </div>
              </div>
            )}

            {/* Languages */}
            {user.languages && user.languages.length > 0 && (
              <div>
                <div style={labelStyle}>Languages</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {user.languages.map((lang) => (
                    <span key={lang} style={chipStyle}>{lang}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div>
                <div style={labelStyle}>Interests</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {user.interests.map((interest) => (
                    <span key={interest} style={chipStyle}>{interest}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <div>
                <div style={labelStyle}>Bio</div>
                <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{user.bio}</div>
              </div>
            )}

            {/* Profile incomplete hint */}
            {!user.profileComplete && (
              <div style={{
                padding: '14px 16px',
                background: 'rgba(14, 124, 119, 0.08)',
                border: '1px solid rgba(14, 124, 119, 0.2)',
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--ink-soft)',
                lineHeight: '1.5',
              }}>
                Your profile is incomplete. Complete it to get better travel matches.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!user.profileComplete && (
              <button
                onClick={handleEdit}
                className="signin-btn"
                style={{ flex: 1, marginTop: 0 }}
              >
                <span className="shine"></span>
                Complete Profile
              </button>
            )}
            <button
              onClick={handleLogout}
              className="signin-btn"
              style={{
                flex: 1,
                marginTop: 0,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.3)',
              }}
            >
              <span className="shine"></span>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
