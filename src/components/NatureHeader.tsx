import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface NatureHeaderProps {
  title?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  shiftStartFrame?: number;
  shiftEndFrame?: number;
  shouldShift?: boolean;
  centerOffsetY?: number;
}

export const NatureHeader: React.FC<NatureHeaderProps> = ({
  title,
  primaryColor = '#2d4a22',
  accentColor = '#dfb76c',
  fontFamily = "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif",
  shiftStartFrame = 0,
  shiftEndFrame = 0,
  shouldShift = false,
  centerOffsetY = 520,
}) => {
  const frame = useCurrentFrame();

  if (!title) return null;

  // Smooth cinematic entrance
  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const entranceSlide = interpolate(frame, [0, 25], [-20, 0], {
    extrapolateRight: 'clamp',
  });

  // Smooth center-to-top glide animation (stays centered if only Hook is rendered)
  const shiftY =
    shouldShift && shiftEndFrame > shiftStartFrame
      ? interpolate(frame, [shiftStartFrame, shiftEndFrame], [centerOffsetY, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        })
      : centerOffsetY;

  const totalTranslateY = entranceSlide + shiftY;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 130,
        opacity,
        transform: `translateY(${totalTranslateY}px)`,
        zIndex: 20,
      }}
    >
      {/* Nature Frosted Title Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 20,
          padding: '14px 44px',
          borderRadius: 40,
          background: 'rgba(11, 26, 16, 0.85)',
          border: `2px solid ${accentColor}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 0 15px rgba(223,183,108,0.15)',
        }}
      >
        <span style={{ color: accentColor, fontSize: 24 }}>✦</span>
        <span
          style={{
            fontSize: 52,
            fontWeight: 'bold',
            color: '#fffbf0',
            direction: 'rtl',
            fontFamily: `'${fontFamily}', 'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif`,
            letterSpacing: 1,
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
          }}
        >
          {title}
        </span>
        <span style={{ color: accentColor, fontSize: 24 }}>✦</span>
      </div>

      {/* Decorative Gold & Nature Line */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          width: 480,
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1.5,
            background: `linear-gradient(to right, transparent, ${accentColor})`,
          }}
        />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill={accentColor} />
        </svg>
        <div
          style={{
            flex: 1,
            height: 1.5,
            background: `linear-gradient(to left, transparent, ${accentColor})`,
          }}
        />
      </div>
    </div>
  );
};
