"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteRoom, updateRoomName } from "@/lib/supabase/rooms";
import { saveRoomNameLocal } from "@/lib/roomStorage";
import { notifyRoomsUpdated } from "@/lib/roomEvents";
import { ensureRoomIsEmpty } from "@/lib/roomsApi";
import { CurrentRoomError, RoomOccupiedError } from "@/lib/roomErrors";

export function useRoomManagement(currentRoomId?: string | null) {
  const router = useRouter();

  const renameRoom = useCallback(async (roomId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("EMPTY_NAME");
    }

    await updateRoomName(roomId, trimmed);
    saveRoomNameLocal(roomId, trimmed);
    notifyRoomsUpdated();
  }, []);

  const removeRoom = useCallback(
    async (roomId: string) => {
      if (currentRoomId === roomId) {
        throw new CurrentRoomError();
      }

      await ensureRoomIsEmpty(roomId);
      await deleteRoom(roomId);
      notifyRoomsUpdated();
    },
    [currentRoomId]
  );

  const leaveCurrentRoom = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    renameRoom,
    removeRoom,
    leaveCurrentRoom,
    isRoomOccupiedError: (error: unknown) => error instanceof RoomOccupiedError,
    isCurrentRoomError: (error: unknown) => error instanceof CurrentRoomError,
  };
}
