"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ServerRail, { servers } from "@/components/ServerRail";
import ChannelSidebar from "@/components/ChannelSidebar";
import TopBar from "@/components/TopBar";
import UserOnboardingModal from "@/components/UserOnboardingModal";
import ChatDrawer from "@/components/ChatDrawer";
import TextChannelChat from "@/components/TextChannelChat";
import CreateChannelModal from "@/components/CreateChannelModal";
import SettingsModal from "@/components/SettingsModal";
import { useParticipantNotificationSounds } from "@/hooks/useParticipantNotificationSounds";
import { useChannelNavigation } from "@/hooks/useChannelNavigation";
import { playNotificationSound } from "@/lib/notificationSounds";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useI18n } from "@/lib/i18n/context";
import { getChannelDisplayName } from "@/lib/channelNames";
import { canJoinVoiceRoom, getVoiceChannelRoomId } from "@/lib/userStorage";

export default function StreamSyncHub() {
  const router = useRouter();
  const { t } = useI18n();
  const profile = useUserProfile();
  const mounted = useHasMounted();

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [viewMode, setViewMode] = useState<"stage" | "grid">("stage");
  const [isDeafened, setIsDeafened] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingVoiceChannel, setPendingVoiceChannel] = useState<string | null>(
    null
  );

  const {
    activeServerId,
    activeChannelId,
    channelType,
    connectedChannelId,
    participants,
    selectChannel,
    selectServer,
  } = useChannelNavigation({
    isDeafened,
    localUserState: {
      isMicOn,
      isCameraOn,
      isScreenSharing: false,
    },
  });

  useParticipantNotificationSounds(participants);

  const currentServer = servers.find((s) => s.id === activeServerId) || servers[1];
  const channelDisplayName = getChannelDisplayName(activeChannelId, t);

  const joinVoiceChannel = (channelId: string) => {
    if (!canJoinVoiceRoom()) {
      setPendingVoiceChannel(channelId);
      return;
    }

    if (!isDeafened) playNotificationSound("channelJoin");
    router.push(`/room/${getVoiceChannelRoomId(channelId)}`);
  };

  const handleSelectChannel = (channelId: string, type: "text" | "voice") => {
    if (type === "voice") {
      joinVoiceChannel(channelId);
      return;
    }
    selectChannel(channelId, type);
  };

  const handleCreateRoom = () => {
    const roomId = crypto.randomUUID();
    if (!isDeafened) playNotificationSound("roomSwitch");
    router.push(`/room/${roomId}`);
  };

  const handleOnboardingComplete = () => {
    if (pendingVoiceChannel && canJoinVoiceRoom()) {
      const channelId = pendingVoiceChannel;
      setPendingVoiceChannel(null);
      if (!isDeafened) playNotificationSound("channelJoin");
      router.push(`/room/${getVoiceChannelRoomId(channelId)}`);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#13131b] text-[#e4e1ed] relative">
      <UserOnboardingModal
        open={mounted && !canJoinVoiceRoom()}
        onComplete={handleOnboardingComplete}
      />

      <ServerRail
        activeServerId={activeServerId}
        onSelectServer={selectServer}
        onOpenCreateServer={handleCreateRoom}
      />

      <ChannelSidebar
        serverName={currentServer.name}
        activeChannelId={activeChannelId}
        connectedChannelId={connectedChannelId}
        onSelectChannel={handleSelectChannel}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={!isMicOn}
        onToggleMute={() => setIsMicOn((prev) => !prev)}
        isDeafened={isDeafened}
        onToggleDeafen={() => setIsDeafened(!isDeafened)}
        participants={participants}
        localUser={
          mounted && profile
            ? { name: profile.username, avatar: profile.avatarUrl }
            : undefined
        }
      />

      <main className="flex-1 ml-[384px] flex flex-col bg-[#13131b] relative min-w-0 h-screen overflow-hidden">
        <div className="flex flex-col">
          <TopBar
            channelName={channelDisplayName}
            channelType={channelType}
            viewMode={viewMode}
            onToggleViewMode={() =>
              setViewMode(viewMode === "stage" ? "grid" : "stage")
            }
            isChatOpen={isChatOpen}
            onToggleChat={() => {
              setIsChatOpen(!isChatOpen);
              if (isMemberListOpen) setIsMemberListOpen(false);
            }}
            isMemberListOpen={isMemberListOpen}
            onToggleMemberList={() => {
              setIsMemberListOpen(!isMemberListOpen);
              if (isChatOpen) setIsChatOpen(false);
            }}
            isInCall={false}
          />
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <TextChannelChat
            key={activeChannelId}
            channelName={channelDisplayName}
            serverName={currentServer.name}
          />

          <ChatDrawer
            isOpen={isChatOpen}
            showMemberList={isMemberListOpen}
            onClose={() => {
              setIsChatOpen(false);
              setIsMemberListOpen(false);
            }}
            channelName={channelDisplayName}
            participants={participants}
          />
        </div>
      </main>

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={handleCreateRoom}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={!isMicOn}
        onToggleMute={() => setIsMicOn((prev) => !prev)}
        isVideoOn={isCameraOn}
        onToggleVideo={() => setIsCameraOn((prev) => !prev)}
      />
    </div>
  );
}
