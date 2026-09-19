import React, { useMemo } from 'react';
import {
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  OffthreadVideo,
  staticFile,
} from 'remotion';
import { CompositionProps } from './types';
import { calculateVideoTiming } from './utils/timing';
import { resolveUrduFont } from './utils/fontSelector';
import { resolveQalamConfig } from './utils/qalamSelector';
import { resolveAudioTrack } from './utils/audioSelector';
import { HandwrittenUrduText } from './components/HandwrittenUrduText';
import { NatureHeader } from './components/NatureHeader';
import { AudioLayer } from './components/AudioLayer';
import { NatureFooter } from './components/NatureFooter';
import { PaperConfig } from './utils/paperSelector';

/**
 * Resolves local public/ paths or external HTTP URLs to valid Remotion video sources
 */
export function resolveVideoSource(src?: string): string {
  if (!src || !src.trim()) {
    return staticFile('videos/nature/nature_fallback.mp4');
  }

  const trimmed = src.trim();

  // If already a full URL or data URI, return directly
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Normalize relative path in public/
  let cleanPath = trimmed.replace(/\\/g, '/');
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.slice(7);
  }

  return staticFile(cleanPath);
}

export const CinematicPexelsShort: React.FC<CompositionProps> = (props) => {
  const {
    title = 'سکونِ قلب',
    authorOrSource,
    backgroundVideoUrl,
    primaryColor = '#0f172a',
    accentColor = '#dfb76c',
    overlayOpacity = 0.58,
    qalam = 'random',
    qalamScale = 6,
    fontFamily = 'random',
    showPenAnimation = true,
    bgMusic = 'random',
    penScratchSound = true,
    penSoundSrc = 'audio/qalam_sound.mp3',
    urduTextColor = '#ffffff',
    hookTextColor = '#fffdf5',
    inkShadow = '0 3px 20px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 0, 0, 0.85)',
    hookShadow = '0 3px 20px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 0, 0, 0.85)',
    dividerColor = '#dfb76c',
    titleTextColor = '#ffffff',
    titleTextShadow = '0 2px 10px rgba(0, 0, 0, 0.85)',
    headerBadgeBgColor = 'rgba(10, 15, 20, 0.72)',
    headerBadgeBorderColor = '#dfb76c',
    footerTextColor = '#f3f4f6',
    footerTextShadow = '0 2px 8px rgba(0, 0, 0, 0.8)',
    footerBadgeBgColor = 'rgba(10, 15, 20, 0.7)',
    footerBadgeBorderColor = '#dfb76c',
  } = props;

  const frame = useCurrentFrame();

  // 1. Resolve dynamic calligraphy font
  const selectedFont = useMemo(() => {
    return resolveUrduFont(fontFamily);
  }, [fontFamily]);

  // 2. Video timing: Frame 0 hook start, voiceover sync, glide up to top
  const timing = useMemo(() => {
    return calculateVideoTiming({
      ...props,
      fontFamily: selectedFont as any,
    });
  }, [props, selectedFont]);

  // 3. Resolve Qalam calligraphy pen
  const activeQalam = useMemo(() => {
    return resolveQalamConfig(qalam);
  }, [qalam]);

  // 4. Resolve dynamic background soundtrack
  const resolvedBgMusic = useMemo(() => {
    return resolveAudioTrack(bgMusic);
  }, [bgMusic]);

  // 5. Video source resolution
  const resolvedVideoSrc = useMemo(() => {
    return resolveVideoSource(backgroundVideoUrl);
  }, [backgroundVideoUrl]);

  // 6. Paper config for dark high-contrast video overlay compatibility
  const cinematicPaperConfig: PaperConfig = useMemo(() => {
    return {
      id: 'cinematic-pexels',
      name: 'Cinematic Pexels Canvas',
      paperBgColor: 'transparent',
      paperGradient: 'transparent',
      burntShadow: 'none',
      scorchedBorderColor: accentColor,
      goldAccent: accentColor,
      textColor: urduTextColor,
      isDark: true,
      sootIntensity: 0.15,
    };
  }, [accentColor, urduTextColor]);

  // 7. Writing intervals for Qalam pen sound synchronization
  const writingIntervals = useMemo(() => {
    const intervals: { startFrame: number; endFrame: number }[] = [];
    if (timing.hookLines.length > 0 && timing.hookEndFrame > timing.hookStartFrame) {
      intervals.push({
        startFrame: timing.hookStartFrame,
        endFrame: timing.hookEndFrame,
      });
    }
    if (timing.bodyLines.length > 0 && timing.bodyEndFrame > timing.bodyStartFrame) {
      intervals.push({
        startFrame: timing.bodyStartFrame,
        endFrame: timing.bodyEndFrame,
      });
    } else if (timing.hookLines.length === 0 && timing.urduLines.length > 0 && timing.urduEndFrame > timing.urduStartFrame) {
      intervals.push({
        startFrame: timing.urduStartFrame,
        endFrame: timing.urduEndFrame,
      });
    }
    return intervals;
  }, [
    timing.hookLines,
    timing.hookStartFrame,
    timing.hookEndFrame,
    timing.bodyLines,
    timing.bodyStartFrame,
    timing.bodyEndFrame,
    timing.urduLines,
    timing.urduStartFrame,
    timing.urduEndFrame,
  ]);

interface SeamlessVideoLoopProps {
  src: string;
  videoDurationSeconds?: number;
  crossfadeSeconds?: number;
}

const CrossfadedVideoClip: React.FC<{
  src: string;
  isFirst: boolean;
  crossfadeFrames: number;
}> = ({ src, isFirst, crossfadeFrames }) => {
  const frame = useCurrentFrame();

  const opacity = isFirst
    ? 1
    : interpolate(frame, [0, crossfadeFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return (
    <OffthreadVideo
      src={src}
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

const SeamlessVideoLoop: React.FC<SeamlessVideoLoopProps> = ({
  src,
  videoDurationSeconds,
  crossfadeSeconds = 1.4,
}) => {
  const { durationInFrames, fps } = useVideoConfig();

  // If known duration from Pexels/cache, use it (clamped safely between 6s and 30s); otherwise default to 15s
  const safeDurationSec = videoDurationSeconds
    ? Math.max(6, Math.min(30, videoDurationSeconds))
    : 15;

  const loopFrames = Math.round(safeDurationSec * fps);
  const crossfadeFrames = Math.max(15, Math.round(crossfadeSeconds * fps));
  const stepFrames = Math.max(30, loopFrames - crossfadeFrames);

  const numClips = Math.ceil(durationInFrames / stepFrames) + 1;

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
      {Array.from({ length: numClips }).map((_, i) => {
        const from = i * stepFrames;
        if (from >= durationInFrames) return null;

        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={loopFrames}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1080,
              height: 1920,
            }}
          >
            <CrossfadedVideoClip
              src={src}
              isFirst={i === 0}
              crossfadeFrames={crossfadeFrames}
            />
          </Sequence>
        );
      })}
    </div>
  );
};

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
      {/* 1. Dynamic Vertical Video Background with Seamless Crossfade Loop */}
      <SeamlessVideoLoop
        src={resolvedVideoSrc}
        videoDurationSeconds={props.backgroundVideoDuration}
        crossfadeSeconds={1.4}
      />

      {/* 2. Dark Cinematic Vignette & Atmospheric Overlay (50% - 65% Opacity) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.85) 100%)',
          opacity: overlayOpacity,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.85) 100%)',
          opacity: overlayOpacity,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* 3. Header: Reflection Title Badge */}
      <NatureHeader
        title={title}
        primaryColor={primaryColor}
        accentColor={accentColor}
        fontFamily={selectedFont}
        shiftStartFrame={timing.shiftStartFrame}
        shiftEndFrame={timing.shiftEndFrame}
        shouldShift={timing.shouldShift}
        centerOffsetY={timing.hookLines.length > 0 ? 520 : 0}
        titleTextColor={titleTextColor}
        titleTextShadow={titleTextShadow}
        badgeBgColor={headerBadgeBgColor}
        badgeBorderColor={headerBadgeBorderColor}
      />

      {/* 4. Synchronized Urdu Calligraphy Text (Hook from Frame 0 -> Glides to Top -> Body) */}
      <div
        style={{
          position: 'relative',
          width: 1080,
          height: 1920,
          zIndex: 15,
        }}
      >
        <HandwrittenUrduText
          hookLines={timing.hookLines}
          hookStartFrame={timing.hookStartFrame}
          hookEndFrame={timing.hookEndFrame}
          bodyLines={timing.bodyLines}
          bodyStartFrame={timing.bodyStartFrame}
          bodyEndFrame={timing.bodyEndFrame}
          hookCaptions={props.hookCaptions}
          bodyCaptions={props.bodyCaptions}
          shiftStartFrame={timing.shiftStartFrame}
          shiftEndFrame={timing.shiftEndFrame}
          shouldShift={timing.shouldShift}
          centerOffsetY={520}
          urduLines={timing.urduLines}
          urduStartFrame={timing.urduStartFrame}
          urduEndFrame={timing.urduEndFrame}
          paper={cinematicPaperConfig}
          qalam={activeQalam}
          qalamScale={qalamScale}
          fontFamily={selectedFont}
          showPenAnimation={showPenAnimation}
          urduTextColor={urduTextColor}
          hookTextColor={hookTextColor}
          inkShadow={inkShadow}
          hookShadow={hookShadow}
          dividerColor={dividerColor}
        />
      </div>

      {/* 5. Footer: Author/Source Credit Badge */}
      {authorOrSource && (
        <div style={{ position: 'relative', zIndex: 20 }}>
          <NatureFooter
            authorOrSource={authorOrSource}
            footerStartFrame={timing.footerStartFrame}
            accentColor={accentColor}
            primaryColor={primaryColor}
            fontFamily={selectedFont}
            footerTextColor={footerTextColor}
            footerTextShadow={footerTextShadow}
            badgeBgColor={footerBadgeBgColor}
            badgeBorderColor={footerBadgeBorderColor}
          />
        </div>
      )}

      {/* 6. Audio Layer: Voiceover starts at frame 0, ambient background soundtrack + pen sound fx */}
      <AudioLayer
        bgMusic={resolvedBgMusic}
        bgMusicVolume={props.bgMusicVolume}
        penScratchSound={penScratchSound}
        penSoundSrc={penSoundSrc}
        penVolume={props.penVolume}
        writingIntervals={writingIntervals}
        hookAudioSrc={props.hookAudioSrc}
        hookAudioStartFrame={timing.hookStartFrame}
        bodyAudioSrc={props.bodyAudioSrc}
        bodyAudioStartFrame={timing.bodyStartFrame}
        voiceoverAudio={props.voiceoverAudio}
        voiceoverStartFrame={timing.hookStartFrame}
        voiceoverVolume={props.voiceoverVolume}
      />
    </div>
  );
};
