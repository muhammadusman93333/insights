# ✒️ Qalam & Dawaat (قلم اور دوات) - Quranic Insights Video Engine

An automated **Node.js + Remotion** video generation engine for 9:16 (1080x1920) vertical YouTube Shorts, Instagram Reels, and TikTok featuring a traditional **"Qalam & Dawaat" (Reed Pen & Antique Inkpot)** handwritten aesthetic for Quranic insights, verses, and reflections in Urdu.

---

## 🌟 Key Features

1. **Authentic RTL Handwriting Engine**:
   - Dynamic real-time Right-to-Left (RTL) writing effect with smooth reveal masks and wet ink sheen.
   - Animated wooden reed pen (**Qalam / قلم**) with realistic angled nib cut (*qat*), ink slit (*shuq*), and dynamic stroke tilting leading the active Urdu cursor.
2. **Vintage Islamic Aesthetic**:
   - Antique Dawaat (**دوات / Inkpot**) with deep liquid ink and brass/ceramic details.
   - Multi-layer aged parchment canvas with candlelit ambient warmth, subtle paper grain, and vignette.
   - Bismillah calligraphy header, geometric Islamic corner borders, and golden dust motes.
3. **Dynamic Duration & Multi-theme**:
   - Calculates total video frames automatically from input Urdu text length.
   - 3 Curated Aesthetic Themes: `vintage-parchment`, `dark-marble`, and `warm-amber`.
4. **Automated CLI & API**:
   - Render directly via CLI from JSON payloads or command-line parameters.
   - Programmatic Node.js / Express API integration.

---

## 📁 Directory Structure

```
insights/
├── src/
│   ├── components/
│   │   ├── ParchmentCanvas.tsx      # Vintage paper background & candlelit vignette
│   │   ├── IslamicBorders.tsx       # Gold geometric corner brackets & crest
│   │   ├── DawaatIllustration.tsx   # Antique brass/ceramic inkpot
│   │   ├── BismillahHeader.tsx      # Thuluth Bismillah & Surah title badge
│   │   ├── QalamNib.tsx             # Traditional reed pen with angled nib cut
│   │   ├── HandwrittenUrduText.tsx  # RTL progressive reveal handwriting engine
│   │   ├── DustParticles.tsx        # Floating golden light particles
│   │   ├── FooterCredits.tsx        # Signature / reference stamp
│   │   └── AudioLayer.tsx           # Audio player for background & sound FX
│   ├── utils/
│   │   └── timing.ts                # Dynamic duration & line splitting engine
│   ├── types.ts                     # Input data interfaces
│   ├── QuranHandwrittenShort.tsx    # Composition visual stack
│   ├── Root.tsx                     # Remotion composition & Google fonts
│   ├── render.ts                    # CLI & Programmatic video renderer
│   └── index.ts                     # Remotion entrypoint
├── samples/
│   ├── sabr_verse.json              # Surah Al-Baqarah (153)
│   ├── tawakkul_verse.json          # Surah At-Talaq (3)
│   └── dark_marble_theme.json       # Surah Ash-Sharh (5-6)
├── remotion.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Live Interactive Preview (Remotion Studio)
Preview, adjust parameters live, and inspect animations:
```bash
npm start
```

### 3. CLI Video Rendering
Render sample videos directly to MP4:

```bash
# Render using a JSON payload file
npm run render -- --input samples/sabr_verse.json --output out/sabr_reel.mp4

# Render with Dark Marble Theme
npm run render -- --input samples/dark_marble_theme.json --output out/dark_marble.mp4

# Quick CLI text override
npm run render -- --text "جو شخص اللہ پر بھروسہ رکھے گا تو وہ اس کے لیے کافی ہے۔" --title "توکل" --surah "سورۃ الطلاق" --output out/tawakkul.mp4
```

---

## 📝 Input JSON Schema (`types.ts`)

```json
{
  "title": "آج کا سبق",
  "surahReference": "سورۃ البقرۃ - آیت ۱۵۳",
  "arabicAyah": "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
  "urduText": "اے ایمان والو! صبر اور نماز کے ذریعے مدد طلب کرو۔ یقیناً اللہ صبر کرنے والوں کے ساتھ ہے۔",
  "authorOrSource": "قرآنی حکمت",
  "bgTheme": "vintage-parchment",
  "showPenAnimation": true,
  "readingPauseSeconds": 4.5
}
```

### Supported Themes (`bgTheme`):
- `vintage-parchment`: Classic warm antique paper with dark walnut ink.
- `dark-marble`: Midnight obsidian and lapis with radiant gold calligraphy.
- `warm-amber`: Deep sunset amber with luminous calligraphy.

### Supported Calligraphy Fonts (`fontFamily`):
If `"fontFamily": "random"` (default), the engine automatically selects a distinct, authentic Islamic calligraphy style for every video:
- `Gulzar` (Traditional Nastaliq / Naskh calligraphy)
- `Noto Nastaliq Urdu` (Classic cascading Nastaliq)
- `Amiri` (High-elegance Thuluth/Naskh)
- `Aref Ruqaa` (Authentic Ruq'ah cursive calligraphy handwriting)
- `Lateef` (Fluid manuscript handwriting)
- `Scheherazade New` (Traditional Arabic/Urdu manuscript)
- `Rakkas` (Flourished artistic Diwani calligraphy)


---

## 🌐 HTTP REST API Server

Start the automated video rendering server:
```bash
npm run server
```
Server runs at `http://localhost:4000`.

