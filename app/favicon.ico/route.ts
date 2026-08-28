import { NextResponse } from "next/server";

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>
    .tile { fill: #ffffff; }
    .mark { fill: #050505; }
  </style>
  <rect width="64" height="64" class="tile"/>
  <text x="32" y="52" text-anchor="middle" class="mark" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="400" textLength="58" lengthAdjust="spacingAndGlyphs">SS</text>
</svg>`;

export function GET() {
  return new NextResponse(favicon, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
