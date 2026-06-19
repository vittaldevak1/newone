const STICKERS = [
  { id: 'wave', emoji: '👋', label: 'Wave' },
  { id: 'thumbsup', emoji: '👍', label: 'Thumbs Up' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'clap', emoji: '👏', label: 'Clap' },
  { id: 'party', emoji: '🎉', label: 'Party' },
  { id: 'laugh', emoji: '😂', label: 'Laugh' },
  { id: 'cool', emoji: '😎', label: 'Cool' },
  { id: 'thinking', emoji: '🤔', label: 'Thinking' },
  { id: 'hug', emoji: '🤗', label: 'Hug' },
  { id: 'peace', emoji: '✌️', label: 'Peace' },
  { id: 'pray', emoji: '🙏', label: 'Pray' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'sparkles', emoji: '✨', label: 'Sparkles' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'sun', emoji: '☀️', label: 'Sun' },
  { id: 'moon', emoji: '🌙', label: 'Moon' },
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
  { id: 'pizza', emoji: '🍕', label: 'Pizza' },
  { id: 'plane', emoji: '✈️', label: 'Plane' },
  { id: 'mountain', emoji: '🏔️', label: 'Mountain' },
  { id: 'beach', emoji: '🏖️', label: 'Beach' },
  { id: 'camera', emoji: '📸', label: 'Camera' },
];

export default function StickerPicker({ onSelect, onClose }) {
  return (
    <div className="picker-popup sticker-picker">
      <div className="picker-grid sticker-grid">
        {STICKERS.map(s => (
          <button
            key={s.id}
            className="picker-sticker"
            onClick={() => onSelect(s.id)}
            title={s.label}
          >
            <span className="sticker-emoji">{s.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
