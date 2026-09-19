import React, { useMemo } from 'react';
import {
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  OffthreadVideo,
} from 'remotion';
import { CompositionProps } from './types';
import { splitUrduIntoLines } from './utils/timing';
import { resolveUrduFont } from './utils/fontSelector';
import { resolveAudioTrack } from './utils/audioSelector';
import { AudioLayer } from './components/AudioLayer';
import { resolveVideoSource } from './CinematicPexelsShort';

interface SeamlessVideoLoopProps {
  src: string;
  crossfadeSeconds?: number;
}

/**
 * Creates a mathematically continuous infinite video loop.
 * By starting Layer 1 from offset T_crossfade and fading into Layer 2 (offset 0)
 * in the final T_crossfade seconds, the very last frame of the video matches
 * frame 0 pixel-for-pixel, making the loop restart completely undetectable on
 * TikTok, Instagram Reels, and YouTube Shorts.
 */
const SeamlessVideoLoop: React.FC<SeamlessVideoLoopProps> = ({
  src,
  crossfadeSeconds = 1.0,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const crossfadeFrames = Math.max(15, Math.round(crossfadeSeconds * fps));
  const loopThreshold = durationInFrames - crossfadeFrames;

  // Base video opacity: 1.0 until the crossfade period, then smoothly fades out to 0.0
  const baseOpacity = interpolate(
    frame,
    [loopThreshold, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {/* 1. Base Continuous Video Clip (starts at offset = crossfadeFrames so frame 0 matches end of transition) */}
      <OffthreadVideo
        src={src}
        startFrom={crossfadeFrames}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          objectFit: 'cover',
          opacity: baseOpacity,
        }}
        volume={0}
        muted
        {...({ loop: true } as any)}
      />

      {/* 2. Seamless Loop Transition Clip (starts from source frame 0 and fades in over the final 1.0s) */}
      <Sequence
        from={loopThreshold}
        durationInFrames={crossfadeFrames}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
        }}
      >
        <LoopCrossfadeLayer
          src={src}
          crossfadeFrames={crossfadeFrames}
        />
      </Sequence>
    </div>
  );
};

const LoopCrossfadeLayer: React.FC<{
  src: string;
  crossfadeFrames: number;
}> = ({ src, crossfadeFrames }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, crossfadeFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <OffthreadVideo
      src={src}
      startFrom={0}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        objectFit: 'cover',
        opacity,
      }}
      volume={0}
      muted
      {...({ loop: true } as any)}
    />
  );
};

