"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { WallpaperStageHandle } from "@/components/dock/WallpaperStage";
import { downloadBlob, exportStageAsPng } from "@/lib/export";
import { useDockStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  stageRef: React.RefObject<WallpaperStageHandle | null>;
};

export function ExportButton({ stageRef }: Props) {
  const format = useDockStore((s) => s.exportFormat);
  const setSelectedItemId = useDockStore((s) => s.setSelectedItemId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onExport = async () => {
    const node = stageRef.current?.getStageNode();
    if (!node) {
      setError("Stage is not ready yet.");
      return;
    }
    // Close any open popover and clear the selection ring so the capture
    // only contains the dock + wallpaper.
    setSelectedItemId(null);
    setLoading(true);
    setError(null);
    try {
      // Wait one frame so React commits the closed-popover state before
      // html-to-image walks the DOM.
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const { blob, filename } = await exportStageAsPng(node, format);
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("[export] failed", err);
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onExport}
        disabled={loading}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-black/30 transition-colors",
          "hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        Export PNG
      </button>
      {error && (
        <p className="text-xs text-red-300/85" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
