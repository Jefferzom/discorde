"use client";

import "@livekit/components-styles";
import React, { use, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ServerRail, { servers } from "@/components/ServerRail";
import ChannelSidebar from "@/components/ChannelSidebar";
import TopBar from "@/components/TopBar";
import ChatDrawer from "@/components/ChatDrawer";
import CreateChannelModal from "@/components/CreateChannelModal";
import SettingsModal from "@/components/SettingsModal";
import UserOnboardingModal from "@/components/UserOnboardingModal";
import CustomRoomLayout from "@/components/CustomRoomLayout";
import PreJoinLobby, { type JoinMediaPrefs } from "@/components/PreJoinLobby";
import LeaveCallModal from "@/components/LeaveCallModal";
import { getLeaveWarning, type LeaveWarning } from "@/lib/leaveCall";
import { Copy, Check, Radio, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useParticipantNotificationSounds } from "@/hooks/useParticipantNotificationSounds";
import { useChannelNavigation } from "@/hooks/useChannelNavigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useLiveKitMappedParticipants } from "@/hooks/useLiveKitMappedParticipants";
import { playNotificationSound } from "@/lib/notificationSounds";
import { getRoomDisplayName } from "@/lib/roomStorage";
import { useRoomSessionActions } from "@/hooks/useRoomSessionActions";
import { useRoomContext } from "@livekit/components-react";
import {
  clearIntentionalRoomNavigation,
  consumeIntentionalRoomNavigation,
  markIntentionalDisconnect,
} from "@/lib/roomEvents";
import { canJoinVoiceRoom, type UserProfile } from "@/lib/userStorage";

const LiveKitRoomSession = dynamic(
  () => import("@/components/LiveKitRoomSession"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#13131b]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin" />
          <p className="text-[#c7c4d7] font-medium">Conectando...</p>
        </div>
      </div>
    ),
  }
);

interface RoomPageProps {
  params: Promise<{ room_id: string }>;
}

interface RoomConnectedLayoutProps {
  profile: UserProfile;
  roomId: string;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  creatingRoom?: boolean;
}

