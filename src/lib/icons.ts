import type { CatalogIcon, IconManifest } from "@/types/dock";

let cached: CatalogIcon[] | null = null;

export async function loadIconManifest(): Promise<CatalogIcon[]> {
  if (cached) return cached;
  try {
    // `no-cache` forces a revalidation; the dev server / Next won't serve
    // a stale manifest after `pnpm fetch-icons` regenerates it.
    const res = await fetch("/icons/manifest.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`);
    const data: IconManifest = await res.json();
    cached = data.icons ?? [];
    return cached;
  } catch (err) {
    console.warn("[icons] failed to load manifest", err);
    cached = [];
    return cached;
  }
}

export function searchCatalog(
  catalog: CatalogIcon[],
  query: string,
): CatalogIcon[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog;
  return catalog.filter((icon) => {
    if (icon.name.toLowerCase().includes(q)) return true;
    if (icon.id.toLowerCase().includes(q)) return true;
    return icon.tags.some((t) => t.toLowerCase().includes(q));
  });
}

/**
 * Best-effort lookup for an icon by domain or brand slug using free CDNs.
 * Tries Simple Icons (brand logos) first, then falls back to geticon.dev
 * (favicons of any domain). Returns `null` if no usable icon is found.
 */
export async function lookupCdnIcon(input: string): Promise<{
  iconUrl: string;
  name: string;
} | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const slug = trimmed
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "");

  // Simple Icons (brand logos, slug-based).
  const simpleIconsSlug = slug.replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]/g, "");
  if (simpleIconsSlug) {
    const simpleUrl = `https://cdn.simpleicons.org/${simpleIconsSlug}`;
    if (await urlExists(simpleUrl)) {
      return { iconUrl: simpleUrl, name: prettyName(simpleIconsSlug) };
    }
  }

  // geticon.dev (favicon of any domain).
  if (slug.includes(".")) {
    const geticonUrl = `https://geticon.dev/?url=${encodeURIComponent(slug)}`;
    return { iconUrl: geticonUrl, name: prettyName(slug.split(".")[0]) };
  }

  // Fallback: try guessing a .com domain.
  const guessed = `${slug}.com`;
  const geticonUrl = `https://geticon.dev/?url=${encodeURIComponent(guessed)}`;
  return { iconUrl: geticonUrl, name: prettyName(slug) };
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET", mode: "cors" });
    return res.ok;
  } catch {
    return false;
  }
}

function prettyName(slug: string): string {
  return slug
    .split(/[-_.]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * Extracts the largest embedded PNG from a macOS `.icns` icon container.
 * `.icns` is just a TOC of chunks where many chunk types (`ic07`, `ic08`,
 * `ic09`, `ic10`, `ic11`, `ic12`, `ic13`, `ic14`) carry a raw PNG payload
 * — we walk the chunks, sniff the PNG magic, and pick the largest one so
 * the dock displays the highest-resolution variant available.
 *
 * Returns a `data:image/png;base64,...` URL on success, or `null` when the
 * file isn't a valid `.icns` or has no PNG variants inside (some very old
 * `.icns` files only ship raw bitmap chunks, which we can't decode in the
 * browser).
 */
export async function extractPngFromIcns(file: File): Promise<string | null> {
  const buf = await file.arrayBuffer();
  if (buf.byteLength < 8) return null;
  const view = new DataView(buf);
  const u8 = new Uint8Array(buf);
  const decoder = new TextDecoder("ascii");

  if (decoder.decode(u8.subarray(0, 4)) !== "icns") return null;

  let bestOffset = -1;
  let bestLength = 0;
  let offset = 8;
  while (offset + 8 <= u8.length) {
    // type (4 bytes) + total chunk length including the 8-byte header,
    // big-endian per the Apple spec.
    const chunkSize = view.getUint32(offset + 4, false);
    if (chunkSize < 8 || offset + chunkSize > u8.length) break;
    const dataOffset = offset + 8;
    const dataLength = chunkSize - 8;
    if (dataLength >= PNG_MAGIC.length && hasPngMagic(u8, dataOffset)) {
      if (dataLength > bestLength) {
        bestOffset = dataOffset;
        bestLength = dataLength;
      }
    }
    offset += chunkSize;
  }

  if (bestOffset < 0) return null;
  const pngBlob = new Blob([u8.subarray(bestOffset, bestOffset + bestLength)], {
    type: "image/png",
  });
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(pngBlob);
  });
}

function hasPngMagic(buf: Uint8Array, offset: number): boolean {
  for (let i = 0; i < PNG_MAGIC.length; i++) {
    if (buf[offset + i] !== PNG_MAGIC[i]) return false;
  }
  return true;
}

export function isIcnsFile(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".icns")) return true;
  // Some browsers report empty or generic MIME for .icns; macOS sometimes
  // reports `image/icns` or `image/x-icns`.
  if (/icns$/i.test(file.type)) return true;
  return false;
}
