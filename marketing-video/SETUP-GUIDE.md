# Quick Setup Guide - Ligaye Marketing Video

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd marketing-video
pnpm install
```

### Step 2: Take Website Screenshots
1. Open your live website: `http://localhost:3000`
2. Take full-page screenshots:
   - **Landing page**: Save as `src/assets/screenshots/landing-page-desktop.png`
   - **Jobs page**: Save as `src/assets/screenshots/jobs-page-desktop.png`

**How to take screenshots:**
- **macOS**: Cmd+Shift+4, then Spacebar, click window
- **Windows**: Windows+Shift+S, select area
- **Browser**: Right-click → "Capture screenshot" (Chrome DevTools)

### Step 3: Start Development
```bash
pnpm dev
```

This opens Remotion Studio in your browser at `http://localhost:3001`

### Step 4: Preview Your Video
- Click the play button to watch your video
- Use the scrubber to navigate to different scenes
- The video is exactly 60 seconds long

### Step 5: Render Final Video
```bash
# High-quality version (takes 5-10 minutes)
pnpm render:prod

# Quick preview (takes 1-2 minutes)
pnpm render
```

## 🎯 What You'll See

Your video includes these 5 scenes:

1. **Logo Animation** (0-8s) - Ligaye logo with tagline
2. **Landing Page** (8-20s) - Hero section and features
3. **Jobs Demo** (20-35s) - Job search interface
4. **Features Split** (35-50s) - Job seekers vs employers
5. **Call to Action** (50-60s) - Final CTA with website

## 🎨 Customization

### Quick Text Changes
Edit `src/utils/constants.ts`:
```typescript
export const CONTENT = {
  companyName: 'Your Company',
  tagline: 'Your Tagline',
  // ... other content
};
```

### Color Changes
Edit `src/utils/colors.ts`:
```typescript
export const BRAND_COLORS = {
  primary: {
    blue: 'hsl(229, 95%, 64%)', // Your primary color
  },
  // ... other colors
};
```

## 🔧 Troubleshooting

**Video won't load?**
- Refresh the browser
- Check console for errors
- Make sure you ran `pnpm install`

**Rendering fails?**
- Close other applications
- Try: `pnpm render` instead of `pnpm render:prod`

**Audio not working?**
- Add MP3 files to `src/assets/audio/`
- Import them in scene files with `staticFile('audio/file.mp3')`

## 📱 Multiple Formats

Generate videos for different platforms:

```bash
pnpm render:prod      # YouTube (16:9)
pnpm render:square    # Instagram Posts (1:1)
pnpm render:story     # Instagram Stories (9:16)
```

## ✅ You're Done!

Your professional marketing video is ready to showcase Ligaye.com to the world. 

The video will be saved in the `out/` folder as `ligaye-marketing-video.mp4`.

---

**Need help?** Check the full README.md for detailed explanations and advanced customization options.