import { useCallback, useEffect, useState } from "react";
import { Participant } from "@/types/streamsync";
import { ChannelType, getChannelParticipants, isVoiceChannel } from "@/lib/channelData";
import { playNotificationSound } from "@/lib/notificationSounds";

type LocalUserState = {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
};

interface UseChannelNavigationOptions {
  isDeafened: boolean;
  localUserState: LocalUserState;
  initialConnected?: boolean;
  initialChannelId?: string;
}

function getInitialChannelType(channelId: string): ChannelType {
  if (channelId === "stage-stream") return "stage";
  if (isVoiceChannel(channelId)) return "voice";
  return "text";
}

export function useChannelNavigation({
  isDeafened,
  localUserState,
  initialConnected = false,
  initialChannelId = "general",
}: UseChannelNavigationOptions) {
  const [activeServerId, setActiveServerId] = useState("gaming");
  const [activeChannelId, setActiveChannelId] = useState(initialChannelId);
  const [channelType, setChannelType] = useState<ChannelType>(() =>
    getInitialChannelType(initialChannelId)
  );
  const [connectedChannelId, setConnectedChannelId] = useState<string | null>(
    initialConnected ? initialChannelId : null
  );
  const [isInCall, setIsInCall] = useState(initialConnected);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const playSound = useCallback(
    (type: Parameters<typeof playNotificationSound>[0]) => {
      if (!isDeafened) {
        playNotificationSound(type);
      }
    },
    [isDeafened]
  );

  useEffect(() => {
    if (!connectedChannelId) {
      setParticipants([]);
      return;
    }

    setParticipants(getChannelParticipants(connectedChannelId, localUserState));
  }, [
    connectedChannelId,
    localUserState.isMicOn,
    localUserState.isCameraOn,
    localUserState.isScreenSharing,
  ]);

  const selectChannel = useCallback(
    (channelId: string, type: "text" | "voice") => {
      if (channelId === activeChannelId && type === channelType) return;

      const isConnected = connectedChannelId !== null;
      const isVoiceSwitch =
        isConnected &&
        type === "voice" &&
        isVoiceChannel(channelId) &&
        channelId !== connectedChannelId;

      if (isVoiceSwitch) {
        playSound("channelSwitch");
        setConnectedChannelId(channelId);
        setParticipants(getChannelParticipants(channelId, localUserState));
        setIsInCall(true);
      } else if (type === "voice" && !isConnected) {
        setIsInCall(false);
        setParticipants(getChannelParticipants(channelId, localUserState));
      }

      setActiveChannelId(channelId);
      setChannelType(type);
    },
    [
      activeChannelId,
      channelType,
      connectedChannelId,
      localUserState,
      playSound,
    ]
  );

  const selectServer = useCallback(
    (serverId: string) => {
      if (serverId === activeServerId) return;
      playSound("serverSwitch");
      setActiveServerId(serverId);
    },
    [activeServerId, playSound]
  );

  const joinCall = useCallback(() => {
    if (channelType !== "voice" || !isVoiceChannel(activeChannelId)) return;

    playSound("channelJoin");
    setConnectedChannelId(activeChannelId);
    setParticipants(getChannelParticipants(activeChannelId, localUserState));
    setIsInCall(true);
  }, [activeChannelId, channelType, localUserState, playSound]);

  const leaveCall = useCallback(() => {
    if (connectedChannelId) {
      playSound("channelLeave");
    }
    setConnectedChannelId(null);
    setIsInCall(false);
  }, [connectedChannelId, playSound]);

  return {
    activeServerId,
    activeChannelId,
    channelType,
    connectedChannelId,
    isInCall,
    participants,
    selectChannel,
    selectServer,
    joinCall,
    leaveCall,
  };
}
