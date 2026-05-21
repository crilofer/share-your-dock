export type IconSource = "bundled" | "upload" | "cdn";

export type AppItem = {
  kind: "app";
  id: string;
  name: string;
  iconUrl: string;
  hasIndicator: boolean;
  source: IconSource;
};

export type SeparatorItem = {
  kind: "separator";
  id: string;
};

export type DockItem = AppItem | SeparatorItem;

export type DockSize = "sm" | "md" | "lg";

export const DOCK_BASE_SIZE: Record<DockSize, number> = {
  sm: 48,
  md: 64,
  lg: 80,
};

export type DockTheme = "dark" | "light" | "glass";

export type WallpaperPresetId = "aurora" | "bloom" | "lake" | "ember";

export type Wallpaper =
  | { type: "preset"; id: WallpaperPresetId }
  | { type: "custom"; dataUrl: string };

export type ExportFormat =
  | "transparent"
  | "strip"
  | "square-1-1"
  | "wide-16-9";

export type CatalogIcon = {
  id: string;
  name: string;
  file: string;
  tags: string[];
};

export type IconManifest = {
  generatedAt: string;
  icons: CatalogIcon[];
};
