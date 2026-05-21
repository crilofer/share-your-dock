#!/usr/bin/env node
/**
 * One-shot script to build the bundled icon catalog under public/icons/.
 *
 * Scope: ONLY official macOS system apps (Finder, Safari, Mail, Trash, ...).
 * Brand apps (Cursor, Figma, Slack, Spotify, ...) are intentionally NOT
 * bundled — users add those at runtime via the "Search by brand or
 * domain" input (which hits Simple Icons / geticon.dev) or by uploading
 * a custom icon. Keeps the bundle small and avoids any brand-policy
 * minefield.
 *
 * Usage:
 *   node scripts/fetch-bundled-icons.mjs
 */

import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const OUT_DIR = path.join(ROOT, "public", "icons");

// =====================================================================
// CATALOG (macOS-native apps only)
// =====================================================================

const SYSTEM_APPS = [
  {
    id: "finder",
    name: "Finder",
    tags: ["macos", "system"],
    svg: `
<defs>
  <linearGradient id="finderBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7AB6FF"/>
    <stop offset="1" stop-color="#1E73E8"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#finderBg)"/>
<rect x="30" y="20" width="10" height="60" rx="3" fill="#fff"/>
<rect x="60" y="20" width="10" height="60" rx="3" fill="#fff"/>
<path d="M30 60 Q50 80 70 60" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: "safari",
    name: "Safari",
    tags: ["macos", "browser", "system"],
    svg: `
<defs>
  <radialGradient id="safariBg" cx="50%" cy="50%" r="60%">
    <stop offset="0" stop-color="#F3F8FE"/>
    <stop offset="1" stop-color="#B6C9DC"/>
  </radialGradient>
</defs>
<circle cx="50" cy="50" r="46" fill="url(#safariBg)"/>
<circle cx="50" cy="50" r="46" fill="none" stroke="#5b6b80" stroke-width="2"/>
<circle cx="50" cy="50" r="36" fill="#0E84F6"/>
<polygon points="50,20 55,46 50,55 45,46" fill="#fff"/>
<polygon points="50,80 45,54 50,45 55,54" fill="#E5343E"/>`,
  },
  {
    id: "mail",
    name: "Mail",
    tags: ["macos", "email", "system"],
    svg: `
<defs>
  <linearGradient id="mailBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#71D2FF"/>
    <stop offset="1" stop-color="#2D8EE0"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#mailBg)"/>
<rect x="18" y="30" width="64" height="40" rx="6" fill="#fff"/>
<polyline points="22,34 50,56 78,34" fill="none" stroke="#2D8EE0" stroke-width="3.5" stroke-linejoin="round"/>`,
  },
  {
    id: "messages",
    name: "Messages",
    tags: ["macos", "chat", "system"],
    svg: `
<defs>
  <linearGradient id="msgBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5BF66E"/>
    <stop offset="1" stop-color="#11C03E"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#msgBg)"/>
<path d="M50 22 C30 22 18 34 18 48 C18 56 22 63 30 68 L26 84 L44 74 C46 74 48 74 50 74 C70 74 82 62 82 48 C82 34 70 22 50 22 Z" fill="#fff"/>`,
  },
  {
    id: "maps",
    name: "Maps",
    tags: ["macos", "navigation", "system"],
    svg: `
<defs>
  <linearGradient id="mapsBg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#cfe2c2"/>
    <stop offset="1" stop-color="#a3c98c"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#mapsBg)"/>
<path d="M10 70 L40 30 L70 70 L90 50 L90 90 L10 90 Z" fill="#7eb37a"/>
<path d="M0 70 L100 50" stroke="#fff" stroke-width="4" stroke-dasharray="6 6"/>
<circle cx="62" cy="38" r="12" fill="#EA4335"/>
<circle cx="62" cy="36" r="4" fill="#fff"/>`,
  },
  {
    id: "facetime",
    name: "FaceTime",
    tags: ["macos", "video", "system"],
    svg: `
<defs>
  <linearGradient id="ftBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5BF66E"/>
    <stop offset="1" stop-color="#11C03E"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#ftBg)"/>
<rect x="20" y="30" width="48" height="40" rx="8" fill="#fff"/>
<polygon points="68,42 86,30 86,70 68,58" fill="#fff"/>`,
  },
  {
    id: "photos",
    name: "Photos",
    tags: ["macos", "photo", "system"],
    svg: `
<rect width="100" height="100" rx="22" fill="#fff"/>
<g transform="translate(50 50)">
  <circle r="14" fill="#F1C232"/>
  <circle r="14" cx="0" cy="-22" fill="#FFB1B1"/>
  <circle r="14" cx="0" cy="22" fill="#5DB75D"/>
  <circle r="14" cx="-22" cy="0" fill="#E45353"/>
  <circle r="14" cx="22" cy="0" fill="#7CB5E8"/>
  <circle r="14" cx="-16" cy="-16" fill="#F58F4E"/>
  <circle r="14" cx="16" cy="-16" fill="#E263A5"/>
  <circle r="14" cx="-16" cy="16" fill="#5DC0A2"/>
  <circle r="14" cx="16" cy="16" fill="#A78BE5"/>
</g>`,
  },
  {
    id: "music",
    name: "Music",
    tags: ["macos", "music", "system"],
    svg: `
<defs>
  <linearGradient id="musicBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FF65A9"/>
    <stop offset="1" stop-color="#FA2452"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#musicBg)"/>
<path d="M40 28 L72 22 L72 60 Q72 70 62 70 Q52 70 52 62 Q52 54 62 54 Q66 54 68 56 L68 36 L44 41 L44 64 Q44 74 34 74 Q24 74 24 66 Q24 58 34 58 Q38 58 40 60 Z" fill="#fff"/>`,
  },
  {
    id: "appstore",
    name: "App Store",
    tags: ["macos", "system"],
    svg: `
<defs>
  <linearGradient id="asBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#67D1FF"/>
    <stop offset="1" stop-color="#1675F1"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#asBg)"/>
<path d="M50 22 L40 42 L60 42 Z" fill="#fff"/>
<rect x="25" y="48" width="50" height="6" rx="3" fill="#fff"/>
<text x="50" y="78" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#fff" text-anchor="middle">A</text>`,
  },
  {
    id: "calendar",
    name: "Calendar",
    tags: ["macos", "system", "productivity"],
    svg: `
<rect width="100" height="100" rx="22" fill="#fff"/>
<rect width="100" height="28" rx="22" fill="#E5343E"/>
<rect width="100" height="14" y="14" fill="#E5343E"/>
<text x="50" y="22" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">FRI</text>
<text x="50" y="78" font-family="Arial, sans-serif" font-size="50" font-weight="700" fill="#333" text-anchor="middle">17</text>`,
  },
  {
    id: "notes",
    name: "Notes",
    tags: ["macos", "system", "productivity"],
    svg: `
<rect width="100" height="100" rx="22" fill="#fff8d6"/>
<rect width="100" height="22" rx="22" fill="#f4d57a"/>
<rect width="100" height="11" y="11" fill="#f4d57a"/>
<line x1="20" y1="40" x2="80" y2="40" stroke="#dcc06a" stroke-width="2"/>
<line x1="20" y1="55" x2="80" y2="55" stroke="#dcc06a" stroke-width="2"/>
<line x1="20" y1="70" x2="65" y2="70" stroke="#dcc06a" stroke-width="2"/>`,
  },
  {
    id: "reminders",
    name: "Reminders",
    tags: ["macos", "system", "productivity"],
    svg: `
<rect width="100" height="100" rx="22" fill="#fff"/>
<circle cx="28" cy="32" r="6" fill="none" stroke="#FF595E" stroke-width="3"/>
<circle cx="28" cy="52" r="6" fill="none" stroke="#FF595E" stroke-width="3"/>
<circle cx="28" cy="72" r="6" fill="none" stroke="#FF595E" stroke-width="3"/>
<line x1="40" y1="32" x2="80" y2="32" stroke="#555" stroke-width="3"/>
<line x1="40" y1="52" x2="80" y2="52" stroke="#555" stroke-width="3"/>
<line x1="40" y1="72" x2="80" y2="72" stroke="#555" stroke-width="3"/>`,
  },
  {
    id: "settings",
    name: "System Settings",
    tags: ["macos", "system"],
    svg: `
<defs>
  <linearGradient id="setBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9aa3ad"/>
    <stop offset="1" stop-color="#4a525c"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#setBg)"/>
<circle cx="50" cy="50" r="16" fill="none" stroke="#fff" stroke-width="3.5"/>
<g stroke="#fff" stroke-width="6" stroke-linecap="round">
  <line x1="50" y1="20" x2="50" y2="30"/>
  <line x1="50" y1="70" x2="50" y2="80"/>
  <line x1="20" y1="50" x2="30" y2="50"/>
  <line x1="70" y1="50" x2="80" y2="50"/>
  <line x1="28" y1="28" x2="35" y2="35"/>
  <line x1="65" y1="65" x2="72" y2="72"/>
  <line x1="72" y1="28" x2="65" y2="35"/>
  <line x1="35" y1="65" x2="28" y2="72"/>
</g>`,
  },
  {
    id: "xcode",
    name: "Xcode",
    tags: ["macos", "code", "apple"],
    svg: `
<defs>
  <linearGradient id="xcBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4faaff"/>
    <stop offset="1" stop-color="#0066d6"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#xcBg)"/>
<path d="M30 70 L50 30 L70 70" stroke="#fff" stroke-width="6" fill="none" stroke-linejoin="round"/>
<line x1="40" y1="56" x2="60" y2="56" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
  },
  {
    id: "terminal",
    name: "Terminal",
    tags: ["macos", "shell", "system"],
    svg: `
<rect width="100" height="100" rx="22" fill="#1d1d1d"/>
<rect x="14" y="22" width="72" height="56" rx="6" fill="#fff"/>
<text x="22" y="58" font-family="Menlo, Courier, monospace" font-size="22" fill="#1d1d1d">&gt;_</text>`,
  },
  {
    id: "launchpad",
    name: "Launchpad",
    tags: ["macos", "system"],
    svg: `
<defs>
  <linearGradient id="lpBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2c2c2e"/>
    <stop offset="1" stop-color="#1a1a1c"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#lpBg)"/>
<g fill="#fff">
  <rect x="28" y="28" width="10" height="10" rx="2"/>
  <rect x="45" y="28" width="10" height="10" rx="2"/>
  <rect x="62" y="28" width="10" height="10" rx="2"/>
  <rect x="28" y="45" width="10" height="10" rx="2"/>
  <rect x="45" y="45" width="10" height="10" rx="2"/>
  <rect x="62" y="45" width="10" height="10" rx="2"/>
  <rect x="28" y="62" width="10" height="10" rx="2"/>
  <rect x="45" y="62" width="10" height="10" rx="2"/>
  <rect x="62" y="62" width="10" height="10" rx="2"/>
</g>`,
  },
  {
    id: "preview",
    name: "Preview",
    tags: ["macos", "system"],
    svg: `
<defs>
  <linearGradient id="prevBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9eb6ff"/>
    <stop offset="1" stop-color="#4a6cc7"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#prevBg)"/>
<path d="M22 26 H60 L78 44 V74 H22 Z" fill="#fff"/>
<path d="M60 26 V44 H78" fill="none" stroke="#4a6cc7" stroke-width="2"/>
<circle cx="68" cy="60" r="9" fill="none" stroke="#4a6cc7" stroke-width="3"/>
<line x1="73" y1="65" x2="80" y2="72" stroke="#4a6cc7" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    id: "podcasts",
    name: "Podcasts",
    tags: ["macos", "audio", "system"],
    svg: `
<defs>
  <linearGradient id="podBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ce8efd"/>
    <stop offset="1" stop-color="#7a3bf5"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#podBg)"/>
<circle cx="50" cy="50" r="10" fill="#fff"/>
<path d="M28 64 a26 26 0 1 1 44 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
<path d="M36 62 a16 16 0 1 1 28 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
<rect x="40" y="60" width="20" height="22" rx="6" fill="#fff"/>`,
  },
  {
    id: "tv",
    name: "TV",
    tags: ["macos", "video", "system"],
    svg: `
<rect width="100" height="100" rx="22" fill="#000"/>
<text x="50" y="68" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="-1.5">tv</text>`,
  },
  {
    id: "stocks",
    name: "Stocks",
    tags: ["macos", "system"],
    svg: `
<rect width="100" height="100" rx="22" fill="#000"/>
<polyline points="18,72 36,56 50,62 64,42 82,32" fill="none" stroke="#7CFC72" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<polyline points="82,32 78,38 76,30" fill="none" stroke="#7CFC72" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "weather",
    name: "Weather",
    tags: ["macos", "system"],
    svg: `
<defs>
  <linearGradient id="wxBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5fb6ff"/>
    <stop offset="1" stop-color="#0e6bb3"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#wxBg)"/>
<circle cx="42" cy="48" r="14" fill="#FFD66B"/>
<path d="M30 64 q-8 0 -8 8 q0 8 10 8 h28 q12 0 12 -12 q0 -12 -14 -12 q-2 -10 -14 -10 q-12 0 -14 18 Z" fill="#fff"/>`,
  },
  {
    id: "news",
    name: "News",
    tags: ["macos", "system"],
    svg: `
<rect width="100" height="100" rx="22" fill="#fff"/>
<text x="50" y="68" font-family="Georgia, 'Times New Roman', serif" font-size="60" font-weight="800" fill="#FA2526" text-anchor="middle">N</text>`,
  },
  {
    id: "books",
    name: "Books",
    tags: ["macos", "system"],
    svg: `
<defs>
  <linearGradient id="booksBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffa948"/>
    <stop offset="1" stop-color="#d36016"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#booksBg)"/>
<g fill="#fff">
  <rect x="24" y="24" width="20" height="52" rx="3"/>
  <rect x="48" y="34" width="18" height="42" rx="3"/>
  <rect x="70" y="28" width="10" height="48" rx="2"/>
</g>`,
  },
  {
    id: "shortcuts",
    name: "Shortcuts",
    tags: ["macos", "system"],
    svg: `
<defs>
  <linearGradient id="shBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ff7eb7"/>
    <stop offset="1" stop-color="#5e4af5"/>
  </linearGradient>
</defs>
<rect width="100" height="100" rx="22" fill="url(#shBg)"/>
<g fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
  <rect x="22" y="28" width="22" height="22" rx="6"/>
  <rect x="56" y="28" width="22" height="22" rx="6"/>
  <rect x="22" y="56" width="22" height="22" rx="6"/>
  <rect x="56" y="56" width="22" height="22" rx="6"/>
</g>`,
  },
  {
    id: "contacts",
    name: "Contacts",
    tags: ["macos", "system"],
    svg: `
<rect width="100" height="100" rx="22" fill="#fff"/>
<rect x="18" y="24" width="64" height="52" rx="6" fill="#f4ddb1" stroke="#a08247" stroke-width="2"/>
<line x1="18" y1="40" x2="82" y2="40" stroke="#a08247" stroke-width="2"/>
<line x1="18" y1="60" x2="82" y2="60" stroke="#a08247" stroke-width="2"/>
<circle cx="50" cy="50" r="6" fill="#a08247"/>
<path d="M40 65 q10 -10 20 0" fill="none" stroke="#a08247" stroke-width="2.5"/>`,
  },
  {
    id: "calculator",
    name: "Calculator",
    tags: ["macos", "system"],
    svg: `
<rect width="100" height="100" rx="22" fill="#1d1d1d"/>
<rect x="20" y="20" width="60" height="14" rx="3" fill="#3a3a3c"/>
<g fill="#5a5a5c">
  <rect x="20" y="40" width="14" height="12" rx="3"/>
  <rect x="38" y="40" width="14" height="12" rx="3"/>
  <rect x="56" y="40" width="14" height="12" rx="3"/>
  <rect x="20" y="56" width="14" height="12" rx="3"/>
  <rect x="38" y="56" width="14" height="12" rx="3"/>
  <rect x="56" y="56" width="14" height="12" rx="3"/>
  <rect x="20" y="72" width="14" height="12" rx="3"/>
  <rect x="38" y="72" width="14" height="12" rx="3"/>
  <rect x="56" y="72" width="14" height="12" rx="3"/>
</g>
<rect x="74" y="40" width="6" height="44" rx="3" fill="#ff9f0a"/>`,
  },
  {
    id: "trash",
    name: "Trash",
    tags: ["macos", "system"],
    svg: `
<rect width="100" height="100" rx="22" fill="#e8edf2"/>
<path d="M30 32 H70 V72 Q70 80 62 80 H38 Q30 80 30 72 Z" fill="#fff" stroke="#7d8590" stroke-width="2.5"/>
<rect x="26" y="26" width="48" height="8" rx="2.5" fill="#fff" stroke="#7d8590" stroke-width="2.5"/>
<rect x="44" y="20" width="12" height="6" rx="2" fill="#fff" stroke="#7d8590" stroke-width="2.5"/>
<line x1="42" y1="42" x2="42" y2="72" stroke="#7d8590" stroke-width="2.5"/>
<line x1="50" y1="42" x2="50" y2="72" stroke="#7d8590" stroke-width="2.5"/>
<line x1="58" y1="42" x2="58" y2="72" stroke="#7d8590" stroke-width="2.5"/>`,
  },
];

// =====================================================================
// HELPERS
// =====================================================================

function makeSvg(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${body}
</svg>`;
}

// =====================================================================
// MAIN
// =====================================================================

async function main() {
  // Recreate output directory (keeps things deterministic).
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = [];
  for (const app of SYSTEM_APPS) {
    const file = `${app.id}.svg`;
    await writeFile(path.join(OUT_DIR, file), makeSvg(app.svg), "utf8");
    manifest.push({ id: app.id, name: app.name, file, tags: app.tags });
    console.log(`  system ${app.id.padEnd(14)} ok`);
  }

  manifest.sort((a, b) => a.name.localeCompare(b.name));

  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), icons: manifest },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\nDone. ${manifest.length} system icons written.`);
  console.log(`Manifest: ${path.relative(ROOT, path.join(OUT_DIR, "manifest.json"))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
