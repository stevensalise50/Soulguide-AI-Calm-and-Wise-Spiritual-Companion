import React from 'react';

export const RobotIllustration: React.FC<{ className?: string }> = ({ className = 'w-44 h-44' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Soft background glow & lavender circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#EEE9FB] via-[#F4F0FD] to-[#E5DCF9] dark:from-[#2B294D] dark:via-[#23243F] dark:to-[#1E1F36] scale-95 shadow-inner" />
      
      {/* Decorative floating sparkles and organic leaves */}
      <svg className="absolute -top-2 -right-1 w-6 h-6 text-[#9B8BEA] animate-pulse-subtle" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
      <svg className="absolute top-1/2 -left-3 w-4 h-4 text-[#7668D8] opacity-75" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
      <svg className="absolute -bottom-1 right-2 w-5 h-5 text-[#86EFAC] opacity-80" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
      </svg>

      {/* Robot Character SVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Headphone Band */}
        <path
          d="M 50 95 C 50 45, 150 45, 150 95"
          stroke="#7668D8"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Headphone Earcups */}
        <rect x="36" y="80" width="18" height="32" rx="9" fill="#9B8BEA" />
        <rect x="40" y="84" width="10" height="24" rx="5" fill="#7668D8" />
        
        <rect x="146" y="80" width="18" height="32" rx="9" fill="#9B8BEA" />
        <rect x="150" y="84" width="10" height="24" rx="5" fill="#7668D8" />

        {/* Robot Head Body */}
        <rect
          x="52"
          y="56"
          width="96"
          height="82"
          rx="38"
          fill="#FFFFFF"
          stroke="#E9E5EE"
          strokeWidth="2.5"
        />

        {/* Face Screen Visor */}
        <rect
          x="64"
          y="68"
          width="72"
          height="54"
          rx="24"
          fill="#1C1D33"
        />

        {/* Eyes (Gentle Glowing Lavender/Purple curved smiling eyes) */}
        <path
          d="M 78 92 Q 85 84 92 92"
          stroke="#9B8BEA"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 108 92 Q 115 84 122 92"
          stroke="#9B8BEA"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cheerful Little Heart/Smile on screen */}
        <path
          d="M 96 104 Q 100 109 104 104"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Soft Pink Blush on Cheeks */}
        <circle cx="73" cy="98" r="4.5" fill="#F472B6" opacity="0.6" />
        <circle cx="127" cy="98" r="4.5" fill="#F472B6" opacity="0.6" />

        {/* Tiny Antenna Star Light */}
        <circle cx="100" cy="40" r="5" fill="#FBBF24" />
        <line x1="100" y1="45" x2="100" y2="56" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

        {/* Little Floating Hands */}
        <rect x="42" y="132" width="22" height="14" rx="7" fill="#FFFFFF" stroke="#E9E5EE" strokeWidth="2" />
        <rect x="136" y="132" width="22" height="14" rx="7" fill="#FFFFFF" stroke="#E9E5EE" strokeWidth="2" />

        {/* Tiny Green Sprout on side */}
        <path
          d="M 152 145 C 158 135 170 138 168 148 C 160 152 154 148 152 145 Z"
          fill="#4ADE80"
        />
      </svg>
    </div>
  );
};
