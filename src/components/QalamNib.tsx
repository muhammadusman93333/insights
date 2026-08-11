import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { QalamConfig } from '../utils/qalamSelector';

interface QalamNibProps {
  x: number;
  y: number;
  isWriting: boolean;
  opacity?: number;
  qalam: QalamConfig;
  scale?: number;
}

export const QalamNib: React.FC<QalamNibProps> = ({
  x,
  y,
  isWriting,
  opacity = 1,
  qalam,
  scale = 6,
}) => {
  const frame = useCurrentFrame();

  // Natural writing micro-wobble and calligraphy rhythm
  const microWobbleAngle = isWriting
    ? Math.sin(frame * 1.2) * 2.5 + Math.cos(frame * 0.8) * 1.8
    : 0;

  const penLift = isWriting ? Math.sin(frame * 1.5) * 1.5 : 0;
  const baseAngle = -32 + microWobbleAngle;

  if (opacity <= 0.01) return null;

  const effectiveWidth = Math.round(qalam.width * scale);
  const effectiveHeight = Math.round(qalam.height * scale);
  const pivotX = Math.round(effectiveWidth / 2);
  const pivotY = Math.round(effectiveHeight - 12 * scale);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + penLift,
        pointerEvents: 'none',
        zIndex: 50,
        opacity,
        transform: `translate(-${pivotX}px, -${pivotY}px) rotate(${baseAngle}deg)`,
        transformOrigin: `${pivotX}px ${pivotY}px`, // Pivot right at the ink nib tip
        filter: 'drop-shadow(8px 14px 18px rgba(10, 5, 2, 0.55))',
        transition: 'opacity 0.15s ease-out',
      }}
    >
      <Img
        src={staticFile(`images/${qalam.imageFileName}`)}
        style={{
          width: effectiveWidth,
          height: effectiveHeight,
          objectFit: 'contain',
          display: 'block',
          rotate: "54deg",
          translate: "148.7px 551.8px"
        }} />
    </div>
  );
};
