import React from 'react';
import { Composition } from 'remotion';
import { QuranHandwrittenShort } from './QuranHandwrittenShort';
import { QuranNatureShort } from './QuranNatureShort';
import { defaultProps, urduInsightSchema } from './types';
import { calculateVideoDurationFrames, FPS } from './utils/timing';

export const Root: React.FC = () => {
  return (
    <>
      {/* 1. Nature-Inspired Reflection Template (Default) */}
      <Composition
        id="QuranNatureShort"
        component={QuranNatureShort}
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

      {/* 2. Classical Parchment & Ancient Candle Template */}
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


