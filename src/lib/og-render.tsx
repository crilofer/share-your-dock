import { ImageResponse } from "next/og";

/**
 * Shared renderer for the social cards. We use the same composition for
 * Open Graph and Twitter so the previews stay consistent across X,
 * LinkedIn, iMessage, Slack, Discord, etc.
 *
 * Notes about the underlying renderer (`next/og` → satori):
 * - Every container with >1 child needs `display: 'flex'` explicitly,
 *   satori does not infer it.
 * - We avoid loading custom fonts so the route stays fast and the
 *   build doesn't need network access. The system fallback is enough
 *   for a chunky, headline-driven composition.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_ALT =
  "Share Your Dock — build a fictional dock and export it as a PNG";
export const OG_CONTENT_TYPE = "image/png";

/** Bottom-row mock dock. Sizes follow a soft magnification curve. */
const DOCK_ITEMS: Array<{ bg: string; size: number }> = [
  { bg: "linear-gradient(135deg, #6366f1, #4f46e5)", size: 56 },
  { bg: "linear-gradient(135deg, #ec4899, #be185d)", size: 60 },
  { bg: "linear-gradient(135deg, #f59e0b, #ea580c)", size: 68 },
  { bg: "linear-gradient(135deg, #10b981, #047857)", size: 80 },
  { bg: "linear-gradient(135deg, #f0abfc, #fcd34d)", size: 96 },
  { bg: "linear-gradient(135deg, #38bdf8, #2563eb)", size: 80 },
  { bg: "linear-gradient(135deg, #facc15, #d97706)", size: 68 },
  { bg: "linear-gradient(135deg, #f43f5e, #9f1239)", size: 60 },
  { bg: "linear-gradient(135deg, #a78bfa, #6d28d9)", size: 56 },
];

export function renderOGImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at 22% 18%, #2a2148 0%, #0a0a14 65%)",
          padding: "64px 72px",
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <BrandMarkSvg />
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              opacity: 0.78,
            }}
          >
            share your dock
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.045em",
              maxWidth: 980,
            }}
          >
            Build the dock you wish you had.
          </div>
          <div
            style={{
              fontSize: 30,
              opacity: 0.55,
              marginTop: 28,
              maxWidth: 820,
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
            }}
          >
            Drag-and-drop a fictional dock, then export a clean PNG you
            can post anywhere.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 16,
              padding: "14px 22px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 26,
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.55)",
            }}
          >
            {DOCK_ITEMS.map((it, i) => (
              <div
                key={i}
                style={{
                  width: it.size,
                  height: it.size,
                  background: it.bg,
                  borderRadius: Math.round(it.size * 0.24),
                  boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

/**
 * Inline render of the brand glyph (the same one as `src/app/icon.svg`
 * and `src/components/BrandMark.tsx`). Kept in sync by hand because
 * `next/og` cannot import an external SVG file at render time.
 */
function BrandMarkSvg() {
  return (
    <svg width={64} height={64} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="og-brand-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1730" />
          <stop offset="1" stopColor="#0a0a14" />
        </linearGradient>
        <linearGradient id="og-brand-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0abfc" />
          <stop offset="0.5" stopColor="#fb7185" />
          <stop offset="1" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#og-brand-bg)" />
      <rect
        x="4"
        y="19"
        width="24"
        height="9"
        rx="3"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.18)"
      />
      <circle cx="9" cy="23.5" r="2.5" fill="url(#og-brand-accent)" />
      <circle cx="16" cy="22" r="3.5" fill="#fff" />
      <circle cx="23" cy="23.5" r="2.5" fill="#60a5fa" />
    </svg>
  );
}
