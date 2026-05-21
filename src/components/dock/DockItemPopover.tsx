"use client";

import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useDockStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AppItem } from "@/types/dock";

type Props = {
  item: AppItem;
  anchorRef: RefObject<HTMLElement | null>;
};

/**
 * Renders into a portal so the popover escapes any `overflow:hidden`
 * ancestors (e.g. the WallpaperStage). Position is computed from the
 * icon's bounding rect on mount and on viewport changes.
 */
export function DockItemPopover({ item, anchorRef }: Props) {
  const toggleIndicator = useDockStore((s) => s.toggleIndicator);
  const renameApp = useDockStore((s) => s.renameApp);
  const removeItem = useDockStore((s) => s.removeItem);
  const setSelectedItemId = useDockStore((s) => s.setSelectedItemId);
  const pinnedItemId = useDockStore((s) => s.pinnedItemId);
  const setPinnedItemId = useDockStore((s) => s.setPinnedItemId);
  const magnificationEnabled = useDockStore((s) => s.magnificationEnabled);

  const isPinned = pinnedItemId === item.id;

  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  useLayoutEffect(() => {
    const compute = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      setPos({
        top: r.top - 10, // popover's bottom edge will sit here (transform translateY -100%)
        left: r.left + r.width / 2,
      });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [anchorRef]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.name) renameApp(item.id, trimmed);
    setRenaming(false);
  };

  if (!pos || typeof document === "undefined") return null;

  const popover = (
    <div
      data-dock-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translate(-50%, -100%)",
      }}
      className={cn(
        "z-50 w-60 rounded-xl border border-white/15 bg-slate-900/95 p-3 text-white shadow-2xl shadow-black/50 backdrop-blur-xl",
      )}
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-white/15 bg-slate-900/95"
      />

      <div className="flex items-center justify-between gap-2">
        {renaming ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraft(item.name);
                setRenaming(false);
              }
            }}
            onBlur={commitRename}
            className="min-w-0 flex-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:border-white/40 focus:outline-none"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {item.name}
          </span>
        )}
        <button
          type="button"
          aria-label={renaming ? "Save name" : "Rename app"}
          onClick={() => (renaming ? commitRename() : setRenaming(true))}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
        >
          {renaming ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
        </button>
      </div>

      <label className="mt-3 flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs hover:bg-white/[0.07]">
        <span className="font-medium text-white/85">Running indicator</span>
        <span
          className={cn(
            "relative inline-flex h-4 w-7 items-center rounded-full border transition-colors",
            item.hasIndicator
              ? "border-white/40 bg-white/80"
              : "border-white/15 bg-white/10",
          )}
        >
          <input
            type="checkbox"
            checked={item.hasIndicator}
            onChange={() => toggleIndicator(item.id)}
            className="peer sr-only"
            aria-label="Toggle running indicator"
          />
          <span
            className={cn(
              "absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-slate-900 transition-transform",
              item.hasIndicator ? "left-[14px]" : "left-[2px]",
            )}
            aria-hidden
          />
        </span>
      </label>

      <label
        className={cn(
          "mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs",
          magnificationEnabled
            ? "cursor-pointer hover:bg-white/[0.07]"
            : "cursor-not-allowed opacity-50",
        )}
      >
        <span className="flex flex-col">
          <span className="font-medium text-white/85">Pin magnify</span>
          <span className="text-[10px] text-white/45">
            Locks one icon zoomed for the screenshot.
          </span>
        </span>
        <span
          className={cn(
            "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors",
            isPinned
              ? "border-white/40 bg-white/80"
              : "border-white/15 bg-white/10",
          )}
        >
          <input
            type="checkbox"
            checked={isPinned}
            disabled={!magnificationEnabled}
            onChange={() => setPinnedItemId(isPinned ? null : item.id)}
            className="peer sr-only"
            aria-label="Pin magnification for export"
          />
          <span
            className={cn(
              "absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-slate-900 transition-transform",
              isPinned ? "left-[14px]" : "left-[2px]",
            )}
            aria-hidden
          />
        </span>
      </label>

      <button
        type="button"
        onClick={() => {
          removeItem(item.id);
          setSelectedItemId(null);
        }}
        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-300/20 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/25"
      >
        <Trash2 className="size-3.5" />
        Remove
      </button>
    </div>
  );

  return createPortal(popover, document.body);
}
