import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from .env file if available
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  fps?: number;
  link: string;
}

interface PexelsVideoItem {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  video_files: PexelsVideoFile[];
}

interface PexelsSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  url: string;
  videos: PexelsVideoItem[];
}

/**
 * Returns the relative path (from public/) of a curated fallback vertical nature video
 */
export function getFallbackNatureVideo(query?: string): string {
  const natureVideosDir = path.resolve(process.cwd(), 'public', 'videos', 'nature');
  const defaultFallback = 'videos/nature/nature_fallback.mp4';

  try {
    if (!fs.existsSync(natureVideosDir)) {
      fs.mkdirSync(natureVideosDir, { recursive: true });
      return defaultFallback;
    }

    const files = fs.readdirSync(natureVideosDir).filter((f) => f.toLowerCase().endsWith('.mp4'));
    if (files.length === 0) {
      return defaultFallback;
    }

    if (query && query.trim()) {
      const qLower = query.toLowerCase();
      // Try to find a curated video matching query keywords
      const matched = files.find((file) => {
        const nameWithoutExt = file.replace(/\.mp4$/i, '').toLowerCase();
        return qLower.includes(nameWithoutExt) || nameWithoutExt.split(/[-_]/).some((part) => qLower.includes(part));
      });
      if (matched) {
        return `videos/nature/${matched}`;
      }
    }

    // Default to first available curated video
    return `videos/nature/${files[0]}`;
  } catch {
    return defaultFallback;
  }
}

/**
 * Resolves a vertical video background for a given search query:
 * 1. Queries the official Pexels Videos API for 9:16 portrait video files
 * 2. Selects the optimal HD/Full-HD file (1080x1920 or 720x1280)
 * 3. Downloads and caches the MP4 file in public/videos/cache/<hash>.mp4
 * 4. Falls back automatically to a local curated video in public/videos/nature/
 *    if no API key is set, the API request fails, or 0 results are returned.
 */
