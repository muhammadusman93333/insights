import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { defaultProps, resolveConcretePayload, UrduInsightPayload, urduInsightSchema } from './types';
import { calculateVideoTiming } from './utils/timing';
import { generateUrduTts } from './utils/tts';
import { resolvePexelsVideo, getCachedVideoDuration } from './utils/pexelsSelector';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Output folder for rendered videos and audio
const outDir = path.resolve(process.cwd(), 'out');
const audioDir = path.resolve(outDir, 'audio');
const publicTtsDir = path.resolve(process.cwd(), 'public', 'audio', 'tts');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
if (!fs.existsSync(publicTtsDir)) {
  fs.mkdirSync(publicTtsDir, { recursive: true });
}

// Serve rendered videos and audio statically
app.use('/videos', express.static(outDir));
app.use('/audio', express.static(audioDir));
app.use('/audio', express.static(publicTtsDir));

// Cache the Remotion bundle for fast subsequent renders
let cachedBundleLocation: string | null = null;
let isBundling = false;

async function getBundleLocation(): Promise<string> {
  if (cachedBundleLocation) {
    return cachedBundleLocation;
  }

  if (isBundling) {
    // Wait until bundling finishes
    while (isBundling) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (cachedBundleLocation) return cachedBundleLocation;
  }

  isBundling = true;
  console.log('📦 Pre-bundling Remotion composition for instant API renders...');
  try {
    const entryPoint = path.resolve(__dirname, 'index.ts');
    cachedBundleLocation = await bundle({
      entryPoint,
      rootDir: path.resolve(process.cwd()),
      publicDir: path.resolve(process.cwd(), 'public'),
      webpackOverride: (config) => config,
    });
    console.log('✅ Remotion bundle cached ready for API requests.');
  } finally {
    isBundling = false;
  }

  return cachedBundleLocation;
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    bundleCached: cachedBundleLocation !== null,
    uptime: process.uptime(),
  });
});

/**
 * Text-to-Speech (TTS) Voiceover Endpoint
 * Generates realistic human-like Urdu voiceover using Microsoft Edge TTS (ur-PK-AsadNeural)
 * Supported routes:
 *   POST /tts
 *   GET  /tts
 *   POST /api/tts
 *   GET  /api/tts
 */
const handleTts = async (req: Request, res: Response) => {
  try {
    const data = req.method === 'GET' ? req.query : req.body;

    const rawText = (data.text || data.urduText || data.body || data.prompt || data.script) as string;

    if (typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing required Urdu text parameter. Please provide "text", "urduText", or "body".',
      });
    }

    const voice = (data.voice as string) || 'ur-PK-AsadNeural';
    // Realistic defaults: -5% pace gives natural breathing space, -1Hz pitch grounds vocal resonance
    const rate = (data.rate as string) || '-5%';
    const pitch = (data.pitch as string) || '-1Hz';
    const volume = (data.volume as string) || '+0%';
    const realistic = data.realistic !== false && data.realistic !== 'false';

    console.log(`\n🎙️ TTS Voiceover Request:`);
    console.log(`🗣️ Voice: ${voice} | Rate: ${rate} | Pitch: ${pitch}`);
    console.log(`📝 Text: "${rawText.substring(0, 80)}..."`);

    const result = await generateUrduTts({
      text: rawText,
      voice,
      rate,
      pitch,
      volume,
      realistic,
      outputDir: audioDir,
    });

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol || 'http';
    const soundUrl = `${protocol}://${host}/audio/${result.filename}`;

    console.log(`✅ Voiceover generated: ${result.filename} (${result.duration}s)`);

    // Stream direct audio file if requested
    if (req.query.stream === 'true' || data.stream === true) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
      return fs.createReadStream(result.outputPath).pipe(res);
    }

    return res.status(200).json({
      success: true,
      soundUrl,
      audioUrl: soundUrl,
      filename: result.filename,
      duration: result.duration,
      voice: result.voice,
      rate: result.rate,
      pitch: result.pitch,
      processedText: result.processedText,
    });
  } catch (error: any) {
    console.error('❌ TTS Generation Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error during TTS synthesis',
    });
  }
};

app.post('/tts', handleTts);
app.get('/tts', handleTts);
app.post('/api/tts', handleTts);
app.get('/api/tts', handleTts);

