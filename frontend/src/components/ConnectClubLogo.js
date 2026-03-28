import React from 'react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_network-pay/artifacts/6yrxkali_IMG_4370.png";

export default function ConnectClubLogo({ className = "h-10" }) {
  return (
    <img 
      src={LOGO_URL} 
      alt="ConnectClub - Your Network. Your Income." 
      className={className}
    />
  );
}

// Shield-only version - uses same image but crops visually with object-fit
export function ConnectClubShield({ className = "h-10" }) {
  return (
    <img 
      src={LOGO_URL} 
      alt="ConnectClub" 
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

// Export the URL for use in other components if needed
export const CONNECTCLUB_LOGO_URL = LOGO_URL;
