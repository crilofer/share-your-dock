#!/usr/bin/env node
/**
 * Generates the bundled wallpaper SVGs into public/wallpapers/.
 *
 * They are gradient/shape compositions inspired by recent macOS releases
 * (Sonoma, Sequoia, Tahoe, Ventura) but generated from scratch — no Apple
 * asset is redistributed. SVG keeps the bundle tiny and crisp at any size.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const OUT_DIR = path.join(ROOT, "public", "wallpapers");

const W = 1920;
const H = 1200;

const WALLPAPERS = [
  {
    id: "aurora",
    label: "Aurora",
    body: `
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0c1a3a"/>
    <stop offset="0.5" stop-color="#3a1e72"/>
    <stop offset="1" stop-color="#7b2a8c"/>
  </linearGradient>
  <radialGradient id="glow" cx="40%" cy="35%" r="50%">
    <stop offset="0" stop-color="#ff9ad2" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#ff9ad2" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow2" cx="80%" cy="65%" r="55%">
    <stop offset="0" stop-color="#3affd5" stop-opacity="0.35"/>
    <stop offset="1" stop-color="#3affd5" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<rect width="${W}" height="${H}" fill="url(#glow2)"/>
<path d="M0 ${H * 0.7} C ${W * 0.25} ${H * 0.55}, ${W * 0.55} ${H * 0.85}, ${W} ${H * 0.65} L ${W} ${H} L 0 ${H} Z"
      fill="#10082b" opacity="0.45"/>`,
  },
  {
    id: "bloom",
    label: "Bloom",
    body: `
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#102b5c"/>
    <stop offset="0.6" stop-color="#5f3aa6"/>
    <stop offset="1" stop-color="#d04a8c"/>
  </linearGradient>
  <radialGradient id="ring" cx="50%" cy="50%" r="60%">
    <stop offset="0.2" stop-color="#ffd9f1" stop-opacity="0.0"/>
    <stop offset="0.45" stop-color="#ffd9f1" stop-opacity="0.6"/>
    <stop offset="0.5" stop-color="#ffd9f1" stop-opacity="0.0"/>
  </radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<ellipse cx="${W * 0.55}" cy="${H * 0.55}" rx="${W * 0.45}" ry="${H * 0.45}" fill="url(#ring)"/>
<path d="M0 ${H * 0.78} Q ${W * 0.5} ${H * 0.6}, ${W} ${H * 0.78} L ${W} ${H} L 0 ${H} Z" fill="#0b1a4a" opacity="0.35"/>`,
  },
  {
    id: "lake",
    label: "Lake",
    body: `
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0a2a4a"/>
    <stop offset="0.55" stop-color="#0e6bb3"/>
    <stop offset="1" stop-color="#65d9ff"/>
  </linearGradient>
  <radialGradient id="sun" cx="75%" cy="20%" r="25%">
    <stop offset="0" stop-color="#fff" stop-opacity="0.85"/>
    <stop offset="0.6" stop-color="#fff" stop-opacity="0.1"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#sun)"/>
<path d="M0 ${H * 0.78} C ${W * 0.25} ${H * 0.68}, ${W * 0.6} ${H * 0.9}, ${W} ${H * 0.75} L ${W} ${H} L 0 ${H} Z" fill="#072036" opacity="0.45"/>
<path d="M0 ${H * 0.84} C ${W * 0.3} ${H * 0.78}, ${W * 0.65} ${H * 0.95}, ${W} ${H * 0.82} L ${W} ${H} L 0 ${H} Z" fill="#062b48" opacity="0.6"/>`,
  },
  {
    id: "ember",
    label: "Ember",
    body: `
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#311a3f"/>
    <stop offset="0.55" stop-color="#a02250"/>
    <stop offset="1" stop-color="#f55c46"/>
  </linearGradient>
  <radialGradient id="bloom" cx="30%" cy="40%" r="55%">
    <stop offset="0" stop-color="#ffd0a8" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#ffd0a8" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#bloom)"/>
<path d="M0 ${H * 0.5} Q ${W * 0.5} ${H * 0.7}, ${W} ${H * 0.45} L ${W} ${H * 0.6} Q ${W * 0.5} ${H * 0.4}, 0 ${H * 0.65} Z"
      fill="#fff" opacity="0.12"/>`,
  },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const wp of WALLPAPERS) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">${wp.body}
</svg>`;
    await writeFile(path.join(OUT_DIR, `${wp.id}.svg`), svg, "utf8");
    console.log(`  wallpaper ${wp.id} (${wp.label}) ok`);
  }
  console.log(`\nDone. ${WALLPAPERS.length} wallpapers written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
