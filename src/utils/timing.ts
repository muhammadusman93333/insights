import { UrduInsightPayload } from '../types';

export const FPS = 30;

export interface TimingPlan {
  totalFrames: number;
  headerStartFrame: number;
  headerEndFrame: number;
  shiftStartFrame: number;
  shiftEndFrame: number;
  shouldShift: boolean;
  hookStartFrame: number;
  hookEndFrame: number;
  hookLines: string[];
  bodyStartFrame: number;
  bodyEndFrame: number;
  bodyLines: string[];
  urduStartFrame: number;
  urduEndFrame: number;
  urduLines: string[];
  footerStartFrame: number;
}

/**
 * Splits Urdu text into balanced, visually appealing lines to fit strictly on ONE single page
 */
export function splitUrduIntoLines(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // If text has explicit line breaks, respect them
  if (trimmed.includes('\n')) {
    return trimmed
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  const charCount = trimmed.length;
  // Dynamically set chars per line so each line utilizes available horizontal width
  let maxCharsPerLine = 48;
  if (charCount > 240) {
    maxCharsPerLine = 56;
  } else if (charCount > 130) {
    maxCharsPerLine = 50;
  } else if (charCount > 70) {
    maxCharsPerLine = 42;
  } else if (charCount < 40) {
    maxCharsPerLine = 30;
  }




  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Calculates dynamic frame timing based on title, hook, and body text
 */
export function calculateVideoTiming(payload: UrduInsightPayload): TimingPlan {
  const {
    hook = '',
    body = '',
    bodyText = '',
    urduText = '',
    readingPauseSeconds = 4.5,
  } = payload;

  const rawHook = hook.trim();
  const rawBody = (body || bodyText || urduText).trim();

  const hookLines = rawHook ? splitUrduIntoLines(rawHook) : [];
  const bodyLines = rawBody ? splitUrduIntoLines(rawBody) : [];

  const headerStartFrame = 5;
  const headerEndFrame = 35;

  let hookStartFrame = 0;
  let hookEndFrame = 0;
  let shiftStartFrame = 0;
  let shiftEndFrame = 0;
  let shouldShift = false;
  let bodyStartFrame = 0;
  let bodyEndFrame = 0;

  if (hookLines.length > 0 && bodyLines.length > 0) {
    // 1. Hook begins in center after Title header
    hookStartFrame = headerEndFrame + 10;
    let hookWritingFrames = 0;
    for (const line of hookLines) {
      const lineLength = line.trim().length;
      const framesForLine = Math.max(40, Math.min(85, Math.round(lineLength * 1.9)));
      hookWritingFrames += framesForLine + 6;
    }
    hookEndFrame = hookStartFrame + Math.max(60, hookWritingFrames);

    // 2. Smoothly shift Title + Hook from Center to Top
    shiftStartFrame = hookEndFrame + 8;
    shiftEndFrame = shiftStartFrame + 24;
    shouldShift = true;

    // 3. Body text starts writing after reaching Top
    bodyStartFrame = shiftEndFrame + 10;
    let bodyWritingFrames = 0;
    for (const line of bodyLines) {
      const lineLength = line.trim().length;
      const framesForLine = Math.max(40, Math.min(85, Math.round(lineLength * 1.9)));
      bodyWritingFrames += framesForLine + 6;
    }
    bodyEndFrame = bodyStartFrame + Math.max(70, bodyWritingFrames);
  } else if (hookLines.length > 0) {
    // Only hook is provided (stays centered)
    hookStartFrame = headerEndFrame + 10;
    let hookWritingFrames = 0;
    for (const line of hookLines) {
      const lineLength = line.trim().length;
      const framesForLine = Math.max(45, Math.min(90, Math.round(lineLength * 2.0)));
      hookWritingFrames += framesForLine + 6;
    }
    hookEndFrame = hookStartFrame + Math.max(80, hookWritingFrames);
    shiftStartFrame = hookEndFrame;
    shiftEndFrame = hookEndFrame;
    shouldShift = false;
    bodyStartFrame = hookEndFrame;
    bodyEndFrame = hookEndFrame;
  } else {
    // Only body / urduText is provided (Title starts center, shifts to top, then body writes)
    shiftStartFrame = headerEndFrame + 12;
    shiftEndFrame = shiftStartFrame + 24;
    shouldShift = true;

    bodyStartFrame = shiftEndFrame + 10;
    let bodyWritingFrames = 0;
    for (const line of bodyLines) {
      const lineLength = line.trim().length;
      const framesForLine = Math.max(45, Math.min(90, Math.round(lineLength * 2.0)));
      bodyWritingFrames += framesForLine + 6;
    }
    bodyEndFrame = bodyStartFrame + Math.max(80, bodyWritingFrames);
    hookStartFrame = bodyStartFrame;
    hookEndFrame = bodyStartFrame;
  }

  const overallStart = hookLines.length > 0 ? hookStartFrame : bodyStartFrame;
  const overallEnd = bodyLines.length > 0 ? bodyEndFrame : hookEndFrame;

  const footerStartFrame = overallEnd - 15;

  // Final reading pause (default 4.5s = 135 frames)
  const pauseFrames = Math.round(readingPauseSeconds * FPS);
  const totalFrames = Math.max(450, overallEnd + pauseFrames); // Min 15s (450 frames)

  const combinedLines = [...hookLines, ...bodyLines];

  return {
    totalFrames,
    headerStartFrame,
    headerEndFrame,
    shiftStartFrame,
    shiftEndFrame,
    shouldShift,
    hookStartFrame,
    hookEndFrame,
    hookLines,
    bodyStartFrame,
    bodyEndFrame,
    bodyLines,
    urduStartFrame: overallStart,
    urduEndFrame: overallEnd,
    urduLines: combinedLines,
    footerStartFrame,
  };
}

export function calculateVideoDurationFrames(payload: UrduInsightPayload): number {
  return calculateVideoTiming(payload).totalFrames;
}

