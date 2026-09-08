"""
Urdu Edge-TTS Voice Generator with Human-like Natural Cadence
Optimized for Urdu (ur-PK-AsadNeural / ur-PK-UzmaNeural)
"""

import sys
import os
import json
import re
import time
import argparse
import asyncio
import edge_tts

def preprocess_urdu_text(text: str, realistic: bool = True) -> str:
    if not text:
        return ""
    
    # 1. Clean markdown, URLs, emojis, and hashtags
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[*_`#~>[\]]', '', text)
    text = re.sub(r'[\U00010000-\U0010ffff]', '', text)  # remove 4-byte emojis
    text = re.sub(r'[\u2600-\u27bf]', '', text)         # remove misc symbols
    
    # 2. Normalize whitespace
    text = re.sub(r'[\r\n]+', '۔ ', text)  # line breaks become sentence breaks
    text = re.sub(r'\s+', ' ', text).strip()
    
    if not realistic:
        return text

    # 3. Standardize Urdu punctuation for natural breathing pauses
    # English comma/semicolon -> Urdu comma with proper space
    text = text.replace(',', '، ').replace(';', '، ')
    text = re.sub(r'۔+', '۔ ', text)
    text = re.sub(r'،+', '، ', text)
    text = re.sub(r'؟+', '؟ ', text)
    text = re.sub(r'!+', '! ', text)

    # 4. Insert natural pauses before transitional Urdu conjunctions if no punctuation exists
    # When humans speak Urdu, they pause briefly before words like 'لیکن', 'کیونکہ', etc.
    conjunctions = ['لیکن', 'کیونکہ', 'حالانکہ', 'چنانچہ', 'بلکہ', 'مگر', 'لہٰذا', 'گویا']
    for conj in conjunctions:
        text = re.sub(rf'(?<![،۔؟!])\s+({conj})\b', rf'، \1', text)

    # 5. Clean up redundant commas or punctuation
    text = re.sub(r'([،۔؟!])\s*([،۔?!])', r'\1', text)
    text = re.sub(r'\s+', ' ', text).strip()

    # 6. Ensure sentence ends with a full stop so the final syllable finishes naturally
    if not text.endswith(('۔', '؟', '!', '.')):
        text += '۔'

    return text

async def generate_tts(text: str, output_path: str, voice: str = "ur-PK-AsadNeural", rate: str = "-5%", pitch: str = "-1Hz", volume: str = "+0%", realistic: bool = True):
    cleaned_text = preprocess_urdu_text(text, realistic=realistic)
    if not cleaned_text:
        raise ValueError("Text content is empty after preprocessing")

    # Format rate/pitch/volume if numbers were passed
    if isinstance(rate, (int, float)):
        rate = f"{'+' if rate >= 0 else ''}{int(rate)}%"
    if isinstance(pitch, (int, float)):
        pitch = f"{'+' if pitch >= 0 else ''}{int(pitch)}Hz"
    if isinstance(volume, (int, float)):
        volume = f"{'+' if volume >= 0 else ''}{int(volume)}%"

    output_abs = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(output_abs), exist_ok=True)

    communicate = edge_tts.Communicate(
        text=cleaned_text,
        voice=voice,
        rate=rate,
        pitch=pitch,
        volume=volume
    )

    await communicate.save(output_abs)
    
    # Calculate duration (Edge-TTS generates 48kHz / 32kbps - 48kbps mono MP3, avg 6KB/sec)
    duration = 0.0
    try:
        size = os.path.getsize(output_abs)
        duration = round(size / 6000.0, 2)
    except Exception:
        pass

    return {
        "success": True,
        "outputPath": output_abs,
        "filename": os.path.basename(output_abs),
        "processedText": cleaned_text,
        "voice": voice,
        "rate": rate,
        "pitch": pitch,
        "volume": volume,
        "duration": duration,
        "fileSizeBytes": os.path.getsize(output_abs) if os.path.exists(output_abs) else 0
    }

def main():
    try:
        sys.stdin.reconfigure(encoding='utf-8')
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

    parser = argparse.ArgumentParser(description="Urdu Edge-TTS Voice Generator")
    parser.add_argument("--json", type=str, help="Path to JSON file containing parameters or raw JSON string")
    parser.add_argument("--text", type=str, help="Urdu text to synthesize")
    parser.add_argument("--file", type=str, help="Path to text file containing Urdu text")
    parser.add_argument("--output", type=str, help="Output MP3 file path")
    parser.add_argument("--voice", type=str, default="ur-PK-AsadNeural", help="Voice name (default: ur-PK-AsadNeural)")
    parser.add_argument("--rate", type=str, default="-5%", help="Speed rate (default: -5% for natural human cadence)")
    parser.add_argument("--pitch", type=str, default="-1Hz", help="Pitch adjustment (default: -1Hz for warm resonance)")
    parser.add_argument("--volume", type=str, default="+0%", help="Volume adjustment")
    parser.add_argument("--no-realistic", dest="realistic", action="store_false", default=True, help="Disable pause and punctuation enhancements")

    args = parser.parse_args()

    data = {}
    if args.json:
        if os.path.exists(args.json):
            with open(args.json, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = json.loads(args.json)

    text = data.get("text") or data.get("urduText") or data.get("body") or args.text
    if not text and args.file and os.path.exists(args.file):
        with open(args.file, 'r', encoding='utf-8') as f:
            text = f.read()

    if not text:
        text = "علم حاصل کرنا ہر مسلمان پر فرض ہے، کیونکہ علم انسان کو اندھیروں سے اجالے کی طرف لاتا ہے۔"

    output_path = data.get("output") or data.get("outputPath") or args.output
    if not output_path:
        unique_id = f"tts_{int(time.time())}_{os.urandom(3).hex()}"
        output_path = os.path.join("out", "audio", f"{unique_id}.mp3")

    voice = data.get("voice") or args.voice
    rate = data.get("rate") or args.rate
    pitch = data.get("pitch") or args.pitch
    volume = data.get("volume") or args.volume
    realistic = data.get("realistic", args.realistic)

    try:
        res = asyncio.run(generate_tts(
            text=text,
            output_path=output_path,
            voice=voice,
            rate=rate,
            pitch=pitch,
            volume=volume,
            realistic=realistic
        ))
        print(json.dumps(res, ensure_ascii=False))
    except Exception as e:
        err_res = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(err_res, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()