/**
 * Main Video Generation Endpoint:
 * POST /api/generate-video
 */
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const hasText =
      (typeof body.hook === 'string' && body.hook.trim().length > 0) ||
      (typeof body.body === 'string' && body.body.trim().length > 0) ||
      (typeof body.bodyText === 'string' && body.bodyText.trim().length > 0) ||
      (typeof body.urduText === 'string' && body.urduText.trim().length > 0);

    if (!hasText) {
      return res.status(400).json({
        success: false,
        error: 'Missing required text content. Please provide "hook", "body", or "urduText".',
      });
    }

    // -------------------------------------------------------------
    // Dynamic Pexels Video Background Support
    // Only applied when template is CinematicPexelsShort / pexels, or not specified.
    // If template is QuranHandwrittenShort or QuranNatureShort, pexelsQuery is omitted.
    // -------------------------------------------------------------
    const requestedTemplate = body.template;
    const isNonPexelsTemplate =
      requestedTemplate === 'QuranHandwrittenShort' ||
      requestedTemplate === 'parchment' ||
      requestedTemplate === 'handwritten' ||
      requestedTemplate === 'QuranNatureShort' ||
      requestedTemplate === 'nature';

    const pexelsQuery = !isNonPexelsTemplate ? (body.pexelsQuery || body.pexels || body.videoQuery) : undefined;
    let resolvedBgVideo: string | undefined = !isNonPexelsTemplate ? body.backgroundVideoUrl : undefined;

    if (pexelsQuery && typeof pexelsQuery === 'string' && pexelsQuery.trim().length > 0) {
      console.log(`\n🌊 [Pexels Query Received]: "${pexelsQuery.trim()}"`);
      resolvedBgVideo = await resolvePexelsVideo(pexelsQuery.trim(), body.pexelsApiKey || body.apiKey);
      body.template = 'CinematicPexelsShort';
      body.backgroundVideoUrl = resolvedBgVideo;
    } else if (isNonPexelsTemplate && body.pexelsQuery) {
      console.log(`ℹ️ [Template Override]: "${requestedTemplate}" selected. Ignoring pexelsQuery.`);
    }

    const resolvedDuration = body.backgroundVideoDuration || getCachedVideoDuration(resolvedBgVideo);

    // Merge defaults with request body
    const rawPayload: UrduInsightPayload = {
      ...defaultProps,
      ...body,
      template: (body.template || (pexelsQuery ? 'CinematicPexelsShort' : defaultProps.template)) as any,
      backgroundVideoUrl: resolvedBgVideo || (!isNonPexelsTemplate ? body.backgroundVideoUrl : undefined),
      backgroundVideoDuration: resolvedDuration,
      pexelsQuery: !isNonPexelsTemplate ? pexelsQuery : undefined,
      fontFamily: body.fontFamily || body.font || defaultProps.fontFamily,
      urduText: body.body || body.bodyText || body.urduText || '',
    };

    // Fix random choices once per video so every frame uses the exact same background, pen, font, and audio
    const payload = resolveConcretePayload(rawPayload);
    if (resolvedBgVideo) {
      payload.backgroundVideoUrl = resolvedBgVideo;
      payload.backgroundVideoDuration = resolvedDuration;
    }
    const isLoopRequested =
      body.template === 'CinematicLoopShort' ||
      body.template === 'CinematicPexelsLoopShort' ||
      body.template === 'loop' ||
      body.template === 'cinematic-loop';
    if (!isNonPexelsTemplate && !isLoopRequested && (body.template === 'CinematicPexelsShort' || pexelsQuery)) {
      payload.template = 'CinematicPexelsShort';
    } else if (isLoopRequested) {
      payload.template = 'CinematicLoopShort';
    }

    console.log(`\n📥 API Render Request Received:`);
    if (payload.template) console.log(`🎬 Template: "${payload.template}"`);
    if (payload.backgroundVideoUrl) console.log(`🎥 Background Video: "${payload.backgroundVideoUrl}"`);
    if (payload.title) console.log(`🏷️ Title: "${payload.title}"`);
    if (payload.hook) console.log(`🪝 Hook: "${payload.hook.substring(0, 50)}..."`);
    console.log(`✍️ Body: "${(payload.body || payload.urduText).substring(0, 50)}..."`);
    console.log(`🎨 Theme: ${payload.bgTheme} | ✒️ Qalam: ${payload.qalam} | 🔤 Font: ${payload.fontFamily} | 🎵 Music: ${payload.bgMusic}`);

    // -------------------------------------------------------------
    // Synthesize human-like Urdu voiceover for Hook & Body (Title excluded)
    // -------------------------------------------------------------
    const isLoopTemplate =
      payload.template === 'CinematicLoopShort' ||
      payload.template === 'CinematicPexelsLoopShort' ||
      payload.template === 'loop' ||
      payload.template === 'cinematic-loop';
    const enableVoiceover = !isLoopTemplate && payload.enableVoiceover !== false;
    const voice = payload.voiceoverVoice || 'ur-PK-AsadNeural';
    const defaultRate = payload.voiceoverRate || '-5%';
    const defaultPitch = payload.voiceoverPitch || '-1Hz';
    const hookRate = (payload as any).hookVoiceoverRate || '+3%';
    const hookPitch = (payload as any).hookVoiceoverPitch || '-1Hz';
    const bodyRate = (payload as any).bodyVoiceoverRate || '-2%';
    const bodyPitch = (payload as any).bodyVoiceoverPitch || '-3Hz';

    const rawHook = typeof payload.hook === 'string' ? payload.hook.trim() : '';
    const rawBody = typeof (payload.body || payload.bodyText || payload.urduText) === 'string'
      ? (payload.body || payload.bodyText || payload.urduText).trim()
      : '';

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol || 'http';
    const serverBaseUrl = `http://127.0.0.1:${PORT}`;

    if (enableVoiceover) {
      console.log(`🎙️ Preparing human-like Urdu voiceover (${voice})...`);

      // 1. Hook Voiceover (No title added!)
      if (rawHook && !payload.hookAudioSrc) {
        try {
          console.log(`  🗣️ Synthesizing Hook TTS: "${rawHook.substring(0, 45)}..."`);
          const hookRes = await generateUrduTts({
            text: rawHook,
            voice,
            rate: hookRate,
            pitch: hookPitch,
            outputDir: publicTtsDir,
          });
          payload.hookAudioSrc = `${serverBaseUrl}/audio/${hookRes.filename}`;
          payload.hookAudioDuration = hookRes.duration;
          payload.hookCaptions = hookRes.captions;
          if (hookRes.srtPath && fs.existsSync(hookRes.srtPath)) {
            payload.hookSrt = fs.readFileSync(hookRes.srtPath, 'utf-8');
          }
          console.log(`  ✅ Hook Voiceover ready: ${hookRes.filename} (${hookRes.duration}s, ${hookRes.captions?.length ?? 0} caption words)`);
        } catch (err: any) {
          console.warn(`  ⚠️ Hook voiceover synthesis error:`, err.message);
        }
      }

      // 2. Body Voiceover (No title added!)
      if (rawBody && !payload.bodyAudioSrc) {
        try {
          console.log(`  🗣️ Synthesizing Body TTS: "${rawBody.substring(0, 45)}..."`);
          const bodyRes = await generateUrduTts({
            text: rawBody,
            voice,
            rate: bodyRate,
            pitch: bodyPitch,
            outputDir: publicTtsDir,
          });
          payload.bodyAudioSrc = `${serverBaseUrl}/audio/${bodyRes.filename}`;
          payload.bodyAudioDuration = bodyRes.duration;
          payload.bodyCaptions = bodyRes.captions;
          if (bodyRes.srtPath && fs.existsSync(bodyRes.srtPath)) {
            payload.bodySrt = fs.readFileSync(bodyRes.srtPath, 'utf-8');
          }
          console.log(`  ✅ Body Voiceover ready: ${bodyRes.filename} (${bodyRes.duration}s, ${bodyRes.captions?.length ?? 0} caption words)`);
        } catch (err: any) {
          console.warn(`  ⚠️ Body voiceover synthesis error:`, err.message);
        }
      }

      // 3. Audio Layer Mixing: Lower background music and keep voiceover prominent
      if (payload.hookAudioSrc || payload.bodyAudioSrc) {
        payload.voiceoverVolume = payload.voiceoverVolume ?? 1.0;
        payload.bgMusicVolume = payload.bgMusicVolume ?? 0.16; // Lowered background music so voice is prominent
        payload.penVolume = payload.penVolume ?? 0.28; // Subtle pen scratch sound
      }
    }

    const bundleLocation = await getBundleLocation();

    // Sync newly synthesized TTS audio into the cached bundle's public directory if present
    if (bundleLocation) {
      try {
        const bundleTtsDir = path.join(bundleLocation, 'public', 'audio', 'tts');
        if (!fs.existsSync(bundleTtsDir)) {
          fs.mkdirSync(bundleTtsDir, { recursive: true });
        }
        if (payload.hookAudioSrc) {
          const hookFilename = path.basename(payload.hookAudioSrc);
          const srcFile = path.join(publicTtsDir, hookFilename);
          const destFile = path.join(bundleTtsDir, hookFilename);
          if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
            fs.copyFileSync(srcFile, destFile);
          }
        }
        if (payload.bodyAudioSrc) {
          const bodyFilename = path.basename(payload.bodyAudioSrc);
          const srcFile = path.join(publicTtsDir, bodyFilename);
          const destFile = path.join(bundleTtsDir, bodyFilename);
          if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
            fs.copyFileSync(srcFile, destFile);
          }
        }
        // Sync local background video into bundle if present
        if (payload.backgroundVideoUrl && !payload.backgroundVideoUrl.startsWith('http')) {
          const cleanRel = payload.backgroundVideoUrl.replace(/^\/?public\//, '').replace(/^\//, '');
          const localSrc = path.join(process.cwd(), 'public', cleanRel);
          const bundleDest = path.join(bundleLocation, 'public', cleanRel);
          if (fs.existsSync(localSrc) && !fs.existsSync(bundleDest)) {
            fs.mkdirSync(path.dirname(bundleDest), { recursive: true });
            fs.copyFileSync(localSrc, bundleDest);
          }
        }
      } catch (syncErr) {
        // Non-blocking fallback
      }
    }

    const compositionId =
      payload.template === 'CinematicLoopShort' || payload.template === 'CinematicPexelsLoopShort' || payload.template === 'loop' || payload.template === 'cinematic-loop'
        ? 'CinematicLoopShort'
        : (payload.template === 'CinematicPexelsShort' || payload.template === 'pexels'
            ? 'CinematicPexelsShort'
            : (payload.template === 'parchment' || payload.template === 'handwritten' || payload.template === 'QuranHandwrittenShort'
                ? 'QuranHandwrittenShort'
                : 'QuranNatureShort'));

    // Select composition and compute dynamic duration
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: payload,
    });

    const uniqueId = `urdu_short_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const filename = `${uniqueId}.mp4`;
    const thumbFilename = `${uniqueId}.png`;
    const outputPath = path.join(outDir, filename);
    const thumbPath = path.join(outDir, thumbFilename);

    // Calculate screenshot frame & offset in milliseconds for Instagram Reels
    const timing = calculateVideoTiming(payload);
    const screenshotFrame = compositionId === 'CinematicLoopShort'
      ? 15
      : (timing.shiftStartFrame > 0
          ? Math.max(1, timing.shiftStartFrame - 2)
          : (timing.hookEndFrame > 0 ? timing.hookEndFrame : timing.headerEndFrame));
    const thumbOffsetMs = Math.round((screenshotFrame / composition.fps) * 1000);

    const isLinux = process.platform === 'linux';
    const chromiumOptions = {
      gl: (isLinux ? 'swangle' : 'angle') as 'swangle' | 'angle',
      enableMultiProcessOnLinux: false,
      disableDevShmUsage: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };

    // Render thumbnail still
    console.log(`📸 Capturing thumbnail screenshot at frame ${screenshotFrame} (${thumbOffsetMs}ms)...`);
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: thumbPath,
      inputProps: payload,
      frame: screenshotFrame,
      imageFormat: 'png',
      chromiumOptions,
    });

    console.log(`🎬 Rendering ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(1)}s)...`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: payload,
      imageFormat: 'jpeg',
      chromiumOptions,
      concurrency: process.env.CI ? 2 : '50%',
      timeoutInMilliseconds: 300000,
    });

    console.log(`✅ Render successful: ${filename}`);

    const videoUrl = `${protocol}://${host}/videos/${filename}`;
    const thumbnailUrl = `${protocol}://${host}/videos/${thumbFilename}`;
    const durationSeconds = +(composition.durationInFrames / composition.fps).toFixed(2);

    // If client requested direct video file stream / download
    if (req.query.stream === 'true' || body.stream === true) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return fs.createReadStream(outputPath).pipe(res);
    }

    // Default: Return JSON with video URL, thumbnail, and Instagram Reels thumb_offset
    return res.status(200).json({
      success: true,
      videoUrl,
      thumbnailUrl,
      filename,
      thumbFilename,
      thumb_offset: thumbOffsetMs,
      thumb_offset_ms: thumbOffsetMs,
      cover_frame_offset_ms: thumbOffsetMs,
      screenshotFrame,
      durationSeconds,
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
      template: payload.template,
      backgroundVideoUrl: payload.backgroundVideoUrl || null,
      voiceover: {
        voice,
        hookAudioUrl: payload.hookAudioSrc ? `${protocol}://${host}/audio/${path.basename(payload.hookAudioSrc)}` : null,
        hookDuration: payload.hookAudioDuration || null,
        bodyAudioUrl: payload.bodyAudioSrc ? `${protocol}://${host}/audio/${path.basename(payload.bodyAudioSrc)}` : null,
        bodyDuration: payload.bodyAudioDuration || null,
      },
    });
  } catch (error: any) {
    console.error('❌ API Render Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error during video rendering',
    });
  }
});

// Start Express server and warm up bundle
app.listen(PORT, async () => {
  console.log(`
===========================================================
 🕌 Qalam & Dawaat API Server Running!
 🌐 URL: http://localhost:${PORT}
 🎙️ TTS Voiceover:   POST/GET http://localhost:${PORT}/tts
 🎥 Video Endpoint: POST     http://localhost:${PORT}/api/generate-video
 🩺 Health Check:    GET      http://localhost:${PORT}/api/health
===========================================================
  `);

  // Warm up bundle in background
  getBundleLocation().catch((err) => {
    console.error('Warning: Bundle warm-up failed:', err);
  });
});
