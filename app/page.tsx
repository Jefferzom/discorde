"use client";

import React, { useState } from "react";
import ServerRail, { servers } from "@/components/ServerRail";
import ChannelSidebar from "@/components/ChannelSidebar";
import TopBar from "@/components/TopBar";
import UserOnboardingModal from "@/components/UserOnboardingModal";
import ChatDrawer from "@/components/ChatDrawer";
import TextChannelChat from "@/components/TextChannelChat";
import VoiceChannelIdle from "@/components/VoiceChannelIdle";
import CreateChannelModal from "@/components/CreateChannelModal";
import SettingsModal from "@/components/SettingsModal";
import { useParticipantNotificationSounds } from "@/hooks/useParticipantNotificationSounds";
import { useChannelNavigation } from "@/hooks/useChannelNavigation";
import { useRoomSessionActions } from "@/hooks/useRoomSessionActions";
import { useActiveRooms } from "@/hooks/useActiveRooms";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useI18n } from "@/lib/i18n/context";
import { getChannelDisplayName } from "@/lib/channelNames";
import { canJoinVoiceRoom } from "@/lib/userStorage";

export default function StreamSyncHub() {
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

  const {
    creatingRoom,
    handleCreateRoom,
    handleJoinRoom,
    handleOnboardingRoomComplete,
  } = useRoomSessionActions({ isDeafened });

  const { rooms, loading: roomsLoading } = useActiveRooms();

  const {
    activeServerId,
    activeChannelId,
    channelType,
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

  const handleOnboardingComplete = async () => {
    await handleOnboardingRoomComplete();
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
        connectedChannelId={null}
        onSelectChannel={selectChannel}
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
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
        creatingRoom={creatingRoom}
      />

      <main className="flex-1 ml-[312px] flex flex-col bg-[#13131b] relative min-w-0 h-screen overflow-hidden">
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

        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {channelType === "voice" ? (
            <VoiceChannelIdle
              channelName={channelDisplayName}
              rooms={rooms}
              loading={roomsLoading}
              creating={creatingRoom}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
            />
          ) : (
            <TextChannelChat
              key={activeChannelId}
              channelId={activeChannelId}
              channelName={channelDisplayName}
              serverName={currentServer.name}
              currentUser={
                mounted && profile
                  ? { name: profile.username, avatar: profile.avatarUrl }
                  : undefined
              }
            />
          )}

          <ChatDrawer
            isOpen={isChatOpen}
            showMemberList={isMemberListOpen}
            onClose={() => {
              setIsChatOpen(false);
              setIsMemberListOpen(false);
            }}
            channelId={activeChannelId}
            channelName={channelDisplayName}
            participants={participants}
            currentUser={
              mounted && profile
                ? { name: profile.username, avatar: profile.avatarUrl }
                : undefined
            }
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
