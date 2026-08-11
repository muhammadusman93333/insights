import React from 'react';
import { Composition, staticFile } from 'remotion';
import { loadFont as loadLocalFont } from '@remotion/fonts';
import { QuranHandwrittenShort } from './QuranHandwrittenShort';
import { UrduInsightPayload, urduInsightSchema } from './types';
import { calculateVideoDurationFrames, FPS } from './utils/timing';

// Load Local Masterpiece Urdu Fonts in browser environment (Jameel Noori Nastaleeq)
if (typeof window !== 'undefined' && typeof FontFace !== 'undefined') {
  loadLocalFont({
    family: 'Jameel Noori Nastaleeq',
    url: staticFile('fonts/Jameel Noori Nastaleeq Regular.ttf'),
  });
  loadLocalFont({
    family: 'Jameel Noori Nastaleeq Kasheeda',
    url: staticFile('fonts/Jameel Noori Nastaleeq Kasheeda.ttf'),
  });
}

export const defaultProps: UrduInsightPayload = {
  title: 'خاموش پکار',
  hook: 'کیا آپ کو بھی لگتا ہے کہ جب دکھ کی شدت سے لفظ ساتھ چھوڑ دیں، تو کوئی آپ کے اندر کے شور کو نہیں سن پاتا؟',
  urduText:
    'اے ایمان والو! صبر اور نماز کے ذریعے مدد طلب کرو۔ یقیناً اللہ صبر کرنے والوں کے ساتھ ہے۔',
  bgTheme: 'random',
  qalam: 'random',
  qalamScale: 6,
  fontFamily: 'random',
  showPenAnimation: true,
  bgMusic: 'random',
  penScratchSound: true,
  penSoundSrc: 'audio/qalam_sound.mp3',
  readingPauseSeconds: 4.5,
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="QuranHandwrittenShort"
        component={QuranHandwrittenShort}
        durationInFrames={calculateVideoDurationFrames(defaultProps)}
        fps={FPS}
        width={1080}
        height={1920}
        schema={urduInsightSchema}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: calculateVideoDurationFrames(props),
          };
        }}
      />
    </>
  );
};
