import type { WallpaperPresetId } from "@/types/dock";

export type WallpaperPreset = {
  id: WallpaperPresetId;
  label: string;
  file: string;
};

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  { id: "aurora", label: "Aurora", file: "/wallpapers/aurora.svg" },
  { id: "bloom", label: "Bloom", file: "/wallpapers/bloom.svg" },
  { id: "lake", label: "Lake", file: "/wallpapers/lake.svg" },
  { id: "ember", label: "Ember", file: "/wallpapers/ember.svg" },
];

export function getWallpaperUrl(
  wallpaper:
    | { type: "preset"; id: WallpaperPresetId }
    | { type: "custom"; dataUrl: string },
): string {
  if (wallpaper.type === "custom") return wallpaper.dataUrl;
  const preset = WALLPAPER_PRESETS.find((w) => w.id === wallpaper.id);
  return preset ? preset.file : WALLPAPER_PRESETS[0].file;
}
