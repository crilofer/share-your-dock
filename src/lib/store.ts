"use client";

import { create } from "zustand";
import {
  type AppItem,
  type DockItem,
  type DockSize,
  type DockTheme,
  type ExportFormat,
  type IconSource,
  type SeparatorItem,
  type Wallpaper,
} from "@/types/dock";
import { uid } from "@/lib/utils";

type AddAppInput = {
  name: string;
  iconUrl: string;
  source: IconSource;
};

type DockState = {
  items: DockItem[];
  size: DockSize;
  theme: DockTheme;
  magnificationEnabled: boolean;
  magnificationMax: number;
  wallpaper: Wallpaper;
  showIndicators: boolean;
  exportFormat: ExportFormat;
  /** Item currently being edited via popover (null when no popover open). */
  selectedItemId: string | null;
  /**
   * Item whose magnification stays "stuck" without a mouse hover. Used to
   * freeze a magnified pose for the PNG export. Only one item at a time.
   */
  pinnedItemId: string | null;

  addApp: (input: AddAppInput) => void;
  addSeparator: () => void;
  removeItem: (id: string) => void;
  reorderItems: (fromId: string, toId: string) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  toggleIndicator: (id: string) => void;
  renameApp: (id: string, name: string) => void;
  clearDock: () => void;
  loadDefaultDock: () => void;

  setSize: (size: DockSize) => void;
  setTheme: (theme: DockTheme) => void;
  setMagnificationEnabled: (enabled: boolean) => void;
  setMagnificationMax: (value: number) => void;
  setWallpaper: (wallpaper: Wallpaper) => void;
  setShowIndicators: (value: boolean) => void;
  setExportFormat: (value: ExportFormat) => void;
  setSelectedItemId: (id: string | null) => void;
  setPinnedItemId: (id: string | null) => void;
};

/**
 * IDs here are intentionally deterministic so the initial server-rendered
 * state matches the client. Once the user starts editing the dock all new
 * items use random uids.
 *
 * Default state ships ONLY official macOS system apps. Brand apps
 * (Cursor, Figma, Spotify, ...) are added by the user via search or
 * upload — the bundle stays small and trademark-clean.
 */
const DEFAULT_ITEMS: () => DockItem[] = () => [
  {
    kind: "app",
    id: "default-finder",
    name: "Finder",
    iconUrl: "/icons/finder.svg",
    hasIndicator: true,
    source: "bundled",
  },
  {
    kind: "app",
    id: "default-launchpad",
    name: "Launchpad",
    iconUrl: "/icons/launchpad.svg",
    hasIndicator: false,
    source: "bundled",
  },
  {
    kind: "app",
    id: "default-safari",
    name: "Safari",
    iconUrl: "/icons/safari.svg",
    hasIndicator: false,
    source: "bundled",
  },
  {
    kind: "app",
    id: "default-mail",
    name: "Mail",
    iconUrl: "/icons/mail.svg",
    hasIndicator: false,
    source: "bundled",
  },
  {
    kind: "app",
    id: "default-messages",
    name: "Messages",
    iconUrl: "/icons/messages.svg",
    hasIndicator: false,
    source: "bundled",
  },
  {
    kind: "separator",
    id: "default-sep-1",
  },
  {
    kind: "app",
    id: "default-maps",
    name: "Maps",
    iconUrl: "/icons/maps.svg",
    hasIndicator: false,
    source: "bundled",
  },
  {
    kind: "app",
    id: "default-photos",
    name: "Photos",
    iconUrl: "/icons/photos.svg",
    hasIndicator: false,
    source: "bundled",
  },
  {
    kind: "app",
    id: "default-music",
    name: "Music",
    iconUrl: "/icons/music.svg",
    hasIndicator: true,
    source: "bundled",
  },
  {
    kind: "app",
    id: "default-calendar",
    name: "Calendar",
    iconUrl: "/icons/calendar.svg",
    hasIndicator: false,
    source: "bundled",
  },
  {
    kind: "separator",
    id: "default-sep-2",
  },
  {
    kind: "app",
    id: "default-settings",
    name: "System Settings",
    iconUrl: "/icons/settings.svg",
    hasIndicator: false,
    source: "bundled",
  },
  {
    kind: "app",
    id: "default-trash",
    name: "Trash",
    iconUrl: "/icons/trash.svg",
    hasIndicator: false,
    source: "bundled",
  },
];

export const useDockStore = create<DockState>((set, get) => ({
  items: DEFAULT_ITEMS(),
  size: "md",
  theme: "dark",
  magnificationEnabled: true,
  magnificationMax: 1.8,
  wallpaper: { type: "preset", id: "aurora" },
  showIndicators: true,
  exportFormat: "wide-16-9",
  selectedItemId: null,
  pinnedItemId: null,

  addApp: ({ name, iconUrl, source }) =>
    set((state) => {
      const app: AppItem = {
        kind: "app",
        id: uid("app"),
        name,
        iconUrl,
        hasIndicator: false,
        source,
      };
      // Insert before trailing trash if it exists, otherwise at end.
      const items = [...state.items];
      const trashIdx = items.findIndex(
        (it) => it.kind === "app" && it.name.toLowerCase() === "trash",
      );
      if (trashIdx >= 0) {
        items.splice(trashIdx, 0, app);
      } else {
        items.push(app);
      }
      return { items };
    }),

  addSeparator: () =>
    set((state) => {
      const sep: SeparatorItem = { kind: "separator", id: uid("sep") };
      return { items: [...state.items, sep] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((it) => it.id !== id),
      selectedItemId:
        state.selectedItemId === id ? null : state.selectedItemId,
      pinnedItemId:
        state.pinnedItemId === id ? null : state.pinnedItemId,
    })),

  reorderItems: (fromId, toId) => {
    const items = get().items;
    const fromIndex = items.findIndex((it) => it.id === fromId);
    const toIndex = items.findIndex((it) => it.id === toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    get().moveItem(fromIndex, toIndex);
  },

  moveItem: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.items];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return { items: next };
    }),

  toggleIndicator: (id) =>
    set((state) => ({
      items: state.items.map((it) =>
        it.kind === "app" && it.id === id
          ? { ...it, hasIndicator: !it.hasIndicator }
          : it,
      ),
    })),

  renameApp: (id, name) =>
    set((state) => ({
      items: state.items.map((it) =>
        it.kind === "app" && it.id === id ? { ...it, name } : it,
      ),
    })),

  clearDock: () => set({ items: [] }),
  loadDefaultDock: () => set({ items: DEFAULT_ITEMS() }),

  setSize: (size) => set({ size }),
  setTheme: (theme) => set({ theme }),
  setMagnificationEnabled: (enabled) =>
    set({ magnificationEnabled: enabled }),
  setMagnificationMax: (value) => set({ magnificationMax: value }),
  setWallpaper: (wallpaper) => set({ wallpaper }),
  setShowIndicators: (value) => set({ showIndicators: value }),
  setExportFormat: (value) => set({ exportFormat: value }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setPinnedItemId: (id) => set({ pinnedItemId: id }),
}));
