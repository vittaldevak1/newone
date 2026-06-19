import { useState, useEffect, useRef } from 'react';

export default function DestinationAutocomplete({ value, onChange, placeholder, disabled }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const searchPlaces = async (q) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      const data = await res.json();
      const mapped = data.map((item) => ({
        name: item.display_name.split(',')[0],
        fullName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        country: item.address?.country || '',
        state: item.address?.state || '',
        city: item.address?.city || item.address?.town || item.address?.village || '',
      }));
      setResults(mapped);
    } catch (err) {
      console.error('Geocoding error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place) => {
    const displayName = place.city || place.name;
    setQuery(displayName);
    onChange(displayName, place);
    setOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < results.length) {
        handleSelect(results[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  const getEmoji = (type) => {
    const map = {
      city: '🏙️',
      town: '🏘️',
      village: '🏡',
      hamlet: '🏠',
      country: '🌍',
      state: '🗺️',
      continent: '🌐',
    };
    return map[type] || '📍';
  };

  return (
    <div className="dest-autocomplete" ref={wrapRef}>
      <div className="dest-input-wrap">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightIndex(-1);
            if (!e.target.value) onChange('', null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search any city, country, or place..."}
          disabled={disabled}
          className="dest-input"
          autoComplete="off"
        />
        {query && (
          <button
            className="dest-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              onChange('', null);
              inputRef.current?.focus();
            }}
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="dest-dropdown" ref={listRef}>
          <div className="dest-list">
            {loading && (
              <div className="dest-loading">
                <div className="dest-spinner"></div>
                <span>Searching places...</span>
              </div>
            )}
            {!loading && results.length === 0 && query.length >= 2 && (
              <div className="dest-empty">
                <span>No places found</span>
                <span className="dest-empty-hint">Try a different search</span>
              </div>
            )}
            {!loading && results.map((place, i) => (
              <button
                key={`${place.name}-${place.lat}-${place.lon}`}
                className={`dest-item ${highlightIndex === i ? 'highlighted' : ''}`}
                onClick={() => handleSelect(place)}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                <span className="dest-item-emoji">{getEmoji(place.type)}</span>
                <div className="dest-item-info">
                  <span className="dest-item-name">{place.city || place.name}</span>
                  <span className="dest-item-country">{place.fullName}</span>
                </div>
              </button>
            ))}
            {!loading && results.length === 0 && query.length < 2 && (
              <div className="dest-empty">
                <span>Start typing to search destinations</span>
                <span className="dest-empty-hint">e.g. "Bengaluru", "Paris", "Tokyo"</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
