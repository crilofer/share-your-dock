"use client";

import { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDockStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { SeparatorItem } from "@/types/dock";
import { DockSeparatorPopover } from "./DockSeparatorPopover";

type Props = {
  item: SeparatorItem;
  baseSize: number;
  /** Lateral push, in px, mirroring the magnified-icon spread. */
  translateX: number;
  setRef: (id: string, node: HTMLDivElement | null) => void;
};

export function DockSeparator({ item, baseSize, translateX, setRef }: Props) {
  const theme = useDockStore((s) => s.theme);
  const selectedItemId = useDockStore((s) => s.selectedItemId);
  const setSelectedItemId = useDockStore((s) => s.setSelectedItemId);

  const isSelected = selectedItemId === item.id;
  const lineColor =
    theme === "light"
      ? isSelected
        ? "bg-slate-900/70"
        : "bg-slate-900/30"
      : isSelected
        ? "bg-white/90"
        : "bg-white/45";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const localRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    setRef(item.id, localRef.current);
    return () => setRef(item.id, null);
  }, [item.id, setRef]);

  const refCallback = (node: HTMLDivElement | null) => {
    localRef.current = node;
    setNodeRef(node);
  };

  const dotSize = Math.max(4, Math.round(baseSize * 0.07));

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
        height: baseSize + dotSize + 6,
        width: Math.round(baseSize * 0.2),
      }}
      className={cn(
        "group relative flex shrink-0 cursor-grab items-center justify-center touch-none",
        isDragging && "opacity-60 cursor-grabbing",
      )}
      aria-label="Dock separator"
    >
      <span
        ref={lineRef}
        className={cn("block w-px rounded-full transition-colors", lineColor)}
        style={{
          height: baseSize * 0.7,
          transform: `translateX(${translateX}px)`,
          transition: "transform 60ms ease-out",
        }}
      />
      {isSelected && (
        <DockSeparatorPopover id={item.id} anchorRef={lineRef} />
      )}
    </div>
  );
}
