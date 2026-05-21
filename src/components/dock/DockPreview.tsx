"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDockStore } from "@/lib/store";
import { DOCK_BASE_SIZE, type DockTheme } from "@/types/dock";
import { magnificationScale } from "@/lib/magnification";
import { cn } from "@/lib/utils";
import { DockItem } from "./DockItem";
import { DockSeparator } from "./DockSeparator";

const DOCK_GAP = 6;

const THEME_CLASSES: Record<DockTheme, string> = {
  dark: "border-white/20 bg-white/15 shadow-2xl shadow-black/40 backdrop-blur-2xl",
  light:
    "border-black/10 bg-white/55 shadow-xl shadow-black/15 backdrop-blur-2xl",
  glass:
    "border-white/15 bg-white/[0.07] shadow-2xl shadow-black/50 backdrop-blur-3xl",
};

export function DockPreview() {
  const items = useDockStore((s) => s.items);
  const size = useDockStore((s) => s.size);
  const theme = useDockStore((s) => s.theme);
  const magnificationEnabled = useDockStore((s) => s.magnificationEnabled);
  const magnificationMax = useDockStore((s) => s.magnificationMax);
  const reorderItems = useDockStore((s) => s.reorderItems);
  const selectedItemId = useDockStore((s) => s.selectedItemId);
  const setSelectedItemId = useDockStore((s) => s.setSelectedItemId);
  const pinnedItemId = useDockStore((s) => s.pinnedItemId);

  const baseSize = DOCK_BASE_SIZE[size];

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [scales, setScales] = useState<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const registerItemRef = useCallback(
    (id: string, node: HTMLDivElement | null) => {
      if (node) itemRefs.current.set(id, node);
      else itemRefs.current.delete(id);
    },
    [],
  );

  const resetScales = useCallback(() => {
    setScales((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  const computeScalesForX = useCallback(
    (cursorX: number) => {
      // Influence ~2.5 icons on each side of the cursor. Anything beyond
      // that stays at base size — matches the lens feel of the macOS dock.
      const radius = baseSize * 2.5;
      const next: Record<string, number> = {};
      itemRefs.current.forEach((node, id) => {
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const distance = Math.abs(cursorX - centerX);
        next[id] = magnificationScale(distance, radius, magnificationMax);
      });
      return next;
    },
    [baseSize, magnificationMax],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!magnificationEnabled) {
        resetScales();
        return;
      }
      setScales(computeScalesForX(e.clientX));
    },
    [magnificationEnabled, computeScalesForX, resetScales],
  );

  const handleMouseLeave = useCallback(() => {
    if (!pinnedItemId) {
      resetScales();
      return;
    }
    // When a pin is active, fall back to the pinned-icon pose instead of
    // a flat dock — so a screenshot taken after the cursor leaves still
    // captures the magnified shape.
    const pinnedNode = itemRefs.current.get(pinnedItemId);
    if (!pinnedNode) {
      resetScales();
      return;
    }
    const r = pinnedNode.getBoundingClientRect();
    setScales(computeScalesForX(r.left + r.width / 2));
  }, [pinnedItemId, computeScalesForX, resetScales]);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      reorderItems(String(active.id), String(over.id));
    },
    [reorderItems],
  );

  // Close popover on outside click / Escape.
  useEffect(() => {
    if (!selectedItemId) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-dock-item]")) return;
      if (target.closest("[data-dock-popover]")) return;
      setSelectedItemId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItemId(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [selectedItemId, setSelectedItemId]);

  // When a pin is set and the cursor is not over the dock, apply the
  // pinned-icon pose so the dock visualisation matches what an export
  // would capture.
  useEffect(() => {
    if (!pinnedItemId) return;
    const pinnedNode = itemRefs.current.get(pinnedItemId);
    if (!pinnedNode) return;
    const r = pinnedNode.getBoundingClientRect();
    setScales(computeScalesForX(r.left + r.width / 2));
  }, [pinnedItemId, computeScalesForX]);

  const sortableIds = useMemo(() => items.map((it) => it.id), [items]);

  // Compute the visual scales + lateral push offsets + total extra width
  // injected into the row by magnification. The track uses `totalExtra`
  // to grow its horizontal padding so the rounded background still hugs
  // the magnified icons (matches AppKit's lens behaviour).
  const layout = useMemo(() => {
    // When a popover is open on an item that is NOT also pinned, flatten
    // the whole dock so the popover sits over a calm, stable row of icons.
    // If the selected item IS the pinned magnify target, keep magnification
    // so the editor mirrors what an export would produce.
    const popoverOpenOnNonPinned =
      selectedItemId !== null && selectedItemId !== pinnedItemId;

    const visualScales = items.map((item) => {
      if (popoverOpenOnNonPinned) return 1;
      return magnificationEnabled ? (scales[item.id] ?? 1) : 1;
    });

    const baseWidths = items.map((item) =>
      item.kind === "separator" ? Math.round(baseSize * 0.2) : baseSize,
    );

    // Extra width injected into the row by each item's scale. Separators
    // stay at scale 1 so they contribute 0.
    const extras = items.map((item, i) =>
      item.kind === "separator"
        ? 0
        : baseWidths[i] * (visualScales[i] - 1),
    );
    const totalExtra = extras.reduce((a, b) => a + b, 0);

    // Lateral offset per item: half of own extra + sum of extras to its
    // left, balanced around the dock's centre so the whole row stays
    // centred while neighbours splay outward.
    const translateXs: number[] = [];
    let cum = 0;
    for (let i = 0; i < items.length; i++) {
      translateXs.push(cum + extras[i] / 2 - totalExtra / 2);
      cum += extras[i];
    }

    return { visualScales, translateXs, totalExtra };
  }, [
    items,
    scales,
    baseSize,
    magnificationEnabled,
    selectedItemId,
    pinnedItemId,
  ]);

  // The leftmost icon's visual edge sits totalExtra/2 to the left of
  // its base position, the rightmost sits the same distance to the right.
  // Add that to the track's horizontal padding so the rounded background
  // grows symmetrically with the magnified content.
  const dockPaddingX = 12 + layout.totalExtra / 2;

  return (
    <div
      ref={trackRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto inline-flex"
      style={{ padding: baseSize * 0.18 }}
    >
      <div
        className={cn(
          "relative flex items-end rounded-[28px] border py-2",
          THEME_CLASSES[theme],
        )}
        style={{
          gap: DOCK_GAP,
          paddingLeft: dockPaddingX,
          paddingRight: dockPaddingX,
          transition:
            "padding-left 60ms ease-out, padding-right 60ms ease-out",
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={horizontalListSortingStrategy}
          >
            {items.map((item, i) => {
              if (item.kind === "separator") {
                return (
                  <DockSeparator
                    key={item.id}
                    item={item}
                    baseSize={baseSize}
                    translateX={layout.translateXs[i]}
                    setRef={registerItemRef}
                  />
                );
              }
              return (
                <DockItem
                  key={item.id}
                  item={item}
                  baseSize={baseSize}
                  scale={layout.visualScales[i]}
                  translateX={layout.translateXs[i]}
                  setRef={registerItemRef}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
