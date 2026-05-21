"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useDockStore } from "@/lib/store";
import { getWallpaperUrl } from "@/lib/wallpapers";
import type { ExportFormat } from "@/types/dock";
import { cn } from "@/lib/utils";
import { DockPreview } from "./DockPreview";

export type StageDimensions = { width: number; height: number };

export const STAGE_DIMENSIONS: Record<ExportFormat, StageDimensions> = {
  "wide-16-9": { width: 1920, height: 1080 },
  "square-1-1": { width: 1080, height: 1080 },
  strip: { width: 1600, height: 360 },
  transparent: { width: 1280, height: 360 },
};

export type WallpaperStageHandle = {
  /** The DOM node that should be passed to html-to-image. */
  getStageNode: () => HTMLDivElement | null;
};

type Props = {
  className?: string;
};

export const WallpaperStage = forwardRef<WallpaperStageHandle, Props>(
  function WallpaperStage({ className }, ref) {
    const stageRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const exportFormat = useDockStore((s) => s.exportFormat);
    const wallpaper = useDockStore((s) => s.wallpaper);

    const dimensions = STAGE_DIMENSIONS[exportFormat];
    const wallpaperUrl = getWallpaperUrl(wallpaper);
    const isTransparent = exportFormat === "transparent";

    const [fitScale, setFitScale] = useState(0.5);

    useImperativeHandle(ref, () => ({
      getStageNode: () => stageRef.current,
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const ro = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        const sx = width / dimensions.width;
        const sy = height / dimensions.height;
        setFitScale(Math.min(sx, sy, 1));
      });
      ro.observe(container);
      return () => ro.disconnect();
    }, [dimensions.width, dimensions.height]);

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden",
          className,
        )}
      >
        <div
          style={{
            width: dimensions.width * fitScale,
            height: dimensions.height * fitScale,
          }}
          className="relative"
        >
          <div
            style={{
              width: dimensions.width,
              height: dimensions.height,
              transform: `scale(${fitScale})`,
              transformOrigin: "top left",
            }}
            className="absolute left-0 top-0"
          >
            <div
              ref={stageRef}
              data-stage
              data-format={exportFormat}
              className={cn(
                "relative overflow-hidden",
                isTransparent ? "bg-transparent" : "",
              )}
              style={{
                width: dimensions.width,
                height: dimensions.height,
              }}
            >
              {!isTransparent && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={wallpaperUrl}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 size-full object-cover"
                />
              )}

              <div
                className={cn(
                  "absolute inset-x-0 flex justify-center",
                  isTransparent || exportFormat === "strip"
                    ? "top-1/2 -translate-y-1/2"
                    : "bottom-[3.5%]",
                )}
              >
                <DockPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
