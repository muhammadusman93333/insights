import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { PaperConfig } from '../utils/paperSelector';
import { QalamConfig, resolveQalamConfig } from '../utils/qalamSelector';
import { QalamNib } from './QalamNib';

interface HandwrittenUrduTextProps {
  hookLines?: string[];
  hookStartFrame?: number;
  hookEndFrame?: number;
  bodyLines?: string[];
  bodyStartFrame?: number;
  bodyEndFrame?: number;
  // Shift animation props
  shiftStartFrame?: number;
  shiftEndFrame?: number;
  shouldShift?: boolean;
  centerOffsetY?: number;
  // Backward compatibility props
  urduLines?: string[];
  urduStartFrame?: number;
  urduEndFrame?: number;
  paper?: PaperConfig;
  qalam?: QalamConfig;
  qalamScale?: number;
  fontFamily?: string;
  showPenAnimation?: boolean;
  urduTextColor?: string;
  hookTextColor?: string;
  inkShadow?: string;
  hookShadow?: string;
  dividerColor?: string;
}

export const HandwrittenUrduText: React.FC<HandwrittenUrduTextProps> = ({
  hookLines,
  hookStartFrame = 45,
  hookEndFrame = 120,
  bodyLines,
  bodyStartFrame = 135,
  bodyEndFrame = 300,
  shiftStartFrame = 0,
  shiftEndFrame = 0,
  shouldShift = false,
  centerOffsetY = 520,
  urduLines,
  urduStartFrame,
  urduEndFrame,
  paper,
  qalam,
  qalamScale = 6,
  fontFamily = "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif",
  showPenAnimation = true,
  urduTextColor: customUrduTextColor,
  hookTextColor: customHookTextColor,
  inkShadow: customInkShadow,
  hookShadow: customHookShadow,
  dividerColor,
}) => {
  const frame = useCurrentFrame();

  const isDark = paper?.isDark ?? false;
  const urduTextColor = customUrduTextColor ?? paper?.textColor ?? (isDark ? '#faeed5' : '#140c06');
  const hookTextColor = customHookTextColor ?? (isDark ? '#ffd97d' : '#522004');
  const goldAccent = dividerColor ?? (isDark ? '#dfb76c' : '#8d6224');

  const inkShadow = customInkShadow ?? (isDark
    ? '0 0 12px rgba(223, 183, 108, 0.25)'
    : '0 2px 5px rgba(35, 20, 10, 0.18)');
  const hookShadow = customHookShadow ?? (isDark
    ? '0 0 16px rgba(255, 217, 125, 0.35)'
    : '0 2px 6px rgba(82, 32, 4, 0.22)');

  const activeQalam = qalam ?? resolveQalamConfig();

  // Determine lines to render
  const hasHook = (hookLines && hookLines.length > 0);
  const actualHookLines = hasHook ? hookLines : [];

  let actualBodyLines: string[] = [];
  if (bodyLines && bodyLines.length > 0) {
    actualBodyLines = bodyLines;
  } else if (!hasHook && urduLines && urduLines.length > 0) {
    actualBodyLines = urduLines;
  }

  const totalLines = actualHookLines.length + actualBodyLines.length;
  const containerWidth = 970;
  const containerLeft = (1080 - containerWidth) / 2; // 55px (safe inside 47px inner gold border)

  const isHookOnly = hasHook && actualBodyLines.length === 0;
  const isKasheeda = fontFamily?.includes('Kasheeda') && isHookOnly;
  const widthMultiplier = isKasheeda ? 0.65 : 0.46;

  // Enhanced dynamic typography sizing with increased font size and comfortable line spacing
  let fontSize = 58;
  let lineSpacing = 168;

  if (totalLines >= 11) {
    fontSize = 35;
    lineSpacing = 94;
  } else if (totalLines >= 9) {
    fontSize = 39;
    lineSpacing = 106;
  } else if (totalLines >= 7) {
    fontSize = 45;
    lineSpacing = 122;
  } else if (totalLines >= 5) {
    fontSize = 47;
    lineSpacing = 138;
  } else if (totalLines >= 1) {
    fontSize = 47;
    lineSpacing = 138;
  } else {
    fontSize = 62;
    lineSpacing = 180;
  }

  const textAlignment = 'center';

  const sectionGap = (actualHookLines.length > 0 && actualBodyLines.length > 0)
    ? Math.round(lineSpacing * 0.35)
    : 0;

  // Vertically balanced start top based on total lines
  const startTop = totalLines <= 4 ? 360 : totalLines <= 7 ? 340 : 325;

  // Track active Qalam coordinates
  let activePenX = -100;
  let activePenY = -100;
  let isPenActive = false;
  let penOpacity = 0;

  // Smooth center-to-top glide animation offset for Hook lines (stays centered if only Hook is rendered)
  const hookShiftY = shouldShift && shiftEndFrame > shiftStartFrame
    ? interpolate(
      frame,
      [shiftStartFrame, shiftEndFrame],
      [centerOffsetY, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: (t) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // easeInOutCubic
      }
    )
    : centerOffsetY;

  // 1. Calculate Hook Lines
  const totalHookFrames = Math.max(1, hookEndFrame - hookStartFrame);
  const framesPerHookLine = actualHookLines.length > 0
    ? Math.max(30, Math.floor(totalHookFrames / actualHookLines.length))
    : 60;

  const renderedHookLines = actualHookLines.map((line, index) => {
    const lineStart = hookStartFrame + index * framesPerHookLine;
    const lineEnd = lineStart + Math.floor(framesPerHookLine * 0.88);

    const progress = interpolate(frame, [lineStart, lineEnd], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    const isCurrentLine = frame >= lineStart && frame <= lineEnd + 3;
    const lineY = startTop + index * lineSpacing + hookShiftY;

    const estLineWidth = Math.min(
      containerWidth,
      Math.max(220, line.trim().length * (fontSize * widthMultiplier))
    );

    // Centered alignment with 6px right-side writing margin
    const startX = containerLeft + (containerWidth + estLineWidth) / 2 - 6;
    const endX = containerLeft + (containerWidth - estLineWidth) / 2;

    if (isCurrentLine) {
      isPenActive = true;
      penOpacity = interpolate(
        frame,
        [lineStart, lineStart + 4, lineEnd, lineEnd + 5],
        [0, 1, 1, 0.7],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const xPos = startX - progress * (startX - endX);
      const yWave =
        Math.sin(progress * Math.PI * 20) * 7 +
        Math.cos(progress * Math.PI * 10) * 3;

      activePenX = xPos;
      activePenY = lineY + Math.round(fontSize * 0.9) + yWave;
    }

    return {
      text: line,
      progress,
      lineY,
    };
  });

  // 2. Calculate Body Lines
  const bodyEffectiveStart = (actualHookLines.length === 0 && urduStartFrame !== undefined)
    ? urduStartFrame
    : bodyStartFrame;
  const bodyEffectiveEnd = (actualHookLines.length === 0 && urduEndFrame !== undefined)
    ? urduEndFrame
    : bodyEndFrame;

  const totalBodyFrames = Math.max(1, bodyEffectiveEnd - bodyEffectiveStart);
  const framesPerBodyLine = actualBodyLines.length > 0
    ? Math.max(30, Math.floor(totalBodyFrames / actualBodyLines.length))
    : 60;

  const bodyBaseY = startTop + actualHookLines.length * lineSpacing + sectionGap;

  const renderedBodyLines = actualBodyLines.map((line, index) => {
    const lineStart = bodyEffectiveStart + index * framesPerBodyLine;
    const lineEnd = lineStart + Math.floor(framesPerBodyLine * 0.88);

    const progress = interpolate(frame, [lineStart, lineEnd], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    const isCurrentLine = frame >= lineStart && frame <= lineEnd + 3;
    const lineY = bodyBaseY + index * lineSpacing;

    const estLineWidth = Math.min(
      containerWidth,
      Math.max(220, line.trim().length * (fontSize * widthMultiplier))
    );

    // Centered alignment with 6px right-side writing margin
    const startX = containerLeft + (containerWidth + estLineWidth) / 2 - 6;
    const endX = containerLeft + (containerWidth - estLineWidth) / 2;

    if (isCurrentLine) {
      isPenActive = true;
      penOpacity = interpolate(
        frame,
        [lineStart, lineStart + 4, lineEnd, lineEnd + 5],
        [0, 1, 1, 0.7],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const xPos = startX - progress * (startX - endX);
      const yWave =
        Math.sin(progress * Math.PI * 20) * 7 +
        Math.cos(progress * Math.PI * 10) * 3;

      activePenX = xPos;
      activePenY = lineY + Math.round(fontSize * 0.9) + yWave;
    }


    return {
      text: line,
      progress,
      lineY,
    };
  });

  // Divider between Hook and Body (appears smoothly once hook and title reach the top)
  const showDivider = actualHookLines.length > 0 && actualBodyLines.length > 0;
  const dividerY = startTop + actualHookLines.length * lineSpacing + Math.round(sectionGap * 0.5) - 18;
  const dividerAppearStart = shouldShift && shiftEndFrame > 0
    ? shiftEndFrame - 2
    : hookEndFrame - 5;
  const dividerOpacity = showDivider
    ? interpolate(frame, [dividerAppearStart, dividerAppearStart + 15], [0, 0.85], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
      }}
    >
      {/* Container for Urdu Calligraphy */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: containerLeft,
          width: containerWidth,
          height: 1920,
        }}
      >
        {/* Render Hook Lines */}
        {renderedHookLines.map((item, idx) => {
          const leftClip = Math.max(0, (1 - item.progress) * 100);
          if (item.progress <= 0) return null;

          return (
            <div
              key={`hook_${idx}`}
              style={{
                position: 'absolute',
                top: item.lineY,
                width: '100%',
                textAlign: textAlignment,
                direction: 'rtl',
                fontFamily: `'${fontFamily}', 'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif`,
                fontSize: Math.round(fontSize * 1.04),
                fontWeight: 700,
                lineHeight: 2.0,
                color: hookTextColor,
                textShadow: hookShadow,
                clipPath: `inset(0 0 0 ${leftClip}%)`,
                WebkitClipPath: `inset(0 0 0 ${leftClip}%)`,
                whiteSpace: 'nowrap',
                overflow: 'visible',
              }}
            >
              {item.text}
            </div>
          );
        })}

        {/* Elegant Subtle Divider between Hook and Body */}
        {showDivider && dividerOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              top: dividerY,
              left: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              opacity: dividerOpacity,
            }}
          >
            <div
              style={{
                width: 120,
                height: 1,
                background: `linear-gradient(to right, transparent, ${goldAccent})`,
              }}
            />
            <span style={{ color: goldAccent, fontSize: 16 }}>✦</span>
            <div
              style={{
                width: 120,
                height: 1,
                background: `linear-gradient(to left, transparent, ${goldAccent})`,
              }}
            />
          </div>
        )}

        {/* Render Body Lines */}
        {renderedBodyLines.map((item, idx) => {
          const leftClip = Math.max(0, (1 - item.progress) * 100);
          if (item.progress <= 0) return null;

          return (
            <div
              key={`body_${idx}`}
              style={{
                position: 'absolute',
                top: item.lineY,
                width: '100%',
                textAlign: textAlignment,
                direction: 'rtl',
                fontFamily: `'${fontFamily}', 'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif`,
                fontSize,
                fontWeight: 600,
                lineHeight: 2.0,
                color: urduTextColor,
                textShadow: inkShadow,
                clipPath: `inset(0 0 0 ${leftClip}%)`,
                WebkitClipPath: `inset(0 0 0 ${leftClip}%)`,
                whiteSpace: 'nowrap',
                overflow: 'visible',
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>



      {/* Animated Qalam Nib following the active writing cursor */}
      {showPenAnimation && isPenActive && (
        <QalamNib
          x={activePenX}
          y={activePenY}
          isWriting={isPenActive}
          opacity={penOpacity}
          qalam={activeQalam}
          scale={qalamScale}
        />
      )}
    </div>
  );
};

