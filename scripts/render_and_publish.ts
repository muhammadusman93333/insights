import path from 'path';
import fs from 'fs';
import { renderUrduInsightVideo } from '../src/render';
import { defaultProps, UrduInsightPayload } from '../src/types';

interface ActionInputs {
  title?: string;
  hook?: string;
  urduText?: string;
  surahReference?: string;
  bgTheme?: string;
  qalam?: string;
  fontFamily?: string;
  bgMusic?: string;
  payload_json?: string;
  webhook_url?: string;
  upload_url?: string;
  [key: string]: any;
}

const DEFAULT_UPLOAD_URL = 'https://uvisionpk.com/insights/upload_video.php';
const DEFAULT_WEBHOOK_URL = 'https://hook.eu1.make.com/husiuaa0llb1tpdgpd142jgkbxypn5gy';

/**
 * Extracts inputs from GitHub Actions environment, CLI flags, or event payload
 */
function getInputs(): {
  payload: UrduInsightPayload;
  uploadUrl: string;
  webhookUrl: string;
  passthrough: Record<string, any>;
} {
  let rawInputs: ActionInputs = {};
  let passthrough: Record<string, any> = {};

  // 1. Check if running inside GitHub Actions with an event JSON
  if (process.env.GITHUB_EVENT_PATH && fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
    try {
      const eventJson = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf-8'));
      console.log('📌 GitHub Event detected:', eventJson.action || eventJson.event_type || 'Workflow Event');

      // Check repository_dispatch client_payload
      if (eventJson.client_payload) {
        rawInputs = { ...rawInputs, ...eventJson.client_payload };
        passthrough = { ...passthrough, ...eventJson.client_payload };
      }
      // Check workflow_dispatch inputs
      if (eventJson.inputs) {
        rawInputs = { ...rawInputs, ...eventJson.inputs };
        passthrough = { ...passthrough, ...eventJson.inputs };
      }
    } catch (e) {
      console.warn('⚠️ Could not parse GITHUB_EVENT_PATH JSON:', e);
    }
  }

  // 2. Read from Environment Variables (GitHub Action step inputs or custom env)
  const envKeys: (keyof ActionInputs)[] = [
    'title',
    'hook',
    'urduText',
    'surahReference',
    'bgTheme',
    'qalam',
    'fontFamily',
    'bgMusic',
    'payload_json',
    'webhook_url',
    'upload_url',
  ];

  for (const key of envKeys) {
    const envVal =
      process.env[`INPUT_${key.toUpperCase()}`] ||
      process.env[key.toUpperCase()] ||
      process.env[key];
    if (envVal !== undefined && envVal !== '') {
      rawInputs[key] = envVal;
    }
  }

  // 3. Parse CLI args if supplied (e.g. tsx scripts/render_and_publish.ts --json '{"title":"..."}')
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json' && args[i + 1]) {
      try {
        const parsed = JSON.parse(args[i + 1]);
        rawInputs = { ...rawInputs, ...parsed };
      } catch (e) {
        console.error('❌ Failed to parse --json argument:', e);
      }
      i++;
    } else if (args[i] === '--webhook' && args[i + 1]) {
      rawInputs.webhook_url = args[i + 1];
      i++;
    } else if (args[i] === '--upload-url' && args[i + 1]) {
      rawInputs.upload_url = args[i + 1];
      i++;
    }
  }

  // 4. Resolve payload_json string if provided
  let parsedPayloadJson: Partial<UrduInsightPayload> = {};
  if (rawInputs.payload_json) {
    try {
      if (typeof rawInputs.payload_json === 'string' && rawInputs.payload_json.trim().startsWith('{')) {
        parsedPayloadJson = JSON.parse(rawInputs.payload_json);
      } else if (typeof rawInputs.payload_json === 'object') {
        parsedPayloadJson = rawInputs.payload_json;
      }
    } catch (e) {
      console.warn('⚠️ Warning: Failed to parse rawInputs.payload_json:', e);
    }
  }

  const uploadUrl = rawInputs.upload_url || process.env.UPLOAD_URL || DEFAULT_UPLOAD_URL;
  const webhookUrl = rawInputs.webhook_url || process.env.MAKE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

  // Build the final UrduInsightPayload
  const payload: UrduInsightPayload = {
    ...defaultProps,
    ...rawInputs,
    ...parsedPayloadJson,
  };

  // Support alternate text keys
  if (rawInputs.body || rawInputs.bodyText) {
    payload.urduText = (rawInputs.body || rawInputs.bodyText || payload.urduText) as string;
  }

  return {
    payload,
    uploadUrl,
    webhookUrl,
    passthrough,
  };
}

/**
 * Uploads a video file to the specified PHP endpoint
 */
