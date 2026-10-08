import React from 'react';

interface FinFacilLogoProps {
  className?: string;
  size?: number;
  variant?: 'emblem' | 'full';
}

export const FinFacilLogo: React.FC<FinFacilLogoProps> = ({
  className = '',
  size = 36,
  variant = 'emblem',
}) => {
  if (variant === 'emblem') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <defs>
          <linearGradient id="ffMint" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#4eecd2" />
          </linearGradient>

          <linearGradient id="ffCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="ffGold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>

          <linearGradient id="ffArrow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
        </defs>

        <g transform="translate(-136, -35)">
          {/* Outer Upper-Left Ring Arc */}
          <path
            d="M 182 195 C 168 152, 190 100, 245 84 C 278 74, 318 84, 342 110"
            stroke="url(#ffMint)"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />

          {/* Outer Right Gold Arc */}
          <path
            d="M 334 145 C 354 185, 350 232, 318 262 C 298 280, 270 286, 252 284 C 275 278, 308 260, 324 234 C 338 210, 338 175, 334 145 Z"
            fill="url(#ffGold)"
          />

          {/* Bottom Left Cyan Leaf */}
          <path
            d="M 174 212 C 160 238, 172 268, 206 280 C 234 290, 256 270, 250 248 C 232 232, 198 222, 174 212 Z"
            fill="url(#ffCyan)"
          />

          {/* Bottom Center Emerald Growth Leaf */}
          <path
            d="M 230 252 C 248 282, 280 282, 296 256 C 290 236, 264 232, 246 242 C 238 246, 233 249, 230 252 Z"
            fill="url(#ffMint)"
          />

          {/* Dollar Sign ($) Vertical Spine */}
          <path
            d="M 256 72 L 256 230"
            stroke="url(#ffMint)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Dollar S curve */}
          <path
            d="M 292 112 C 292 94, 276 84, 256 84 C 232 84, 218 96, 218 114 C 218 135, 236 144, 258 150 C 284 157, 302 167, 302 190 C 302 214, 282 226, 256 226 C 230 226, 214 214, 214 195"
            stroke="url(#ffMint)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />

          {/* Trend line & Arrow */}
          <path
            d="M 170 238 L 210 196 L 244 226 L 344 116"
            stroke="url(#ffArrow)"
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Arrow Head */}
          <path
            d="M 302 114 L 350 110 L 346 158"
            stroke="url(#ffArrow)"
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    );
  }

  // Full Variant with Typography
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <FinFacilLogo size={size} variant="emblem" />
      <div className="mt-2 text-center">
        <div className="text-xl font-black tracking-tight text-white flex items-center justify-center">
          <span>Fin </span>
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent ml-1">
            Fácil
          </span>
        </div>
        <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
          App
        </p>
      </div>
    </div>
  );
};
