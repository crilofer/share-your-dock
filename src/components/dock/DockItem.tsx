"use client";

import { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDockStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AppItem } from "@/types/dock";
import { DockItemPopover } from "./DockItemPopover";

type Props = {
  item: AppItem;
  baseSize: number;
  scale: number;
  /** Lateral push, in px, to keep neighbours from overlapping the magnified icon. */
  translateX: number;
  setRef: (id: string, node: HTMLDivElement | null) => void;
};

export function DockItem({ item, baseSize, scale, translateX, setRef }: Props) {
  const showIndicators = useDockStore((s) => s.showIndicators);
  const theme = useDockStore((s) => s.theme);
  const selectedItemId = useDockStore((s) => s.selectedItemId);
  const setSelectedItemId = useDockStore((s) => s.setSelectedItemId);
  const magnificationEnabled = useDockStore((s) => s.magnificationEnabled);
  const magnificationMax = useDockStore((s) => s.magnificationMax);

  const isSelected = selectedItemId === item.id;

  // Mirrors macOS: only the icon that is currently the magnification peak
  // (directly under the cursor, OR the pinned icon when the cursor is
  // elsewhere) shows its name label. Neighbours that are partially
  // magnified do not. We accept a small epsilon so floating-point noise
  // in the scale doesn't make the label flicker on/off as the cursor
  // crosses pixel boundaries.
  const isAtPeak =
    magnificationEnabled && scale >= magnificationMax - 0.05;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const localRef = useRef<HTMLDivElement | null>(null);
  const iconWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRef(item.id, localRef.current);
    return () => setRef(item.id, null);
  }, [item.id, setRef]);

  const refCallback = (node: HTMLDivElement | null) => {
    localRef.current = node;
    setNodeRef(node);
  };

  const dotSize = Math.max(4, Math.round(baseSize * 0.07));
  // Label sits a few px above the magnified icon's visual top. Computed
  // OUTSIDE the scaled wrapper so the offset does not multiply with scale
  // and the tooltip never overshoots the stage's overflow:hidden bounds.
  const labelBottom = baseSize * scale + dotSize + 12;

  // Label + arrow grow with the magnification scale, the same way the
  // real macOS dock label gets bigger as the icon under the cursor
  // expands. `k` is the "extra" past base scale (0 when not magnified).
  const k = scale - 1;
  const labelFontSize = Math.round(12 + k * 2);
  const labelPadX = Math.round(10 + k * 2);
  const labelPadY = Math.round(3 + k * 1.5);
  const labelRadius = Math.round(7 + k * 2);
  const arrowW = Math.round(12 + k * 4);
  const arrowH = Math.round(6 + k * 2);

  return (
    <div
      ref={refCallback}
      {...attributes}
      {...listeners}
      data-dock-item
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItemId(isSelected ? null : item.id);
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        width: baseSize,
        height: baseSize + dotSize + 6,
      }}
      className={cn(
        "group relative flex shrink-0 cursor-grab flex-col items-center justify-end touch-none",
        isDragging && "opacity-60 cursor-grabbing",
      )}
    >
      <div
        ref={iconWrapperRef}
        className="relative"
        style={{
          width: baseSize,
          height: baseSize,
          transform: `translateX(${translateX}px) scale(${scale})`,
          transformOrigin: "bottom center",
          transition: "transform 60ms ease-out",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.iconUrl}
          alt={item.name}
          draggable={false}
          className="size-full select-none drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]"
        />
      </div>

      {/* Hover/peak-magnification name tooltip. Lives OUTSIDE the scaled
          wrapper so its position scales linearly (not quadratically) with
          the icon, which keeps it inside the stage even at high
          intensities.

          The label is shown only when this icon is the magnification
          peak (cursor directly over it, OR it is the pinned icon and the
          cursor isn't over the dock). Hover (`group-hover:flex`) is a
          fallback for the no-magnification case so users can still see
          the app name by mousing over.

          The non-peak/non-hover variant uses `hidden` so the label is
          fully removed from the DOM (display:none). We avoid `opacity:0`
          because html-to-image sometimes paints the element's shadow
          even when its opacity is 0, leaving stray ghost rectangles in
          the exported PNG.

          Visual style mirrors the macOS dock label: a small material
          pill with a downward arrow at the bottom-centre. Pill geometry
          (font, padding, radius, arrow) all grow with the icon's scale
          so the label keeps proportion when intensity is high. */}
      {!isSelected && (
        <span
          data-export-hide={isAtPeak ? undefined : ""}
          className={cn(
            // No backdrop-blur on the label: html-to-image cannot
            // reproduce backdrop-filter and can leave a stray rectangle
            // halo in the exported PNG. We rely on a solid translucent
            // background instead, which is reproduced faithfully.
            "pointer-events-none absolute whitespace-nowrap font-medium tracking-[-0.01em] shadow-[0_2px_8px_rgba(0,0,0,0.28)]",
            theme === "light"
              ? "bg-white/95 text-slate-900 ring-1 ring-black/5"
              : "bg-[#1c1c1e]/95 text-white ring-1 ring-white/10",
            isAtPeak ? "flex" : "hidden group-hover:flex",
          )}
          style={{
            bottom: labelBottom,
            left: `calc(50% + ${translateX}px)`,
            transform: "translateX(-50%)",
            fontSize: `${labelFontSize}px`,
            padding: `${labelPadY}px ${labelPadX}px`,
            borderRadius: `${labelRadius}px`,
          }}
        >
          {item.name}
          {/* Downward-pointing arrow stitched to the pill's bottom edge.
              Built with the classic border-triangle technique (0×0 box
              with one solid coloured border and two transparent ones)
              instead of clip-path, because html-to-image cannot render
              clip-path and would otherwise emit the arrow as a solid
              rectangle in the exported PNG. */}
          <span
            aria-hidden
            className="absolute left-1/2 top-full -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: `${arrowW / 2}px solid transparent`,
              borderRight: `${arrowW / 2}px solid transparent`,
              borderTop: `${arrowH}px solid ${
                theme === "light"
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(28,28,30,0.9)"
              }`,
            }}
          />
        </span>
      )}

      {showIndicators && item.hasIndicator && (
        <span
          className={cn(
            "mt-1 rounded-full",
            theme === "light" ? "bg-slate-700" : "bg-white/90",
          )}
          style={{
            width: dotSize,
            height: dotSize,
            transform: `translateX(${translateX}px)`,
            transition: "transform 60ms ease-out",
          }}
          aria-hidden
        />
      )}

      {isSelected && (
        <DockItemPopover item={item} anchorRef={iconWrapperRef} />
      )}
    </div>
  );
}
