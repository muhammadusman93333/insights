import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BgThemeType } from '../types';

interface IslamicBordersProps {
  isDark?: boolean;
  theme?: BgThemeType | string;
}

export const IslamicBorders: React.FC<IslamicBordersProps> = ({
  isDark: isDarkProp,
  theme = 'vintage-parchment',
}) => {
  const frame = useCurrentFrame();

  const isDark = isDarkProp ?? (theme === 'dark-marble' || theme === 'warm-amber');
  const primaryGold = isDark ? '#dfb76c' : '#8d6322';
  const secondaryGold = isDark ? '#b88938' : '#b28641';
  const frameOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 35,
        pointerEvents: 'none',
        opacity: frameOpacity,
        zIndex: 15,
      }}
    >
      {/* Outer Border with double pinstripe */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `2px solid ${primaryGold}`,
          borderRadius: 20,
          boxShadow: isDark
            ? `0 0 15px rgba(223, 183, 108, 0.2), inset 0 0 15px rgba(223, 183, 108, 0.1)`
            : `0 0 10px rgba(141, 99, 34, 0.15)`,
        }}
      />

      {/* Inner Inset Border */}
      <div
        style={{
          position: 'absolute',
          inset: 12,
          border: `1px solid ${secondaryGold}`,
          borderRadius: 14,
          opacity: 0.6,
        }}
      />

      {/* Corner Ornaments */}
      {/* Top Left */}
      <svg
        style={{ position: 'absolute', top: 4, left: 4 }}
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
      >
        <path
          d="M6 84V20C6 12.268 12.268 6 20 6H84"
          stroke={primaryGold}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M16 75V26C16 20.477 20.477 16 26 16H75"
          stroke={secondaryGold}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="35" cy="35" r="5" fill={primaryGold} />
        <path
          d="M35 15L40 30L55 35L40 40L35 55L30 40L15 35L30 30Z"
          fill={primaryGold}
          opacity="0.75"
        />
      </svg>

      {/* Top Right */}
      <svg
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          transform: 'scaleX(-1)',
        }}
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
      >
        <path
          d="M6 84V20C6 12.268 12.268 6 20 6H84"
          stroke={primaryGold}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M16 75V26C16 20.477 20.477 16 26 16H75"
          stroke={secondaryGold}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="35" cy="35" r="5" fill={primaryGold} />
        <path
          d="M35 15L40 30L55 35L40 40L35 55L30 40L15 35L30 30Z"
          fill={primaryGold}
          opacity="0.75"
        />
      </svg>

      {/* Bottom Left */}
      <svg
        style={{
          position: 'absolute',
          bottom: 4,
          left: 4,
          transform: 'scaleY(-1)',
        }}
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
      >
        <path
          d="M6 84V20C6 12.268 12.268 6 20 6H84"
          stroke={primaryGold}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M16 75V26C16 20.477 20.477 16 26 16H75"
          stroke={secondaryGold}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="35" cy="35" r="5" fill={primaryGold} />
        <path
          d="M35 15L40 30L55 35L40 40L35 55L30 40L15 35L30 30Z"
          fill={primaryGold}
          opacity="0.75"
        />
      </svg>

      {/* Bottom Right */}
      <svg
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          transform: 'scale(-1, -1)',
        }}
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
      >
        <path
          d="M6 84V20C6 12.268 12.268 6 20 6H84"
          stroke={primaryGold}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M16 75V26C16 20.477 20.477 16 26 16H75"
          stroke={secondaryGold}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="35" cy="35" r="5" fill={primaryGold} />
        <path
          d="M35 15L40 30L55 35L40 40L35 55L30 40L15 35L30 30Z"
          fill={primaryGold}
          opacity="0.75"
        />
      </svg>

      {/* Top Center Arch Motif */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 90,
            height: 1,
            background: `linear-gradient(to right, transparent, ${primaryGold})`,
          }}
        />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9"
            fill={primaryGold}
          />
        </svg>
        <div
          style={{
            width: 90,
            height: 1,
            background: `linear-gradient(to left, transparent, ${primaryGold})`,
          }}
        />
      </div>
    </div>
  );
};
