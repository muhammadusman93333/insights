export const AUDIO_TRACKS = [
  'audio/1.mp3',
  'audio/2.mp3',
  'audio/3.mp3',
  'audio/4.mp3',
  'audio/5.mp3',
  'audio/6.mp3',
  'audio/7.mp3',
  'audio/8.mp3',
] as const;

/**
 * Resolves a background music path or picks a random track from 1.mp3 - 8.mp3 when 'random' is passed.
 */
export function resolveAudioTrack(bgMusic?: string): string {
  if (bgMusic && bgMusic !== 'random') {
    if (bgMusic.startsWith('http://') || bgMusic.startsWith('https://') || bgMusic.startsWith('data:')) {
      return bgMusic;
    }
    if (bgMusic.startsWith('audio/')) {
      return bgMusic;
    }
    if (bgMusic.endsWith('.mp3')) {
      return `audio/${bgMusic}`;
    }
    const trackNum = parseInt(bgMusic, 10);
    if (!isNaN(trackNum) && trackNum >= 1 && trackNum <= AUDIO_TRACKS.length) {
      return `audio/${trackNum}.mp3`;
    }
    return bgMusic;
  }

  // Pure random selection from 1.mp3 - 8.mp3
  const randomIndex = Math.floor(Math.random() * AUDIO_TRACKS.length);
  return AUDIO_TRACKS[randomIndex];
}
