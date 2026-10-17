import React from 'react';

export const SoulGuideLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7668D8] to-[#9B8BEA] text-white p-2 shadow-sm ${className}`}>
      {/* Heart integrated with chat bubble */}
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" opacity="0.95" />
        <circle cx="9" cy="9" r="1.2" fill="#FFFFFF" />
        <circle cx="15" cy="9" r="1.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export const MountainsIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-16' }) => {
  return (
    <div className={`relative overflow-hidden rounded-b-2xl ${className}`}>
      <svg
        viewBox="0 0 300 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="none"
      >
        {/* Soft morning sun */}
        <circle cx="210" cy="28" r="14" fill="#FDE68A" opacity="0.8" />
        
        {/* Distant mountain layer */}
        <path
          d="M0 80L35 38C45 28 65 32 80 48L110 80H0Z"
          fill="#D8D0F5"
          opacity="0.6"
        />
        <path
          d="M70 80L145 22C160 10 185 15 200 40L240 80H70Z"
          fill="#C4B9EE"
          opacity="0.75"
        />

        {/* Foreground rolling hill */}
        <path
          d="M160 80L230 35C245 25 265 30 280 50L300 80H160Z"
          fill="#ABA0E6"
          opacity="0.85"
        />
        
        {/* Peaceful base curve */}
        <path
          d="M0 65C80 50 180 62 300 55V80H0V65Z"
          fill="#9486DE"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
