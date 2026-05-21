import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Render the wordmark next to the glyph. */
  withWordmark?: boolean;
};

/**
 * The product mark for "Share Your Dock". This is the single source of
 * truth for the brand glyph: the same SVG is mirrored in
 * `src/app/icon.svg` so the favicon, the in-app header logo, and any
 * future surfaces stay visually identical. If you tweak one, mirror the
 * other.
 *
 * The glyph is a tiny stylised macOS dock: a translucent pill behind
 * three icon-like circles (left = warm gradient, middle = neutral
 * highlight, right = blue accent), on a dark rounded square.
 */
export function BrandMark({ className, withWordmark = false }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="size-full"
      >
        <defs>
          <linearGradient id="brand-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d1730" />
            <stop offset="1" stopColor="#0a0a14" />
          </linearGradient>
          <linearGradient id="brand-accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0abfc" />
            <stop offset="0.5" stopColor="#fb7185" />
            <stop offset="1" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="7" fill="url(#brand-bg)" />
        <rect
          x="4"
          y="19"
          width="24"
          height="9"
          rx="3"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.18)"
        />
        <circle cx="9" cy="23.5" r="2.5" fill="url(#brand-accent)" />
        <circle cx="16" cy="22" r="3.5" fill="#fff" />
        <circle cx="23" cy="23.5" r="2.5" fill="#60a5fa" />
      </svg>
      {withWordmark && (
        <span className="text-sm font-semibold tracking-tight text-white">
          Share Your Dock
        </span>
      )}
    </span>
  );
}
