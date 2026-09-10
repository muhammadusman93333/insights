import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type { Caption } from '@remotion/captions';
import { PaperConfig } from '../utils/paperSelector';
import { QalamConfig, resolveQalamConfig } from '../utils/qalamSelector';
import { QalamNib } from './QalamNib';

export type CaptionLike = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs?: number | null;
  confidence?: number | null;
};

interface HandwrittenUrduTextProps {
  hookLines?: string[];
  hookStartFrame?: number;
  hookEndFrame?: number;
  bodyLines?: string[];
  bodyStartFrame?: number;
  bodyEndFrame?: number;
  // Remotion Captions synchronization
  hookCaptions?: CaptionLike[];
  bodyCaptions?: CaptionLike[];
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
  hookStartFrame = 0,
  hookEndFrame = 120,
  bodyLines,
  bodyStartFrame = 135,
  bodyEndFrame = 300,
  hookCaptions,
  bodyCaptions,
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

  // Helper: map sequential word captions to rendered lines
  const groupCaptionsByLines = (lines: string[], captions?: CaptionLike[]): CaptionLike[][] => {
    if (!captions || captions.length === 0 || lines.length === 0) {
      return lines.map(() => []);
    }
    const result: CaptionLike[][] = [];
    let captionIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const wordsInLine = line.trim().split(/\s+/).filter(Boolean);
      const lineCaptions: CaptionLike[] = [];

      if (i === lines.length - 1) {
        while (captionIdx < captions.length) {
          lineCaptions.push(captions[captionIdx]);
          captionIdx++;
        }
      } else {
        for (let w = 0; w < wordsInLine.length && captionIdx < captions.length; w++) {
          lineCaptions.push(captions[captionIdx]);
          captionIdx++;
        }
      }
      result.push(lineCaptions);
    }
    return result;
  };

  // Helper: compute word-level progress and pause status for line captions
  const calculateCaptionProgress = (
    lineCaptions: CaptionLike[],
    sectionTimeMs: number
  ): { progress: number; isInsideWord: boolean } => {
    if (lineCaptions.length === 0) {
      return { progress: 0, isInsideWord: false };
    }

    const lineStartMs = lineCaptions[0].startMs;
    const lineEndMs = lineCaptions[lineCaptions.length - 1].endMs;

    if (sectionTimeMs <= lineStartMs) {
      return { progress: 0, isInsideWord: false };
    }
    if (sectionTimeMs >= lineEndMs) {
      return { progress: 1, isInsideWord: false };
    }

    const totalWordChars = lineCaptions.reduce((acc, c) => acc + Math.max(1, c.text.length), 0);
    let charsCompleted = 0;
    let isInsideWord = false;

    for (let k = 0; k < lineCaptions.length; k++) {
      const word = lineCaptions[k];
      const wordLen = Math.max(1, word.text.length);

      if (sectionTimeMs < word.startMs) {
        // Pausing before next word
        break;
      } else if (sectionTimeMs >= word.startMs && sectionTimeMs <= word.endMs) {
        isInsideWord = true;
        const wordSpan = Math.max(1, word.endMs - word.startMs);
        const wordFrac = Math.min(1, Math.max(0, (sectionTimeMs - word.startMs) / wordSpan));
        charsCompleted += wordFrac * wordLen;
        break;
      } else {
        charsCompleted += wordLen;
      }
    }

    const progress = Math.min(1, Math.max(0, charsCompleted / totalWordChars));
    return { progress, isInsideWord };
  };

  // 1. Calculate Hook Lines timing synchronized with voiceover
  const hasHookCaptions = hookCaptions && hookCaptions.length > 0;
  const hookCaptionsByLine = groupCaptionsByLines(actualHookLines, hookCaptions);

  const totalHookFrames = Math.max(1, hookEndFrame - hookStartFrame);
  const totalHookChars = actualHookLines.reduce((sum, l) => sum + Math.max(1, l.trim().length), 0) || 1;
  const hookSpeechOffset = 0;
  const availableHookFrames = Math.max(actualHookLines.length * 28, totalHookFrames);

  let currentHookFrame = hookStartFrame;
  const screenCenterX = containerLeft + containerWidth / 2; // 540px center of screen
  const hookLineTimings = actualHookLines.map((line, index) => {
    const lineY = startTop + index * lineSpacing + hookShiftY;
    const words = line.trim().split(/\s+/).filter(Boolean);
    const charCount = line.replace(/\s+/g, '').length;
    const spaceCount = Math.max(0, words.length - 1);
    const charFactor = isKasheeda ? 0.58 : 0.40;
    const rawWidth = charCount * (fontSize * charFactor) + spaceCount * (fontSize * 0.28);
    const estLineWidth = Math.min(containerWidth - 20, Math.max(fontSize * 1.1, rawWidth));
    const startX = screenCenterX + estLineWidth / 2;
    const endX = screenCenterX - estLineWidth / 2;

    if (hasHookCaptions) {
      const lineCaps = hookCaptionsByLine[index] || [];
      const lineStartMs = lineCaps[0]?.startMs ?? (index * 2000);
      const lineEndMs = lineCaps[lineCaps.length - 1]?.endMs ?? ((index + 1) * 2000);
      const lineStart = hookStartFrame + Math.floor((lineStartMs / 1000) * 30);
      const lineEnd = hookStartFrame + Math.ceil((lineEndMs / 1000) * 30);
      return { line, index, lineY, startX, endX, lineStart, lineEnd, lineCaps, isCaptionDriven: true };
    } else {
      const lineChars = Math.max(1, line.trim().length);
      const lineWeight = lineChars / totalHookChars;
      const allocatedFrames = Math.max(28, Math.round(availableHookFrames * lineWeight));
      const lineStart = currentHookFrame;
      const lineEnd = lineStart + Math.max(26, Math.floor(allocatedFrames * 0.96));
      currentHookFrame = lineStart + allocatedFrames;
      return { line, index, lineY, startX, endX, lineStart, lineEnd, lineCaps: [], isCaptionDriven: false };
    }
  });

  const renderedHookLines = hookLineTimings.map((item, index) => {
    let progress = 0;
    let isInsideWord = true;

    if (item.isCaptionDriven) {
      const sectionTimeMs = ((frame - hookStartFrame) / 30) * 1000;
      const res = calculateCaptionProgress(item.lineCaps, sectionTimeMs);
      progress = res.progress;
      isInsideWord = res.isInsideWord;
    } else {
      progress = interpolate(frame, [item.lineStart, item.lineEnd], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }

    const isCurrentLine = frame >= item.lineStart && frame <= item.lineEnd + 3;

    if (isCurrentLine) {
      isPenActive = true;
      penOpacity = interpolate(
        frame,
        [item.lineStart, item.lineStart + 4, item.lineEnd, item.lineEnd + 4],
        [0, 1, 1, 0.7],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const xPos = item.startX - progress * (item.startX - item.endX);
      const yWave = isInsideWord
        ? (Math.sin(progress * Math.PI * 20) * 7 + Math.cos(progress * Math.PI * 10) * 3)
        : 0;

      activePenX = xPos;
      activePenY = item.lineY + Math.round(fontSize * 0.9) + yWave;
    } else if (index < hookLineTimings.length - 1) {
      // Smooth inter-line glide between line completion and next line start
      const nextLine = hookLineTimings[index + 1];
      if (frame > item.lineEnd + 3 && frame < nextLine.lineStart) {
        const glide = interpolate(frame, [item.lineEnd + 3, nextLine.lineStart], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        isPenActive = true;
        penOpacity = 0.8;
        activePenX = item.endX + glide * (nextLine.startX - item.endX);
        activePenY = item.lineY + glide * (nextLine.lineY - item.lineY) + Math.round(fontSize * 0.9);
      }
    }

    return {
      text: item.line,
      progress,
      lineY: item.lineY,
    };
  });

  // 2. Calculate Body Lines timing synchronized with voiceover
  const bodyEffectiveStart = (actualHookLines.length === 0 && urduStartFrame !== undefined)
    ? urduStartFrame
    : bodyStartFrame;
  const bodyEffectiveEnd = (actualHookLines.length === 0 && urduEndFrame !== undefined)
    ? urduEndFrame
    : bodyEndFrame;

  const hasBodyCaptions = bodyCaptions && bodyCaptions.length > 0;
  const bodyCaptionsByLine = groupCaptionsByLines(actualBodyLines, bodyCaptions);

  const totalBodyFrames = Math.max(1, bodyEffectiveEnd - bodyEffectiveStart);
  const totalBodyChars = actualBodyLines.reduce((sum, l) => sum + Math.max(1, l.trim().length), 0) || 1;
  const bodySpeechOffset = actualBodyLines.length > 0 ? Math.min(8, Math.floor(totalBodyFrames * 0.05)) : 0;
  const availableBodyFrames = Math.max(actualBodyLines.length * 28, totalBodyFrames - bodySpeechOffset);

  const bodyBaseY = startTop + actualHookLines.length * lineSpacing + sectionGap;

  let currentBodyFrame = bodyEffectiveStart + bodySpeechOffset;
  const bodyLineTimings = actualBodyLines.map((line, index) => {
    const lineY = bodyBaseY + index * lineSpacing;
    const words = line.trim().split(/\s+/).filter(Boolean);
    const charCount = line.replace(/\s+/g, '').length;
    const spaceCount = Math.max(0, words.length - 1);
    const rawWidth = charCount * (fontSize * 0.40) + spaceCount * (fontSize * 0.28);
    const estLineWidth = Math.min(containerWidth - 20, Math.max(fontSize * 1.1, rawWidth));
    const startX = screenCenterX + estLineWidth / 2;
    const endX = screenCenterX - estLineWidth / 2;

    if (hasBodyCaptions) {
      const lineCaps = bodyCaptionsByLine[index] || [];
      const lineStartMs = lineCaps[0]?.startMs ?? (index * 2000);
      const lineEndMs = lineCaps[lineCaps.length - 1]?.endMs ?? ((index + 1) * 2000);
      const lineStart = bodyEffectiveStart + Math.floor((lineStartMs / 1000) * 30);
      const lineEnd = bodyEffectiveStart + Math.ceil((lineEndMs / 1000) * 30);
      return { line, index, lineY, startX, endX, lineStart, lineEnd, lineCaps, isCaptionDriven: true };
    } else {
      const lineChars = Math.max(1, line.trim().length);
      const lineWeight = lineChars / totalBodyChars;
      const allocatedFrames = Math.max(28, Math.round(availableBodyFrames * lineWeight));
      const lineStart = currentBodyFrame;
      const lineEnd = lineStart + Math.max(26, Math.floor(allocatedFrames * 0.96));
      currentBodyFrame = lineStart + allocatedFrames;
      return { line, index, lineY, startX, endX, lineStart, lineEnd, lineCaps: [], isCaptionDriven: false };
    }
  });

  const renderedBodyLines = bodyLineTimings.map((item, index) => {
    let progress = 0;
    let isInsideWord = true;

    if (item.isCaptionDriven) {
      const sectionTimeMs = ((frame - bodyEffectiveStart) / 30) * 1000;
      const res = calculateCaptionProgress(item.lineCaps, sectionTimeMs);
      progress = res.progress;
      isInsideWord = res.isInsideWord;
    } else {
      progress = interpolate(frame, [item.lineStart, item.lineEnd], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }

    const isCurrentLine = frame >= item.lineStart && frame <= item.lineEnd + 3;

    if (isCurrentLine) {
      isPenActive = true;
      penOpacity = interpolate(
        frame,
        [item.lineStart, item.lineStart + 4, item.lineEnd, item.lineEnd + 4],
        [0, 1, 1, 0.7],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const xPos = item.startX - progress * (item.startX - item.endX);
      const yWave = isInsideWord
        ? (Math.sin(progress * Math.PI * 20) * 7 + Math.cos(progress * Math.PI * 10) * 3)
        : 0;

      activePenX = xPos;
      activePenY = item.lineY + Math.round(fontSize * 0.9) + yWave;
    } else if (index < bodyLineTimings.length - 1) {
      const nextLine = bodyLineTimings[index + 1];
      if (frame > item.lineEnd + 3 && frame < nextLine.lineStart) {
        const glide = interpolate(frame, [item.lineEnd + 3, nextLine.lineStart], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        isPenActive = true;
        penOpacity = 0.8;
        activePenX = item.endX + glide * (nextLine.startX - item.endX);
        activePenY = item.lineY + glide * (nextLine.lineY - item.lineY) + Math.round(fontSize * 0.9);
      }
    }

    return {
      text: item.line,
      progress,
      lineY: item.lineY,
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
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
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
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
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

