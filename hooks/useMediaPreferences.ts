"use client";

import { useSyncExternalStore } from "react";
import {
  getMediaPreferences,
  subscribeMediaPreferences,
  type MediaPreferences,
} from "@/lib/mediaPreferences";
import { DEFAULT_MEDIA_PREFS } from "@/lib/mediaPreferences";

export function useMediaPreferences(): MediaPreferences {
  return useSyncExternalStore(
    subscribeMediaPreferences,
    getMediaPreferences,
    () => DEFAULT_MEDIA_PREFS
  );
}
