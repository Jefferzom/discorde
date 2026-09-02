"use client";

import { useState, type MouseEvent } from "react";
import { Loader2, Plus, RefreshCw, Volume2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { RoomRecord } from "@/lib/supabase/rooms";
import type { Participant } from "@/types/streamsync";
import { useRoomManagement } from "@/hooks/useRoomManagement";
import RoomContextMenu from "@/components/RoomContextMenu";
import RenameRoomModal from "@/components/RenameRoomModal";
import DeleteRoomModal from "@/components/DeleteRoomModal";
import SidebarParticipant from "@/components/SidebarParticipant";

interface VoiceRoomsListProps {
  rooms: RoomRecord[];
  loading: boolean;
  error: string | null;
  currentRoomId?: string | null;
  participants?: Participant[];
  creating?: boolean;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  onRefresh: () => void;
}

export default function VoiceRoomsList({
  rooms,
  loading,
  error,
  currentRoomId,
  participants = [],
  creating = false,
  onJoinRoom,
  onCreateRoom,
  onRefresh,
}: VoiceRoomsListProps) {
  const { t } = useI18n();
  const {
    renameRoom,
    removeRoom,
    isRoomOccupiedError,
    isCurrentRoomError,
  } = useRoomManagement(currentRoomId);

  const [contextMenu, setContextMenu] = useState<{
    room: RoomRecord;
    x: number;
    y: number;
  } | null>(null);
  const [renamingRoom, setRenamingRoom] = useState<RoomRecord | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<RoomRecord | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [savingRename, setSavingRename] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleContextMenu = (event: MouseEvent, room: RoomRecord) => {
    event.preventDefault();
    event.stopPropagation();
    setActionError(null);
    setContextMenu({ room, x: event.clientX, y: event.clientY });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoom) return;

    setDeleteError(null);
    setDeleting(true);

    try {
      await removeRoom(deletingRoom.id);
      setDeletingRoom(null);
    } catch (err) {
      if (isCurrentRoomError(err)) {
        setDeleteError(t.rooms.cannotDeleteCurrent);
      } else if (isRoomOccupiedError(err)) {
        setDeleteError(t.rooms.cannotDeleteOccupied);
      } else {
        setDeleteError(
          err instanceof Error ? err.message : t.rooms.deleteError
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleRenameSave = async (name: string) => {
    if (!renamingRoom) return;

    setRenameError(null);
    setSavingRename(true);

    try {
      await renameRoom(renamingRoom.id, name);
      setRenamingRoom(null);
    } catch (err) {
      setRenameError(
        err instanceof Error ? err.message : t.rooms.renameError
      );
    } finally {
      setSavingRename(false);
    }
  };

  return (
    <>
      <div className="pl-2 pr-1 py-1 flex flex-col gap-0.5">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6a78]">
            {t.rooms.activeTitle}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-1 rounded-md text-[#908fa0] hover:text-white hover:bg-[#292932] transition-colors disabled:opacity-50"
              title={t.rooms.refresh}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onCreateRoom}
              disabled={creating}
              className="p-1 rounded-md text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
              title={t.rooms.createNew}
            >
              {creating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="px-2 text-[10px] text-red-400 leading-tight">
            {t.rooms.loadError}
          </p>
        )}

        {actionError && (
          <p className="px-2 text-[10px] text-red-400 leading-tight">{actionError}</p>
        )}

        {loading && rooms.length === 0 ? (
          <div className="flex items-center gap-2 px-2 py-1.5 text-[#908fa0]">
            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            <span className="text-[11px]">{t.rooms.loading}</span>
          </div>
        ) : rooms.length === 0 ? (
          <button
            type="button"
            onClick={onCreateRoom}
            disabled={creating}
            className="mx-1 px-2 py-1.5 rounded-md text-[11px] text-indigo-300 hover:bg-indigo-500/10 border border-dashed border-indigo-500/25 transition-colors text-left"
          >
            {t.rooms.createNew}
          </button>
        ) : (
          rooms.map((room) => {
            const isActive = currentRoomId === room.id;

            return (
              <div key={room.id} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => onJoinRoom(room.id)}
                  onContextMenu={(event) => handleContextMenu(event, room)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors w-full text-left group ${
                    isActive
                      ? "bg-[#34343d] text-white"
                      : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
                  }`}
                  title={room.name || room.id}
                >
                  <Volume2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive
                        ? "text-emerald-400"
                        : "text-[#908fa0] group-hover:text-[#adc6ff]"
                    }`}
                  />
                  <span className="truncate flex-1">
                    {room.name || t.rooms.unnamed}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>

                {isActive && participants.length > 0 && (
                  <div className="pl-4 pr-1 pb-1 flex flex-col gap-0.5">
                    {participants.map((participant) => (
                      <SidebarParticipant
                        key={participant.id}
                        participant={participant}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {contextMenu && (
        <RoomContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={() => {
            setRenameError(null);
            setRenamingRoom(contextMenu.room);
          }}
          onDelete={() => {
            setDeleteError(null);
            setDeletingRoom(contextMenu.room);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      <RenameRoomModal
        open={Boolean(renamingRoom)}
        initialName={renamingRoom?.name ?? ""}
        saving={savingRename}
        error={renameError}
        onClose={() => {
          setRenamingRoom(null);
          setRenameError(null);
        }}
        onSave={handleRenameSave}
      />

      <DeleteRoomModal
        open={Boolean(deletingRoom)}
        roomName={deletingRoom?.name || deletingRoom?.id || ""}
        deleting={deleting}
        error={deleteError}
        onClose={() => {
          if (deleting) return;
          setDeletingRoom(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
