import { RoomOccupiedError } from "@/lib/roomErrors";

export { RoomOccupiedError };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchRoomOccupancy(
  roomId: string
): Promise<{ participantCount: number }> {
  const response = await fetch(
    `${API_URL}/rooms/occupancy?roomName=${encodeURIComponent(roomId)}`
  );

  if (!response.ok) {
    throw new Error(`Falha ao verificar ocupação (${response.status})`);
  }

  return response.json() as Promise<{ participantCount: number }>;
}

export async function ensureRoomIsEmpty(roomId: string): Promise<void> {
  const { participantCount } = await fetchRoomOccupancy(roomId);
  if (participantCount > 0) {
    throw new RoomOccupiedError();
  }
}
