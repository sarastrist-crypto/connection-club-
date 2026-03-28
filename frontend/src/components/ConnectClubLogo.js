import React from 'react';

export default function ConnectClubLogo({ className = "h-10", showTagline = false }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 800 380" 
      className={className}
      aria-label="ConnectClub Logo"
    >
      <defs>
        {/* Deep forest green — shield fill */}
        <linearGradient id="shieldGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#0F3D22"/>
          <stop offset="100%" stopColor="#071A0D"/>
        </linearGradient>

        {/* Gold — dollar sign and ornaments */}
        <linearGradient id="dollarGrad" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#FFE070"/>
          <stop offset="45%" stopColor="#D4A017"/>
          <stop offset="100%" stopColor="#8A6000"/>
        </linearGradient>

        {/* Gold — border stroke */}
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D060"/>
          <stop offset="50%" stopColor="#C49010"/>
          <stop offset="100%" stopColor="#8A6000"/>
        </linearGradient>

        {/* Gold — wordmark Club */}
        <linearGradient id="clubGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8B820"/>
          <stop offset="100%" stopColor="#C08C08"/>
        </linearGradient>

        {/* Shield drop shadow */}
        <filter id="shieldShadow" x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="10" floodColor="#000000" floodOpacity="0.30"/>
        </filter>

        {/* Dollar sign gold glow */}
        <filter id="dollarGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
          <feColorMatrix in="blur" type="matrix"
            values="1 0.8 0 0 0.1
                    0.6 0.5 0 0 0.05
                    0   0   0 0 0
                    0   0   0 0.5 0" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Text shadow for wordmark legibility */}
        <filter id="wordShadow" x="-5%" y="-10%" width="110%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.10"/>
        </filter>
      </defs>

      {/* Background — transparent */}
      <rect width="800" height="380" fill="transparent"/>

      {/* SHIELD OUTER — the fill body */}
      <path d="
        M 160,30
        L 278,30
        L 278,185
        Q 278,250 160,330
        Q 42,250 42,185
        L 42,30
        Z"
        fill="url(#shieldGrad)"
        filter="url(#shieldShadow)"
      />

      {/* SHIELD BORDER OUTER — gold, clean stroke, no fill */}
      <path d="
        M 160,30
        L 278,30
        L 278,185
        Q 278,250 160,330
        Q 42,250 42,185
        L 42,30
        Z"
        fill="none"
        stroke="url(#borderGrad)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        opacity="0.75"
      />

      {/* SHIELD BORDER INNER — inset 14px, gold hairline */}
      <path d="
        M 160,46
        L 264,46
        L 264,184
        Q 264,240 160,312
        Q 56,240 56,184
        L 56,46
        Z"
        fill="none"
        stroke="url(#borderGrad)"
        strokeWidth="1.0"
        strokeLinejoin="round"
        opacity="0.30"
      />

      {/* SHIELD BORDER INNERMOST — inset 24px, faintest line for depth */}
      <path d="
        M 160,58
        L 254,58
        L 254,183
        Q 254,234 160,300
        Q 66,234 66,183
        L 66,58
        Z"
        fill="none"
        stroke="url(#borderGrad)"
        strokeWidth="0.6"
        strokeLinejoin="round"
        opacity="0.15"
      />

      {/* CROWN ORNAMENT — 5 dots centered on X=160 at top of shield */}
      <circle cx="126" cy="40" r="2.8" fill="#F5D060" opacity="0.48"/>
      <circle cx="143" cy="35" r="3.5" fill="#F5D060" opacity="0.68"/>
      <circle cx="160" cy="31" r="5.0" fill="#F5D060" opacity="0.96" filter="url(#dollarGlow)"/>
      <circle cx="177" cy="35" r="3.5" fill="#F5D060" opacity="0.68"/>
      <circle cx="194" cy="40" r="2.8" fill="#F5D060" opacity="0.48"/>

      {/* Ghost backdrop for depth (very faint, same position) */}
      <text
        x="160"
        y="232"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="190"
        fontWeight="bold"
        textAnchor="middle"
        fill="url(#dollarGrad)"
        opacity="0.07"
      >$</text>

      {/* Dollar sign — primary, optically centered */}
      <text
        x="160"
        y="232"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="190"
        fontWeight="bold"
        textAnchor="middle"
        fill="url(#dollarGrad)"
        filter="url(#dollarGlow)"
      >$</text>

      {/* "Connect" — dark forest green */}
      <text
        x="312"
        y="192"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="58"
        fontWeight="bold"
        fill="#0A2A18"
        letterSpacing="-1.0"
        filter="url(#wordShadow)"
      >Connect</text>

      {/* "Club" — gold, immediately after Connect, same baseline */}
      <text
        x="568"
        y="192"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="58"
        fontWeight="bold"
        fill="url(#clubGrad)"
        letterSpacing="-1.0"
        filter="url(#wordShadow)"
      >Club</text>

      {/* GOLD RULE — sits 14px below wordmark baseline */}
      <line
        x1="312" y1="210"
        x2="760" y2="210"
        stroke="url(#borderGrad)"
        strokeWidth="0.9"
        opacity="0.35"
      />

      {/* TAGLINE */}
      {showTagline && (
        <text
          x="312"
          y="232"
          fontFamily="'Trebuchet MS', 'Gill Sans', Arial, sans-serif"
          fontSize="11.5"
          fill="#1A5C38"
          letterSpacing="3.5"
          opacity="0.72"
        >YOUR NETWORK. YOUR INCOME.</text>
      )}
    </svg>
  );
}

