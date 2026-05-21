"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Plus, Search, Upload, Globe, Loader2 } from "lucide-react";
import { useDockStore } from "@/lib/store";
import {
  extractPngFromIcns,
  fileToDataUrl,
  isIcnsFile,
  loadIconManifest,
  lookupCdnIcon,
  searchCatalog,
} from "@/lib/icons";
import type { CatalogIcon } from "@/types/dock";
import { cn } from "@/lib/utils";
import { CollapseSection } from "./CollapseSection";

export function IconPicker() {
  const addApp = useDockStore((s) => s.addApp);

  const [catalog, setCatalog] = useState<CatalogIcon[]>([]);
  const [query, setQuery] = useState("");
  const [cdnQuery, setCdnQuery] = useState("");
  const [cdnLoading, setCdnLoading] = useState(false);
  const [cdnError, setCdnError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadIconManifest().then((c) => {
      if (!cancelled) setCatalog(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => searchCatalog(catalog, query),
    [catalog, query],
  );

  const onPickCatalog = useCallback(
    (icon: CatalogIcon) => {
      addApp({
        name: icon.name,
        iconUrl: `/icons/${icon.file}`,
        source: "bundled",
      });
    },
    [addApp],
  );

  const onCdnLookup = useCallback(async () => {
    if (!cdnQuery.trim()) return;
    setCdnLoading(true);
    setCdnError(null);
    try {
      const result = await lookupCdnIcon(cdnQuery);
      if (!result) {
        setCdnError("No icon found for that query.");
        return;
      }
      addApp({ name: result.name, iconUrl: result.iconUrl, source: "cdn" });
      setCdnQuery("");
    } catch (err) {
      setCdnError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setCdnLoading(false);
    }
  }, [addApp, cdnQuery]);

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadError(null);
      try {
        let dataUrl: string | null;
        if (isIcnsFile(file)) {
          dataUrl = await extractPngFromIcns(file);
          if (!dataUrl) {
            setUploadError(
              "This .icns has no PNG variants inside. Download the PNG version from macosicons.com instead.",
            );
            return;
          }
        } else if (file.type.startsWith("image/")) {
          dataUrl = await fileToDataUrl(file);
        } else {
          setUploadError(
            "Unsupported file. Use a PNG, JPG, WebP, SVG, or .icns.",
          );
          return;
        }
        const name = file.name.replace(/\.[^.]+$/, "");
        addApp({ name, iconUrl: dataUrl, source: "upload" });
      } catch (err) {
        console.error("upload failed", err);
        setUploadError(
          err instanceof Error ? err.message : "Could not read that file.",
        );
      } finally {
        e.target.value = "";
      }
    },
    [addApp],
  );

  return (
    <div className="flex flex-col gap-4">
      <CollapseSection
        title="System apps"
        trailing={
          <span className="text-xs tabular-nums text-white/40">
            {catalog.length} included
          </span>
        }
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search system apps..."
            aria-label="Search system apps"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
          />
        </div>

        <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="col-span-4 px-2 py-6 text-center text-xs text-pretty text-white/40">
              No matches. Use the search-by-brand below or upload a custom
              icon.
            </p>
          )}
          {filtered.map((icon) => (
            <button
              key={icon.id}
              type="button"
              onClick={() => onPickCatalog(icon)}
              title={`Add ${icon.name}`}
              aria-label={`Add ${icon.name}`}
              className="group flex flex-col items-center gap-1 rounded-lg border border-transparent p-1.5 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/icons/${icon.file}`}
                alt=""
                className="size-10 rounded-lg"
              />
              <span className="line-clamp-1 w-full text-center text-[10px] text-white/60">
                {icon.name}
              </span>
            </button>
          ))}
        </div>

        <p className="text-pretty text-[10px] leading-relaxed text-white/40">
          These are stylized look-alikes, not the official assets. For
          pixel-accurate icons download them from{" "}
          <a
            href="https://macosicons.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/65 underline-offset-2 hover:text-white hover:underline"
          >
            macosicons.com
          </a>{" "}
          and upload them below.
        </p>
      </CollapseSection>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/90">Other apps</h2>
        </div>
        <p className="text-pretty text-[11px] leading-relaxed text-white/45">
          Anything not in the system list is pulled live from public icon
          CDNs by brand name or domain.
        </p>
        <label className="block text-xs font-medium text-white/70">
          Search by brand or domain
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={cdnQuery}
              onChange={(e) => setCdnQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCdnLookup();
              }}
              placeholder="e.g. dropbox, anthropic.com"
              aria-label="Search icons by brand or domain"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onCdnLookup}
            disabled={cdnLoading || !cdnQuery.trim()}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors",
              "hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {cdnLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            Add
          </button>
        </div>
        {cdnError && (
          <p className="text-xs text-red-300/80">{cdnError}</p>
        )}
      </div>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <input
          ref={fileInputRef}
          type="file"
          // Browsers don't expose a MIME type for `.icns`, so we add the
          // extension explicitly. Otherwise the file picker greys out
          // icons downloaded from macosicons.com.
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,.icns"
          onChange={onUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 px-3 py-2.5 text-xs font-medium text-white/80 hover:bg-white/10"
        >
          <Upload className="size-4" />
          Upload custom icon
        </button>
        <p className="text-[10px] leading-relaxed text-white/40">
          PNG, JPG, WebP, SVG, or .icns. The .icns you download from
          macosicons.com works directly — we extract its highest-res PNG
          variant on upload.
        </p>
        {uploadError && (
          <p className="text-xs text-red-300/85" role="alert">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
}