export async function resolvePexelsVideo(query: string, apiKey?: string): Promise<string> {
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) {
    return getFallbackNatureVideo();
  }

  const key = process.env.PEXELS_API_KEY || apiKey;

  if (!key) {
    console.log(`ℹ️ [Pexels] No PEXELS_API_KEY found in environment or parameters.`);
    console.log(`🌿 [Pexels] Falling back to local curated nature video for query: "${trimmedQuery}".`);
    const fallbackPath = getFallbackNatureVideo(trimmedQuery);
    console.log(`🎬 [Pexels] Curated local video selected: ${fallbackPath}`);
    return fallbackPath;
  }

  try {
    console.log(`🔍 [Pexels] Searching portrait videos for query: "${trimmedQuery}"...`);
    // Request a larger pool of portrait videos (per_page=15) to ensure variety
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(trimmedQuery)}&orientation=portrait&per_page=15`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: key,
        'User-Agent': 'Remotion-Urdu-Insights/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`⚠️ [Pexels API Error] Received HTTP ${res.status}: ${res.statusText}`);
      console.warn(`🌿 [Pexels] Automatically falling back to local curated nature video.`);
      return getFallbackNatureVideo(trimmedQuery);
    }

    const data = (await res.json()) as PexelsSearchResponse;

    if (!data.videos || data.videos.length === 0) {
      console.warn(`⚠️ [Pexels] No portrait videos found for "${trimmedQuery}".`);
      console.warn(`🌿 [Pexels] Falling back to local curated nature video.`);
      return getFallbackNatureVideo(trimmedQuery);
    }

    // Collect the best vertical 9:16 file for each video returned in the pool
    interface ScoredCandidate {
      file: PexelsVideoFile;
      score: number;
      videoUrl: string;
      videoId: number;
    }

    const candidates: ScoredCandidate[] = [];

    for (const video of data.videos) {
      if (!video.video_files || !Array.isArray(video.video_files)) continue;

      let videoBestFile: PexelsVideoFile | null = null;
      let videoBestScore = -1;

      for (const file of video.video_files) {
        // Ensure MP4 file format
        const isMp4 =
          file.file_type === 'video/mp4' ||
          (typeof file.link === 'string' && file.link.toLowerCase().includes('.mp4'));
        if (!isMp4) continue;

        const w = file.width || 0;
        const h = file.height || 0;

        // Must be portrait (height > width)
        if (h <= w) continue;

        const aspectRatio = w / h; // 9/16 is 0.5625
        let score = 0;

        // Prefer 9:16 aspect ratio (between 0.50 and 0.65)
        if (aspectRatio >= 0.5 && aspectRatio <= 0.62) {
          score += 30;
        }

        // Exact resolution matching preference
        if (w === 1080 && h === 1920) {
          score += 60; // Optimal 1080x1920 HD
        } else if (w === 720 && h === 1280) {
          score += 45; // 720x1280 HD
        } else if (h >= 1080) {
          score += 40;
        } else if (h >= 720) {
          score += 25;
        } else {
          score += 10;
        }

        if (file.quality === 'hd') {
          score += 10;
        }

        if (score > videoBestScore) {
          videoBestScore = score;
          videoBestFile = file;
        }
      }

      if (videoBestFile && videoBestScore > 0) {
        candidates.push({
          file: videoBestFile,
          score: videoBestScore,
          videoUrl: video.url,
          videoId: video.id,
        });
      }
    }

    if (candidates.length === 0) {
      console.warn(`⚠️ [Pexels] No valid vertical MP4 video file found in search results.`);
      console.warn(`🌿 [Pexels] Falling back to local curated nature video.`);
      return getFallbackNatureVideo(trimmedQuery);
    }

    // Filter to top-tier candidates (within 25 points of highest score) and randomly pick one
    const maxScore = Math.max(...candidates.map((c) => c.score));
    const topCandidates = candidates.filter((c) => c.score >= Math.max(30, maxScore - 25));

    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const bestFile = selected.file;

    // Log the selected Pexels video links in the console
    console.log(`🎲 [Pexels] Selected random video from ${topCandidates.length} high-quality candidates: ${bestFile.width}x${bestFile.height} (${bestFile.quality || 'standard'})`);
    console.log(`🌐 [Pexels Webpage]: ${selected.videoUrl}`);
    console.log(`🔗 [Pexels Direct Video MP4]: ${bestFile.link}`);

    // Download to local cache in public/videos/cache/<hash>.mp4 for smooth rendering
    const cacheDir = path.resolve(process.cwd(), 'public', 'videos', 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const hash = crypto.createHash('md5').update(bestFile.link).digest('hex');
    const cacheFilename = `${hash}.mp4`;
    const cacheFilePath = path.join(cacheDir, cacheFilename);
    const relativeCachePath = `videos/cache/${cacheFilename}`;

    if (fs.existsSync(cacheFilePath)) {
      const stats = fs.statSync(cacheFilePath);
      if (stats.size > 10000) {
        console.log(`⚡ [Pexels] Video already cached locally: ${relativeCachePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        return relativeCachePath;
      }
    }

    console.log(`⬇️ [Pexels] Downloading video to cache: ${relativeCachePath}...`);
    const downloadRes = await fetch(bestFile.link);
    if (!downloadRes.ok) {
      console.warn(`⚠️ [Pexels] Failed to download video file (${downloadRes.status}). Using direct remote URL.`);
      return bestFile.link;
    }

    const arrayBuffer = await downloadRes.arrayBuffer();
    fs.writeFileSync(cacheFilePath, Buffer.from(arrayBuffer));
    console.log(`✅ [Pexels] Video successfully cached: ${relativeCachePath} (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);

    return relativeCachePath;
  } catch (error: any) {
    console.error(`❌ [Pexels Error] ${error?.message || error}`);
    console.log(`🌿 [Pexels] Falling back to local curated nature video.`);
    return getFallbackNatureVideo(trimmedQuery);
  }
}
