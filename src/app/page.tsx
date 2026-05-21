"use client";

import { useRef } from "react";
import {
  WallpaperStage,
  type WallpaperStageHandle,
} from "@/components/dock/WallpaperStage";
import { IconPicker } from "@/components/panel/IconPicker";
import { ControlPanel } from "@/components/panel/ControlPanel";
import { ExportButton } from "@/components/panel/ExportButton";
import { BrandMark } from "@/components/BrandMark";
import { useDockStore } from "@/lib/store";

export default function HomePage() {
  const stageRef = useRef<WallpaperStageHandle>(null);
  const itemCount = useDockStore(
    (s) => s.items.filter((it) => it.kind === "app").length,
  );

  return (
    <main className="grid min-h-dvh grid-cols-[360px_1fr] grid-rows-[auto_1fr]">
      <header className="col-span-2 flex items-center justify-between border-b border-white/5 bg-black/40 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <BrandMark className="size-7" />
          <div>
            <h1 className="text-balance text-sm font-semibold text-white">
              Share Your Dock
            </h1>
            <p className="text-pretty text-[11px] text-white/45">
              Build a fictional dock & share it anywhere.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/55 tabular-nums">
          <span aria-live="polite">{itemCount} apps in your dock</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-white/45 underline-offset-2 hover:text-white/70 hover:underline sm:inline"
          >
            Source
          </a>
        </div>
      </header>

      <aside className="row-start-2 flex flex-col gap-6 overflow-y-auto border-r border-white/5 bg-[#0a0d16] px-5 py-6">
        <IconPicker />

        <div className="h-px shrink-0 bg-white/5" />

        <ControlPanel />

        <div className="h-px shrink-0 bg-white/5" />

        <ExportButton stageRef={stageRef} />
      </aside>

      <section className="row-start-2 relative flex min-h-0 flex-col">
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#06070b] p-8">
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
        <footer className="border-t border-white/5 bg-black/40 px-6 py-2.5 text-xs text-white/50 text-pretty">
          Drag icons to reorder · hover for label · click ✕ to remove · use the
          left panel to add apps, change wallpapers, and export.
        </footer>
      </section>
    </main>
  );
}
