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

export function removeRoomNameLocal(roomId: string): void {
  if (typeof window === "undefined") return;

  const raw = localStorage.getItem(ROOM_NAMES_STORAGE_KEY);
  if (!raw) return;

  try {
    const map = JSON.parse(raw) as Record<string, string>;
    if (!(roomId in map)) return;
    delete map[roomId];
    localStorage.setItem(ROOM_NAMES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore corrupt storage
  }
}

/** Remove nomes de salas que não existem mais no servidor. */
export function pruneRoomNamesLocal(activeRoomIds: string[]): void {
  if (typeof window === "undefined") return;

  const raw = localStorage.getItem(ROOM_NAMES_STORAGE_KEY);
  if (!raw) return;

  try {
    const map = JSON.parse(raw) as Record<string, string>;
    const active = new Set(activeRoomIds);
    let changed = false;

    for (const id of Object.keys(map)) {
      if (!active.has(id)) {
        delete map[id];
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(ROOM_NAMES_STORAGE_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore corrupt storage
  }
}

export function getRoomDisplayName(roomId: string, unnamedLabel = "Sala"): string {
  const localName = getRoomNameLocal(roomId);
  if (localName) return localName;
  return `${unnamedLabel} #${roomId.slice(0, 6)}`;
}
