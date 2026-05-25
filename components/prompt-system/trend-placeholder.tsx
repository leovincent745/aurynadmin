/** Deck-style trend sparkline when per-pipeline trend is unavailable. */

export function TrendPlaceholder() {
  return (
    <svg
      aria-hidden
      className="h-5 w-14 text-slate-300"
      fill="none"
      viewBox="0 0 56 20"
    >
      <path
        d="M1 14 L7 10 L13 12 L19 6 L25 9 L31 4 L37 8 L43 5 L49 11 L55 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        strokeDasharray="3 2"
      />
    </svg>
  );
}
