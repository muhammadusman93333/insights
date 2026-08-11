import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { UrduInsightPayload, urduInsightSchema } from './types';
import { defaultProps } from './Root';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Output folder for rendered videos
const outDir = path.resolve(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Serve rendered videos statically
app.use('/videos', express.static(outDir));

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
 * Main Video Generation Endpoint:
 * POST /api/generate-video
 *
 * Body schema:
 * {
 *   "urduText": "اے ایمان والو! صبر اور نماز کے ذریعے مدد طلب کرو۔",
 *   "title": "آج کا سبق",
 *   "surahReference": "سورۃ البقرۃ - آیت ۱۵۳",
 *   "arabicAyah": "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
 *   "authorOrSource": "قرآنی حکمت",
 *   "bgTheme": "vintage-parchment" | "dark-marble" | "warm-amber",
 *   "showPenAnimation": true,
 *   "readingPauseSeconds": 4.5,
 *   "stream": false // set to true to directly download the MP4 file
 * }
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

    // Merge defaults with request body
    const payload: UrduInsightPayload = {
      ...defaultProps,
      ...body,
      urduText: body.body || body.bodyText || body.urduText || body.hook || '',
    };

    console.log(`\n📥 API Render Request Received:`);
    if (payload.title) console.log(`🏷️ Title: "${payload.title}"`);
    if (payload.hook) console.log(`🪝 Hook: "${payload.hook.substring(0, 50)}..."`);
    console.log(`✍️ Body: "${(payload.body || payload.urduText).substring(0, 50)}..."`);
    console.log(`🎨 Theme: ${payload.bgTheme || 'random'}`);

    const bundleLocation = await getBundleLocation();

    // Select composition and compute dynamic duration
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'QuranHandwrittenShort',
      inputProps: payload,
    });

    const uniqueId = `urdu_short_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const filename = `${uniqueId}.mp4`;
    const outputPath = path.join(outDir, filename);

    console.log(`🎬 Rendering ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(1)}s)...`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: payload,
    });

    console.log(`✅ Render successful: ${filename}`);

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol || 'http';
    const videoUrl = `${protocol}://${host}/videos/${filename}`;
    const durationSeconds = +(composition.durationInFrames / composition.fps).toFixed(2);

    // If client requested direct video file stream / download
    if (req.query.stream === 'true' || body.stream === true) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return fs.createReadStream(outputPath).pipe(res);
    }

    // Default: Return JSON with video URL and metadata
    return res.status(200).json({
      success: true,
      videoUrl,
      filename,
      durationSeconds,
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
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
 🎥 Video Endpoint: POST http://localhost:${PORT}/api/generate-video
 🩺 Health Check:    GET  http://localhost:${PORT}/api/health
===========================================================
  `);

  // Warm up bundle in background
  getBundleLocation().catch((err) => {
    console.error('Warning: Bundle warm-up failed:', err);
  });
});
