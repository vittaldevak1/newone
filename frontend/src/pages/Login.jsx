import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import "../styles/auth.css";

export default function Login() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { login, loginWithGoogle, loading, error, setError } = useContext(AuthContext);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const cardRef = useRef(null);
  const stageRef = useRef(null);
  const navigate = useNavigate();

  // Reset errors on mount
  useEffect(() => {
    setError(null);
  }, []);

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;

      // Move blobs and clouds
      const layers = stageRef.current?.querySelectorAll('[data-depth]');
      layers?.forEach((el) => {
        const depth = parseFloat(el.getAttribute('data-depth'));
        el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });

      // Move card
      if (cardRef.current) {
        cardRef.current.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password);
      navigate(userData.profileComplete ? '/dashboard' : '/profile-setup');
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const userData = await loginWithGoogle(codeResponse.access_token);
        navigate(userData.profileComplete ? '/dashboard' : '/profile-setup');
      } catch (err) {
        // Error handled by AuthContext
      }
    },
    onError: () => setError('Google login failed'),
    flow: 'implicit',
  });

  return (
    <div className="stage" ref={stageRef}>
      {/* Theme Toggle */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? (
          <svg
            className="icon-sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
          </svg>
        ) : (
          <svg
            className="icon-moon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.6A9 9 0 1 1 11.4 3a7 7 0 0 0 9.6 9.6Z" />
          </svg>
        )}
      </button>

      {/* Parallax Background */}
      <div className="sky-layer">
        <div className="blob blob1" data-depth="20"></div>
        <div className="blob blob2" data-depth="35"></div>
        <div className="blob blob3" data-depth="15"></div>
        <div className="blob blob4" data-depth="28"></div>

        <div className="cloud cloud--a" data-depth="45">
          <svg viewBox="0 0 140 60" fill="none">
            <path
              d="M20 45C8 45 2 36 8 28C4 18 16 10 26 14C30 4 48 2 56 12C68 6 84 12 84 24C96 22 106 30 102 40C108 48 100 56 90 54L24 54C14 54 10 50 20 45Z"
              opacity="0.55"
            />
          </svg>
        </div>
        <div className="cloud cloud--b" data-depth="55">
          <svg viewBox="0 0 140 60" fill="none">
            <path
              d="M20 45C8 45 2 36 8 28C4 18 16 10 26 14C30 4 48 2 56 12C68 6 84 12 84 24C96 22 106 30 102 40C108 48 100 56 90 54L24 54C14 54 10 50 20 45Z"
              opacity="0.4"
            />
          </svg>
        </div>
        <div className="cloud cloud--c" data-depth="40">
          <svg viewBox="0 0 140 60" fill="none">
            <path
              d="M20 45C8 45 2 36 8 28C4 18 16 10 26 14C30 4 48 2 56 12C68 6 84 12 84 24C96 22 106 30 102 40C108 48 100 56 90 54L24 54C14 54 10 50 20 45Z"
              opacity="0.5"
            />
          </svg>
        </div>
        <div className="cloud cloud--d" data-depth="60">
          <svg viewBox="0 0 140 60" fill="none">
            <path
              d="M20 45C8 45 2 36 8 28C4 18 16 10 26 14C30 4 48 2 56 12C68 6 84 12 84 24C96 22 106 30 102 40C108 48 100 56 90 54L24 54C14 54 10 50 20 45Z"
              opacity="0.35"
            />
          </svg>
        </div>

        <div className="plane" data-depth="70">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      </div>

      {/* Left Panel */}
      <div className="left">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5z"
                fill="white"
              />
            </svg>
          </div>
          <div className="brand-name">WireUs</div>
        </div>

        <h1 className="headline">
          Travel together,<br />
          <span className="hl">connect forever</span>
        </h1>
        <p className="sub">
          Find travel companions, connect with families, and create unforgettable experiences — together.
        </p>

        <div className="pills">
          <div className="pill">
            <div className="pill-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div className="pill-text">Safe, verified community</div>
          </div>
          <div className="pill">
            <div className="pill-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>
            <div className="pill-text">Matched by shared interests</div>
          </div>
          <div className="pill">
            <div className="pill-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11l18-7-7 18-3-8-8-3Z" />
              </svg>
            </div>
            <div className="pill-text">Built for family travel</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="right">
        <div className="card" ref={cardRef}>
          <div className="card-title">Welcome back</div>
          <div className="card-sub">Sign in to continue your journey</div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <input
                type="email"
                placeholder=" "
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <label>Email</label>
            </div>

            <div className="field field--password">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder=" "
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <label>Password</label>
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setPasswordVisible(!passwordVisible)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {passwordVisible ? (
                  <svg
                    className="eye-off"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18M10.6 5.1A11 11 0 0 1 12 5c7 0 10.5 7 10.5 7a13.2 13.2 0 0 1-2.6 3.4M6.3 6.9C3.4 8.8 1.5 12 1.5 12S5 19 12 19a10.4 10.4 0 0 0 4.2-.9M9.5 9.6a3 3 0 0 0 4.2 4.2" />
                  </svg>
                ) : (
                  <svg
                    className="eye-on"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" className="signin-btn" disabled={loading}>
              <span className="shine"></span>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {error && (
            <div
              style={{
                color: '#ff6b6b',
                fontSize: '14px',
                textAlign: 'center',
                marginTop: '12px',
              }}
            >
              {error}
            </div>
          )}

          <div className="divider">
            <span>or</span>
          </div>

          <button
            className="google-btn"
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            type="button"
          >
            <svg viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 12.4 4.5 3 13.9 3 25.5S12.4 46.5 24 46.5 45 37.1 45 25.5c0-1.4-.1-2.7-.4-4z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5c-7.6 0-14.1 4.3-17.7 10.2z"
              />
              <path
                fill="#4CAF50"
                d="M24 46.5c5.4 0 10.3-1.9 14.1-5.1l-6.5-5.5C29.6 37.5 26.9 38.5 24 38.5c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.9 42.2 16.4 46.5 24 46.5z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.8l6.5 5.5C41.5 36 45 31.2 45 25.5c0-1.4-.1-2.7-.4-4z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="footer-link">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
