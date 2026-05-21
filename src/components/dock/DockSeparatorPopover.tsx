"use client";

import {
  type RefObject,
  useLayoutEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { useDockStore } from "@/lib/store";

type Props = {
  id: string;
  anchorRef: RefObject<HTMLElement | null>;
};

export function DockSeparatorPopover({ id, anchorRef }: Props) {
  const removeItem = useDockStore((s) => s.removeItem);
  const setSelectedItemId = useDockStore((s) => s.setSelectedItemId);

  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const compute = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      setPos({ top: r.top - 10, left: r.left + r.width / 2 });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [anchorRef]);

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
      className="z-50 w-44 rounded-xl border border-white/15 bg-slate-900/95 p-3 text-white shadow-2xl shadow-black/50 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-white/15 bg-slate-900/95"
      />
      <p className="mb-2 text-xs font-semibold text-white/85">Separator</p>
      <button
        type="button"
        onClick={() => {
          removeItem(id);
          setSelectedItemId(null);
        }}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-300/20 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/25"
      >
        <Trash2 className="size-3.5" />
        Remove
      </button>
    </div>
  );

  return createPortal(popover, document.body);
}
