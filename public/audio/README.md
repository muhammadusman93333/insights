# 🎵 Background Audio Assets

Place your `.mp3` or `.wav` background vocal nasheeds or calm ambient audio files here.

### How to use in Remotion / API:

1. Put your audio file here:
   `public/audio/calm_nasheed.mp3`

2. In your JSON payload or API request, set `bgMusic`:
   ```json
   {
     "bgMusic": "audio/calm_nasheed.mp3",
     "urduText": "..."
   }
   ```

3. Or pass any public direct HTTPS audio URL:
   ```json
   {
     "bgMusic": "https://cdn.example.com/calm_vocal.mp3"
   }
   ```
