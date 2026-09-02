"use client";

import { useSyncExternalStore } from "react";
import {
  getPresenceStatus,
  subscribePresenceStatus,
  type PresenceStatus,
} from "@/lib/presenceStorage";

export function usePresenceStatus(): PresenceStatus {
  return useSyncExternalStore(
    subscribePresenceStatus,
    getPresenceStatus,
    () => "online"
  );
}
