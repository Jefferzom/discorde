"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { createRoom } from "@/lib/supabase/rooms";
import { saveRoomNameLocal } from "@/lib/roomStorage";
import {
  markIntentionalDisconnect,
  markIntentionalRoomNavigation,
  notifyRoomsUpdated,
} from "@/lib/roomEvents";
import { playNotificationSound } from "@/lib/notificationSounds";
import { canJoinVoiceRoom, getUserProfile } from "@/lib/userStorage";

interface UseRoomSessionActionsOptions {
  isDeafened?: boolean;
  onRoomCreated?: () => void | Promise<void>;
}

export function useRoomSessionActions({
  isDeafened = false,
  onRoomCreated,
}: UseRoomSessionActionsOptions = {}) {
  const router = useRouter();
  const { t } = useI18n();
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [pendingRoomAction, setPendingRoomAction] = useState<"create" | "join">(
    "create"
  );
  const creatingRef = useRef(false);

  const buildRoomName = (roomId: string) => {
    const userProfile = getUserProfile();
    if (!userProfile) return undefined;
    const shortId = roomId.slice(0, 6);
    return `${t.rooms.defaultName.replace("{user}", userProfile.username)} #${shortId}`;
  };

  const persistRoomAndNavigate = async (roomId: string) => {
    const userProfile = getUserProfile();
    const roomName = buildRoomName(roomId);

    if (roomName) {
      saveRoomNameLocal(roomId, roomName);
    }

    try {
      await createRoom({
        id: roomId,
        name: roomName,
        createdBy: userProfile?.username,
      });
      await onRoomCreated?.();
      notifyRoomsUpdated();
    } catch (err) {
      console.error("Erro ao salvar sala no Supabase:", err);
      return;
    }

    markIntentionalDisconnect();
    markIntentionalRoomNavigation();
    if (!isDeafened) playNotificationSound("roomSwitch");
    router.push(`/room/${roomId}`);
  };

  const handleCreateRoom = async () => {
    if (creatingRef.current) return;

    const roomId = crypto.randomUUID();

    if (!canJoinVoiceRoom()) {
      setPendingRoomId(roomId);
      setPendingRoomAction("create");
      return;
    }

    creatingRef.current = true;
    setCreatingRoom(true);
    try {
      await persistRoomAndNavigate(roomId);
    } finally {
      creatingRef.current = false;
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (!canJoinVoiceRoom()) {
      setPendingRoomId(roomId);
      setPendingRoomAction("join");
      return;
    }

    markIntentionalDisconnect();
    markIntentionalRoomNavigation();
    if (!isDeafened) playNotificationSound("channelJoin");
    router.push(`/room/${roomId}`);
  };

  const handleOnboardingRoomComplete = async () => {
    if (!pendingRoomId || !canJoinVoiceRoom()) return false;

    const roomId = pendingRoomId;
    const action = pendingRoomAction;
    setPendingRoomId(null);

    if (action === "create") {
      if (creatingRef.current) return true;
      creatingRef.current = true;
      setCreatingRoom(true);
      try {
        await persistRoomAndNavigate(roomId);
      } finally {
        creatingRef.current = false;
        setCreatingRoom(false);
      }
      return true;
    }

    markIntentionalDisconnect();
    markIntentionalRoomNavigation();
    if (!isDeafened) playNotificationSound("channelJoin");
    router.push(`/room/${roomId}`);
    return true;
  };

  return {
    creatingRoom,
    pendingRoomId,
    handleCreateRoom,
    handleJoinRoom,
    handleOnboardingRoomComplete,
  };
}
