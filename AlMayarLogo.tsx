import React from "react";

interface AlMayarLogoProps {
  logoUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function AlMayarLogo({ logoUrl, size = "md", className = "" }: AlMayarLogoProps) {
  // If the user has configured an actual image URL, render it
  if (logoUrl) {
    const sizeClasses = {
      sm: "w-10 h-10",
      md: "w-16 h-16 sm:w-20 sm:h-20",
      lg: "w-28 h-28 sm:w-36 sm:h-36",
      xl: "w-44 h-44 sm:w-56 sm:h-56",
    };
    return (
      <img
        src={logoUrl}
        alt="متجر الميار لملابس النساء"
        className={`object-contain rounded-full shadow-md ${sizeClasses[size]} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Otherwise, render our custom high-fidelity SVG that perfectly replicates the beautiful Al Mayar logo
  const sizeDims = {
    sm: { width: 44, height: 44 },
    md: { width: 80, height: 80 },
    lg: { width: 150, height: 150 },
    xl: { width: 240, height: 240 },
  };

  const { width, height } = sizeDims[size];

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width, height }}>
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Gold Gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBA6B" />
            <stop offset="30%" stopColor="#F5E3A9" />
            <stop offset="70%" stopColor="#C59E4E" />
            <stop offset="100%" stopColor="#9E7A2F" />
          </linearGradient>

          {/* Soft Pink Background Gradient */}
          <radialGradient id="pinkBg" cx="50%" cy="45%" r="45%">
            <stop offset="0%" stopColor="#FFF1F3" />
            <stop offset="60%" stopColor="#FCDCE2" />
            <stop offset="100%" stopColor="#F7BFC9" />
          </radialGradient>

          {/* Ribbon Purple Gradient */}
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#501A22" />
            <stop offset="50%" stopColor="#7D2D3E" />
            <stop offset="100%" stopColor="#501A22" />
          </linearGradient>

          {/* Gold Stroke Gradient */}
          <linearGradient id="goldStroke" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9E7A2F" />
            <stop offset="50%" stopColor="#F5E3A9" />
            <stop offset="100%" stopColor="#C59E4E" />
          </linearGradient>

          {/* Soft Shadow Filter */}
          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" floodColor="#722F37" />
          </filter>
        </defs>

        <g filter="url(#logoShadow)">
          {/* 1. Outer Ornate Golden Shield Frame */}
          <path
            d="M 250,55 
               C 335,55 385,85 410,135 
               C 430,175 425,260 415,310 
               C 405,360 375,410 250,455 
               C 125,410 95,360 85,310 
               C 75,260 70,175 90,135 
               C 115,85 165,55 250,55 Z"
            fill="url(#pinkBg)"
            stroke="url(#goldStroke)"
            strokeWidth="12"
          />

          {/* Inside delicate golden accent border */}
          <path
            d="M 250,70 
               C 322,70 368,96 392,141 
               C 409,173 408,247 398,293 
               C 389,339 360,381 250,425 
               C 140,381 111,339 102,293 
               C 92,247 91,173 108,141 
               C 132,96 178,70 250,70 Z"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
          />

          {/* 2. Sparkles in the background */}
          <g opacity="0.6">
            <path d="M 160,120 L 165,110 L 170,120 L 180,125 L 170,130 L 165,140 L 160,130 L 150,125 Z" fill="#FFF" />
            <path d="M 340,120 L 343,113 L 346,120 L 353,123 L 346,126 L 343,133 L 340,126 L 333,123 Z" fill="#FFF" />
            <path d="M 130,230 L 132,225 L 134,230 L 139,232 L 134,234 L 132,239 L 130,234 L 125,232 Z" fill="#FFF" />
            <circle cx="280" cy="110" r="3" fill="#FFF" />
            <circle cx="220" cy="140" r="2" fill="#FFF" />
            <circle cx="150" cy="180" r="3.5" fill="url(#goldGrad)" />
            <circle cx="350" cy="180" r="3" fill="url(#goldGrad)" />
          </g>

          {/* 3. Golden Leaves and Roses details decorating the frame */}
          {/* Top Roses (3 pink roses at the crest) */}
          <g>
            {/* Center Top Rose */}
            <circle cx="250" cy="55" r="14" fill="#E48B9D" stroke="url(#goldStroke)" strokeWidth="1.5" />
            <circle cx="250" cy="55" r="8" fill="#C4657B" />
            <circle cx="250" cy="55" r="4" fill="#913349" />
            {/* Left Top Rose */}
            <circle cx="225" cy="58" r="11" fill="#E48B9D" stroke="url(#goldStroke)" strokeWidth="1.5" />
            <circle cx="225" cy="58" r="6" fill="#C4657B" />
            {/* Right Top Rose */}
            <circle cx="275" cy="58" r="11" fill="#E48B9D" stroke="url(#goldStroke)" strokeWidth="1.5" />
            <circle cx="275" cy="58" r="6" fill="#C4657B" />

            {/* Left and Right floral frames */}
            {/* Golden Leaves on Left */}
            <path d="M 170,55 C 150,60 135,75 120,95" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 120,95 Q 110,110 100,130" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 85,250 C 80,280 85,310 95,340" stroke="url(#goldGrad)" strokeWidth="4" />
            {/* Golden Leaves on Right */}
            <path d="M 330,55 C 350,60 365,75 380,95" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 380,95 Q 390,110 400,130" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 415,250 C 420,280 415,310 405,340" stroke="url(#goldGrad)" strokeWidth="4" />

            {/* Side pink rosebud decoration */}
            <circle cx="108" cy="145" r="9" fill="#E48B9D" stroke="url(#goldStroke)" strokeWidth="1" />
            <circle cx="392" cy="145" r="9" fill="#E48B9D" stroke="url(#goldStroke)" strokeWidth="1" />
            <circle cx="90" cy="270" r="10" fill="#E48B9D" stroke="url(#goldStroke)" strokeWidth="1" />
            <circle cx="410" cy="270" r="10" fill="#E48B9D" stroke="url(#goldStroke)" strokeWidth="1" />
          </g>

          {/* 4. Silhouette of the Elegant Lady (Center Art) */}
          <g>
            {/* Elegant Flowing Dress - Pink-Purple Gown */}
            <path
              d="M 250,170
                 C 230,190 200,240 160,260
                 C 150,265 170,270 190,268
                 C 220,265 240,245 250,225
                 C 260,245 280,265 310,268
                 C 330,270 350,265 340,260
                 C 300,240 270,190 250,170 Z"
              fill="#9F4055"
              opacity="0.85"
            />
            {/* Additional elegant folds of the dress reaching down behind text */}
            <path
              d="M 250,195
                 C 230,220 185,275 145,290
                 C 135,293 150,300 175,296
                 C 215,290 240,260 250,240
                 C 260,260 285,290 325,296
                 C 350,300 365,293 355,290
                 C 315,275 270,220 250,195 Z"
              fill="#BD5A71"
              opacity="0.65"
            />

            {/* Lady Silhouette (Body, Neck, and Head in Dark Purple/Plum Black) */}
            <path
              d="M 250,135 
                 C 248,138 245,142 244,146 
                 C 243,150 244,153 246,156 
                 C 247,158 249,161 248,164 
                 C 247,166 244,168 242,170 
                 C 246,170 254,170 258,170 
                 C 256,168 253,166 252,164 
                 C 251,161 253,158 254,156 
                 C 256,153 257,150 256,146 
                 C 255,142 252,138 250,135 Z"
              fill="#2E1117"
            />
            {/* Lady Head */}
            <circle cx="250" cy="130" r="7" fill="#2E1117" />
            {/* Elegant Side-Profile Hair-updo */}
            <circle cx="254" cy="130" r="4.5" fill="#2E1117" />

            {/* Hand on waist & arm line */}
            <path d="M 245,146 C 238,152 238,157 242,161" stroke="#2E1117" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Other arm holding a hanger */}
            <path d="M 255,146 C 263,149 268,145 275,138" stroke="#2E1117" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Golden Hanger */}
            <path d="M 275,138 C 275,134 278,131 280,133 C 282,135 281,138 277,140" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" />
            <path d="M 268,144 L 275,138 L 285,144" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* 5. Elegant Wide-Brimmed Pink/Plum Hat */}
            <path
               d="M 225,124 
                  C 235,118 265,118 275,124 
                  C 285,127 295,123 285,118 
                  C 270,111 230,111 215,118 
                  C 205,123 215,127 225,124 Z"
               fill="#9F4055"
               stroke="url(#goldStroke)"
               strokeWidth="1"
            />
            {/* Flower decoration on hat */}
            <circle cx="242" cy="122" r="3.5" fill="#FAF5F6" />
            <circle cx="242" cy="122" r="1.5" fill="#C4657B" />
          </g>

          {/* 6. Accessories inside the shield (Handbag and High-Heel Shoe) */}
          <g opacity="0.9">
            {/* Handbag on the Left */}
            <path d="M 135,220 C 135,212 145,212 145,220" stroke="#722F37" strokeWidth="2" fill="none" />
            <path d="M 128,220 L 152,220 L 155,238 C 155,241 152,243 149,243 L 131,243 C 128,243 125,241 125,238 Z" fill="#9F4055" stroke="url(#goldGrad)" strokeWidth="1" />
            <circle cx="140" cy="230" r="3" fill="url(#goldGrad)" />

            {/* High-Heel Shoe on the Right */}
            <path d="M 345,232 C 352,232 358,226 364,222 C 367,220 371,223 369,226 L 364,240 C 363,242 360,243 358,243 L 345,243 Z" fill="#501A22" />
            <path d="M 346,243 L 346,233" stroke="url(#goldGrad)" strokeWidth="1.5" />
          </g>

          {/* 7. Golden Calligraphy-Style Store Name: "متجر الميار" */}
          {/* We will draw custom calligraphic paths for "متجر الميار" to look absolutely majestic and high-end! */}
          <g transform="translate(110, 290)">
            {/* Background shadow for text legibility */}
            <text x="140" y="52" fill="#4B1B22" fontSize="56" fontWeight="900" fontFamily="'Amiri', 'Cairo', serif" textAnchor="middle" opacity="0.15">
              متجر الميار
            </text>
            {/* Foreground text using premium gold gradient */}
            <text x="140" y="50" fill="url(#goldGrad)" fontSize="56" fontWeight="900" fontFamily="'Amiri', 'Cairo', serif" textAnchor="middle" stroke="#3A2105" strokeWidth="1.5">
              متجر المِيَار
            </text>
          </g>

          {/* Sparkles on the Text */}
          <path d="M 135,320 L 138,313 L 141,320 L 148,323 L 141,326 L 138,333 L 135,326 L 128,323 Z" fill="#FFF" />
          <path d="M 350,305 L 352,300 L 354,305 L 359,307 L 354,309 L 352,314 L 350,309 L 345,307 Z" fill="#FFF" />

          {/* 8. Majestic Ribbons Banner at the Bottom */}
          <g>
            {/* Left Ribbon End Fold */}
            <path d="M 100,380 L 130,350 L 130,390 Z" fill="#3D131A" />
            <path d="M 75,370 L 110,355 L 110,390 L 75,405 L 90,387 Z" fill="#5E1F2A" />

            {/* Right Ribbon End Fold */}
            <path d="M 400,380 L 370,350 L 370,390 Z" fill="#3D131A" />
            <path d="M 425,370 L 390,355 L 390,390 L 425,405 L 410,387 Z" fill="#5E1F2A" />

            {/* Main Ribbon Body */}
            <path
              d="M 110,355
                 C 200,345 300,345 390,355
                 L 395,392
                 C 300,382 200,382 105,392
                 Z"
              fill="url(#purpleGrad)"
              stroke="url(#goldGrad)"
              strokeWidth="2.5"
            />

            {/* Gold trim lines on ribbon */}
            <path d="M 115,360 C 200,351 300,351 385,360" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.6" fill="none" />
            <path d="M 110,387 C 200,377 300,377 390,387" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.6" fill="none" />

            {/* Banner Text: "للملابس النسائية" */}
            <text
              x="250"
              y="378"
              fill="#FFF"
              fontSize="21"
              fontWeight="bold"
              fontFamily="'Cairo', sans-serif"
              textAnchor="middle"
              letterSpacing="1"
              style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.5)" }}
            >
              للملابس النسائية
            </text>
          </g>

          {/* Tiny details under ribbon */}
          <path d="M 235,410 L 240,402 L 245,410 L 253,413 L 245,416 L 240,424 L 235,416 L 227,413 Z" fill="url(#goldGrad)" />
          <circle cx="215" cy="413" r="2.5" fill="url(#goldGrad)" />
          <circle cx="265" cy="413" r="2.5" fill="url(#goldGrad)" />
        </g>
      </svg>
    </div>
  );
}
