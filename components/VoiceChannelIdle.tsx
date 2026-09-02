"use client";

import { Loader2, Plus, Volume2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { RoomRecord } from "@/lib/supabase/rooms";

interface VoiceChannelIdleProps {
  channelName: string;
  rooms: RoomRecord[];
  loading?: boolean;
  creating?: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export default function VoiceChannelIdle({
  channelName,
  rooms,
  loading = false,
  creating = false,
  onCreateRoom,
  onJoinRoom,
}: VoiceChannelIdleProps) {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#13131b]">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
          <Volume2 className="w-8 h-8 text-indigo-400" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-1">{t.voiceChannel.idleTitle}</h2>
          <p className="text-sm text-[#908fa0]">
            {t.voiceChannel.idleDesc.replace("{channel}", channelName)}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-[#908fa0] text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            {t.rooms.loading}
          </div>
        ) : rooms.length > 0 ? (
          <div className="w-full flex flex-col gap-2">
            <p className="text-xs text-[#908fa0] mb-1">{t.voiceChannel.pickRoom}</p>
            {rooms.slice(0, 5).map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => onJoinRoom(room.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1b1b23] border border-[#292932] hover:border-indigo-500/40 hover:bg-[#1f1f27] text-left transition-all"
              >
                <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-sm text-white truncate flex-1">
                  {room.name || t.rooms.unnamed}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#908fa0]">{t.voiceChannel.createRoomHint}</p>
        )}

        <button
          type="button"
          onClick={onCreateRoom}
          disabled={creating}
          className="px-5 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {t.voiceChannel.createRoomBtn}
        </button>
      </div>
    </div>
  );
}
