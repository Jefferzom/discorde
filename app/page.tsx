"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ServerRail, { servers } from "@/components/ServerRail";
import ChannelSidebar from "@/components/ChannelSidebar";
import TopBar from "@/components/TopBar";
import CallStage from "@/components/CallStage";
import FloatingControls from "@/components/FloatingControls";
import PreJoinLobby from "@/components/PreJoinLobby";
import ChatDrawer from "@/components/ChatDrawer";
import TextChannelChat from "@/components/TextChannelChat";
import CreateChannelModal from "@/components/CreateChannelModal";
import SettingsModal from "@/components/SettingsModal";
import { AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useParticipantNotificationSounds } from "@/hooks/useParticipantNotificationSounds";
import { useChannelNavigation } from "@/hooks/useChannelNavigation";
import { useScreenShare } from "@/hooks/useScreenShare";
import { playNotificationSound } from "@/lib/notificationSounds";

export default function StreamSyncHub() {
  const router = useRouter();
  const { t } = useI18n();

  // Mídia Local
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);

  const {
    isScreenSharing,
    screenShareStream,
    screenShareMode,
    toggleScreenShare,
    stopScreenShare,
    changeScreenShareMode,
  } = useScreenShare();

  const [viewMode, setViewMode] = useState<"stage" | "grid">("stage");
  const [isDeafened, setIsDeafened] = useState(false);
  
  // Painéis & Modais
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  const {
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
  } = useChannelNavigation({
    isDeafened,
    localUserState: {
      isMicOn,
      isCameraOn,
      isScreenSharing,
    },
  });

  useParticipantNotificationSounds(participants);

  const localVideoStreamRef = useRef<MediaStream | null>(null);
  const toggleCamera = async () => {
    try {
      setMediaError(null);
      if (!isCameraOn) {
        console.log("[StreamSync] Solicitando permissão para câmera...");
        
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error("Seu navegador não suporta navigator.mediaDevices.getUserMedia.");
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
            audio: false,
          });
        } catch (constraintErr) {
          console.warn("[StreamSync] Fallback para constraints padrão:", constraintErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        console.log("[StreamSync] Câmera ativada!");
        setLocalVideoStream(stream);
        setIsCameraOn(true);
      } else {
        console.log("[StreamSync] Desligando câmera...");
        if (localVideoStreamRef.current) {
          localVideoStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        setLocalVideoStream(null);
        setIsCameraOn(false);
      }
    } catch (err: any) {
      console.error("[StreamSync] Erro ao acessar câmera:", err);
      let msg = t.errors.genericMediaError;
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        msg = t.errors.permissionDenied;
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        msg = t.errors.noCameraFound;
      } else if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
        msg = t.errors.cameraInUse;
      } else if (err?.message) {
        msg = err.message;
      }
      setMediaError(msg);
      setIsCameraOn(false);
    }
  };

  useEffect(() => {
    localVideoStreamRef.current = localVideoStream;
  }, [localVideoStream]);

  const toggleMic = () => {
    setIsMicOn((prev) => !prev);
  };

  // Cleanup de streams
  useEffect(() => {
    return () => {
      if (localVideoStreamRef.current) {
        localVideoStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  const currentServer = servers.find((s) => s.id === activeServerId) || servers[1];

  const handleCreateRoom = () => {
    const roomId = crypto.randomUUID();
    if (!isDeafened) playNotificationSound("roomSwitch");
    router.push(`/room/${roomId}`);
  };

  const handleSendReaction = (emoji: string) => {
    const newReaction = {
      id: Math.random().toString(),
      emoji,
      x: Math.floor(Math.random() * 40) + 30,
      y: 80,
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1800);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#13131b] text-[#e4e1ed] relative">
      {/* 1. Left Primary Server Rail */}
      <ServerRail
        activeServerId={activeServerId}
        onSelectServer={selectServer}
        onOpenCreateServer={handleCreateRoom}
      />

      {/* 2. Secondary Channel Sidebar */}
      <ChannelSidebar
        serverName={currentServer.name}
        activeChannelId={activeChannelId}
        connectedChannelId={connectedChannelId}
        onSelectChannel={selectChannel}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={!isMicOn}
        onToggleMute={toggleMic}
        isDeafened={isDeafened}
        onToggleDeafen={() => setIsDeafened(!isDeafened)}
        participants={participants}
      />

      {/* 3. Main Stage Content Area */}
      <main className="flex-1 ml-[312px] flex flex-col bg-[#13131b] relative min-w-0 h-screen overflow-hidden">
        {/* Top App Bar */}
        <div className="flex flex-col">
          <TopBar
            channelName={activeChannelId}
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

          {mediaError && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-1.5 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mediaError}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {channelType === "voice" ? (
            isInCall ? (
              <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                <CallStage
                  participants={participants}
                  viewMode={viewMode}
                  screenSharer={participants.find((p) => p.isScreenSharing)}
                  isMyScreenSharing={isScreenSharing}
                  activeSpeakerId="2"
                  reactions={reactions}
                  localVideoStream={localVideoStream}
                  screenShareStream={screenShareStream}
                  onStartScreenShare={toggleScreenShare}
                />

                <FloatingControls
                  isVideoOn={isCameraOn}
                  onToggleVideo={toggleCamera}
                  isMuted={!isMicOn}
                  onToggleMute={toggleMic}
                  isScreenSharing={isScreenSharing}
                  screenShareMode={screenShareMode}
                  onToggleScreenShare={toggleScreenShare}
                  onChangeScreenShareMode={changeScreenShareMode}
                  onLeaveCall={() => {
                    stopScreenShare();
                    if (localVideoStreamRef.current) {
                      localVideoStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                    }
                    setLocalVideoStream(null);
                    setIsCameraOn(false);
                    leaveCall();
                  }}
                  onSendReaction={handleSendReaction}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            ) : (
              <PreJoinLobby
                channelName={activeChannelId}
                onJoinCall={joinCall}
                participants={participants}
                isVideoOn={isCameraOn}
                onToggleVideo={toggleCamera}
                isMuted={!isMicOn}
                onToggleMute={toggleMic}
              />
            )
          ) : (
            <TextChannelChat
              key={activeChannelId}
              channelName={activeChannelId}
              serverName={currentServer.name}
            />
          )}

          {/* 4. Slide-in Chat / Member List Drawer */}
          <ChatDrawer
            isOpen={isChatOpen}
            showMemberList={isMemberListOpen}
            onClose={() => {
              setIsChatOpen(false);
              setIsMemberListOpen(false);
            }}
            channelName={activeChannelId}
            participants={participants}
          />
        </div>
      </main>

      {/* Modals */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={handleCreateRoom}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={!isMicOn}
        onToggleMute={toggleMic}
        isVideoOn={isCameraOn}
        onToggleVideo={toggleCamera}
      />
    </div>
  );
}