export const CinematicLoopShort: React.FC<CompositionProps> = (props) => {
  const {
    title = 'سکونِ قلب',
    backgroundVideoUrl,
    accentColor = '#dfb76c',
    overlayOpacity = 0.60,
    fontFamily = 'random',
    bgMusic = 'random',
    urduTextColor = '#ffffff',
    hookTextColor = '#dfb76c',
    inkShadow = '0 3px 20px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 0, 0, 0.85)',
    hookShadow = '0 3px 20px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 0, 0, 0.85)',
    dividerColor = '#dfb76c',
    titleTextColor = '#ffffff',
    titleTextShadow = '0 2px 10px rgba(0, 0, 0, 0.85)',
    headerBadgeBgColor = 'rgba(10, 15, 20, 0.75)',
    headerBadgeBorderColor = '#dfb76c',
    bgMusicVolume = 0.8,
  } = props;

  // 1. Resolve calligraphy font
  const selectedFont = useMemo(() => {
    return resolveUrduFont(fontFamily);
  }, [fontFamily]);

  // 2. Resolve background music
  const resolvedBgMusic = useMemo(() => {
    return resolveAudioTrack(bgMusic);
  }, [bgMusic]);

  // 3. Resolve background video source
  const resolvedVideoSrc = useMemo(() => {
    return resolveVideoSource(backgroundVideoUrl);
  }, [backgroundVideoUrl]);

  // 4. Extract Hook and Description (Body) text
  const rawHook = (props.hook || '').trim();
  const rawBody = (props.body || props.bodyText || props.urduText || '').trim();

  const isKasheeda = selectedFont === 'Jameel Noori Nastaleeq Kasheeda';
  const hookLines = useMemo(() => {
    return rawHook ? splitUrduIntoLines(rawHook, isKasheeda ? selectedFont : undefined) : [];
  }, [rawHook, selectedFont, isKasheeda]);

  const bodyLines = useMemo(() => {
    return rawBody ? splitUrduIntoLines(rawBody, undefined) : [];
  }, [rawBody]);

  // Dynamic font sizing based on content density to ensure generous whitespace
  const hookFontSize = useMemo(() => {
    const totalChars = rawHook.length;
    if (totalChars < 50) return 56;
    if (totalChars < 90) return 50;
    if (totalChars < 140) return 46;
    return 42;
  }, [rawHook]);

  const bodyFontSize = useMemo(() => {
    const totalChars = rawBody.length;
    if (totalChars < 70) return 50;
    if (totalChars < 130) return 45;
    if (totalChars < 200) return 40;
    return 36;
  }, [rawBody]);

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#050a0f',
      }}
    >
      {/* 1. Seamless Video Background with 1-second Loop Crossfade */}
      <SeamlessVideoLoop
        src={resolvedVideoSrc}
        crossfadeSeconds={1.0}
      />

      {/* 2. Cinematic Vignette & Atmospheric Contrast Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.88) 100%)',
          opacity: overlayOpacity,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0.85) 100%)',
          opacity: overlayOpacity,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* 3. Header: Title Badge (Instant display from Millisecond 0 at top center) */}
      {title && (
        <div
          style={{
            position: 'absolute',
            top: 85,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 20,
            direction: 'rtl',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              padding: '12px 32px',
              borderRadius: 36,
              backgroundColor: headerBadgeBgColor,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1.5px solid ${headerBadgeBorderColor}`,
              boxShadow:
                '0 8px 32px rgba(0, 0, 0, 0.65), inset 0 0 14px rgba(223, 183, 108, 0.15)',
            }}
          >
            <span style={{ color: headerBadgeBorderColor, fontSize: 20 }}>✦</span>
            <span
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: titleTextColor,
                fontFamily: `'${selectedFont}', 'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif`,
                textShadow: titleTextShadow,
                letterSpacing: 0.5,
                lineHeight: 1.2,
              }}
            >
              {title}
            </span>
            <span style={{ color: headerBadgeBorderColor, fontSize: 20 }}>✦</span>
          </div>
        </div>
      )}

      {/* 4. Instant Visual Display: Hook + Description Centered on Screen from Millisecond 0 */}
      <div
        style={{
          position: 'absolute',
          top: 240,
          bottom: 120,
          left: 40,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 15,
          direction: 'rtl',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '24px 20px',
          }}
        >
          {/* Hook Text: Prominent, Golden / High-Contrast Highlight */}
          {hookLines.length > 0 && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {hookLines.map((line, idx) => (
                <div
                  key={`hook_line_${idx}`}
                  style={{
                    fontFamily: `'${selectedFont}', 'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif`,
                    fontSize: hookFontSize,
                    fontWeight: 700,
                    lineHeight: 2.1,
                    color: hookTextColor,
                    textShadow: hookShadow,
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                    letterSpacing: 0.3,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          )}

          {/* Ornamental Divider: Separates Hook and Description */}
          {hookLines.length > 0 && bodyLines.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                margin: '36px 0 28px 0',
                width: '80%',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1.5,
                  background: `linear-gradient(90deg, transparent, ${dividerColor})`,
                  opacity: 0.8,
                }}
              />
              <span
                style={{
                  color: dividerColor,
                  fontSize: 22,
                  textShadow: `0 0 12px ${dividerColor}`,
                }}
              >
                ✦ ❖ ✦
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1.5,
                  background: `linear-gradient(270deg, transparent, ${dividerColor})`,
                  opacity: 0.8,
                }}
              />
            </div>
          )}

          {/* Description / Body Insight Text: Pure White, Crisp Nastaleeq Typography */}
          {bodyLines.length > 0 && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {bodyLines.map((line, idx) => (
                <div
                  key={`body_line_${idx}`}
                  style={{
                    fontFamily: `'${selectedFont}', 'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif`,
                    fontSize: bodyFontSize,
                    fontWeight: 600,
                    lineHeight: 2.15,
                    color: urduTextColor,
                    textShadow: inkShadow,
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                    letterSpacing: 0.2,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Louder Nasheed Audio Track (Full volume, no voiceover, no fade out cutoff) */}
      <AudioLayer
        bgMusic={resolvedBgMusic}
        bgMusicVolume={bgMusicVolume}
        disableFadeOut={true}
        penScratchSound={false}
      />
    </div>
  );
};
