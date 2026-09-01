"use client";

import React, { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ServerRail, { servers } from "@/components/ServerRail";
import ChannelSidebar from "@/components/ChannelSidebar";
import TopBar from "@/components/TopBar";
import CallStage from "@/components/CallStage";
import FloatingControls from "@/components/FloatingControls";
import PreJoinLobby from "@/components/PreJoinLobby";
import ChatDrawer from "@/components/ChatDrawer";
import CreateChannelModal from "@/components/CreateChannelModal";
import SettingsModal from "@/components/SettingsModal";
import { Participant, ChatMessage } from "@/types/streamsync";
import { Copy, Check, Radio, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface RoomPageProps {
  params: Promise<{ room_id: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const { t } = useI18n();
  const resolvedParams = use(params);
  const roomId = resolvedParams?.room_id;

  // 1. Estados de Mídia Local
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Streams de Mídia
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);

  // Refs de Streams para evitar stale closures e evitar cleanup indevido
  const localVideoStreamRef = useRef<MediaStream | null>(null);
  const screenShareStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    localVideoStreamRef.current = localVideoStream;
  }, [localVideoStream]);

  useEffect(() => {
    screenShareStreamRef.current = screenShareStream;
  }, [screenShareStream]);

  const [copied, setCopied] = useState(false);

  // 2. Validação do Room ID
  useEffect(() => {
    if (!roomId || typeof roomId !== "string" || roomId.trim().length === 0) {
      console.warn("[StreamSync] ID de sala inválido. Redirecionando para a Home...");
      router.replace("/");
      return;
    }

    console.log(`[StreamSync] Conectado com sucesso à sala: ${roomId}`);
  }, [roomId, router]);

  // 3. Captura e Alternância de Câmera (navigator.mediaDevices.getUserMedia)
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
          console.warn("[StreamSync] Fallback para constraints padrão de vídeo:", constraintErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        console.log("[StreamSync] Câmera ativada com sucesso!", stream.getVideoTracks()[0]?.label);
        setLocalVideoStream(stream);
        setIsCameraOn(true);
      } else {
        console.log("[StreamSync] Desligando câmera local...");
        if (localVideoStreamRef.current) {
          localVideoStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        setLocalVideoStream(null);
        setIsCameraOn(false);
      }
    } catch (err: any) {
      console.error("[StreamSync] Erro ao acessar a câmera:", err);
      let errorMsg = t.errors.genericMediaError;
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        errorMsg = t.errors.permissionDenied;
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        errorMsg = t.errors.noCameraFound;
      } else if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
        errorMsg = t.errors.cameraInUse;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setMediaError(errorMsg);
      setIsCameraOn(false);
    }
  };

  // 4. Captura e Alternância de Compartilhamento de Tela (navigator.mediaDevices.getDisplayMedia)
  const toggleScreenShare = async () => {
    try {
      setMediaError(null);
      if (!isScreenSharing) {
        console.log("[StreamSync] Iniciando captura de tela...");
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            console.log("[StreamSync] Compartilhamento encerrado via barra nativa.");
            stopScreenShare();
          };
        }

        setScreenShareStream(stream);
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.info("[StreamSync] Compartilhamento de tela cancelado ou não permitido:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    setScreenShareStream(null);
    setIsScreenSharing(false);
  };

  const toggleMic = () => {
    setIsMicOn((prev) => !prev);
  };

  // Cleanup de Streams ao desmontar a página
  useEffect(() => {
    return () => {
      if (localVideoStreamRef.current) {
        localVideoStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  // Estados de Interface
  const [activeServerId, setActiveServerId] = useState("gaming");
  const [activeChannelId, setActiveChannelId] = useState("voice-lounge");
  const [channelType, setChannelType] = useState<"text" | "voice" | "stage">("voice");
  
  const [isInCall, setIsInCall] = useState(true);
  const [viewMode, setViewMode] = useState<"stage" | "grid">("stage");
  const [isDeafened, setIsDeafened] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  // Participantes da Sala
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "Alex",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80",
      isYou: true,
      isSpeaking: false,
      isMuted: !isMicOn,
      isVideoOn: isCameraOn,
      isScreenSharing: isScreenSharing,
      volume: 100,
    },
    {
      id: "2",
      name: "Sarah",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: true,
      isMuted: false,
      isVideoOn: true,
      volume: 85,
      videoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=300&q=80",
    },
    {
      id: "3",
      name: "Mike",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: false,
      isMuted: true,
      isVideoOn: false,
      volume: 100,
    },
    {
      id: "4",
      name: "Emma",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: false,
      isMuted: false,
      isVideoOn: true,
      volume: 90,
      videoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=300&q=80",
    },
  ]);

  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.isYou
          ? {
              ...p,
              isMuted: !isMicOn,
              isVideoOn: isCameraOn,
              isScreenSharing: isScreenSharing,
            }
          : p
      )
    );
  }, [isMicOn, isCameraOn, isScreenSharing]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      user: "Sarah",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
      timestamp: "Just now",
      text: `Welcome to room: ${roomId} 🚀`,
    },
  ]);

  const handleCopyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      user: "Alex",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const currentServer = servers.find((s) => s.id === activeServerId) || servers[1];

  if (!roomId) return null;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#13131b] text-[#e4e1ed] relative">
      {/* 1. Primary Server Rail */}
      <ServerRail
        activeServerId={activeServerId}
        onSelectServer={(id) => setActiveServerId(id)}
        onOpenCreateServer={() => {
          const newRoomId = crypto.randomUUID();
          router.push(`/room/${newRoomId}`);
        }}
      />

      {/* 2. Secondary Channel Sidebar */}
      <ChannelSidebar
        serverName={currentServer.name}
        activeChannelId={activeChannelId}
        onSelectChannel={(id, type) => {
          setActiveChannelId(id);
          setChannelType(type);
        }}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={!isMicOn}
        onToggleMute={toggleMic}
        isDeafened={isDeafened}
        onToggleDeafen={() => setIsDeafened(!isDeafened)}
        participants={participants}
        isInCall={isInCall}
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

          {/* Banner de Confirmação da Sala */}
          <div className="bg-[#1b1b23] border-b border-[#292932] px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                <span>{t.common.roomId}: <strong>{roomId}</strong></span>
              </span>

              {isCameraOn && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ● {t.stage.cameraActive}
                </span>
              )}

              {isScreenSharing && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  ● {t.stage.screenActive}
                </span>
              )}
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

          {/* Banner de Erro de Permissão */}
          {mediaError && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-1.5 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mediaError}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {isInCall ? (
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
                onToggleScreenShare={toggleScreenShare}
                onLeaveCall={() => {
                  stopScreenShare();
                  if (localVideoStreamRef.current) {
                    localVideoStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                  }
                  router.push("/");
                }}
                onSendReaction={handleSendReaction}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          ) : (
            <PreJoinLobby
              channelName={activeChannelId}
              onJoinCall={() => setIsInCall(true)}
              participants={participants}
              isVideoOn={isCameraOn}
              onToggleVideo={toggleCamera}
              isMuted={!isMicOn}
              onToggleMute={toggleMic}
            />
          )}

          <ChatDrawer
            isOpen={isChatOpen}
            showMemberList={isMemberListOpen}
            onClose={() => {
              setIsChatOpen(false);
              setIsMemberListOpen(false);
            }}
            channelName={activeChannelId}
            messages={messages}
            onSendMessage={handleSendMessage}
            participants={participants}
          />
        </div>
      </main>

      {/* Modals */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={() => {
          const newRoomId = crypto.randomUUID();
          router.push(`/room/${newRoomId}`);
        }}
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
