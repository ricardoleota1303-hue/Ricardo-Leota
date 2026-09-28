import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  className?: string;
  color?: string;
  showText?: boolean;
  textColor?: string;
  textSize?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  customLogoUrl?: string;
  customCompanyName?: string;
  customSlogan?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-9 w-auto',
  color,
  showText = false,
  textColor,
  textSize = 'md',
  theme = 'light',
  customLogoUrl,
  customCompanyName,
  customSlogan,
}) => {
  let appConfig: any = null;
  try {
    const app = useApp();
    appConfig = app.config;
  } catch {
    // Graceful fallback if rendered outside AppContext
    appConfig = null;
  }

  const [imageError, setImageError] = useState(false);

  const activeLogoUrl = customLogoUrl !== undefined ? customLogoUrl : (appConfig?.logoUrl || '');
  const companyShortName = customCompanyName || appConfig?.customTexts?.companyShortName || 'JF12';
  const companySlogan = customSlogan || appConfig?.customTexts?.companySlogan || 'Uniformes Industriales';
  const primaryThemeColor = appConfig?.themeColors?.primaryColor;

  // Primary color for vector fallback
  const fillColor = color || (theme === 'dark' ? (primaryThemeColor || '#38bdf8') : (primaryThemeColor || '#06174a'));

  return (
    <div className="inline-flex items-center gap-2.5 select-none shrink-0">
      {activeLogoUrl && !imageError ? (
        <img
          src={activeLogoUrl}
          alt={appConfig?.companyName || 'Logo de la Empresa'}
          onError={() => setImageError(true)}
          className={`${className} object-contain rounded-md max-h-16`}
          loading="eager"
        />
      ) : (
        <svg
          viewBox="0 0 205 136"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Logo Oficial ${companyShortName}`}
        >
          <g fill={fillColor} transform="translate(18, 5) skewX(-11)">
            {/* Top Overarching Slanted Crossbar */}
            <path d="M 32 10 L 178 10 L 178 35 L 32 35 Z" />

            {/* Letter J: Vertical Stem and Hook to the Left */}
            <path d="M 54 35 L 82 35 L 82 125 L 8 125 L 8 101 L 54 101 Z" />

            {/* Letter F: Vertical Stem with Rounded Bottom Terminal */}
            <path d="M 97 35 L 125 35 L 125 114 C 125 120.5 119.5 125 111 125 C 102.5 125 97 120.5 97 114 Z" />

            {/* Letter F: Middle Horizontal Arm */}
            <path d="M 125 54 L 168 54 L 168 76 L 125 76 Z" />

            {/* Numeral 1 in 12 */}
            <path d="M 134 93 L 141 87 L 149 87 L 149 125 L 138 125 L 138 99 L 134 102 Z" />

            {/* Numeral 2 in 12 */}
            <path d="M 154 96 C 154 89.5 158.5 85.5 166.5 85.5 C 174.5 85.5 179 89.5 179 96 C 179 101.5 175.5 105.5 168.5 110.5 L 162 115 L 180 115 L 180 125 L 153 125 L 153 117 L 166.5 106 C 169.5 103.5 171 100.5 171 97 C 171 94.5 169 92.5 166 92.5 C 163 92.5 161 94.5 161 97 Z" />
          </g>
        </svg>
      )}

      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <span
            className={`font-black tracking-tight ${
              textColor || (theme === 'dark' ? 'text-white' : 'text-slate-900')
            } ${
              textSize === 'lg'
                ? 'text-xl'
                : textSize === 'sm'
                ? 'text-sm'
                : 'text-base'
            }`}
          >
            {companyShortName}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
            {companySlogan}
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
