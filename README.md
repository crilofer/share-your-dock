# share-your-dock

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcrilofer%2Fshare-your-dock)

Build a fictional dock with the apps you wish you had, then export a clean
PNG to share anywhere. No installs, no accounts, no backend — everything
runs in the browser.

> Inspired by every "show me your dock" thread on the internet. Now you
> can assemble the dock you _wish_ you had.

## What it does

- Drag-and-drop dock editor with macOS-style magnification on hover.
- Three sizes (Small / Medium / Large) and a magnification intensity slider.
- Three dock styles: **Dark** (default), **Light**, **Glass**.
- 27 system-app look-alikes pre-bundled (Finder, Safari, Mail, Trash, …)
  stylized as squircle icons. They are not the official Apple assets — for
  pixel-accurate icons download them from
  [macosicons.com](https://macosicons.com) and upload them.
- Search-by-brand-or-domain that fetches everything else live from
  [Simple Icons](https://cdn.simpleicons.org) and
  [geticon.dev](https://geticon.dev) (free, no API key, no rate limit).
- Upload your own PNG / SVG / JPG icons for anything not found online.
- 4 procedurally-generated wallpapers (Aurora, Bloom, Lake, Ember) plus
  custom wallpaper upload (grab any you like from
  [wallpaperhub.app](https://wallpaperhub.app)).
- Per-icon controls (click an icon → popover): rename, toggle running
  indicator, **pin magnify** (locks a zoomed pose for the export), remove.
- Section separators that you can drop anywhere in the dock — no limit.
- Export to PNG in four formats:
  - **Wide** — 1920×1080 with wallpaper (full screenshot vibe).
  - **Square** — 1080×1080 with wallpaper.
  - **Strip** — 1600×360 banner: dock plus a thin border of wallpaper.
  - **Bare** — 1280×360 transparent background, dock only.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [dnd-kit](https://dndkit.com) for sortable drag-and-drop
- [Zustand](https://github.com/pmndrs/zustand) for client state
- [html-to-image](https://github.com/bubkoo/html-to-image) for PNG export
- [lucide-react](https://lucide.dev) for UI icons

## Run it

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

Production build:

```bash
pnpm build
pnpm start
```

## Repo layout

```
share-your-dock/
├── public/
│   ├── icons/           # 80+ bundled SVGs + manifest.json
│   └── wallpapers/      # procedurally generated SVG wallpapers
├── scripts/
│   ├── fetch-bundled-icons.mjs    # regenerates public/icons/
│   └── generate-wallpapers.mjs    # regenerates public/wallpapers/
└── src/
    ├── app/             # Next.js App Router (layout + page)
    ├── components/
    │   ├── dock/        # WallpaperStage, DockPreview, DockItem, DockSeparator
    │   └── panel/       # IconPicker, ControlPanel, WallpaperSelect, ExportButton
    ├── lib/             # store, icons, wallpapers, magnification, export, utils
    └── types/           # dock-related TS types
```

## Adding more icons to the bundled catalog

The bundled catalog is intentionally limited to **system app look-alikes**
(Finder, Safari, Mail, Trash, …). Brand apps (Cursor, Figma, Slack, …) are
added by end users at runtime through the **Search by brand or domain**
input or by uploading their own image — that keeps the repo light and
avoids any brand-policy minefield.

To add a new system icon:

1. Append an entry to `SYSTEM_APPS` in
   [`scripts/fetch-bundled-icons.mjs`](scripts/fetch-bundled-icons.mjs).
   Each entry needs an inline SVG body (no `<svg>` wrapper — the script
   adds one with `viewBox="0 0 100 100"`).
2. Regenerate the catalog:

   ```bash
   pnpm fetch-icons
   ```

3. Commit the updated `public/icons/` and `public/icons/manifest.json`.

## How export works

The `WallpaperStage` is rendered at its true target resolution
(1920×1080 / 1080×1080 / 1280×360 for the transparent format) and scaled
down via a CSS `transform` only for the editor preview. On export, the
stage element is fed straight into `html-to-image` with
`pixelRatio: 2`, which captures the underlying DOM at native size and
ignores the editor's preview transform. The resulting PNG is downloaded
client-side via a temporary `<a download>` — no upload, no server.

## Roadmap

- Windows 11 taskbar skin (centered + start button)
- Ubuntu GNOME dock skin (left-aligned + activity indicator)
- KDE Plasma panel skin
- Optional top menu bar with fake clock, Wi-Fi, battery and Spotlight
- Shareable URL state (encoded in `?d=…` query param)
- Public gallery / "show off" feed (needs a backend; out of MVP scope)
- macOSicons.com API integration for users with their own API key

## License

[MIT](LICENSE) © 2026 [crilofer](https://github.com/crilofer). The bundled
system-app glyphs in `public/icons/` are stylized look-alikes produced for
this project, not Apple's official artwork.