### `POST /api/generate-video`

#### Request Body (JSON):
```json
{
  "urduText": "اے ایمان والو! صبر اور نماز کے ذریعے مدد طلب کرو۔ یقیناً اللہ صبر کرنے والوں کے ساتھ ہے۔",
  "title": "آج کا سبق",
  "surahReference": "سورۃ البقرۃ - آیت ۱۵۳",
  "arabicAyah": "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
  "authorOrSource": "قرآنی حکمت",
  "bgTheme": "vintage-parchment",
  "showPenAnimation": true
}
```

#### JSON Response:
```json
{
  "success": true,
  "videoUrl": "http://localhost:4000/videos/urdu_short_1723101234_abc12.mp4",
  "filename": "urdu_short_1723101234_abc12.mp4",
  "durationSeconds": 18.5,
  "durationInFrames": 555,
  "fps": 30,
  "width": 1080,
  "height": 1920
}
```

---

### Example cURL Request:
```bash
curl -X POST http://localhost:4000/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "urduText": "اور جو شخص اللہ پر بھروسہ رکھے گا تو وہ اس کے لیے کافی ہو جائے گا۔",
    "title": "توکل علی اللہ",
    "surahReference": "سورۃ الطلاق - آیت ۳",
    "bgTheme": "warm-amber"
  }'
```

### Example PHP Integration (cURL):
```php
<?php
$payload = [
    'urduText'       => 'اے ایمان والو! صبر اور نماز کے ذریعے مدد طلب کرو۔',
    'title'          => 'قرآنی حکمت',
    'surahReference' => 'سورۃ البقرۃ - آیت ۱۵۳',
    'bgTheme'        => 'vintage-parchment'
];

$ch = curl_init('http://localhost:4000/api/generate-video');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$data = json_decode($response, true);

if ($data['success']) {
    echo "Video Generated: " . $data['videoUrl'];
}
?>
```

---

## 💻 Programmatic Node.js Usage

```typescript
import { renderUrduInsightVideo } from './src/render';

await renderUrduInsightVideo({
  inputPayload: {
    title: 'قرآنی حکمت',
    surahReference: 'سورۃ البقرۃ - آیت ۱۵۳',
    urduText: 'اے ایمان والو! صبر اور نماز کے ذریعے مدد طلب کرو۔',
    bgTheme: 'vintage-parchment',
    showPenAnimation: true,
  },
  outputPath: 'out/my_quran_short.mp4',
  onProgress: (pct) => console.log(`Progress: ${pct}%`),
});
```

---

## ⚡ GitHub Actions Automated Cloud Rendering & Webhooks

The repository includes a complete automated CI/CD pipeline [render_video.yml](file:///.github/workflows/render_video.yml) that renders videos directly in the cloud on GitHub's runners, uploads the MP4 output to your server (`https://uvisionpk.com/insights/upload_video.php`), and dispatches a webhook to Make.com (`https://hook.eu1.make.com/husiuaa0llb1tpdgpd142jgkbxypn5gy`) with the resulting live video URL.

### 1. Trigger via Make.com (HTTP Module)
You can trigger GitHub Actions cloud rendering from Make.com or any external system using GitHub's `repository_dispatch` API:

- **Method**: `POST`
- **URL**: `https://api.github.com/repos/muhammadusman93333/insights/dispatches`
- **Headers**:
  - `Accept`: `application/vnd.github+json`
  - `Authorization`: `Bearer YOUR_GITHUB_PERSONAL_ACCESS_TOKEN`
  - `User-Agent`: `Make-Automation`
- **Body (JSON)**:
  ```json
  {
    "event_type": "render-video",
    "client_payload": {
      "title": "خاموش پکار",
      "hook": "کیا آپ کو بھی لگتا ہے کہ جب دکھ کی شدت سے لفظ ساتھ چھوڑ دیں...",
      "urduText": "اے ایمان والو! صبر اور نماز کے ذریعے مدد طلب کرو۔ یقیناً اللہ صبر کرنے والوں کے ساتھ ہے۔",
      "surahReference": "سورۃ البقرۃ - آیت ۱۵۳",
      "bgTheme": "random",
      "qalam": "random",
      "fontFamily": "random",
      "bgMusic": "random",
      "webhook_url": "https://hook.eu1.make.com/husiuaa0llb1tpdgpd142jgkbxypn5gy"
    }
  }
  ```

### 2. Manual Trigger via GitHub Actions UI
1. Go to your repository on GitHub: `https://github.com/muhammadusman93333/insights/actions`
2. Select **"Render Urdu Insight Video"** from the left sidebar.
3. Click **"Run workflow"**, customize your text, theme, pen, and fonts, and click **"Run workflow"**.

### 3. Make.com Webhook Payload Received
When rendering and upload complete, Make.com immediately receives:
```json
{
  "status": "success",
  "message": "Video has been rendered and uploaded successfully",
  "video_url": "https://uvisionpk.com/insights/uploads/urdu_insight_1723123456789.mp4",
  "file_name": "urdu_insight_1723123456789.mp4",
  "upload_data": {
    "file_name": "urdu_insight_1723123456789.mp4",
    "url": "https://uvisionpk.com/insights/uploads/urdu_insight_1723123456789.mp4"
  },
  "metadata": {
    "title": "خاموش پکار",
    "surahReference": "سورۃ البقرۃ - آیت ۱۵۳",
    "durationSeconds": 18.5
  },
  "completed_at": "2026-08-11T07:10:00.000Z"
}
```

