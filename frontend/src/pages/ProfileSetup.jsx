import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import PhoneVerificationStep from '../components/PhoneVerificationStep';
import '../styles/auth.css';

const INTERESTS_OPTIONS = [
  'Photography', 'Hiking', 'Food & Dining', 'Beach', 'Culture',
  'Nightlife', 'Shopping', 'Adventure Sports', 'Sightseeing', 'Museums',
  'Nature', 'Music', 'Yoga & Wellness', 'History', 'Art',
  'Cooking', 'Wildlife', 'Camping', 'Water Sports', 'Cycling'
];

const LANGUAGES_OPTIONS = [
  'Abkhaz','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Aymara','Azerbaijani','Bambara','Bashkir','Basque','Belarusian','Bengali','Bihari','Bislama','Bosnian','Breton','Bulgarian','Burmese','Catalan','Chechen','Chichewa','Chinese','Chuvash','Cornish','Corsican','Croatian','Czech','Danish','Divehi','Dutch','Dzongkha','English','Esperanto','Estonian','Ewe','Faroese','Fijian','Finnish','French','Frisian','Fulah','Georgian','German','Greek','Guarani','Gujarati','Haitian','Hausa','Hebrew','Herero','Hindi','Hiri Motu','Hungarian','Icelandic','Ido','Igbo','Indonesian','Interlingua','Interlingue','Inuktitut','Inupiaq','Irish','Italian','Japanese','Javanese','Kalaallisut','Kannada','Kanuri','Kashmiri','Kazakh','Khmer','Kikuyu','Kinyarwanda','Kirghiz','Komi','Kongo','Korean','Kurdish','Kwanyama','Lao','Latin','Latvian','Limburgish','Lingala','Lithuanian','Luba-Katanga','Luxembourgish','Macedonian','Malagasy','Malay','Malayalam','Maltese','Manx','Maori','Marathi','Marshallese','Mongolian','Navajo','Ndonga','Nepali','Norwegian','Occitan','Ojibwe','Oriya','Oromo','Ossetian','Pali','Panjabi','Pashto','Persian','Polish','Portuguese','Quechua','Romanian','Romansh','Rundi','Russian','Samoan','Sango','Sanskrit','Sardinian','Serbian','Shona','Sindhi','Sinhala','Slovak','Slovenian','Somali','Southern Ndebele','Spanish','Sundanese','Swahili','Swati','Swedish','Tagalog','Tahitian','Tajik','Tamil','Tatar','Telugu','Thai','Tibetan','Tigrinya','Tonga','Tsonga','Tswana','Turkish','Turkmen','Twi','Ukrainian','Urdu','Uyghur','Uzbek','Venda','Vietnamese','Volapük','Walloon','Welsh','Western Frisian','Wolof','Xhosa','Yoruba','Zulu',
];

const LANGUAGES_SEARCH = LANGUAGES_OPTIONS.slice().sort();

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guinea',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Liberia', 'Libya',
  'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali',
  'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Somalia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const TRAVEL_STYLES = [
  { value: 'budget', label: 'Budget', icon: '🎒', desc: 'Hostels, street food, free activities' },
  { value: 'mid-range', label: 'Mid-Range', icon: '🏨', desc: 'Comfortable hotels, balanced spending' },
  { value: 'luxury', label: 'Luxury', icon: '✨', desc: 'Premium experiences, fine dining' },
  { value: 'backpacker', label: 'Backpacker', icon: '🗺️', desc: 'Off the beaten path, spontaneous' },
  { value: 'family-friendly', label: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Kid-safe, relaxed pace' },
];

