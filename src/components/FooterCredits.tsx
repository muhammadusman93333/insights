import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BgThemeType } from '../types';

interface FooterCreditsProps {
  authorOrSource?: string;
  footerStartFrame: number;
  isDark?: boolean;
  theme?: BgThemeType | string;
}

export const FooterCredits: React.FC<FooterCreditsProps> = ({
  authorOrSource,
  footerStartFrame,
  isDark: isDarkProp,
  theme = 'vintage-parchment',
}) => {
  const frame = useCurrentFrame();

  if (!authorOrSource) return null;

  const isDark = isDarkProp ?? (theme === 'dark-marble' || theme === 'warm-amber');
  const textColor = isDark ? '#dfb76c' : '#3d260c';
  const sealBg = isDark
    ? 'rgba(30, 20, 10, 0.7)'
    : 'rgba(235, 218, 192, 0.9)';
  const sealBorder = isDark ? '#a87834' : '#8c6027';

  const opacity = interpolate(
    frame,
    [footerStartFrame, footerStartFrame + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [footerStartFrame, footerStartFrame + 25],
    [15, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 110,
        right: 90,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        direction: 'rtl',
        zIndex: 20,
      }}
    >
      <div
        style={{
          padding: '6px 20px',
          borderRadius: 20,
          background: sealBg,
          border: `1px solid ${sealBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <span
          style={{
            fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif",
            fontSize: 24,
            fontWeight: 'bold',
            color: textColor,
          }}
        >
          {authorOrSource}
        </span>
      </div>
    </div>
  );
};
