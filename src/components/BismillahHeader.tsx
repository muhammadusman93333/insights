import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BgThemeType } from '../types';

interface HeaderTitleProps {
  title?: string;
  isDark?: boolean;
  theme?: BgThemeType | string;
  fontFamily?: string;
}

export const BismillahHeader: React.FC<HeaderTitleProps> = ({
  title,
  isDark: isDarkProp,
  theme = 'vintage-parchment',
  fontFamily = "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif",
}) => {
  const frame = useCurrentFrame();

  if (!title) return null;

  const isDark = isDarkProp ?? (theme === 'dark-marble' || theme === 'warm-amber');
  const goldPrimary = isDark ? '#dfb76c' : '#8d6224';
  const titleColor = isDark ? '#fbf6ea' : '#2b190a';
  const badgeBg = isDark
    ? 'rgba(35, 24, 12, 0.85)'
    : 'rgba(242, 230, 204, 0.9)';
  const badgeBorder = isDark ? '#c89d4d' : '#a87834';

  // Smooth cinematic entrance
  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(frame, [0, 25], [-20, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 130,
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 20,
      }}
    >
      {/* Prominent Large Calligraphic Title Banner */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 20,
          padding: '14px 44px',
          borderRadius: 40,
          background: badgeBg,
          border: `2px solid ${badgeBorder}`,
          boxShadow: isDark
            ? '0 8px 24px rgba(0,0,0,0.5), inset 0 0 15px rgba(223,183,108,0.15)'
            : '0 6px 18px rgba(80,50,20,0.15)',
        }}
      >
        <span
          style={{
            color: goldPrimary,
            fontSize: 26,
          }}
        >
          ✦
        </span>
        <span
          style={{
            fontSize: 54,
            fontWeight: 'bold',
            color: titleColor,
            direction: 'rtl',
            fontFamily: `'${fontFamily}', 'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif`,
            letterSpacing: 1,
            textShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.6)'
              : '0 1px 2px rgba(255,255,255,0.6)',
          }}
        >
          {title}
        </span>
        <span
          style={{
            color: goldPrimary,
            fontSize: 26,
          }}
        >
          ✦
        </span>
      </div>

      {/* Elegant Golden Divider line beneath the title */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          width: 500,
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1.5,
            background: `linear-gradient(to right, transparent, ${goldPrimary})`,
          }}
        />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9"
            fill={goldPrimary}
          />
        </svg>
        <div
          style={{
            flex: 1,
            height: 1.5,
            background: `linear-gradient(to left, transparent, ${goldPrimary})`,
          }}
        />
      </div>
    </div>
  );
};
