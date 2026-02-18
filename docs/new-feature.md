🎞️ Film Scrubber: High-Performance Local Mode
This document outlines the implementation of Local File Mode, an alternative to the standard YouTube URL player. Local Mode allows for frame-perfect scrubbing and high-resolution exports by reading files directly from the device's memory.

🛠️ Technical Implementation: The "Warm-Up" Script
iOS Safari is aggressive with memory management. To prevent lag during scrubbing, we use a "Warm-Up" routine that forces the browser to buffer the video into RAM immediately upon selection.

1. The Optimized File Handler
Add this logic to your JavaScript to handle the transition from a URL-based player to a Local-File player.

JavaScript
/**
 * Handles local file selection and optimizes for iOS scrubbing.
 */
function initializeLocalVideo(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Create a local blob reference (No server upload required)
    const blobURL = URL.createObjectURL(file);
    const video = document.getElementById('local-video-player');
    
    video.src = blobURL;
    video.load();

    // 2. iOS "Warm-Up" Routine
    video.addEventListener('loadedmetadata', () => {
        const originalTime = video.currentTime;
        
        // Force a seek to trigger hardware decoding/buffering
        video.currentTime = 0.1; 
        
        video.onseeked = () => {
            video.currentTime = originalTime;
            video.onseeked = null; // Clean up listener
            console.log("🚀 Local video primed for high-speed scrubbing.");
        };
    }, { once: true });
}
2. UI Logic: Mode Switching
To keep the app clean, use a simple conditional display to swap between the YouTube Iframe and the Local <video> tag.

HTML
<div id="player-container">
    <iframe id="youtube-player" src="..." frameborder="0"></iframe>

    <video id="local-video-player" controls style="display:none;"></video>
</div>

<input type="file" id="video-upload" accept="video/mp4,video/quicktime" onchange="initializeLocalVideo(event)">
📱 User Guide: How to use YouTube videos on iOS
Because YouTube blocks direct file access via URL, users must download the video to their device first. Below are the most reliable methods for iPhone users.

Method A: iOS Shortcuts (Recommended)
The fastest way to get a YouTube video into your Files app or Photos.

Download a Shortcut like "R⤓Download" or "SW-DLT" from RoutineHub.

Open the YouTube app → Tap Share.

Tap More → Select the Shortcut.

Save the video as an MP4.

Return to Film Scrubber and select the file from your device.

Method B: Documents by Readdle
Download the Documents app (Free on App Store).

Use the built-in browser to visit a downloader site (e.g., yt5s.io).

Download the video to your local "Downloads" folder.

In Film Scrubber, tap Upload and browse to the Documents folder.

💡 Pro-Tips for Mobile Optimization
Format Matters: iOS performs best with H.264 MP4. Avoid WebM, as it often lacks hardware acceleration on older iPhones.

Canvas Throttling: When scrubbing on mobile, wrap your canvas redraw function in a requestAnimationFrame to ensure the UI stays responsive at 60fps.

Storage: Local blobs persist as long as the tab is open. If you want the video to stay after a refresh, consider using IndexedDB for storage.