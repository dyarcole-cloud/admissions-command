type MarkProps = {
  size?: number;
  className?: string;
};

export function Mark({ size = 40, className }: MarkProps) {
  const id = "mark-" + Math.random().toString(36).slice(2, 8);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-core`} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="35%" stopColor="#a78bfa" />
          <stop offset="75%" stopColor="#5b3aa1" />
          <stop offset="100%" stopColor="#0a0e1a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-accent`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id={`${id}-hairline`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#0a0e1a" />
      <rect
        x="0.5"
        y="0.5"
        width="63"
        height="63"
        rx="13.5"
        fill="none"
        stroke={`url(#${id}-hairline)`}
        strokeWidth="0.75"
      />
      <circle cx="32" cy="28" r="22" fill={`url(#${id}-core)`} opacity="0.95" />
      <rect
        x="14"
        y="38.5"
        width="36"
        height="2.5"
        rx="1.25"
        fill={`url(#${id}-accent)`}
        filter={`url(#${id}-glow)`}
      />
      <rect
        x="14"
        y="38.5"
        width="36"
        height="2.5"
        rx="1.25"
        fill={`url(#${id}-accent)`}
      />
      <ellipse cx="28" cy="22" rx="9" ry="3.5" fill="#ffffff" opacity="0.18" />
    </svg>
  );
}
