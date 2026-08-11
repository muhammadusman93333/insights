import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { defaultProps, resolveConcretePayload, UrduInsightPayload } from './types';
import { calculateVideoTiming } from './utils/timing';

export interface RenderOptions {
  inputPayload?: UrduInsightPayload;
  jsonPath?: string;
  outputPath?: string;
  screenshotPath?: string;
  captureScreenshot?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Programmatic Node.js API to render handwritten Urdu Quran Shorts
 */
export async function renderUrduInsightVideo(options: RenderOptions = {}) {
  let payload: UrduInsightPayload = { ...defaultProps };

  // 1. If JSON file is specified, load and merge it
  if (options.jsonPath) {
    const fullJsonPath = path.resolve(process.cwd(), options.jsonPath);
    if (!fs.existsSync(fullJsonPath)) {
      throw new Error(`Input JSON file not found at: ${fullJsonPath}`);
    }
    const rawData = fs.readFileSync(fullJsonPath, 'utf-8');
    const parsedData = JSON.parse(rawData);
    payload = { ...payload, ...parsedData };
  } else if (options.inputPayload) {
    payload = { ...payload, ...options.inputPayload };
  }

  // Fix random choices once per video so every frame uses the exact same background, pen, font, and audio
  payload = resolveConcretePayload(payload);

  // 2. Determine output paths
  const outDir = path.resolve(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const timestamp = Date.now();
  const outputPath =
    options.outputPath ||
    path.join(outDir, `urdu_short_${timestamp}.mp4`);

  const screenshotPath =
    options.screenshotPath ||
    path.join(outDir, `urdu_thumb_${timestamp}.png`);

  const shouldCaptureScreenshot = options.captureScreenshot !== false;

  console.log('----------------------------------------------------');
  console.log(' ✒️  Qalam & Dawaat (قلم اور دوات) - Video Generator');
  console.log('----------------------------------------------------');
  console.log(`📜 Title:       ${payload.title || 'N/A'}`);
  if (payload.hook) {
    console.log(`🪝 Hook:        ${payload.hook.substring(0, 60)}...`);
  }
  console.log(`✍️ Body Text:   ${(payload.body || payload.bodyText || payload.urduText || '').substring(0, 60)}...`);
  console.log(`📖 Reference:   ${payload.surahReference || 'N/A'}`);
  console.log(`🎨 Theme:       ${payload.bgTheme}`);
  console.log(`✒️ Qalam:       ${payload.qalam}`);
  console.log(`🔤 Font:        ${payload.fontFamily}`);
  console.log(`🎵 Music:       ${payload.bgMusic}`);
  console.log(`📁 Video File:  ${outputPath}`);
  if (shouldCaptureScreenshot) {
    console.log(`📸 Thumb File:  ${screenshotPath}`);
  }
  console.log('----------------------------------------------------');


  console.log('📦 Bundling Remotion composition...');
  const entryPoint = path.resolve(__dirname, 'index.ts');
  const bundleLocation = await bundle({
    entryPoint,
    rootDir: path.resolve(process.cwd()),
    publicDir: path.resolve(process.cwd(), 'public'),
    webpackOverride: (config) => config,
  });

  console.log('🔍 Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'QuranHandwrittenShort',
    inputProps: payload,
  });

  // Calculate timing to determine the exact screenshot frame
  const timing = calculateVideoTiming(payload);
  const screenshotFrame = timing.shiftStartFrame > 0
    ? Math.max(1, timing.shiftStartFrame - 2)
    : (timing.hookEndFrame > 0 ? timing.hookEndFrame : timing.headerEndFrame);

  // 1. Capture Thumbnail Screenshot when Hook is completed in center before moving up
  if (shouldCaptureScreenshot) {
    console.log(
      `📸 Capturing thumbnail screenshot at frame ${screenshotFrame} (Hook completed in center)...`
    );
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: screenshotPath,
      inputProps: payload,
      frame: screenshotFrame,
      imageFormat: 'png',
    });
    console.log(`✅ Thumbnail screenshot saved to: ${screenshotPath}`);
  }

  // 2. Render Full Video
  console.log(
    `🎬 Rendering video (${composition.durationInFrames} frames @ ${composition.fps}fps, ${(composition.durationInFrames / composition.fps).toFixed(1)}s)...`
  );

  let lastReportedPct = -1;

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: payload,
    timeoutInMilliseconds: 300000,
    onProgress: ({ renderedFrames, encodedFrames }) => {
      const progress = Math.round(
        (encodedFrames / composition.durationInFrames) * 100
      );
      if (progress !== lastReportedPct && progress % 5 === 0) {
        lastReportedPct = progress;
        console.log(
          `⏳ Rendering progress: ${progress}% (${encodedFrames}/${composition.durationInFrames} frames)`
        );
        if (options.onProgress) {
          options.onProgress(progress);
        }
      }
    },
  });

  console.log('----------------------------------------------------');
  console.log(`✅ Render complete! Output saved to:`);
  console.log(`👉 Video:     ${outputPath}`);
  if (shouldCaptureScreenshot) {
    console.log(`👉 Thumbnail: ${screenshotPath}`);
  }
  console.log('----------------------------------------------------');

  return {
    outputPath,
    screenshotPath: shouldCaptureScreenshot ? screenshotPath : undefined,
    screenshotFrame: shouldCaptureScreenshot ? screenshotFrame : undefined,
    durationInFrames: composition.durationInFrames,
    fps: composition.fps,
  };
}

// Command Line Interface (CLI) execution
async function runCli() {
  const args = process.argv.slice(2);
  let jsonPath: string | undefined;
  let outputPath: string | undefined;
  let customHook: string | undefined;
  let customBody: string | undefined;
  let customText: string | undefined;
  let customTitle: string | undefined;
  let customSurah: string | undefined;
  let customTheme: any;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') {
      jsonPath = args[i + 1];
      i++;
    } else if (args[i] === '--output' || args[i] === '-o') {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === '--hook') {
      customHook = args[i + 1];
      i++;
    } else if (args[i] === '--body' || args[i] === '-b') {
      customBody = args[i + 1];
      i++;
    } else if (args[i] === '--text' || args[i] === '-t') {
      customText = args[i + 1];
      i++;
    } else if (args[i] === '--title') {
      customTitle = args[i + 1];
      i++;
    } else if (args[i] === '--surah') {
      customSurah = args[i + 1];
      i++;
    } else if (args[i] === '--theme') {
      customTheme = args[i + 1];
      i++;
    }
  }

  const inputPayload: Partial<UrduInsightPayload> = {};
  if (customHook) inputPayload.hook = customHook;
  if (customBody) inputPayload.body = customBody;
  if (customText) inputPayload.urduText = customText;
  if (customTitle) inputPayload.title = customTitle;
  if (customSurah) inputPayload.surahReference = customSurah;
  if (customTheme) inputPayload.bgTheme = customTheme;

  try {
    await renderUrduInsightVideo({
      jsonPath,
      outputPath,
      inputPayload: Object.keys(inputPayload).length > 0 ? (inputPayload as UrduInsightPayload) : undefined,
    });
  } catch (error) {
    console.error('❌ Render failed:', error);
    process.exit(1);
  }
}

// Only execute CLI if run directly
if (require.main === module || process.argv[1]?.endsWith('render.ts')) {
  runCli();
}

