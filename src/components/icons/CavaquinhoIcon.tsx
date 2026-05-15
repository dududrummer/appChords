interface CavaquinhoIconProps {
  className?: string;
  color?: string;
}

export function CavaquinhoIcon({ className = "h-6 w-6", color = "currentColor" }: CavaquinhoIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Body - small rounded shape like cavaquinho/ukulele */}
      <ellipse cx="12" cy="16" rx="5.5" ry="6" />
      {/* Sound hole */}
      <circle cx="12" cy="17" r="1.8" />
      {/* Neck */}
      <rect x="10.5" y="3" width="3" height="10" rx="1" />
      {/* Headstock */}
      <rect x="10" y="1" width="4" height="3" rx="1.5" />
      {/* Tuning pegs */}
      <line x1="10" y1="2" x2="9" y2="2" />
      <line x1="10" y1="3.5" x2="9" y2="3.5" />
      <line x1="14" y1="2" x2="15" y2="2" />
      <line x1="14" y1="3.5" x2="15" y2="3.5" />
      {/* Strings */}
      <line x1="11" y1="4" x2="11" y2="17" strokeWidth="0.5" />
      <line x1="11.7" y1="4" x2="11.7" y2="17" strokeWidth="0.5" />
      <line x1="12.3" y1="4" x2="12.3" y2="17" strokeWidth="0.5" />
      <line x1="13" y1="4" x2="13" y2="17" strokeWidth="0.5" />
      {/* Bridge */}
      <line x1="10.5" y1="20" x2="13.5" y2="20" strokeWidth="1.5" />
    </svg>
  );
}
