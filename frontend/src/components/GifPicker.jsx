import { useState } from 'react';

const GIF_CATEGORIES = {
  'Travel': [
    'https://media.giphy.com/media/l46CqGfCwZvXffy1G/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
    'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
  ],
  'Reactions': [
    'https://media.giphy.com/media/l3vR95jRz2hAO21HO/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
    'https://media.giphy.com/media/l46CqGfCwZvXffy1G/giphy.gif',
  ],
  'Funny': [
    'https://media.giphy.com/media/l3vR95jRz2hAO21HO/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
    'https://media.giphy.com/media/l46CqGfCwZvXffy1G/giphy.gif',
  ],
  'Celebration': [
    'https://media.giphy.com/media/l3vR95jRz2hAO21HO/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
    'https://media.giphy.com/media/l46CqGfCwZvXffy1G/giphy.gif',
  ],
};

export default function GifPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Travel');
  const [search, setSearch] = useState('');

  const gifs = GIF_CATEGORIES[activeCategory] || [];

  return (
    <div className="picker-popup gif-picker">
      <div className="picker-tabs">
        {Object.keys(GIF_CATEGORIES).map(cat => (
          <button
            key={cat}
            className={`picker-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="picker-gif-grid">
        {gifs.map((gif, i) => (
          <button key={i} className="picker-gif-item" onClick={() => onSelect(gif)}>
            <img src={gif} alt="GIF" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
