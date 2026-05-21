"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Big title shown next to the chevron, e.g. "System apps". */
  title: string;
  /**
   * Optional trailing badge / hint shown on the right of the title row
   * (kept readable when collapsed so the user knows what's inside).
   */
  trailing?: ReactNode;
  /** Open by default. Useful for sections that matter for first-run UX. */
  defaultOpen?: boolean;
  /** Inner content; only mounted when the section is open. */
  children: ReactNode;
  className?: string;
};

/**
 * Lightweight disclosure used to keep the sidebar tidy. The whole title
 * row is the toggle; collapsed state hides the body entirely (unmounts)
 * so it doesn't compete for scroll space. We chose unmount-on-collapse
 * over `display:none` because the sections store no expensive state
 * (search query lives in the parent `IconPicker`, so it survives a
 * collapse/expand cycle).
 */
export function CollapseSection({
  title,
  trailing,
  defaultOpen = false,
  children,
  className,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn("flex flex-col", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "group flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left transition-colors",
          "hover:bg-white/[0.04]",
        )}
      >
        <span className="flex items-center gap-1.5">
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 text-white/45 transition-transform duration-150",
              open ? "" : "-rotate-90",
            )}
          />
          <h2 className="text-sm font-semibold text-white/90">{title}</h2>
        </span>
        {trailing}
      </button>
      {open && <div className="mt-3 flex flex-col gap-4">{children}</div>}
    </section>
  );
}