// Shield-only version for smaller use cases
export function ConnectClubShield({ className = "h-10" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 320 380" 
      className={className}
      aria-label="ConnectClub Shield"
    >
      <defs>
        <linearGradient id="shieldGrad2" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#0F3D22"/>
          <stop offset="100%" stopColor="#071A0D"/>
        </linearGradient>

        <linearGradient id="dollarGrad2" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#FFE070"/>
          <stop offset="45%" stopColor="#D4A017"/>
          <stop offset="100%" stopColor="#8A6000"/>
        </linearGradient>

        <linearGradient id="borderGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D060"/>
          <stop offset="50%" stopColor="#C49010"/>
          <stop offset="100%" stopColor="#8A6000"/>
        </linearGradient>

        <filter id="shieldShadow2" x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="10" floodColor="#000000" floodOpacity="0.30"/>
        </filter>

        <filter id="dollarGlow2" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
          <feColorMatrix in="blur" type="matrix"
            values="1 0.8 0 0 0.1
                    0.6 0.5 0 0 0.05
                    0   0   0 0 0
                    0   0   0 0.5 0" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="320" height="380" fill="transparent"/>

      <path d="
        M 160,30
        L 278,30
        L 278,185
        Q 278,250 160,330
        Q 42,250 42,185
        L 42,30
        Z"
        fill="url(#shieldGrad2)"
        filter="url(#shieldShadow2)"
      />

      <path d="
        M 160,30
        L 278,30
        L 278,185
        Q 278,250 160,330
        Q 42,250 42,185
        L 42,30
        Z"
        fill="none"
        stroke="url(#borderGrad2)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        opacity="0.75"
      />

      <circle cx="126" cy="40" r="2.8" fill="#F5D060" opacity="0.48"/>
      <circle cx="143" cy="35" r="3.5" fill="#F5D060" opacity="0.68"/>
      <circle cx="160" cy="31" r="5.0" fill="#F5D060" opacity="0.96" filter="url(#dollarGlow2)"/>
      <circle cx="177" cy="35" r="3.5" fill="#F5D060" opacity="0.68"/>
      <circle cx="194" cy="40" r="2.8" fill="#F5D060" opacity="0.48"/>

      <text
        x="160"
        y="232"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="190"
        fontWeight="bold"
        textAnchor="middle"
        fill="url(#dollarGrad2)"
        filter="url(#dollarGlow2)"
      >$</text>
    </svg>
  );
}
