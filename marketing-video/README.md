# Ligaye.com Marketing Video - Remotion Project

A professional 60-second marketing video showcasing Ligaye.com's job board platform, built with React and Remotion.

## 🎥 Project Overview

This project creates a polished marketing video that:
- Showcases the Ligaye.com landing page and jobs page
- Highlights key platform features
- Uses professional animations and brand-consistent styling
- Outputs multiple formats (16:9, 1:1, 9:16) for different platforms

## 📁 Project Structure

```
marketing-video/
├── remotion.config.ts          # Remotion configuration
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── src/
│   ├── Root.tsx              # Main composition definitions
│   ├── style.css             # Global styles and Tailwind imports
│   ├── compositions/
│   │   ├── MainVideo.tsx     # Primary video composition
│   │   └── scenes/           # Individual scene components
│   │       ├── IntroScene.tsx
│   │       ├── LandingShowcase.tsx
│   │       ├── JobsPageShowcase.tsx
│   │       ├── FeaturesScene.tsx
│   │       └── CallToActionScene.tsx
│   ├── components/           # Reusable UI components
│   │   ├── AnimatedLogo.tsx
│   │   ├── JobCard.tsx
│   │   └── TextAnimations.tsx
│   ├── utils/               # Utilities and helpers
│   │   ├── colors.ts        # Brand colors and color utilities
│   │   ├── constants.ts     # Video configuration and content
│   │   └── animations.ts    # Animation hooks and utilities
│   └── assets/              # Static assets
│       ├── screenshots/     # Website screenshots
│       ├── audio/          # Audio files (music, voiceover)
│       └── fonts/          # Custom fonts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- pnpm (recommended) or npm

### Installation

1. **Navigate to the marketing-video directory:**
   ```bash
   cd marketing-video
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Add screenshots (important):**
   - Take screenshots of your live website
   - Place them in `src/assets/screenshots/`
   - See `src/assets/screenshots/README.md` for detailed instructions

### Development

**Start the Remotion Studio (recommended for beginners):**
```bash
pnpm dev
```

This opens a browser-based interface where you can:
- Preview your video in real-time
- Scrub through the timeline
- Adjust parameters and see changes instantly
- Play, pause, and navigate frame by frame

## 🎬 Video Structure (60 seconds)

| Scene | Duration | Description |
|-------|----------|-------------|
| **Intro** | 0-8s | Animated logo reveal and tagline |
| **Landing Showcase** | 8-20s | Hero section and key benefits |
| **Jobs Page Demo** | 20-35s | Job search interface and listings |
| **Features** | 35-50s | Split view of job seeker vs employer benefits |
| **Call to Action** | 50-60s | Strong closing with website and CTA buttons |

## 🎨 What Makes This Video Special

### Professional Design Elements
- **Glassmorphic UI**: Matches your website's modern design language
- **Brand Consistency**: Uses exact colors from your CSS variables
- **Smooth Animations**: Physics-based spring animations for natural movement
- **Responsive Layouts**: Adapts to different aspect ratios automatically

### Advanced Animation Techniques
- **Staggered Animations**: Elements appear in sequence for visual hierarchy
- **Parallax Effects**: Background elements move at different speeds
- **Morphing Transitions**: Smooth scene changes without jarring cuts
- **Dynamic Typography**: Text reveals character by character

### Multi-Format Support
- **16:9 Landscape**: Perfect for YouTube, website headers
- **1:1 Square**: Optimized for Instagram posts, LinkedIn
- **9:16 Portrait**: Ideal for Instagram Stories, TikTok, YouTube Shorts

## 🛠 Customization Guide

### Updating Content

**Edit text content in `src/utils/constants.ts`:**
```typescript
export const CONTENT = {
  companyName: 'Ligaye.com',
  tagline: "Gambia's Digital Career Revolution",
  features: {
    jobSeekers: [
      'Connect directly with top Gambian employers',
      // Add your own features...
    ],
  },
  // Update other content...
};
```

**Modify colors in `src/utils/colors.ts`:**
```typescript
export const BRAND_COLORS = {
  primary: {
    blue: 'hsl(229, 95%, 64%)', // Your primary color
    // Update other colors...
  },
};
```

### Adjusting Animations

