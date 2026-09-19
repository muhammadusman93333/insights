import React, { useMemo } from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';

interface WritingInterval {
  startFrame: number;
  endFrame: number;
}

interface AudioLayerProps {
  bgMusic?: string;
  musicVolume?: number;
  bgMusicVolume?: number;
  penScratchSound?: boolean;
  penSoundSrc?: string;
  penVolume?: number;
  writingIntervals?: WritingInterval[];
  // Prominent Urdu Voiceover Audio Layer
  hookAudioSrc?: string;
  hookAudioStartFrame?: number;
  bodyAudioSrc?: string;
  bodyAudioStartFrame?: number;
  voiceoverAudio?: string;
  voiceoverStartFrame?: number;
  voiceoverVolume?: number;
  disableFadeOut?: boolean;
}

/**
 * Resolves local public paths or external URLs into playable Remotion audio sources
 */
const resolveAudioSource = (src?: string): string | null => {
  if (!src || !src.trim()) return null;
  const trimmed = src.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const cleaned = trimmed.replace(/^\/?public\//, '').replace(/^\//, '');
  return staticFile(cleaned);
};

export const AudioLayer: React.FC<AudioLayerProps> = ({
  bgMusic = 'audio/Sacred Breath.mp3',
  musicVolume,
  bgMusicVolume,
  penScratchSound = true,
  penSoundSrc = 'audio/qalam_sound.mp3',
  penVolume,
  writingIntervals = [],
  hookAudioSrc,
  hookAudioStartFrame = 0,
  bodyAudioSrc,
  bodyAudioStartFrame = 120,
  voiceoverAudio,
  voiceoverStartFrame = 0,
  voiceoverVolume = 1.0,
  disableFadeOut = false,
}) => {
  const { durationInFrames } = useVideoConfig();

  const resolvedBgMusicSrc = useMemo(() => resolveAudioSource(bgMusic), [bgMusic]);
  const resolvedPenSoundSrc = useMemo(() => resolveAudioSource(penSoundSrc), [penSoundSrc]);
  const resolvedHookAudioSrc = useMemo(() => resolveAudioSource(hookAudioSrc), [hookAudioSrc]);
  const resolvedBodyAudioSrc = useMemo(() => resolveAudioSource(bodyAudioSrc), [bodyAudioSrc]);
  const resolvedGeneralVoiceoverSrc = useMemo(() => resolveAudioSource(voiceoverAudio), [voiceoverAudio]);

  const hasVoiceover = Boolean(
    resolvedHookAudioSrc || resolvedBodyAudioSrc || resolvedGeneralVoiceoverSrc
  );

  // Background music volume: Lowered to 0.16 when voiceover is present so voiceover is prominent and crystal clear
  const effectiveMusicVolume = useMemo(() => {
    if (bgMusicVolume !== undefined) return bgMusicVolume;
    if (musicVolume !== undefined) return musicVolume;
    return hasVoiceover ? 0.16 : 0.4;
  }, [bgMusicVolume, musicVolume, hasVoiceover]);

  // Pen scratch SFX volume: balanced to 0.28 when voiceover is active
  const effectivePenVolume = useMemo(() => {
    if (penVolume !== undefined) return penVolume;
    return hasVoiceover ? 0.28 : 0.55;
  }, [penVolume, hasVoiceover]);

  const effectiveVoiceoverVolume = voiceoverVolume ?? 1.0;

  // Calculate start frames for 1-second (30 frames) qalam sound loops during active writing
  const penSoundStartFrames = useMemo(() => {
    if (!penScratchSound || !resolvedPenSoundSrc) return [];

    const starts: number[] = [];
    const clipLength = 28; // Trigger every ~28 frames (approx 0.93s) for continuous handwriting rhythm

    for (const interval of writingIntervals) {
      if (interval.endFrame <= interval.startFrame) continue;
      for (let f = interval.startFrame; f < interval.endFrame; f += clipLength) {
        starts.push(f);
      }
    }

    return starts;
  }, [penScratchSound, resolvedPenSoundSrc, writingIntervals]);

  const shouldFadeOut = !disableFadeOut && durationInFrames > 180;

  return (
    <>
      {/* 1. Peaceful Background Music (lowered/ducked underneath voiceover) */}
      {resolvedBgMusicSrc && (
        <Audio
          src={resolvedBgMusicSrc}
          volume={(f) => {
            // Smooth fast fade in over first 15 frames (0.5s) if longer video, or first 5 frames if loop
            const fadeInFrames = shouldFadeOut ? 15 : 5;
            if (f < fadeInFrames) {
              return (f / fadeInFrames) * effectiveMusicVolume;
            }
            // Smooth fade out over last 60 frames (2s) only for standard long videos
            if (shouldFadeOut && f > durationInFrames - 60) {
              return Math.max(0, ((durationInFrames - f) / 60) * effectiveMusicVolume);
            }
            return effectiveMusicVolume;
          }}
        />
      )}

      {/* 2. Synchronized Qalam Pen Writing Sound SFX */}
      {penScratchSound &&
        resolvedPenSoundSrc &&
        penSoundStartFrames.map((startFrame, idx) => (
          <Sequence
            key={`qalam_sfx_${idx}_${startFrame}`}
            from={startFrame}
            durationInFrames={30}>
            <Audio src={resolvedPenSoundSrc} volume={effectivePenVolume} />
          </Sequence>
        ))}

      {/* 3. Top Audio Layer: Prominent Human Urdu Voiceover (ur-PK-AsadNeural) */}
      {resolvedHookAudioSrc && (
        <Sequence
          key="voiceover_hook_track"
          from={hookAudioStartFrame}
          layout="none">
          <Audio src={resolvedHookAudioSrc} volume={effectiveVoiceoverVolume} />
        </Sequence>
      )}

      {resolvedBodyAudioSrc && (
        <Sequence
          key="voiceover_body_track"
          from={bodyAudioStartFrame}
          layout="none">
          <Audio src={resolvedBodyAudioSrc} volume={effectiveVoiceoverVolume} />
        </Sequence>
      )}

      {resolvedGeneralVoiceoverSrc && (
        <Sequence
          key="voiceover_general_track"
          from={voiceoverStartFrame}
          layout="none">
          <Audio src={resolvedGeneralVoiceoverSrc} volume={effectiveVoiceoverVolume} />
        </Sequence>
      )}
    </>
  );
};
