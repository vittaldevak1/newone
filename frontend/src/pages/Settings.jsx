import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { PALETTES } from '../palettes';
import '../styles/dashboard.css';
import '../styles/auth.css';

const TRAVEL_STYLES = [
  { id: 'budget', icon: '🎒', label: 'Budget' },
  { id: 'mid-range', icon: '🏨', label: 'Mid-Range' },
  { id: 'luxury', icon: '✨', label: 'Luxury' },
  { id: 'backpacker', icon: '🗺️', label: 'Backpacker' },
  { id: 'family-friendly', icon: '👨‍👩‍👧‍👦', label: 'Family' },
];

const INTEREST_OPTIONS = [
  'Hiking', 'Photography', 'Food & Dining', 'Nightlife', 'History',
  'Museums', 'Beach', 'Adventure Sports', 'Shopping', 'Nature',
  'Cultural Exchanges', 'Music Festivals', 'Yoga & Wellness', 'Camping',
  'Wildlife', 'Architecture', 'Scuba Diving', 'Skiing', 'Art',
  'Coffee Culture', 'Wine Tasting', 'Surfing', 'Cycling', 'Trekking',
  'Street Food', 'Volunteering', 'Road Trips', 'Island Hopping',
  'Stargazing', 'Photography Walks',
];

const LANGUAGES = [
  'Abkhaz','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Aymara','Azerbaijani','Bambara','Bashkir','Basque','Belarusian','Bengali','Bihari','Bislama','Bosnian','Breton','Bulgarian','Burmese','Catalan','Chechen','Chichewa','Chinese','Chuvash','Cornish','Corsican','Croatian','Czech','Danish','Divehi','Dutch','Dzongkha','English','Esperanto','Estonian','Ewe','Faroese','Fijian','Finnish','French','Frisian','Fulah','Georgian','German','Greek','Guarani','Gujarati','Haitian','Hausa','Hebrew','Herero','Hindi','Hiri Motu','Hungarian','Icelandic','Ido','Igbo','Indonesian','Interlingua','Interlingue','Inuktitut','Inupiaq','Irish','Italian','Japanese','Javanese','Kalaallisut','Kannada','Kanuri','Kashmiri','Kazakh','Khmer','Kikuyu','Kinyarwanda','Kirghiz','Komi','Kongo','Korean','Kurdish','Kwanyama','Lao','Latin','Latvian','Limburgish','Lingala','Lithuanian','Luba-Katanga','Luxembourgish','Macedonian','Malagasy','Malay','Malayalam','Maltese','Manx','Maori','Marathi','Marshallese','Mongolian','Navajo','Ndonga','Nepali','Norwegian','Occitan','Ojibwe','Oriya','Oromo','Ossetian','Pali','Panjabi','Pashto','Persian','Polish','Portuguese','Quechua','Romanian','Romansh','Rundi','Russian','Samoan','Sango','Sanskrit','Sardinian','Serbian','Shona','Sindhi','Sinhala','Slovak','Slovenian','Somali','Southern Ndebele','Spanish','Sundanese','Swahili','Swati','Swedish','Tagalog','Tahitian','Tajik','Tamil','Tatar','Telugu','Thai','Tibetan','Tigrinya','Tonga','Tsonga','Tswana','Turkish','Turkmen','Twi','Ukrainian','Urdu','Uyghur','Uzbek','Venda','Vietnamese','Volapük','Walloon','Welsh','Western Frisian','Wolof','Xhosa','Yoruba','Zulu',
].slice().sort();

const LANGUAGES_INITIALS = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Mandarin', 'Hindi', 'Arabic', 'Russian',
  'Dutch', 'Thai', 'Vietnamese', 'Turkish', 'Greek', 'Swedish',
];

