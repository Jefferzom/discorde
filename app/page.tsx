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
import CreateChannelModal from "@/components/CreateChannelModal";
import SettingsModal from "@/components/SettingsModal";
import { Participant, ChatMessage } from "@/types/streamsync";
import { Hash, Send, Smile, Paperclip, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function StreamSyncHub() {
  const router = useRouter();
  const { t } = useI18n();
  const [activeServerId, setActiveServerId] = useState("gaming");
  const [activeChannelId, setActiveChannelId] = useState("voice-lounge");
  const [channelType, setChannelType] = useState<"text" | "voice" | "stage">("voice");
  
  // Mídia Local
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);

  // Estados de Chamada
  const [isInCall, setIsInCall] = useState(true);
  const [viewMode, setViewMode] = useState<"stage" | "grid">("stage");
  const [isDeafened, setIsDeafened] = useState(false);
  
  // Painéis & Modais
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  // 1. Captura e Alternância de Câmera
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

  // 2. Captura e Alternância de Compartilhamento de Tela
  const toggleScreenShare = async () => {
    try {
      setMediaError(null);
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            stopScreenShare();
          };
        }

        setScreenShareStream(stream);
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.info("[StreamSync] Compartilhamento de tela cancelado:", err);
    }
  };

  // Refs de Streams
  const localVideoStreamRef = useRef<MediaStream | null>(null);
  const screenShareStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    localVideoStreamRef.current = localVideoStream;
  }, [localVideoStream]);

  useEffect(() => {
    screenShareStreamRef.current = screenShareStream;
  }, [screenShareStream]);

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

  // Cleanup de streams
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

  // Participantes
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
      timestamp: "Today at 6:12 PM",
      text: "Hey everyone! The stream latency on 1080p60 is super smooth 🔥",
    },
    {
      id: "m2",
      user: "Mike",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&h=160&q=80",
      timestamp: "Today at 6:14 PM",
      text: "Can you scroll down on the React component? Wanted to see the peer mesh connection.",
    },
  ]);

  const [textChannelInput, setTextChannelInput] = useState("");

  const handleCreateRoom = () => {
    const roomId = crypto.randomUUID();
    console.log(`[StreamSync] Criando nova sala com ID: ${roomId}`);
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

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      user: "Alex",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80",
      timestamp: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const currentServer = servers.find((s) => s.id === activeServerId) || servers[1];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#13131b] text-[#e4e1ed] relative">
      {/* 1. Left Primary Server Rail */}
      <ServerRail
        activeServerId={activeServerId}
        onSelectServer={(id) => setActiveServerId(id)}
        onOpenCreateServer={handleCreateRoom}
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
                  onToggleScreenShare={toggleScreenShare}
                  onLeaveCall={() => {
                    stopScreenShare();
                    if (localVideoStreamRef.current) {
                      localVideoStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                    }
                    setIsInCall(false);
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
            )
          ) : (
            /* TEXT CHANNEL VIEW */
            <div className="flex-1 flex flex-col bg-[#1f1f27] h-full overflow-hidden">
              <div className="p-6 border-b border-[#292932] flex items-center gap-4 bg-[#1b1b23]/50">
                <div className="w-14 h-14 rounded-2xl bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#6366f1]">
                  <Hash className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {t.chat.welcomeTitle} #{activeChannelId}!
                  </h3>
                  <p className="text-xs text-[#908fa0]">
                    {t.chat.welcomeDesc} {currentServer.name}.
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
                {messages.map((m) => (
                  <div key={m.id} className="flex items-start gap-4 group hover:bg-[#13131b]/30 p-2 rounded-xl transition-colors">
                    <img
                      src={m.avatar}
                      alt={m.user}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white hover:underline cursor-pointer">
                          {m.user}
                        </span>
                        <span className="text-[11px] text-[#908fa0]">
                          {m.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-[#e4e1ed] mt-1 leading-relaxed">
                        {m.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#1b1b23] border-t border-[#292932]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!textChannelInput.trim()) return;
                    handleSendMessage(textChannelInput);
                    setTextChannelInput("");
                  }}
                  className="flex items-center bg-[#13131b] border border-[#292932] rounded-2xl px-4 py-2.5 focus-within:border-[#6366f1] transition-colors"
                >
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-[#908fa0] hover:text-white hover:bg-[#292932] transition-colors mr-2"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`${t.chat.messagePlaceholder} #${activeChannelId}...`}
                    value={textChannelInput}
                    onChange={(e) => setTextChannelInput(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-[#e4e1ed] placeholder:text-[#908fa0] focus:outline-none"
                  />

                  <div className="flex items-center gap-2 text-[#908fa0]">
                    <button
                      type="button"
                      onClick={() => setTextChannelInput((prev) => prev + " 🔥")}
                      className="p-1.5 hover:text-white transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!textChannelInput.trim()}
                      className={`p-2 rounded-xl transition-all ${
                        textChannelInput.trim()
                          ? "bg-[#6366f1] text-white hover:bg-[#8083ff]"
                          : "text-[#464554] cursor-not-allowed"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
