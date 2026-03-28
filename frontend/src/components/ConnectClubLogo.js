import React from 'react';

export default function ConnectClubLogo({ className = "h-14" }) {
  return (
    <img 
      src="/logo.svg" 
      alt="ConnectClub - Your Network. Your Income." 
      className={className}
    />
  );
}

// Shield-only version - crops to just the shield portion
export function ConnectClubShield({ className = "h-14" }) {
  return (
    <img 
      src="/logo.svg" 
      alt="ConnectClub" 
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

// Export the path for use in other components if needed
export const CONNECTCLUB_LOGO_URL = "/logo.svg";
