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
import { Copy, Check, Radio, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useParticipantNotificationSounds } from "@/hooks/useParticipantNotificationSounds";
import { useChannelNavigation } from "@/hooks/useChannelNavigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useLiveKitMappedParticipants } from "@/hooks/useLiveKitMappedParticipants";
import { playNotificationSound } from "@/lib/notificationSounds";
import { getChannelDisplayName } from "@/lib/channelNames";
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
}

function RoomConnectedLayout({ profile, roomId }: RoomConnectedLayoutProps) {
  const { t } = useI18n();
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
    initialChannelId: roomId,
  });

  useParticipantNotificationSounds(participants);

  const channelDisplayName = getChannelDisplayName(roomId, t);

  const handleCopyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentServer = servers.find((s) => s.id === activeServerId) || servers[1];

  return (
    <>
      <ChannelSidebar
        serverName={currentServer.name}
        activeChannelId={activeChannelId}
        connectedChannelId={connectedChannelId}
        onSelectChannel={selectChannel}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={!isMicOn}
        onToggleMute={() => setIsMicOn((prev) => !prev)}
        isDeafened={isDeafened}
        onToggleDeafen={() => setIsDeafened(!isDeafened)}
        participants={participants}
        localUser={{ name: profile.username, avatar: profile.avatarUrl }}
      />

      <main className="flex-1 ml-[311px] flex flex-col bg-[#13131b] relative min-w-0 h-full overflow-hidden">
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

          <div className="bg-[#1b1b23] border-b border-[#292932] px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                <span>
                  {t.common.roomId}: <strong>{roomId}</strong>
                </span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ● LiveKit
              </span>
            </div>

            <button
              onClick={handleCopyRoomLink}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#292932] hover:bg-[#34343d] text-[#c7c4d7] hover:text-white transition-colors"
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
            channelName={channelDisplayName}
            participants={participants}
          />
        </div>
      </main>

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={() => {
          const newRoomId = crypto.randomUUID();
          window.location.href = `/room/${newRoomId}`;
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={!isMicOn}
        onToggleMute={() => setIsMicOn((prev) => !prev)}
        isVideoOn={isCameraOn}
        onToggleVideo={() => setIsCameraOn((prev) => !prev)}
      />
    </>
  );
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomId = resolvedParams?.room_id;
  const profile = useUserProfile();
  const mounted = useHasMounted();

  const prevRoomIdRef = useRef<string | null>(null);
  const [isDeafened] = useState(false);

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

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!roomId) return null;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#13131b] text-[#e4e1ed] relative">
      <UserOnboardingModal open={mounted && !canJoinVoiceRoom()} />

      <ServerRail
        activeServerId="gaming"
        onSelectServer={() => {}}
        onOpenCreateServer={() => router.push(`/room/${crypto.randomUUID()}`)}
      />

      <div className="flex-1 ml-[72px] flex min-w-0 h-screen">
        {mounted && canJoinVoiceRoom() && profile && livekitUrl ? (
          <LiveKitRoomSession
            roomId={roomId}
            livekitUrl={livekitUrl}
            participantName={profile.username}
            onDisconnected={() => router.push("/")}
          >
            <RoomConnectedLayout profile={profile} roomId={roomId} />
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