async function uploadVideo(filePath: string, uploadUrl: string): Promise<any> {
  console.log(`\n🚀 Uploading video to: ${uploadUrl}`);
  console.log(`📁 File: ${filePath} (${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB)`);

  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'video/mp4' });

  const formData = new FormData();
  formData.append('video', blob, fileName);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const responseText = await response.text();
  let jsonResult: any;
  try {
    jsonResult = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Upload server responded with non-JSON (Status ${response.status}): ${responseText.substring(0, 300)}`);
  }

  if (!response.ok || (jsonResult.status && jsonResult.status !== 'success')) {
    throw new Error(jsonResult.message || `Upload failed with status code ${response.status}`);
  }

  console.log('✅ Upload response received:');
  console.log(JSON.stringify(jsonResult, null, 2));
  return jsonResult;
}

/**
 * Uploads an image / thumbnail file to the specified PHP endpoint
 */
async function uploadThumbnail(filePath: string, uploadUrl: string): Promise<any> {
  console.log(`\n📸 Uploading thumbnail screenshot to: ${uploadUrl}`);
  console.log(`📁 File: ${filePath} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);

  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append('image', blob, fileName);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const responseText = await response.text();
  let jsonResult: any;
  try {
    jsonResult = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Thumbnail upload server responded with non-JSON (Status ${response.status}): ${responseText.substring(0, 300)}`);
  }

  if (!response.ok || (jsonResult.status && jsonResult.status !== 'success')) {
    throw new Error(jsonResult.message || `Thumbnail upload failed with status code ${response.status}`);
  }

  console.log('✅ Thumbnail upload response received:');
  console.log(JSON.stringify(jsonResult, null, 2));
  return jsonResult;
}

/**
 * Sends a completion or failure webhook to Make.com
 */
async function sendWebhook(webhookUrl: string, data: Record<string, any>) {
  if (!webhookUrl) {
    console.log('ℹ️ No webhook URL configured, skipping webhook notification.');
    return;
  }

  console.log(`\n📡 Sending webhook notification to Make.com: ${webhookUrl}`);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const respText = await response.text();
    console.log(`✅ Webhook delivered (Status ${response.status}): ${respText.substring(0, 100)}`);
  } catch (err: any) {
    console.error('❌ Failed to trigger webhook notification:', err.message);
  }
}

/**
 * Write summary to GitHub Step Summary if running in CI
 */
function appendStepSummary(markdown: string) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    try {
      fs.appendFileSync(summaryFile, markdown + '\n');
    } catch (e) {
      console.warn('Could not write to GITHUB_STEP_SUMMARY:', e);
    }
  }
}

async function main() {
  const { payload, uploadUrl, webhookUrl, passthrough } = getInputs();

  console.log('====================================================');
  console.log(' 🕌 Qalam & Dawaat - GitHub Action Pipeline');
  console.log('====================================================');
  console.log(`🎯 Upload Target:   ${uploadUrl}`);
  console.log(`🔔 Webhook Target:  ${webhookUrl}`);
  console.log(`📝 Title:           ${payload.title || 'N/A'}`);
  console.log(`🪝 Hook:            ${(payload.hook || '').substring(0, 50)}...`);
  console.log(`✍️ Urdu Text:       ${(payload.urduText || payload.body || '').substring(0, 50)}...`);
  console.log('====================================================\n');

  const timestamp = new Date().toISOString();
  const outDir = path.resolve(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const uniqueId = Date.now();
  const videoFileName = `urdu_insight_${uniqueId}.mp4`;
  const thumbFileName = `urdu_thumb_${uniqueId}.png`;
  const outputPath = path.join(outDir, videoFileName);
  const screenshotPath = path.join(outDir, thumbFileName);

  try {
    // 1. Render Video & Thumbnail Screenshot
    console.log('🎬 Step 1/4: Rendering video and thumbnail screenshot with Remotion...');
    const renderResult = await renderUrduInsightVideo({
      inputPayload: payload,
      outputPath,
      screenshotPath,
      captureScreenshot: true,
    });

    // 2. Upload Video
    console.log('\n📤 Step 2/4: Uploading video to live server...');
    const uploadVideoResult = await uploadVideo(outputPath, uploadUrl);

    const videoUrl =
      uploadVideoResult.data?.url ||
      uploadVideoResult.url ||
      `https://uvisionpk.com/insights/uploads/${uploadVideoResult.data?.file_name || videoFileName}`;

    console.log(`\n🎉 Public Video URL: ${videoUrl}`);

    // 3. Upload Thumbnail Screenshot
    let thumbnailUrl: string | undefined;
    let thumbData: any = undefined;
    if (renderResult.screenshotPath && fs.existsSync(renderResult.screenshotPath)) {
      console.log('\n📸 Step 3/4: Uploading thumbnail image to live server...');
      const uploadThumbResult = await uploadThumbnail(renderResult.screenshotPath, uploadUrl);
      thumbData = uploadThumbResult.data;
      thumbnailUrl =
        uploadThumbResult.data?.url ||
        uploadThumbResult.url ||
        `https://uvisionpk.com/insights/uploads/${uploadThumbResult.data?.file_name || thumbFileName}`;
      console.log(`\n🖼️ Public Thumbnail URL: ${thumbnailUrl}`);
    }

    // 4. Send Webhook Notification to Make.com
    console.log('\n🔔 Step 4/4: Sending Make.com webhook notification...');
    const screenshotFrame = renderResult.screenshotFrame ?? 0;
    const fps = renderResult.fps || 30;
    const thumbOffsetMs = Math.round((screenshotFrame / fps) * 1000);

    const webhookPayload = {
      status: 'success',
      message: 'Video and thumbnail have been rendered and uploaded successfully',
      title: payload.title,
      hook: payload.hook,
      urduText: payload.urduText || payload.body,
      surahReference: payload.surahReference,
      video_url: videoUrl,
      videoUrl: videoUrl,
      file_name: uploadVideoResult.data?.file_name || videoFileName,
      file_size: uploadVideoResult.data?.file_size,
      upload_data: uploadVideoResult.data,
      thumbnail_url: thumbnailUrl,
      thumbnailUrl: thumbnailUrl,
      thumbnail_file_name: thumbData?.file_name || thumbFileName,
      thumbnail_file_size: thumbData?.file_size,
      thumbnail_data: thumbData,
      // Instagram Reels Cover Frame / Thumbnail offset in milliseconds
      thumb_offset: thumbOffsetMs,
      thumb_offset_ms: thumbOffsetMs,
      cover_frame_offset_ms: thumbOffsetMs,
      cover_frame_ms: thumbOffsetMs,
      thumbnail_offset_ms: thumbOffsetMs,
      screenshot_frame: screenshotFrame,
      screenshot_timestamp_seconds: +(screenshotFrame / fps).toFixed(2),
      metadata: {
        title: payload.title,
        hook: payload.hook,
        urduText: payload.urduText || payload.body,
        surahReference: payload.surahReference,
        bgTheme: payload.bgTheme,
        qalam: payload.qalam,
        fontFamily: payload.fontFamily,
        bgMusic: payload.bgMusic,
        durationInFrames: renderResult.durationInFrames,
        fps: renderResult.fps,
        durationSeconds: +(renderResult.durationInFrames / renderResult.fps).toFixed(2),
        thumb_offset: thumbOffsetMs,
        thumbOffsetMs,
        screenshotFrame,
      },
      passthrough,
      completed_at: new Date().toISOString(),
    };

    await sendWebhook(webhookUrl, webhookPayload);

    // Write GitHub Actions Step Summary
    appendStepSummary(`
## 🎥 Video Render & Upload Completed Successfully!
- **Video URL**: [${videoUrl}](${videoUrl})
${thumbnailUrl ? `- **Thumbnail URL**: [${thumbnailUrl}](${thumbnailUrl})` : ''}
- **Instagram Thumb Offset**: \`${thumbOffsetMs} ms\` (Frame ${screenshotFrame} @ ${fps}fps)
- **Video File**: \`${uploadVideoResult.data?.file_name || videoFileName}\`
${thumbData?.file_name ? `- **Thumbnail File**: \`${thumbData.file_name}\`` : ''}
- **Duration**: \`${(renderResult.durationInFrames / renderResult.fps).toFixed(1)}s\` (${renderResult.durationInFrames} frames @ ${renderResult.fps}fps)
- **Title**: *${payload.title || 'N/A'}*
- **Reference**: *${payload.surahReference || 'N/A'}*
- **Webhook Status**: Dispatched to Make.com ✅
    `);

    console.log('\n====================================================');
    console.log('✅ ALL PIPELINE STEPS COMPLETED SUCCESSFULLY');
    console.log('====================================================');
  } catch (error: any) {
    console.error('\n❌ Pipeline execution failed:', error);

    // Notify Make.com of the failure
    await sendWebhook(webhookUrl, {
      status: 'error',
      message: error.message || 'Video rendering or upload failed',
      timestamp,
      passthrough,
    });

    appendStepSummary(`
## ❌ Video Pipeline Failed
- **Error**: \`${error.message || 'Unknown error'}\`
- **Webhook Status**: Failure event dispatched to Make.com ⚠️
    `);

    process.exit(1);
  }
}

if (require.main === module || process.argv[1]?.endsWith('render_and_publish.ts')) {
  main();
}