export default function ProfileSetup() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, updateProfile, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const stageRef = useRef(null);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [natOpen, setNatOpen] = useState(false);
  const [natSearch, setNatSearch] = useState('');
  const natRef = useRef(null);
  const [formData, setFormData] = useState({
    age: '',
    nationality: '',
    languages: [],
    travelStyle: '',
    interests: [],
    bio: '',
    avatar: '',
    social: {
      instagram: '',
      whatsapp: '',
      twitter: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      phone: '',
    },
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const totalSteps = 6;

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(natSearch.toLowerCase())
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.profileComplete) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (natRef.current && !natRef.current.contains(e.target)) {
        setNatOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const toggleArrayItem = (array, item) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

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
        setFormData({ ...formData, avatar: canvas.toDataURL('image/jpeg', 0.7) });
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

  const handleNext = () => {
    if (step === 1 && (!formData.avatar || !formData.age || !formData.nationality)) {
      setError(!formData.avatar ? 'Please upload a profile photo' : 'Please fill in your age and nationality');
      return;
    }
    if (step === 2 && formData.languages.length === 0) {
      setError('Please select at least one language');
      return;
    }
    if (step === 3 && !formData.travelStyle) {
      setError('Please select your travel style');
      return;
    }
    if (step === 4 && formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    if (step === 5) {
      // Social links are optional, just proceed
    }
    if (step === 6 && !formData.phoneVerified) {
      setError('Please verify your phone number to continue');
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const [langSearch, setLangSearch] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const handleSubmit = async () => {
    if (!formData.avatar) {
      setError('Please upload a profile photo to continue');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProfile({
        age: parseInt(formData.age),
        nationality: formData.nationality,
        languages: formData.languages,
        travelStyle: formData.travelStyle,
        interests: formData.interests,
        bio: formData.bio,
        avatar: formData.avatar,
        social: formData.social,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="stage" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--ink)', fontSize: '24px' }}>Loading...</div>
      </div>
    );
  }

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
        <div className="brand" style={{ marginBottom: '24px' }}>
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5z" fill="white" />
            </svg>
          </div>
          <div className="brand-name">WireUs</div>
        </div>
        <h1 className="headline" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
          Set up your profile,<br />
          <span className="hl">find your people</span>
        </h1>
        <p className="sub" style={{ maxWidth: '400px' }}>
          Tell us about yourself so we can match you with the perfect travel companions.
        </p>

        <div className="pills">
          <div className="pill">
            <div className="pill-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div className="pill-text">Step {step} of {totalSteps}</div>
          </div>
        </div>
      </div>

      <div className="right">
        <div className="card" ref={cardRef} style={{ padding: '40px 32px' }}>
          <div className="card-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            {step === 1 && 'About You'}
            {step === 2 && 'Languages'}
            {step === 3 && 'Travel Style'}
            {step === 4 && 'Interests'}
            {step === 5 && 'Social Links'}
            {step === 6 && 'Verify Phone'}
          </div>
          <div className="card-sub" style={{ marginBottom: '32px' }}>
            {step === 1 && 'Basic information'}
            {step === 2 && 'What languages do you speak?'}
            {step === 3 && 'How do you like to travel?'}
            {step === 4 && 'What do you enjoy?'}
            {step === 5 && 'How can people reach you?'}
            {step === 6 && 'Verify your phone number'}
          </div>

          {error && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '16px',
              padding: '10px',
              background: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '8px',
            }}>
              {error}
            </div>
          )}

          {/* Step 1: About You */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
              {/* Avatar Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <div
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
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--divider-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid var(--input-border)',
                }}>
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--label-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {formData.avatar ? 'Change Photo' : 'Upload Profile Photo'}
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.5px',
                    }}>REQUIRED</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--label-color)' }}>
                    Drag & drop or click to browse. JPG, PNG, max 2MB.
                  </div>
                </div>
                {formData.avatar && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, avatar: '' }); }}
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

              <div className="field">
                <input
                  type="number"
                  placeholder=" "
                  min="18"
                  max="100"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  disabled={saving}
                />
                <label>Age</label>
              </div>

              <div className="field" ref={natRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => { setNatOpen(!natOpen); setNatSearch(''); }}
                  style={{
                    width: '100%',
                    height: '50px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: natOpen ? 'var(--teal-deep)' : 'var(--input-border)',
                    background: 'var(--input-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: natOpen ? '0 0 0 3px rgba(14, 124, 119, 0.1)' : 'none',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  <span style={{
                    color: formData.nationality ? 'var(--ink)' : 'var(--label-color)',
                    fontSize: '14px',
                    flex: 1,
                  }}>
                    {formData.nationality || 'Select your nationality'}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--label-color)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: natOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                {!formData.nationality && (
                  <label style={{
                    position: 'absolute',
                    left: '16px',
                    top: '-8px',
                    fontSize: '11px',
                    color: 'var(--teal-deep)',
                    background: 'var(--card-bg)',
                    padding: '0 4px',
                  }}>Nationality</label>
                )}
                {natOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '56px',
                    left: 0,
                    right: 0,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px var(--shadow-tint)',
                    zIndex: 100,
                    maxHeight: '220px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--input-border)' }}>
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={natSearch}
                        onChange={(e) => setNatSearch(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--input-border)',
                          background: 'var(--input-bg)',
                          fontSize: '13px',
                          color: 'var(--ink)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: '170px' }}>
                      {filteredCountries.map((country) => (
                        <div
                          key={country}
                          onClick={() => {
                            setFormData({ ...formData, nationality: country });
                            setNatOpen(false);
                            setNatSearch('');
                          }}
                          style={{
                            padding: '10px 16px',
                            fontSize: '14px',
                            color: formData.nationality === country ? 'var(--teal-deep)' : 'var(--ink)',
                            background: formData.nationality === country ? 'rgba(14, 124, 119, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            fontWeight: formData.nationality === country ? '600' : '400',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            if (formData.nationality !== country) e.target.style.background = 'var(--input-bg)';
                          }}
                          onMouseLeave={(e) => {
                            if (formData.nationality !== country) e.target.style.background = 'transparent';
                          }}
                        >
                          {country}
                        </div>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--label-color)', fontSize: '13px' }}>
                          No countries found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="field">
                <textarea
                  placeholder=" "
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={saving}
                  rows="3"
                  style={{
                    resize: 'vertical',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    padding: '12px 16px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: 'var(--ink)',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <label>Bio (optional)</label>
              </div>
            </div>
          )}

          {/* Step 2: Languages */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div ref={langRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => { setLangOpen(!langOpen); setLangSearch(''); }}
                  style={{
                    width: '100%',
                    minHeight: '50px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: langOpen ? 'var(--accent)' : 'var(--input-border)',
                    background: 'var(--input-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: langOpen ? '0 0 0 3px rgba(108, 92, 231, 0.1)' : 'none',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  {formData.languages.length > 0 ? (
                    formData.languages.map((l) => (
                      <span key={l} style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
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
                          onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, languages: formData.languages.filter(x => x !== l) }); }}
                          style={{ cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                        >&times;</span>
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--label-color)', fontSize: '14px' }}>Select languages you speak</span>
                  )}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--label-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ marginLeft: 'auto', transform: langOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                {langOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '56px',
                    left: 0,
                    right: 0,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px var(--shadow-tint)',
                    zIndex: 100,
                    maxHeight: '280px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--input-border)' }}>
                      <input
                        type="text"
                        placeholder="Search languages..."
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--input-border)',
                          background: 'var(--input-bg)',
                          color: 'var(--ink)',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: '220px' }}>
                      {LANGUAGES_SEARCH
                        .filter((l) => l.toLowerCase().includes(langSearch.toLowerCase()))
                        .map((lang) => (
                          <div
                            key={lang}
                            onClick={() => {
                              const langs = formData.languages.includes(lang)
                                ? formData.languages.filter((l) => l !== lang)
                                : [...formData.languages, lang];
                              setFormData({ ...formData, languages: langs });
                            }}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: formData.languages.includes(lang) ? 'var(--accent)' : 'var(--ink)',
                              background: formData.languages.includes(lang) ? 'rgba(108, 92, 231, 0.08)' : 'transparent',
                              fontWeight: formData.languages.includes(lang) ? '600' : '400',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { if (!formData.languages.includes(lang)) e.currentTarget.style.background = 'var(--input-bg)'; }}
                            onMouseLeave={(e) => { if (!formData.languages.includes(lang)) e.currentTarget.style.background = 'transparent'; }}
                          >
                            {formData.languages.includes(lang) && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
              {formData.languages.length > 0 && (
                <div style={{ fontSize: '13px', color: 'var(--label-color)' }}>
                  {formData.languages.length} language{formData.languages.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* Step 3: Travel Style */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, travelStyle: style.value })}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    border: '2px solid',
                    borderColor: formData.travelStyle === style.value ? 'var(--accent)' : 'var(--input-border)',
                    background: formData.travelStyle === style.value ? 'var(--accent-bg, rgba(99, 102, 241, 0.1))' : 'var(--input-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{style.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '15px' }}>{style.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px' }}>{style.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {INTERESTS_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => setFormData({ ...formData, interests: toggleArrayItem(formData.interests, interest) })}
                    disabled={saving}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '24px',
                      border: '2px solid',
                      borderColor: formData.interests.includes(interest) ? 'var(--accent)' : 'var(--input-border)',
                      background: formData.interests.includes(interest) ? 'var(--accent)' : 'var(--input-bg)',
                      color: formData.interests.includes(interest) ? 'white' : 'var(--ink)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Social Links */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              {[
                { key: 'instagram', label: 'Instagram', icon: '📷', placeholder: '@username' },
                { key: 'whatsapp', label: 'WhatsApp', icon: '💬', placeholder: '+1 234 567 890' },
                { key: 'phone', label: 'Phone', icon: '📱', placeholder: '+1 234 567 890' },
                { key: 'twitter', label: 'Twitter / X', icon: '🐦', placeholder: '@username' },
                { key: 'facebook', label: 'Facebook', icon: '👤', placeholder: 'Profile URL' },
                { key: 'tiktok', label: 'TikTok', icon: '🎵', placeholder: '@username' },
                { key: 'youtube', label: 'YouTube', icon: '📺', placeholder: 'Channel URL' },
              ].map((item) => (
                <div key={item.key} style={{ position: 'relative', marginBottom: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0 16px',
                    height: '50px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    transition: 'border-color 0.25s ease',
                  }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                    <input
                      type="text"
                      placeholder={item.label}
                      value={formData.social[item.key]}
                      onChange={(e) => setFormData({
                        ...formData,
                        social: { ...formData.social, [item.key]: e.target.value }
                      })}
                      disabled={saving}
                      style={{
                        flex: 1,
                        height: '100%',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '14px',
                        color: 'var(--ink)',
                        outline: 'none',
                        padding: 0,
                      }}
                    />
                  </div>
                  <label style={{
                    position: 'absolute',
                    left: '48px',
                    top: '-8px',
                    fontSize: '11px',
                    color: 'var(--accent)',
                    background: 'var(--card-bg)',
                    padding: '0 4px',
                    pointerEvents: 'none',
                  }}>{item.label}</label>
                </div>
              ))}
              <div style={{ fontSize: '12px', color: 'var(--label-color)', textAlign: 'center', marginTop: '4px' }}>
                All fields are optional. Add what you're comfortable sharing.
              </div>
            </div>
          )}

          {/* Step 6: Phone Verification */}
          {step === 6 && (
            <PhoneVerificationStep formData={formData} setFormData={setFormData} />
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', width: '100%' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                style={{
                  flex: '0 0 auto',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '2px solid var(--input-border)',
                  background: 'transparent',
                  color: 'var(--ink)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="signin-btn"
                style={{ flex: 1 }}
              >
                <span className="shine"></span>
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="signin-btn"
                style={{ flex: 1 }}
              >
                <span className="shine"></span>
                {saving ? 'Saving...' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
