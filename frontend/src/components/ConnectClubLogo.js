import React, { useId } from 'react';

// ConnectClub brand lockup — crafted inline SVG.
// Inline (not an <img>) so the wordmark renders in the real Fraunces webfont,
// dark mode swaps true ink colors instead of a brightness filter, and the
// gold catches a periodic sheen. textLength locks the layout so the lockup
// never shifts while fonts load.

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace";

const INK = 'fill-[#0C2B1A] dark:fill-[#F4EDDC] transition-colors duration-300';
const TAG = 'fill-[#47604F] dark:fill-[#B7AE97] transition-colors duration-300';

function BrandDefs({ id }) {
  return (
    <defs>
      {/* Deep forest — shield body */}
      <linearGradient id={`${id}-shield`} x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#1A4A2E" />
        <stop offset="55%" stopColor="#0D2E1B" />
        <stop offset="100%" stopColor="#06180D" />
      </linearGradient>

      {/* Gold — dollar sign */}
      <linearGradient id={`${id}-dollar`} x1="0%" y1="0%" x2="60%" y2="100%">
        <stop offset="0%" stopColor="#FFE070" />
        <stop offset="45%" stopColor="#D4A017" />
        <stop offset="100%" stopColor="#8A6000" />
      </linearGradient>

      {/* Gold — borders and rules */}
      <linearGradient id={`${id}-border`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5D060" />
        <stop offset="50%" stopColor="#C49010" />
        <stop offset="100%" stopColor="#8A6000" />
      </linearGradient>

      {/* Gold — "Club" wordmark */}
      <linearGradient id={`${id}-club`} x1="0%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="#F3CB5A" />
        <stop offset="52%" stopColor="#D4A017" />
        <stop offset="100%" stopColor="#A87B06" />
      </linearGradient>

      {/* Sheen sweep — a soft light band that glints across the wordmark */}
      <linearGradient id={`${id}-sheen`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="50%" stopColor="#FFF6DC" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      <filter id={`${id}-shadow`} x="-15%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000000" floodOpacity="0.28" />
      </filter>

      <filter id={`${id}-glow`} x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0.8 0 0 0.1  0.6 0.5 0 0 0.05  0 0 0 0 0  0 0 0 0.45 0"
          result="coloredBlur"
        />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function ShieldMark({ id }) {
  const body =
    'M 160 30 L 266 30 Q 280 30 280 44 L 280 184 Q 280 252 160 334 Q 40 252 40 184 L 40 44 Q 40 30 54 30 Z';
  return (
    <g>
      {/* Crown of gold points */}
      <circle cx="120" cy="22" r="2.7" fill="#F5D060" opacity="0.45" />
      <circle cx="139" cy="15" r="3.6" fill="#F5D060" opacity="0.7" />
      <circle cx="160" cy="11" r="5" fill="#F5D060" opacity="0.95" filter={`url(#${id}-glow)`} />
      <circle cx="181" cy="15" r="3.6" fill="#F5D060" opacity="0.7" />
      <circle cx="200" cy="22" r="2.7" fill="#F5D060" opacity="0.45" />

      {/* Shield body */}
      <path d={body} fill={`url(#${id}-shield)`} filter={`url(#${id}-shadow)`} />

      {/* Top gloss */}
      <path
        d="M 40 44 Q 40 30 54 30 L 266 30 Q 280 30 280 44 L 280 88 Q 160 126 40 88 Z"
        fill="#FFFFFF"
        opacity="0.055"
      />

      {/* Gold borders — outer and inner hairline */}
      <path d={body} fill="none" stroke={`url(#${id}-border)`} strokeWidth="3.5" strokeLinejoin="round" opacity="0.8" />
      <path
        d="M 160 46 L 264 46 L 264 184 Q 264 240 160 312 Q 56 240 56 184 L 56 46 Z"
        fill="none"
        stroke={`url(#${id}-border)`}
        strokeWidth="1"
        opacity="0.32"
      />

      {/* Dollar sign */}
      <text
        x="160"
        y="238"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="180"
        fontWeight="600"
        fill={`url(#${id}-dollar)`}
        filter={`url(#${id}-glow)`}
      >
        $
      </text>
    </g>
  );
}

function Wordmark({ id }) {
  const word = {
    y: 214,
    fontFamily: SERIF,
    fontSize: 120,
    fontWeight: 600,
    lengthAdjust: 'spacingAndGlyphs',
  };
  return (
    <g>
      <text x="332" textLength="452" {...word} className={INK}>
        Connect
      </text>
      <text x="800" textLength="252" {...word} fill={`url(#${id}-club)`}>
        Club
      </text>

      {/* Sheen glint, masked to the letterforms */}
      <mask id={`${id}-wordmask`}>
        <text x="332" textLength="452" {...word} fill="#FFFFFF">
          Connect
        </text>
        <text x="800" textLength="252" {...word} fill="#FFFFFF">
          Club
        </text>
      </mask>
      <g mask={`url(#${id}-wordmask)`}>
        <rect className="cc-logo-sheen" x="-280" y="80" width="240" height="170" fill={`url(#${id}-sheen)`} />
      </g>

      {/* Gold rule */}
      <line x1="332" y1="242" x2="1052" y2="242" stroke={`url(#${id}-border)`} strokeWidth="2.5" opacity="0.55" />

      {/* Tagline */}
      <text
        x="332"
        y="278"
        fontFamily={MONO}
        fontSize="23"
        fontWeight="500"
        letterSpacing="8"
        textLength="720"
        lengthAdjust="spacing"
        className={TAG}
      >
        YOUR NETWORK
        <tspan fill="#D4A017"> · </tspan>
        YOUR INCOME
      </text>
    </g>
  );
}

export default function ConnectClubLogo({ className = 'h-14' }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg
      viewBox="0 0 1150 380"
      className={`${className} w-auto select-none`}
      role="img"
      aria-label="ConnectClub — Your Network. Your Income."
    >
      <BrandDefs id={id} />
      <ShieldMark id={id} />
      <Wordmark id={id} />
    </svg>
  );
}

// Shield-only version — the mark without the wordmark, for tight spaces.
export function ConnectClubShield({ className = 'h-14' }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg
      viewBox="24 0 272 356"
      className={`${className} w-auto select-none`}
      role="img"
      aria-label="ConnectClub"
    >
      <BrandDefs id={id} />
      <ShieldMark id={id} />
    </svg>
  );
}

// Inline text wordmark — for headlines and prose where "ConnectClub" appears
// as words rather than the full lockup. tone="onDark" for dark/green surfaces.
export function ConnectClubWordmark({ className = '', tone = 'auto' }) {
  const connect =
    tone === 'onDark'
      ? 'text-inherit'
      : 'text-[#0C2B1A] dark:text-[#F4EDDC] transition-colors duration-300';
  // On a primary-colored panel the surface flips between themes (deep forest
  // in light, mid green in dark), so the gold flips too: bright on forest,
  // deep bronze on the lighter green.
  const club =
    tone === 'onDark'
      ? 'bg-gradient-to-br from-[#F3CB5A] via-[#D4A017] to-[#A87B06] dark:from-[#6B4E03] dark:via-[#7E5F04] dark:to-[#553E02]'
      : 'bg-gradient-to-br from-[#F3CB5A] via-[#D4A017] to-[#A87B06]';
  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap ${className}`}
      style={{ fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.01em' }}
    >
      <span className={connect}>Connect</span>
      <span className={`${club} bg-clip-text text-transparent`}>Club</span>
    </span>
  );
}

// Static asset path, kept for any external consumers.
export const CONNECTCLUB_LOGO_URL = '/logo.svg';
