"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchActiveRooms, type RoomRecord } from "@/lib/supabase/rooms";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ROOMS_UPDATED_EVENT } from "@/lib/roomEvents";

export function useActiveRooms() {
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setRooms([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchActiveRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar salas");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const handleRoomsUpdated = () => {
      reload();
    };

    window.addEventListener(ROOMS_UPDATED_EVENT, handleRoomsUpdated);
    return () => window.removeEventListener(ROOMS_UPDATED_EVENT, handleRoomsUpdated);
  }, [reload]);

  return { rooms, loading, error, reload };
}