function LangDropdown({ languages, setLanguages }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => { setOpen(!open); setSearch(''); }}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1.5px solid var(--input-border)',
          background: 'var(--input-bg)',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        {languages.length > 0 ? (
          languages.map((l) => (
            <span key={l} style={{
              padding: '3px 10px',
              borderRadius: '14px',
              background: 'var(--accent)',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              {l}
              <span
                onClick={(e) => { e.stopPropagation(); setLanguages(languages.filter(x => x !== l)); }}
                style={{ cursor: 'pointer', fontSize: '13px', lineHeight: 1 }}
              >&times;</span>
            </span>
          ))
        ) : (
          <span style={{ color: 'var(--label-color)', fontSize: '13px' }}>Select languages</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--label-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '50px', left: 0, right: 0,
          background: 'var(--card-bg)', border: '1px solid var(--input-border)',
          borderRadius: '12px', boxShadow: '0 12px 32px var(--shadow-tint)',
          zIndex: 100, maxHeight: '260px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--input-border)' }}>
            <input type="text" placeholder="Search languages..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--ink)', fontSize: '13px', outline: 'none' }} />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {LANGUAGES.filter((l) => l.toLowerCase().includes(search.toLowerCase())).map((lang) => (
              <div key={lang}
                onClick={() => {
                  setLanguages(languages.includes(lang) ? languages.filter((l) => l !== lang) : [...languages, lang]);
                }}
                style={{
                  padding: '9px 14px', cursor: 'pointer', fontSize: '13px',
                  color: languages.includes(lang) ? 'var(--accent)' : 'var(--ink)',
                  background: languages.includes(lang) ? 'rgba(108, 92, 231, 0.08)' : 'transparent',
                  fontWeight: languages.includes(lang) ? '600' : '400',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!languages.includes(lang)) e.currentTarget.style.background = 'var(--input-bg)'; }}
                onMouseLeave={(e) => { if (!languages.includes(lang)) e.currentTarget.style.background = 'transparent'; }}
              >
                {languages.includes(lang) && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {lang}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const { theme, toggleTheme, palette, changePalette } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('account');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Account
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Travel preferences
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [languages, setLanguages] = useState(user?.languages || []);
  const [nationality, setNationality] = useState(user?.nationality || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Travel history
  const [visitedPlaces, setVisitedPlaces] = useState(user?.visitedPlaces || []);
  const [wishlist, setWishlist] = useState(user?.wishlist || []);
  const [newPlace, setNewPlace] = useState('');
  const [newWish, setNewWish] = useState('');

  // Privacy
  const [showAge, setShowAge] = useState(user?.privacy?.showAge ?? true);
  const [showNationality, setShowNationality] = useState(user?.privacy?.showNationality ?? true);
  const [allowMessages, setAllowMessages] = useState(user?.privacy?.allowMessages ?? true);

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleLanguage = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const addVisitedPlace = () => {
    if (newPlace.trim() && !visitedPlaces.includes(newPlace.trim())) {
      setVisitedPlaces([...visitedPlaces, newPlace.trim()]);
      setNewPlace('');
    }
  };

  const removeVisitedPlace = (p) => setVisitedPlaces(visitedPlaces.filter((x) => x !== p));

  const addWishlist = () => {
    if (newWish.trim() && !wishlist.includes(newWish.trim())) {
      setWishlist([...wishlist, newWish.trim()]);
      setNewWish('');
    }
  };

  const removeWishlist = (p) => setWishlist(wishlist.filter((x) => x !== p));

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 300;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = (h / w) * MAX; w = MAX; }
          else { w = (w / h) * MAX; h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setAvatar(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile({ name, email, avatar });
      setMsg({ type: 'success', text: 'Account updated!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile({ currentPassword, newPassword });
      setMsg({ type: 'success', text: 'Password updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile({ travelStyle, interests, languages, nationality, bio });
      setMsg({ type: 'success', text: 'Travel preferences saved!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHistory = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile({ visitedPlaces, wishlist });
      setMsg({ type: 'success', text: 'Travel history saved!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile({ privacy: { showAge, showNationality, allowMessages } });
      setMsg({ type: 'success', text: 'Privacy settings saved!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/auth/profile`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate('/login');
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete account' });
    }
  };

  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'password', label: 'Password', icon: '🔒' },
    { id: 'preferences', label: 'Travel Preferences', icon: '🧭' },
    { id: 'history', label: 'Travel History', icon: '🌍' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="settings-back" onClick={() => navigate('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => { setActiveSection(s.id); setMsg(null); }}
            >
              <span className="settings-nav-icon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {msg && (
            <div className={`settings-msg ${msg.type === 'success' ? 'settings-msg-success' : 'settings-msg-error'}`}>
              {msg.text}
            </div>
          )}

          {/* Account */}
          {activeSection === 'account' && (
            <form onSubmit={handleSaveAccount} className="settings-section">
              <h2 className="settings-section-title">Account Information</h2>
              <p className="settings-section-desc">Update your basic account details.</p>

              {/* Photo Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <div
                className="settings-field"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '16px',
                  border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--input-border)'}`,
                  background: dragOver ? 'rgba(108, 92, 231, 0.05)' : 'var(--input-bg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'var(--divider-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid var(--input-border)',
                }}>
                  {avatar ? (
                    <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--label-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)', marginBottom: '4px' }}>
                    {avatar ? 'Change Photo' : 'Upload Profile Photo'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--label-color)' }}>
                    Drag & drop or click to browse. JPG, PNG, max 2MB.
                  </div>
                </div>
                {avatar && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAvatar(''); }}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="settings-field">
                <label className="settings-label">Display Name</label>
                <input type="text" className="settings-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="settings-field">
                <label className="settings-label">Email</label>
                <input type="email" className="settings-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="settings-field">
                <label className="settings-label">Bio</label>
                <textarea className="settings-input settings-textarea" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell fellow travelers about yourself..." />
              </div>

              <div className="settings-field">
                <label className="settings-label">Nationality</label>
                <input type="text" className="settings-input" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Indian" />
              </div>

              <div className="settings-field">
                <label className="settings-label">Member Since</label>
                <div className="settings-static">{new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>

              <button type="submit" className="settings-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          )}

          {/* Password */}
          {activeSection === 'password' && (
            <form onSubmit={handleSavePassword} className="settings-section">
              <h2 className="settings-section-title">Change Password</h2>
              <p className="settings-section-desc">Keep your account secure.</p>

              <div className="settings-field">
                <label className="settings-label">Current Password</label>
                <input type="password" className="settings-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="settings-field">
                <label className="settings-label">New Password</label>
                <input type="password" className="settings-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="settings-field">
                <label className="settings-label">Confirm New Password</label>
                <input type="password" className="settings-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              <button type="submit" className="settings-btn-primary" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
            </form>
          )}

          {/* Travel Preferences */}
          {activeSection === 'preferences' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Travel Preferences</h2>
              <p className="settings-section-desc">Help us find you the best travel buddies.</p>

              <div className="settings-field">
                <label className="settings-label">Travel Style</label>
                <div className="settings-chip-grid">
                  {TRAVEL_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`settings-chip ${travelStyle === s.id ? 'selected' : ''}`}
                      onClick={() => setTravelStyle(s.id)}
                    >
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-label">Interests</label>
                <p className="settings-hint">Select all that apply</p>
                <div className="settings-chip-grid">
                  {INTEREST_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`settings-chip ${interests.includes(item) ? 'selected' : ''}`}
                      onClick={() => toggleInterest(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-label">Languages</label>
                <p className="settings-hint">Languages you speak</p>
                <LangDropdown languages={languages} setLanguages={setLanguages} />
              </div>

              <button className="settings-btn-primary" onClick={handleSavePreferences} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
            </div>
          )}

          {/* Travel History */}
          {activeSection === 'history' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Travel History</h2>
              <p className="settings-section-desc">Track where you've been and where you want to go.</p>

              <div className="settings-field">
                <label className="settings-label">Places Visited</label>
                <div className="settings-add-row">
                  <input
                    type="text"
                    className="settings-input"
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVisitedPlace())}
                    placeholder="Add a place you've visited..."
                  />
                  <button type="button" className="settings-btn-add" onClick={addVisitedPlace}>Add</button>
                </div>
                <div className="settings-tags">
                  {visitedPlaces.map((p) => (
                    <span key={p} className="settings-tag">
                      {p}
                      <button onClick={() => removeVisitedPlace(p)} className="settings-tag-x">&times;</button>
                    </span>
                  ))}
                  {visitedPlaces.length === 0 && <span className="settings-hint">No places added yet</span>}
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-label">Wishlist</label>
                <div className="settings-add-row">
                  <input
                    type="text"
                    className="settings-input"
                    value={newWish}
                    onChange={(e) => setNewWish(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWishlist())}
                    placeholder="Add a dream destination..."
                  />
                  <button type="button" className="settings-btn-add" onClick={addWishlist}>Add</button>
                </div>
                <div className="settings-tags">
                  {wishlist.map((p) => (
                    <span key={p} className="settings-tag tag-wish">
                      {p}
                      <button onClick={() => removeWishlist(p)} className="settings-tag-x">&times;</button>
                    </span>
                  ))}
                  {wishlist.length === 0 && <span className="settings-hint">No destinations on your wishlist yet</span>}
                </div>
              </div>

              <button className="settings-btn-primary" onClick={handleSaveHistory} disabled={saving}>{saving ? 'Saving...' : 'Save History'}</button>
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Appearance</h2>
              <p className="settings-section-desc">Customize how WireUs looks.</p>

              <div className="settings-toggle-row">
                <div>
                  <div className="settings-label">Dark Mode</div>
                  <div className="settings-hint">Switch between light and dark theme</div>
                </div>
                <button className={`settings-toggle ${theme === 'dark' ? 'on' : ''}`} onClick={toggleTheme} type="button">
                  <span className="settings-toggle-thumb" />
                </button>
              </div>

              <div className="settings-field" style={{ marginTop: '24px' }}>
                <label className="settings-label">Color Palette</label>
                <p className="settings-hint">Choose a color theme that suits your style</p>
                <div className="palette-grid">
                  {Object.entries(PALETTES).map(([id, p]) => (
                    <button
                      key={id}
                      className={`palette-card ${palette === id ? 'selected' : ''}`}
                      onClick={() => changePalette(id)}
                      type="button"
                    >
                      <div className="palette-swatches">
                        {p.preview.map((color, i) => (
                          <div
                            key={i}
                            className="palette-swatch"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                      <div className="palette-name">{p.name}</div>
                      <div className="palette-desc">{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Privacy</h2>
              <p className="settings-section-desc">Control who can see your information.</p>

              <div className="settings-toggle-row">
                <div>
                  <div className="settings-label">Show Age</div>
                  <div className="settings-hint">Display your age on your profile</div>
                </div>
                <button className={`settings-toggle ${showAge ? 'on' : ''}`} onClick={() => setShowAge(!showAge)} type="button">
                  <span className="settings-toggle-thumb" />
                </button>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <div className="settings-label">Show Nationality</div>
                  <div className="settings-hint">Display your nationality on your profile</div>
                </div>
                <button className={`settings-toggle ${showNationality ? 'on' : ''}`} onClick={() => setShowNationality(!showNationality)} type="button">
                  <span className="settings-toggle-thumb" />
                </button>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <div className="settings-label">Allow Messages</div>
                  <div className="settings-hint">Let matched travelers send you messages</div>
                </div>
                <button className={`settings-toggle ${allowMessages ? 'on' : ''}`} onClick={() => setAllowMessages(!allowMessages)} type="button">
                  <span className="settings-toggle-thumb" />
                </button>
              </div>

              <button className="settings-btn-primary" onClick={handleSavePrivacy} disabled={saving}>{saving ? 'Saving...' : 'Save Privacy'}</button>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === 'account' && (
            <div className="settings-section settings-danger">
              <h2 className="settings-section-title" style={{ color: '#ef4444' }}>Danger Zone</h2>
              <p className="settings-section-desc">Permanently delete your account and all data.</p>
              <button className="settings-btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
