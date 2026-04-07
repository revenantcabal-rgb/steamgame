interface GoldenCapBadgeProps {
  size?: 'sm' | 'md';
}

/**
 * Small inline golden crown icon for premium recognition.
 * Use size="sm" for chat, size="md" for profile/cards.
 */
export function GoldenCapBadge({ size = 'sm' }: GoldenCapBadgeProps) {
  const px = size === 'sm' ? 14 : 20;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: size === 'sm' ? 3 : 4 }}
    >
      <path
        d="M3 18h18v2H3v-2zm0-2l3-8 3 4 3-6 3 6 3-4 3 8H3z"
        fill="url(#goldGrad)"
        stroke="#b8860b"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
      </defs>
    </svg>
  );
}
