export const MEDIA_DEVICES_STORAGE_KEY = "discorde_media_devices";

export type MediaDeviceKind = "audioinput" | "audiooutput";

interface SavedMediaDevices {
  audioinput?: string;
  audiooutput?: string;
}

function readStore(): SavedMediaDevices {
  if (typeof window === "undefined") return {};

  const raw = localStorage.getItem(MEDIA_DEVICES_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as SavedMediaDevices;
  } catch {
    return {};
  }
}

function writeStore(store: SavedMediaDevices): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEDIA_DEVICES_STORAGE_KEY, JSON.stringify(store));
}

export function getSavedMediaDeviceId(kind: MediaDeviceKind): string | null {
  const id = readStore()[kind];
  return id?.trim() ? id : null;
}

export function setSavedMediaDeviceId(
  kind: MediaDeviceKind,
  deviceId: string
): void {
  if (!deviceId.trim()) return;

  const store = readStore();
  store[kind] = deviceId;
  writeStore(store);
}

export function clearSavedMediaDeviceId(kind: MediaDeviceKind): void {
  const store = readStore();
  if (!(kind in store)) return;
  delete store[kind];
  writeStore(store);
}
