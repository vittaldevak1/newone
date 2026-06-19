import { useState } from 'react';

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '🫶', '😍', '🥰', '😘', '😻', '💑', '💏', '👩‍❤️‍👨'],
  'Travel': ['✈️', '🚗', '🚕', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🚂', '🚆', '🚇', '🚈', '🚊', '🚝', '🚞', '🚋', '🚍', '🚘', '🚖', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛸', '🌍', '🌎', '🌏', '🗺️', '🧭', '⛰️', '🏔️', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️'],
  'Food': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥖', '🥨', '🥯', '🥝', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '☕', '🍵', '🥤', '🧃', '🍷', '🍺', '🥂', '🍹'],
  'Objects': ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💾', '💿', '📀', '📷', '📸', '📹', '🎥', '📽️', '🎬', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏰', '🕰️', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🧲', '🪜'],
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Smileys');
  const [search, setSearch] = useState('');

  const categories = Object.keys(EMOJI_CATEGORIES);

  const filtered = search
    ? Object.values(EMOJI_CATEGORIES).flat().filter(() => true)
    : EMOJI_CATEGORIES[activeCategory] || [];

  return (
    <div className="picker-popup emoji-picker">
      <div className="picker-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`picker-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => { setActiveCategory(cat); setSearch(''); }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="picker-grid">
        {filtered.map((emoji, i) => (
          <button key={i} className="picker-emoji" onClick={() => onSelect(emoji)}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
