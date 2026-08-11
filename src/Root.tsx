import React from 'react';
import { Composition } from 'remotion';
import { QuranHandwrittenShort } from './QuranHandwrittenShort';
import { defaultProps, urduInsightSchema } from './types';
import { calculateVideoDurationFrames, FPS } from './utils/timing';

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
