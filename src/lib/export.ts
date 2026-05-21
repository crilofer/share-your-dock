"use client";

import { toPng } from "html-to-image";
import type { ExportFormat } from "@/types/dock";
import { STAGE_DIMENSIONS } from "@/components/dock/WallpaperStage";

export type ExportResult = {
  blob: Blob;
  filename: string;
};

/**
 * Captures the dock stage as a PNG at its native pixel size, ignoring
 * any CSS transforms applied for the preview-fit.
 */
export async function exportStageAsPng(
  stageNode: HTMLElement,
  format: ExportFormat,
): Promise<ExportResult> {
  const dims = STAGE_DIMENSIONS[format];

  // html-to-image cannot reliably reproduce `backdrop-filter`/`backdrop-blur`.
  // When the tree contains backdrop-blurred surfaces (the dock track, the
  // pinned app-name label) the resulting PNG can show stray "ghost"
  // rounded rectangles in random spots — caused by the blurred halo being
  // re-rasterized at incorrect coordinates. As a defensive measure we
  // temporarily disable backdrop-filter on the live tree (and bump the
  // affected background opacity so the result still looks frosted) for the
  // duration of the capture, then restore everything.
  const restore = neutralizeBackdropFilters(stageNode);
  let dataUrl: string;
  try {
    dataUrl = await toPng(stageNode, {
      width: dims.width,
      height: dims.height,
      canvasWidth: dims.width,
      canvasHeight: dims.height,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: format === "transparent" ? undefined : "#000000",
      skipFonts: false,
      style: {
        transform: "none",
      },
      // Skip any UI chrome that shouldn't appear in the screenshot, e.g.
      // an open popover or a hover-only tooltip.
      filter: (node) => {
        if (!(node instanceof HTMLElement)) return true;
        if (node.dataset.dockPopover !== undefined) return false;
        if (node.dataset.exportHide !== undefined) return false;
        return true;
      },
    });
  } finally {
    restore();
  }

  const blob = await dataUrlToBlob(dataUrl);
  const timestamp = new Date()
    .toISOString()
    .replace(/[:T]/g, "-")
    .replace(/\..+$/, "");
  const suffix =
    format === "wide-16-9"
      ? "16x9"
      : format === "square-1-1"
        ? "1x1"
        : format === "strip"
          ? "strip"
          : "bare";
  return { blob, filename: `my-dock_${suffix}_${timestamp}.png` };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

type CssRecord = {
  el: HTMLElement;
  backdropFilter: string;
  webkitBackdropFilter: string;
  backgroundColor: string;
};

/**
 * Walks the subtree and, on every element with a non-`none` computed
 * `backdrop-filter`, overrides it with `none` while bumping the alpha
 * channel of its background so the surface still reads as translucent.
 * Returns a cleanup function that restores the original inline styles.
 */
function neutralizeBackdropFilters(root: HTMLElement): () => void {
  const records: CssRecord[] = [];
  const visit = (el: HTMLElement) => {
    const cs = window.getComputedStyle(el);
    const bf = cs.backdropFilter;
    const wbf =
      (cs as CSSStyleDeclaration & { webkitBackdropFilter?: string })
        .webkitBackdropFilter ?? "none";
    if (bf !== "none" || wbf !== "none") {
      records.push({
        el,
        backdropFilter: el.style.backdropFilter,
        webkitBackdropFilter:
          (el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string })
            .webkitBackdropFilter ?? "",
        backgroundColor: el.style.backgroundColor,
      });
      el.style.backdropFilter = "none";
      (
        el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }
      ).webkitBackdropFilter = "none";
      const bumped = bumpAlpha(cs.backgroundColor);
      if (bumped) el.style.backgroundColor = bumped;
    }
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i];
      if (c instanceof HTMLElement) visit(c);
    }
  };
  visit(root);
  return () => {
    for (const r of records) {
      r.el.style.backdropFilter = r.backdropFilter;
      (
        r.el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }
      ).webkitBackdropFilter = r.webkitBackdropFilter;
      r.el.style.backgroundColor = r.backgroundColor;
    }
  };
}

function bumpAlpha(color: string): string | null {
  // Matches both rgb(a) and the modern color() / lab() outputs that
  // browsers sometimes emit. We only bump alpha when the parsed alpha
  // is below ~0.6, otherwise the surface is already opaque enough.
  const m = color.match(
    /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)/i,
  );
  if (!m) return null;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  const a = m[4] === undefined ? 1 : Number(m[4]);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  if (a >= 0.6) return null;
  const next = Math.min(0.85, a * 3 + 0.18);
  return `rgba(${r}, ${g}, ${b}, ${next})`;
}
