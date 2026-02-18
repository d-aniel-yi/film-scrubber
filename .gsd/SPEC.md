# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
To expand Film Scrubber into a versatile motion analysis tool that supports both YouTube streams and local video files, enabling dancers and athletes to analyze movement from any source. Additionally, provide utilities to facilitate the acquisition of content for analysis.

## Goals
1.  **Local File Analysis**: Enable users to open and scrub local video files (MP4, MOV) with the same precision controls as the YouTube player.
2.  **Unified Interface**: Abstract the playback logic so the control bar and keyboard shortcuts work identically for both YouTube and local videos.
3.  **Content Acquisition**: Provide a mechanism (direct download or guided workflow) for users to save YouTube videos locally for offline analysis.

## Non-Goals (Out of Scope)
-   Video editing or exporting (trimming, merging).
-   Cloud storage or hosting of user videos.
-   Social sharing features.

## Users
-   **Dancers/Choreographers**: Analyzing rehearsals recorded on their phones.
-   **Athletes**: Reviewing game footage or technique.
-   **Motion Designers**: Studying animation reference.

## Constraints
-   **Local First**: Local video processing must happen client-side for performance and privacy.
-   **YouTube API**: Downloader functionality is subject to YouTube's changing anti-scraping measures; fallback to "instructional" mode may be necessary.

## Success Criteria
- [ ] User can select a local video file and see it load in the player area.
- [ ] Frame stepping and slow-motion controls work on local video.
- [ ] User can switch between YouTube and Local modes without page reload.
- [ ] User can download a YouTube video (or receive clear instructions on how to do so).