function RoomConnectedLayout({
  profile,
  roomId,
  onJoinRoom,
  onCreateRoom,
  creatingRoom = false,
}: RoomConnectedLayoutProps) {
  const { t } = useI18n();
  const router = useRouter();
  const room = useRoomContext();
  const participants = useLiveKitMappedParticipants(profile);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [viewMode, setViewMode] = useState<"stage" | "grid">("stage");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [leaveWarning, setLeaveWarning] = useState<LeaveWarning | null>(null);

  const {
    activeServerId,
    activeChannelId,
    channelType,
    connectedChannelId,
    isInCall,
    selectChannel,
    selectServer,
  } = useChannelNavigation({
    isDeafened,
    localUserState: {
      isMicOn,
      isCameraOn,
      isScreenSharing: false,
    },
    initialConnected: true,
    initialChannelId: "voice-lounge",
  });

  useParticipantNotificationSounds(participants);

  const channelDisplayName = getRoomDisplayName(roomId, t.rooms.unnamed);

  const handleCopyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmDisconnect = async () => {
    setLeaveWarning(null);
    markIntentionalDisconnect();
    clearIntentionalRoomNavigation();
    await room.disconnect(true);
    router.push("/");
  };

  const handleDisconnectVoice = async () => {
    const warning = getLeaveWarning(room);
    if (warning) {
      setLeaveWarning(warning);
      return;
    }
    await confirmDisconnect();
  };

  const currentServer = servers.find((s) => s.id === activeServerId) || servers[1];

  return (
    <>
      <ChannelSidebar
        serverName={currentServer.name}
        activeChannelId="voice-lounge"
        connectedChannelId="voice-lounge"
        onSelectChannel={selectChannel}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={!isMicOn}
        onToggleMute={() => setIsMicOn((prev) => !prev)}
        isDeafened={isDeafened}
        onToggleDeafen={() => setIsDeafened(!isDeafened)}
        participants={participants}
        localUser={{ name: profile.username, avatar: profile.avatarUrl }}
        currentRoomId={roomId}
        onJoinRoom={onJoinRoom}
        onCreateRoom={onCreateRoom}
        creatingRoom={creatingRoom}
        onDisconnectVoice={handleDisconnectVoice}
      />

      <main className="flex-1 ml-[240px] flex flex-col bg-[#13131b] relative min-w-0 h-full overflow-hidden">
        <div className="flex flex-col shrink-0">
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
            isInCall={isInCall}
          />

          <div className="bg-[#1b1b23] border-b border-[#292932] px-4 py-2 flex items-center justify-between gap-3 text-xs min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 min-w-0 max-w-full"
                title={`${t.common.roomId}: ${roomId}`}
              >
                <Radio className="w-3 h-3 text-indigo-400 animate-pulse shrink-0" />
                <span className="truncate">
                  {t.common.roomId}: <strong>{roomId}</strong>
                </span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ● LiveKit
              </span>
            </div>

            <button
              onClick={handleCopyRoomLink}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#292932] hover:bg-[#34343d] text-[#c7c4d7] hover:text-white transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">{t.common.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.common.copyLink}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative min-h-0">
          <CustomRoomLayout />

          <ChatDrawer
            isOpen={isChatOpen}
            showMemberList={isMemberListOpen}
            onClose={() => {
              setIsChatOpen(false);
              setIsMemberListOpen(false);
            }}
            channelId="voice-lounge"
            channelName={channelDisplayName}
            participants={participants}
            currentUser={{ name: profile.username, avatar: profile.avatarUrl }}
          />
        </div>
      </main>

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={onCreateRoom}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={!isMicOn}
        onToggleMute={() => setIsMicOn((prev) => !prev)}
        isVideoOn={isCameraOn}
        onToggleVideo={() => setIsCameraOn((prev) => !prev)}
      />

      {leaveWarning && (
        <LeaveCallModal
          warning={leaveWarning}
          onStay={() => setLeaveWarning(null)}
          onConfirm={() => void confirmDisconnect()}
        />
      )}
    </>
  );
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const { t } = useI18n();
  const resolvedParams = use(params);
  const roomId = resolvedParams?.room_id;
  const profile = useUserProfile();
  const mounted = useHasMounted();

  const prevRoomIdRef = useRef<string | null>(null);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [joinPrefsByRoom, setJoinPrefsByRoom] = useState<
    Record<string, JoinMediaPrefs>
  >({});
  const [lobbySettingsOpen, setLobbySettingsOpen] = useState(false);
  const {
    creatingRoom,
    handleCreateRoom,
    handleJoinRoom,
    handleOnboardingRoomComplete,
  } = useRoomSessionActions({ isDeafened });

  useEffect(() => {
    if (!roomId || typeof roomId !== "string" || roomId.trim().length === 0) {
      router.replace("/");
      return;
    }

    if (prevRoomIdRef.current && prevRoomIdRef.current !== roomId && !isDeafened) {
      playNotificationSound("roomSwitch");
    } else if (!prevRoomIdRef.current && !isDeafened) {
      playNotificationSound("roomSwitch");
    }

    prevRoomIdRef.current = roomId;
  }, [roomId, router, isDeafened]);

  const joinPrefs = roomId ? joinPrefsByRoom[roomId] ?? null : null;

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!roomId) return null;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#13131b] text-[#e4e1ed] relative">
      <UserOnboardingModal
        open={mounted && !canJoinVoiceRoom()}
        onComplete={handleOnboardingRoomComplete}
      />

      <ServerRail
        activeServerId="gaming"
        onSelectServer={() => {}}
        onOpenCreateServer={handleCreateRoom}
      />

      <div className="flex-1 ml-[72px] flex min-w-0 h-screen">
        {mounted && canJoinVoiceRoom() && profile && livekitUrl && !joinPrefs ? (
          <>
            <ChannelSidebar
              serverName={servers[1]?.name ?? "StreamSync"}
              activeChannelId="voice-lounge"
              connectedChannelId={null}
              onSelectChannel={() => {}}
              onOpenCreateChannel={handleCreateRoom}
              onOpenSettings={() => setLobbySettingsOpen(true)}
              isMuted={!isMicOn}
              onToggleMute={() => setIsMicOn((prev) => !prev)}
              isDeafened={isDeafened}
              onToggleDeafen={() => setIsDeafened((prev) => !prev)}
              participants={[]}
              localUser={{ name: profile.username, avatar: profile.avatarUrl }}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={handleCreateRoom}
              creatingRoom={creatingRoom}
            />
            <main className="flex-1 ml-[240px] flex flex-col bg-[#13131b] min-w-0 h-full overflow-hidden">
              <TopBar
                channelName={getRoomDisplayName(roomId, t.rooms.unnamed)}
                channelType="voice"
                viewMode="stage"
                onToggleViewMode={() => {}}
                isChatOpen={false}
                onToggleChat={() => {}}
                isMemberListOpen={false}
                onToggleMemberList={() => {}}
                isInCall={false}
              />
              <PreJoinLobby
                channelName={getRoomDisplayName(roomId, t.rooms.unnamed)}
                roomId={roomId}
                displayName={profile.username}
                avatarUrl={profile.avatarUrl}
                onJoin={(prefs) =>
                  setJoinPrefsByRoom((prev) =>
                    roomId ? { ...prev, [roomId]: prefs } : prev
                  )
                }
                onBack={() => router.push("/")}
              />
            </main>
            <SettingsModal
              isOpen={lobbySettingsOpen}
              onClose={() => setLobbySettingsOpen(false)}
              isMuted={!isMicOn}
              onToggleMute={() => setIsMicOn((prev) => !prev)}
              isVideoOn={isCameraOn}
              onToggleVideo={() => setIsCameraOn((prev) => !prev)}
            />
          </>
        ) : mounted && canJoinVoiceRoom() && profile && livekitUrl && joinPrefs ? (
          <LiveKitRoomSession
            key={roomId}
            roomId={roomId}
            livekitUrl={livekitUrl}
            participantName={profile.username}
            audio={joinPrefs.audio}
            video={joinPrefs.video}
            onDisconnected={() => {
              if (consumeIntentionalRoomNavigation()) return;
              router.push("/");
            }}
          >
            <RoomConnectedLayout
              profile={profile}
              roomId={roomId}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={handleCreateRoom}
              creatingRoom={creatingRoom}
            />
          </LiveKitRoomSession>
        ) : mounted && canJoinVoiceRoom() && profile && !livekitUrl ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-red-400">
              NEXT_PUBLIC_LIVEKIT_URL não configurada.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
