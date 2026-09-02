export const PRESENCE_STATUS_KEY = "discorde_presence_status";
export const PRESENCE_STATUS_EVENT = "discorde-presence-status";

export type PresenceStatus = "online" | "idle" | "dnd" | "invisible";

const VALID: PresenceStatus[] = ["online", "idle", "dnd", "invisible"];

let cached: PresenceStatus | null = null;

export function isPresenceStatus(value: string): value is PresenceStatus {
  return VALID.includes(value as PresenceStatus);
}

export function getPresenceStatus(): PresenceStatus {
  if (typeof window === "undefined") return "online";
  if (cached) return cached;

  const raw = localStorage.getItem(PRESENCE_STATUS_KEY);
  cached = raw && isPresenceStatus(raw) ? raw : "online";
  return cached;
}

export function setPresenceStatus(status: PresenceStatus): void {
  if (typeof window === "undefined") return;
  cached = status;
  localStorage.setItem(PRESENCE_STATUS_KEY, status);
  window.dispatchEvent(new Event(PRESENCE_STATUS_EVENT));
}

export function subscribePresenceStatus(onStoreChange: () => void): () => void {
  const handler = () => {
    cached = null;
    onStoreChange();
  };

  window.addEventListener(PRESENCE_STATUS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(PRESENCE_STATUS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function presenceDotClass(status: PresenceStatus): string {
  switch (status) {
    case "idle":
      return "bg-amber-400";
    case "dnd":
      return "bg-red-500";
    case "invisible":
      return "bg-[#6b6a78]";
    default:
      return "bg-emerald-500";
  }
}
