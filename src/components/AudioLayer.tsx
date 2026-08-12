import React, { useMemo } from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';

interface WritingInterval {
  startFrame: number;
  endFrame: number;
}

interface AudioLayerProps {
  bgMusic?: string;
  musicVolume?: number;
  penScratchSound?: boolean;
  penSoundSrc?: string;
  penVolume?: number;
  writingIntervals?: WritingInterval[];
}

export const AudioLayer: React.FC<AudioLayerProps> = ({
  bgMusic = 'audio/Sacred Breath.mp3',
  musicVolume = 0.4,
  penScratchSound = true,
  penSoundSrc = 'audio/qalam_sound.mp3',
  penVolume = 0.55,
  writingIntervals = [],
}) => {
  const { durationInFrames } = useVideoConfig();

  // Resolve background music source
  const bgMusicSrc = useMemo(() => {
    if (!bgMusic) return null;
    return bgMusic.startsWith('http://') ||
      bgMusic.startsWith('https://') ||
      bgMusic.startsWith('data:')
      ? bgMusic
      : staticFile(bgMusic);
  }, [bgMusic]);

  // Resolve pen scratch SFX source
  const resolvedPenSoundSrc = useMemo(() => {
    if (!penSoundSrc) return null;
    return penSoundSrc.startsWith('http://') ||
      penSoundSrc.startsWith('https://') ||
      penSoundSrc.startsWith('data:')
      ? penSoundSrc
      : staticFile(penSoundSrc);
  }, [penSoundSrc]);

  // Calculate start frames for 1-second (30 frames) qalam sound loops during active writing
  const penSoundStartFrames = useMemo(() => {
    if (!penScratchSound || !resolvedPenSoundSrc) return [];

    const starts: number[] = [];
    const clipLength = 28; // Trigger every ~28 frames (approx 0.93s) for smooth continuous handwriting rhythm

    for (const interval of writingIntervals) {
      if (interval.endFrame <= interval.startFrame) continue;
      for (let f = interval.startFrame; f < interval.endFrame; f += clipLength) {
        starts.push(f);
      }
    }

    return starts;
  }, [penScratchSound, resolvedPenSoundSrc, writingIntervals]);

  return (
    <>
      {/* 1. Main Peaceful Background Music (Sacred Breath) */}
      {bgMusicSrc && (
        <Audio
          src={bgMusicSrc}
          volume={(f) => {
            // Smooth fade in over first 45 frames (1.5s)
            if (f < 45) {
              return (f / 45) * musicVolume;
            }
            // Smooth fade out over last 60 frames (2s)
            if (f > durationInFrames - 60) {
              return Math.max(0, ((durationInFrames - f) / 60) * musicVolume);
            }
            return musicVolume;
          }}
        />
      )}
      {/* 2. Synchronized Qalam Pen Writing Sound (1-second sound loops only while pen is moving) */}
      {penScratchSound &&
        resolvedPenSoundSrc &&
        penSoundStartFrames.map((startFrame, idx) => (
          <Sequence
            key={`qalam_sfx_${idx}_${startFrame}`}
            from={startFrame}
            durationInFrames={30}
          >
            <Audio src={resolvedPenSoundSrc} volume={penVolume} />
          </Sequence>
        ))}
    </>
  );
};
