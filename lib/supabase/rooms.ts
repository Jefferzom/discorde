import { getSupabaseClient } from "@/lib/supabase/client";

export interface RoomRecord {
  id: string;
  name: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateRoomInput {
  id: string;
  name?: string;
  createdBy?: string;
}

export async function createRoom({
  id,
  name,
  createdBy,
}: CreateRoomInput): Promise<RoomRecord> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      id,
      name: name ?? null,
      created_by: createdBy ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as RoomRecord;
}

export async function fetchActiveRooms(): Promise<RoomRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const unique = new Map<string, RoomRecord>();
  for (const room of (data ?? []) as RoomRecord[]) {
    unique.set(room.id, room);
  }
  return Array.from(unique.values());
}

export async function updateRoomName(
  id: string,
  name: string
): Promise<RoomRecord> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  const { data, error } = await supabase
    .from("rooms")
    .update({ name: name.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as RoomRecord;
}

export async function deleteRoom(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) throw error;
}
