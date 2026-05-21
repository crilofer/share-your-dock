"use client";

import { RotateCcw, Trash2, SeparatorVertical } from "lucide-react";
import { useDockStore } from "@/lib/store";
import type { DockSize, DockTheme, ExportFormat } from "@/types/dock";
import { cn } from "@/lib/utils";
import { WallpaperSelect } from "./WallpaperSelect";

const SIZE_LABELS: { id: DockSize; label: string }[] = [
  { id: "sm", label: "Small" },
  { id: "md", label: "Medium" },
  { id: "lg", label: "Large" },
];

const THEME_LABELS: { id: DockTheme; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "glass", label: "Glass" },
];

const FORMAT_LABELS: { id: ExportFormat; label: string; meta: string }[] = [
  { id: "wide-16-9", label: "Wide", meta: "1920 × 1080" },
  { id: "square-1-1", label: "Square", meta: "1080 × 1080" },
  { id: "strip", label: "Strip", meta: "1600 × 360" },
  { id: "transparent", label: "Bare", meta: "Dock only" },
];

export function ControlPanel() {
  const size = useDockStore((s) => s.size);
  const setSize = useDockStore((s) => s.setSize);
  const theme = useDockStore((s) => s.theme);
  const setTheme = useDockStore((s) => s.setTheme);
  const magnificationEnabled = useDockStore((s) => s.magnificationEnabled);
  const setMagnificationEnabled = useDockStore(
    (s) => s.setMagnificationEnabled,
  );
  const magnificationMax = useDockStore((s) => s.magnificationMax);
  const setMagnificationMax = useDockStore((s) => s.setMagnificationMax);
  const showIndicators = useDockStore((s) => s.showIndicators);
  const setShowIndicators = useDockStore((s) => s.setShowIndicators);
  const exportFormat = useDockStore((s) => s.exportFormat);
  const setExportFormat = useDockStore((s) => s.setExportFormat);
  const addSeparator = useDockStore((s) => s.addSeparator);
  const clearDock = useDockStore((s) => s.clearDock);
  const loadDefaultDock = useDockStore((s) => s.loadDefaultDock);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/60">
          Dock layout
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] text-white/55">Icon size</label>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1">
            {SIZE_LABELS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSize(s.id)}
                aria-pressed={size === s.id}
                className={cn(
                  "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  size === s.id
                    ? "bg-white text-slate-900"
                    : "text-white/70 hover:bg-white/10",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] text-white/55">Dock style</label>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1">
            {THEME_LABELS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                aria-pressed={theme === t.id}
                className={cn(
                  "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  theme === t.id
                    ? "bg-white text-slate-900"
                    : "text-white/70 hover:bg-white/10",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ToggleRow
          label="Magnification"
          checked={magnificationEnabled}
          onChange={setMagnificationEnabled}
        />

        {magnificationEnabled && (
          <div className="space-y-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <div className="flex items-center justify-between text-[11px] text-white/55">
              <span>Intensity</span>
              <span className="tabular-nums text-white/70">
                {magnificationMax.toFixed(2)}×
              </span>
            </div>
            <input
              type="range"
              min={1.1}
              max={2.5}
              step={0.05}
              value={magnificationMax}
              onChange={(e) =>
                setMagnificationMax(parseFloat(e.target.value))
              }
              aria-label="Magnification intensity"
              className="w-full accent-white"
            />
          </div>
        )}

        <ToggleRow
          label="Show running indicators"
          checked={showIndicators}
          onChange={setShowIndicators}
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={addSeparator}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 hover:bg-white/10"
          >
            <SeparatorVertical className="size-3.5" />
            Add separator
          </button>
          <button
            type="button"
            onClick={loadDefaultDock}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 hover:bg-white/10"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={clearDock}
            aria-label="Clear all items"
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/20"
          >
            <Trash2 className="size-3.5" />
            Clear dock
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/60">
          Export format
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {FORMAT_LABELS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setExportFormat(f.id)}
              aria-pressed={exportFormat === f.id}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors",
                exportFormat === f.id
                  ? "border-white/70 bg-white/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]",
              )}
            >
              <span className="font-medium">{f.label}</span>
              <span className="tabular-nums text-[10px] text-white/45">
                {f.meta}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <WallpaperSelect />
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-white/80 hover:bg-white/[0.06]">
      <span className="font-medium">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors",
          checked
            ? "border-white/40 bg-white/80"
            : "border-white/15 bg-white/10",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
          className="peer sr-only"
        />
        <span
          className={cn(
            "absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-slate-900 transition-transform",
            checked ? "left-[18px]" : "left-[2px]",
          )}
          aria-hidden
        />
      </span>
    </label>
  );
}
