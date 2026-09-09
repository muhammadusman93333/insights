import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import type { Caption } from '@remotion/captions';

export interface TtsOptions {
  text: string;
  voice?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
  realistic?: boolean;
  outputDir?: string;
  filename?: string;
}

export interface TtsResult {
  success: boolean;
  outputPath: string;
  filename: string;
  srtPath?: string | null;
  processedText: string;
  voice: string;
  rate: string;
  pitch: string;
  volume: string;
  duration: number;
  captions?: Caption[];
  fileSizeBytes: number;
  error?: string;
}

/**
 * Generates natural, human-like Urdu voiceover using Microsoft Edge Neural TTS (ur-PK-AsadNeural)
 */
export async function generateUrduTts(options: TtsOptions): Promise<TtsResult> {
  const text = (options.text || '').trim();
  if (!text) {
    throw new Error('Text is required for TTS generation.');
  }

  const voice = options.voice || 'ur-PK-AsadNeural';
  // Natural human cadence defaults: slightly relaxed pace (-5%) and grounded warm pitch (-1Hz)
  const rate = options.rate || '-5%';
  const pitch = options.pitch || '-1Hz';
  const volume = options.volume || '+0%';
  const realistic = options.realistic !== false;

  const outDir = options.outputDir || path.resolve(process.cwd(), 'out', 'audio');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const uniqueId = options.filename || `tts_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp3`;
  const outputPath = path.resolve(outDir, uniqueId);

  // Use temporary JSON configuration to safely pass UTF-8 Urdu text across Windows subprocesses
  const tempJsonPath = path.resolve(outDir, `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.json`);
  const payload = {
    text,
    output: outputPath,
    voice,
    rate,
    pitch,
    volume,
    realistic,
  };

  fs.writeFileSync(tempJsonPath, JSON.stringify(payload), 'utf8');

  const scriptPath = path.resolve(process.cwd(), 'scripts', 'tts_generator.py');

  return new Promise((resolve, reject) => {
    const pythonProc = spawn('python', [scriptPath, '--json', tempJsonPath], {
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    pythonProc.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });

    pythonProc.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });

    pythonProc.on('close', (code) => {
      // Clean up temporary config file
      try {
        if (fs.existsSync(tempJsonPath)) {
          fs.unlinkSync(tempJsonPath);
        }
      } catch {
        // ignore
      }

      if (code !== 0) {
        return reject(new Error(`TTS generation failed (code ${code}): ${stderr || stdout}`));
      }

      try {
        const result = JSON.parse(stdout.trim()) as TtsResult;
        if (!result.success) {
          return reject(new Error(result.error || 'Unknown error during TTS generation'));
        }
        resolve(result);
      } catch (err: any) {
        reject(new Error(`Failed to parse TTS generator response: ${err.message}. Output: ${stdout}`));
      }
    });

    pythonProc.on('error', (err) => {
      try {
        if (fs.existsSync(tempJsonPath)) {
          fs.unlinkSync(tempJsonPath);
        }
      } catch {
        // ignore
      }
      reject(new Error(`Failed to launch Python TTS process: ${err.message}`));
    });
  });
}
