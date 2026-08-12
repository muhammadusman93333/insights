import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface NatureFooterProps {
  authorOrSource: string;
  footerStartFrame?: number;
  accentColor?: string;
  primaryColor?: string;
  fontFamily?: string;
}

export const NatureFooter: React.FC<NatureFooterProps> = ({
  authorOrSource,
  footerStartFrame = 280,
  accentColor = '#dfb76c',
  primaryColor = '#2d4a22',
  fontFamily = "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif",
}) => {
  const frame = useCurrentFrame();

  if (!authorOrSource) return null;

  const opacity = interpolate(
    frame,
    [footerStartFrame, footerStartFrame + 25],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const translateY = interpolate(
    frame,
    [footerStartFrame, footerStartFrame + 25],
    [15, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 110,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 32px',
          borderRadius: 30,
          background: 'rgba(10, 24, 14, 0.88)',
          border: `1.5px solid ${accentColor}`,
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ color: accentColor, fontSize: 18 }}>✦</span>
        <span
          style={{
            fontSize: 34,
            color: '#faeed5',
            direction: 'rtl',
            fontFamily: `'${fontFamily}', 'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif`,
            fontWeight: 600,
          }}
        >
          {authorOrSource}
        </span>
        <span style={{ color: accentColor, fontSize: 18 }}>✦</span>
      </div>
    </div>
  );
};
