# Screenshots Directory

This directory contains screenshots of the Ligaye.com website for use in the marketing video.

## Required Screenshots

To complete the video, you'll need to take screenshots of:

1. **Landing Page (Full Desktop View)**
   - Navigate to: `http://localhost:3000`
   - Take full-page screenshot of the landing page
   - Save as: `landing-page-desktop.png`

2. **Jobs Page (Desktop View)**
   - Navigate to: `http://localhost:3000/jobs`
   - Take screenshot of the jobs listing page
   - Save as: `jobs-page-desktop.png`

3. **Job Detail Page (Optional)**
   - Click on any job listing
   - Take screenshot of job detail view
   - Save as: `job-detail-desktop.png`

## How to Take Screenshots

### Method 1: Browser Developer Tools (Recommended)
1. Open Chrome/Safari Developer Tools (F12)
2. Click the device toolbar icon (mobile icon)
3. Set to "Responsive" and adjust to 1920x1080
4. Right-click page → "Capture screenshot" (or use built-in screenshot tool)

### Method 2: Manual Screenshots
1. Set browser to fullscreen
2. Use system screenshot tools:
   - **macOS**: Cmd+Shift+4, then Spacebar to capture window
   - **Windows**: Windows+Shift+S
   - **Linux**: Various tools like gnome-screenshot

### Method 3: Automated (Advanced)
```bash
# Install puppeteer for automated screenshots
npm install puppeteer
node scripts/take-screenshots.js
```

## Image Requirements
- **Format**: PNG (for transparency support)
- **Resolution**: Minimum 1920x1080
- **Quality**: High quality, no compression artifacts
- **Content**: Ensure all text is readable and UI elements are clear

## Notes
- Screenshots will be used as background elements in the video
- They may be cropped, scaled, or have overlays applied
- Higher resolution is better for video quality