**Animation timing in `src/utils/constants.ts`:**
```typescript
export const SCENE_TIMING = {
  intro: {
    start: 0,
    duration: 240, // 8 seconds at 30fps
  },
  // Adjust other scene timings...
};
```

**Create custom animations in `src/utils/animations.ts`:**
```typescript
export const useCustomAnimation = (startFrame: number) => {
  const frame = useCurrentFrame();
  // Your custom animation logic...
};
```

## 📤 Rendering Options

### Quick Preview (Fast)
```bash
pnpm render
```

### High-Quality Production (Slow but Best)
```bash
pnpm render:prod
```

### Multiple Formats
```bash
# Square format for social media
pnpm render:square

# Story format for Instagram/TikTok
pnpm render:story

# GIF version for web use
pnpm render:gif
```

### Custom Rendering
```bash
# Custom resolution and quality
npx remotion render MainVideo output.mp4 --width=3840 --height=2160 --quality=100
```

## 🎵 Adding Audio

1. **Add background music:**
   - Place audio files in `src/assets/audio/`
   - Import and use in your scenes:
   ```typescript
   import { Audio } from 'remotion';
   
   <Audio src={staticFile('audio/background-music.mp3')} volume={0.3} />
   ```

2. **Recommended audio specs:**
   - Format: MP3 or WAV
   - Length: 60+ seconds
   - Volume: Keep background music subtle (0.2-0.4)

## 🔧 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
pnpm install
```

**Video won't play in studio:**
- Check browser console for errors
- Ensure all image paths are correct
- Try refreshing the Remotion Studio

**Slow rendering:**
- Close other applications
- Use `--concurrency=1` flag for memory-constrained systems
- Consider cloud rendering with Remotion Lambda

**Audio not playing:**
- Ensure audio files are in supported formats (MP3, WAV)
- Check file paths are correct
- Verify audio files aren't corrupted

### Performance Tips

1. **Optimize images:**
   - Use JPEG for photos, PNG for graphics with transparency
   - Compress images to reasonable sizes (1920px width max)

2. **Efficient animations:**
   - Use `interpolate()` instead of complex calculations
   - Avoid animating too many elements simultaneously

3. **Memory management:**
   - Use `staticFile()` for assets instead of imports
   - Clean up unused animations and components

## 🌐 Deployment Options

### Local Rendering
- Render locally for full control
- Best for small teams or one-off videos

### Cloud Rendering (Remotion Lambda)
- Faster rendering using AWS
- Great for batch processing or team workflows
- Set up guide: [Remotion Lambda docs](https://remotion.dev/lambda)

### CI/CD Integration
- Automate video generation in your deployment pipeline
- Update videos when website content changes

## 📚 Learning Resources

### Remotion Fundamentals
- [Official Remotion Documentation](https://remotion.dev/)
- [Remotion YouTube Channel](https://youtube.com/@remotion-dev)

### Key Concepts for Beginners
1. **Compositions**: Think of these as different video templates
2. **Sequences**: Layer multiple scenes with specific timing
3. **useCurrentFrame()**: Gets the current frame number for animations
4. **interpolate()**: Smoothly transitions between values over time

### Example Learning Path
1. Start with the Remotion Studio to understand the interface
2. Modify text content in `constants.ts`
3. Adjust animation timing in scene files
4. Experiment with colors and styling
5. Try creating custom animations

## 🚀 Next Steps

### Enhancements You Can Add
1. **Real Screenshots**: Replace placeholders with actual website screenshots
2. **Voiceover**: Add professional narration to guide viewers
3. **Music**: Include background music that matches your brand
4. **Localization**: Create versions in different languages
5. **A/B Testing**: Create multiple versions to test effectiveness

### Advanced Features
1. **Dynamic Data**: Pull real job listings from your API
2. **User Testimonials**: Include quotes from satisfied users
3. **Animation Presets**: Create reusable animation templates
4. **Interactive Elements**: Add clickable areas for web versions

## 📞 Support

If you encounter issues or need help customizing the video:

1. Check the Remotion documentation
2. Look at the example code in each scene file
3. Use the Remotion Studio to visually debug issues
4. Modify one element at a time to isolate problems

Remember: Remotion is just React, so if you know React, you can create amazing videos!

---

**Created with ❤️ for Ligaye.com**  
*Empowering Gambian careers through technology*