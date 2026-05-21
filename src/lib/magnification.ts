/**
 * Compute a scale factor for a dock item based on the mouse's horizontal
 * distance to the item's centre.
 *
 * We use a "lens" curve closer to the real macOS dock: a flatter plateau
 * near the cursor (so the 2-3 icons under the pointer all read as large),
 * then a sharp drop-off so far-away icons stay at base size — instead of
 * the long-tailed gaussian we used before, which made distant icons creep
 * up slightly and softened the overall lens feel.
 *
 * @param distancePx Absolute distance from cursor to item centre (px).
 * @param radiusPx Influence radius. Beyond this the scale is exactly 1.
 * @param maxScale Maximum scale applied when distance is 0.
 * @returns Scale factor in the range [1, maxScale].
 */
export function magnificationScale(
  distancePx: number,
  radiusPx: number,
  maxScale: number,
): number {
  if (maxScale <= 1 || radiusPx <= 0) return 1;
  if (distancePx >= radiusPx) return 1;
  const t = distancePx / radiusPx;
  // Raised cosine in [0, 1]: 1 at the centre, 0 at the edge, with a slight
  // sharpening (^1.4) to push more "flat" feel near the peak and a steeper
  // shoulder near the boundary.
  const falloff = Math.pow((Math.cos(Math.PI * t) + 1) / 2, 1.4);
  return 1 + (maxScale - 1) * falloff;
}
