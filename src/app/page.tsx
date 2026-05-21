"use client";

import { useEffect, useRef, useState } from "react";
import { Info, PanelLeft, X as CloseIcon } from "lucide-react";
import {
  WallpaperStage,
  type WallpaperStageHandle,
} from "@/components/dock/WallpaperStage";
import { IconPicker } from "@/components/panel/IconPicker";
import { ControlPanel } from "@/components/panel/ControlPanel";
import { ExportButton } from "@/components/panel/ExportButton";
import { BrandMark } from "@/components/BrandMark";
import { useDockStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/crilofer/share-your-dock";
const X_URL = "https://x.com/crilofer";

/**
 * Brand glyphs are inlined here on purpose: `lucide-react` ships a Twitter
 * bird (deprecated) and dropped the GitHub octocat for licensing reasons,
 * so importing them would be either off-brand or impossible. These two
 * paths come from the official brand assets.
 */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-1.94c-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

/** Official X (formerly Twitter) glyph. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const MOBILE_NOTICE_STORAGE_KEY = "syd:mobile-notice-dismissed";

/**
 * Soft, dismissable notice shown only on < lg viewports. The drawer lets
 * touch users navigate and even export, but hover-driven magnification
 * and smooth drag-and-drop really do need a mouse — we set that
 * expectation up front instead of letting them discover it after a few
 * failed attempts. Dismissal is persisted so we don't nag returning users.
 */
function MobileExperienceNotice() {
  // We start hidden to keep SSR output stable, then decide on the client
  // once we can read localStorage.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(MOBILE_NOTICE_STORAGE_KEY) === "1";
    } catch {
      // Private mode / disabled storage — treat as "not dismissed".
    }
    // `setState` in an effect is intentional here: `localStorage` is not
    // available during SSR, so we must do the visibility decision after
    // hydration. A lazy `useState` initializer would create a hydration
    // mismatch (server renders nothing, client renders the banner).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(MOBILE_NOTICE_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-start gap-3 border-b border-amber-400/15 bg-amber-400/10 px-4 py-2.5 text-[12px] leading-snug text-amber-100/90 sm:px-6 lg:hidden">
      <Info className="mt-0.5 size-4 shrink-0 text-amber-200/85" aria-hidden />
      <p className="text-pretty">
        Some interactions need a mouse — hover magnification and smooth
        drag-and-drop work best on a desktop or laptop. You can still build
        and export a dock from here.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notice"
        className="-mr-1 ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-amber-100/70 transition-colors hover:bg-white/[0.08] hover:text-amber-50"
      >
        <CloseIcon className="size-3.5" />
      </button>
    </div>
  );
}

export default function HomePage() {
  const stageRef = useRef<WallpaperStageHandle>(null);
  const itemCount = useDockStore(
    (s) => s.items.filter((it) => it.kind === "app").length,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer on ESC. Standard dialog convention; keeps power users
  // from having to reach for the mouse just to dismiss the panel.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Lock body scroll while the drawer is open so background content
  // (the dock stage) doesn't drift under the user's finger.
  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);

  // Auto-close the drawer when the viewport crosses the `lg` breakpoint:
  // above lg the sidebar is static, so an "open" state would be meaningless
  // and would re-trigger the body-scroll lock the next time we resize down.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setDrawerOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <main className="grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[360px_1fr]">
      <header className="relative flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-3 backdrop-blur sm:px-6 lg:col-span-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open dock controls"
            aria-expanded={drawerOpen}
            aria-controls="dock-controls-drawer"
            className="inline-flex size-9 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"
          >
            <PanelLeft className="size-[18px]" />
          </button>
          <BrandMark className="size-7" />
          <div>
            <h1 className="text-balance text-sm font-semibold text-white">
              Share Your Dock
            </h1>
            <p className="hidden text-pretty text-[11px] text-white/45 sm:block">
              Build a fictional dock & share it anywhere.
            </p>
          </div>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 sm:flex">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            title="View source on GitHub"
            className="pointer-events-auto inline-flex size-7 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/85"
          >
            <GithubIcon className="size-[15px]" />
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow @crilofer on X"
            title="Follow @crilofer on X"
            className="pointer-events-auto inline-flex size-7 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/85"
          >
            <XIcon className="size-[13px]" />
          </a>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/55 tabular-nums">
          <span aria-live="polite" className="hidden sm:inline">
            {itemCount} apps in your dock
          </span>
          <span aria-live="polite" className="sm:hidden">
            {itemCount} apps
          </span>
        </div>
      </header>

      {/* Backdrop for the mobile drawer. We use a button (not a div) so the
          dismiss interaction is reachable by keyboard users who somehow
          land focus on it. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-30 bg-black/60 transition-opacity duration-200 lg:hidden",
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        id="dock-controls-drawer"
        role={drawerOpen ? "dialog" : undefined}
        aria-modal={drawerOpen ? true : undefined}
        aria-label="Dock controls"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(360px,85vw)] flex-col gap-6 overflow-y-auto border-r border-white/5 bg-[#0a0d16] px-5 py-6 shadow-2xl shadow-black/50 transition-transform duration-300",
          "lg:static lg:row-start-2 lg:w-auto lg:shadow-none lg:transition-none",
          drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close dock controls"
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
        >
          <CloseIcon className="size-4" />
        </button>

        <IconPicker />

        <div className="h-px shrink-0 bg-white/5" />

        <ControlPanel />

        <div className="h-px shrink-0 bg-white/5" />

        <ExportButton stageRef={stageRef} />
      </aside>

      <section className="row-start-2 relative flex min-h-0 flex-col lg:col-start-2">
        <MobileExperienceNotice />
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#06070b] p-4 sm:p-8">
          {/* checkerboard for transparent format */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #1a1d27 25%, transparent 25%), linear-gradient(-45deg, #1a1d27 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1d27 75%), linear-gradient(-45deg, transparent 75%, #1a1d27 75%)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
            }}
          />
          <WallpaperStage ref={stageRef} className="relative z-10" />
        </div>
        <footer className="border-t border-white/5 bg-black/40 px-4 py-2.5 text-xs text-white/50 text-pretty sm:px-6">
          Drag icons to reorder · hover for label · click ✕ to remove · use
          the left panel to add apps, change wallpapers, and export.
        </footer>
      </section>
    </main>
  );
}
