export const MEDIA_PREFS_KEY = "discorde_media_prefs";
export const MEDIA_PREFS_EVENT = "discorde-media-prefs";

export interface MediaPreferences {
  echoCancellation: boolean;
  autoGainControl: boolean;
  noiseSuppression: boolean;
  krisp: boolean;
  backgroundBlur: boolean;
  mirrorLocalVideo: boolean;
}

export const DEFAULT_MEDIA_PREFS: MediaPreferences = {
  echoCancellation: true,
  autoGainControl: true,
  noiseSuppression: true,
  krisp: true,
  backgroundBlur: false,
  mirrorLocalVideo: true,
};

let cached: MediaPreferences | null = null;

function parse(raw: string | null): MediaPreferences {
  if (!raw) return { ...DEFAULT_MEDIA_PREFS };
  try {
    return { ...DEFAULT_MEDIA_PREFS, ...(JSON.parse(raw) as Partial<MediaPreferences>) };
  } catch {
    return { ...DEFAULT_MEDIA_PREFS };
  }
}

export function getMediaPreferences(): MediaPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_MEDIA_PREFS };
  if (cached) return cached;
  cached = parse(localStorage.getItem(MEDIA_PREFS_KEY));
  return cached;
}

export function setMediaPreferences(patch: Partial<MediaPreferences>): MediaPreferences {
  const next = { ...getMediaPreferences(), ...patch };
  cached = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(MEDIA_PREFS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(MEDIA_PREFS_EVENT));
  }
  return next;
}

export function subscribeMediaPreferences(onStoreChange: () => void): () => void {
  const handler = () => {
    cached = null;
    onStoreChange();
  };
  window.addEventListener(MEDIA_PREFS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(MEDIA_PREFS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
