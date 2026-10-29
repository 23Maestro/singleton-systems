// Public Carrd URLs and start times: docs/offer/2026-10-10-carrd-video-sources.json.
export type VideoSample = { id: string; title: string; category: string; start: number; embedUrl?: string; poster?: string; watchUrl?: string };
export const FEATURED_EDITS: VideoSample[] = [
  { id: "oI07KwkIIuQ", title: "Sports Analysis in Motion — Lineups Reel", category: "Client work · Sports editing", start: 0, poster: "/portfolio/video-offer/lineups-reel-poster.jpg" },
  { id: "NsK_vIA9m30", title: "Wemby — Perimeter vs. Paint", category: "Test edit · Basketball", start: 0, poster: "/portfolio/video-offer/wemby-test-edit-poster.jpg" },
  { id: "txnYIYJMs88", title: "NurseHub Course Lesson", category: "Course editing", start: 0 },
  { id: "QLSmwi8LyJ8", title: "Rethinking Cheer Practice Lesson", category: "Course editing", start: 0 },
  { id: "OiHYbc1MyqE", title: "Academic Page Walkthrough", category: "Software tutorial", start: 131 },
  { id: "jb3A5hnU3YU", title: "Player ID Introduction", category: "Software tutorial", start: 58 },
  { id: "vXDzn9GdP30", title: "Math Walkthrough for TikTok", category: "Short-form editing", start: 0 },
  { id: "QIDtMWo8VDE", title: "Casual Fanatic Social Ad", category: "Short-form editing", start: 0 },
];
export const MORE_EDITS: VideoSample[] = [
  { id: "wDASc9Aw38E", title: "Command Canine Test Edit", category: "Test edit", start: 0 },
  { id: "SbHius0Rz0U", title: "NurseHub Course Lesson", category: "Course editing", start: 0 },
  { id: "YZ0jRokso0s", title: "NurseHub Course Lesson", category: "Course editing", start: 0 },
  { id: "kwiPRH87Cxs", title: "Webinar Highlight Reel", category: "Software tutorial", start: 7 },
  { id: "zJs_cw8fxgI", title: "Athletics Page Walkthrough", category: "Software tutorial", start: 179 },
  { id: "hVtsQdsPK8Q", title: "Media Page Walkthrough", category: "Software tutorial", start: 0 },
];
export const CLIENT_TESTIMONIAL: VideoSample = { id: "HTtsQg2Mow4", title: "An Upwork Client’s Experience", category: "Client testimonial", start: 0 };
