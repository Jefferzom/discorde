export const ROOM_NAMES_STORAGE_KEY = "discorde_room_names";

export function saveRoomNameLocal(roomId: string, name: string): void {
  if (typeof window === "undefined") return;

  const raw = localStorage.getItem(ROOM_NAMES_STORAGE_KEY);
  const map: Record<string, string> = raw ? JSON.parse(raw) : {};
  map[roomId] = name.trim();
  localStorage.setItem(ROOM_NAMES_STORAGE_KEY, JSON.stringify(map));
}

export function getRoomNameLocal(roomId: string): string | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(ROOM_NAMES_STORAGE_KEY);
  if (!raw) return null;

  try {
    const map = JSON.parse(raw) as Record<string, string>;
    return map[roomId] ?? null;
  } catch {
    return null;
  }
}
