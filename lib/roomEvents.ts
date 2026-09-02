export const INTENTIONAL_ROOM_NAV_KEY = "discorde_skip_disconnect_redirect";
export const ROOMS_UPDATED_EVENT = "discorde-rooms-updated";

const INTENTIONAL_NAV_TTL_MS = 5000;

export function markIntentionalRoomNavigation(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INTENTIONAL_ROOM_NAV_KEY, String(Date.now()));
}

export function consumeIntentionalRoomNavigation(): boolean {
  if (typeof window === "undefined") return false;

  const value = sessionStorage.getItem(INTENTIONAL_ROOM_NAV_KEY);
  if (!value) return false;

  sessionStorage.removeItem(INTENTIONAL_ROOM_NAV_KEY);

  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) {
    return true;
  }

  return Date.now() - timestamp < INTENTIONAL_NAV_TTL_MS;
}

export function clearIntentionalRoomNavigation(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(INTENTIONAL_ROOM_NAV_KEY);
}

export const INTENTIONAL_DISCONNECT_KEY = "discorde_intentional_disconnect";

export function markIntentionalDisconnect(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INTENTIONAL_DISCONNECT_KEY, "1");
}

export function consumeIntentionalDisconnect(): boolean {
  if (typeof window === "undefined") return false;
  const value = sessionStorage.getItem(INTENTIONAL_DISCONNECT_KEY);
  if (!value) return false;
  sessionStorage.removeItem(INTENTIONAL_DISCONNECT_KEY);
  return true;
}

export function notifyRoomsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROOMS_UPDATED_EVENT));
}
