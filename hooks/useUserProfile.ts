"use client";

import { useSyncExternalStore } from "react";
import {
  getUserProfile,
  subscribeUserProfile,
  type UserProfile,
} from "@/lib/userStorage";

export function useUserProfile(): UserProfile | null {
  return useSyncExternalStore(
    subscribeUserProfile,
    getUserProfile,
    () => null
  );
}
