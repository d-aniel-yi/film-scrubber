/**
 * Pure URL parsing for YouTube. No React, no hooks — easy to unit test.
 */

/**
 * Extract YouTube video ID from common URL formats.
 * Returns null for invalid or unsupported URLs.
 */
export function extractVideoId(url: string | null | undefined): string | null {
  if (url == null || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // youtube.com/watch?v=ID
  const watchMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  if (watchMatch) return watchMatch[1];

  // youtu.be/ID
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/shorts/ID
  const shortsMatch = trimmed.match(
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  if (shortsMatch) return shortsMatch[1];

  // youtube.com/embed/ID
  const embedMatch = trimmed.match(
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (embedMatch) return embedMatch[1];

  return null;
}
