"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Maximize2,
  Minimize2,
  ExternalLink,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sliders,
  Sparkles,
  ScreenShare,
  Pin,
  PinOff
} from "lucide-react";
import { Participant } from "../types/streamsync";
import { useI18n } from "@/lib/i18n/context";

interface CallStageProps {
  participants: Participant[];
  viewMode: "stage" | "grid";
  screenSharer?: Participant;
  isMyScreenSharing: boolean;
  activeSpeakerId: string;
  reactions: { id: string; emoji: string; x: number; y: number }[];
  localVideoStream?: MediaStream | null;
  screenShareStream?: MediaStream | null;
  onStartScreenShare?: () => void;
}

// Componente dedicado para reprodução confiável de MediaStream
export function VideoStreamPlayer({
  stream,
  muted = true,
  className = "",
}: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream) {
      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }
      videoEl.play().catch((err) => {
        console.info("[StreamSync] Video play notification:", err);
      });
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
}

export default function CallStage({
  participants,
  viewMode,
  screenSharer,
  isMyScreenSharing,
  activeSpeakerId,
  reactions,
  localVideoStream,
  screenShareStream,
  onStartScreenShare,
}: CallStageProps) {
  const { t } = useI18n();
  const [fullscreenStage, setFullscreenStage] = useState(false);
  const [selectedUserForVolume, setSelectedUserForVolume] = useState<string | null>(null);
  
  // 🎯 Estado de Foco / Spotlight: ID do item focado no centro (ex: 'screen-share' ou ID do participante '1', '2', etc.)
  const [focusedId, setFocusedId] = useState<string>("screen-share");

  const [userVolumes, setUserVolumes] = useState<Record<string, number>>({
    "1": 100,
    "2": 85,
    "3": 100,
    "4": 90,
  });

  const handleVolumeChange = (userId: string, val: number) => {
    setUserVolumes((prev) => ({ ...prev, [userId]: val }));
  };

  // Se o compartilhamento de tela começar, prioriza o foco nele
  useEffect(() => {
    if (isMyScreenSharing && screenShareStream) {
      setFocusedId("screen-share");
    }
  }, [isMyScreenSharing, screenShareStream]);

  const focusedParticipant = participants.find((p) => p.id === focusedId);
  const isScreenShareFocused = focusedId === "screen-share";

  const isScreenAvailable = isMyScreenSharing || true;
  const showScreenInThumbnails = !isScreenShareFocused && isScreenAvailable;
  const otherParticipants = participants.filter((p) => p.id !== focusedId);

  return (
    <div className="flex-1 p-4 bg-[#0d0d15] relative overflow-hidden flex flex-col gap-3 min-h-0">
      {/* Floating Reaction Particles */}
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute z-50 pointer-events-none animate-reaction text-4xl select-none"
          style={{
            left: `${r.x}%`,
            bottom: "120px",
          }}
        >
          {r.emoji}
        </div>
      ))}

      {viewMode === "stage" ? (
        /* STAGE / SPOTLIGHT VIEW: 1 Focado no Centro + Grade de Quadrados Embaixo */
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* 1. QUADRADO PRINCIPAL FOCADO NO CENTRO */}
          <div
            className={`flex-1 bg-[#1b1b23] rounded-2xl relative overflow-hidden flex flex-col shadow-2xl border border-[#292932] group transition-all duration-300 min-h-0 ${
              fullscreenStage ? "fixed inset-4 z-50" : ""
            }`}
          >
            {isScreenShareFocused ? (
              /* FOCO: COMPARTILHAMENTO DE TELA */
              isMyScreenSharing && screenShareStream ? (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <VideoStreamPlayer
                    stream={screenShareStream}
                    muted={true}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-[#0d0e15] flex flex-col">
                  {/* Header Bar */}
                  <div className="h-9 bg-[#13131b] border-b border-[#292932] flex items-center justify-between px-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-[11px] text-[#908fa0] font-mono ml-2">
                        StreamSyncRoom.tsx — WebRTC MediaCapture Engine
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                        ● navigator.mediaDevices Active
                      </span>
                    </div>
                  </div>

                  {/* Code Content View */}
                  <div className="flex-1 p-4 font-mono text-[13px] leading-relaxed text-[#c7c4d7] overflow-hidden bg-gradient-to-br from-[#0d0e15] via-[#11121d] to-[#151624]">
                    <p className="text-slate-500">// 🚀 Dynamic Spotlight Engine: WebRTC Live Mesh</p>
                    <p>
                      <span className="text-[#8083ff]">const</span> [focusedId, setFocusedId] = useState&lt;<span className="text-cyan-300">string</span>&gt;(<span className="text-emerald-300">&quot;screen-share&quot;</span>);
                    </p>
                    <p className="mt-2 text-slate-400">
                      // {t.stage.readyToShareDesc}
                    </p>
                    <p>
                      activeSpotlight.renderFocus();
                    </p>

                    <div className="mt-4 p-3.5 bg-[#181926]/90 border border-indigo-500/20 rounded-2xl backdrop-blur-md max-w-md">
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>{t.stage.readyToShare}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">
                        {t.stage.readyToShareDesc}
                      </p>
                      {onStartScreenShare && !isMyScreenSharing && (
                        <button
                          onClick={onStartScreenShare}
                          className="px-3.5 py-1.5 rounded-xl bg-[#6366f1] hover:bg-[#8083ff] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                        >
                          <ScreenShare className="w-3.5 h-3.5" />
                          <span>{t.stage.startScreenShare}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : focusedParticipant ? (
              /* FOCO: PARTICIPANTE / WEBCAM ESPECÍFICA */
              <div className="absolute inset-0 bg-[#13131b] flex items-center justify-center">
                {focusedParticipant.isYou && localVideoStream && focusedParticipant.isVideoOn ? (
                  <div className="w-full h-full bg-black relative flex items-center justify-center">
                    <VideoStreamPlayer
                      stream={localVideoStream}
                      muted={true}
                      className="w-full h-full object-contain scale-x-[-1]"
                    />
                  </div>
                ) : focusedParticipant.isVideoOn ? (
                  <div className="w-full h-full relative">
                    <img
                      src={focusedParticipant.videoUrl || focusedParticipant.avatar}
                      alt={focusedParticipant.name}
                      className="w-full h-full object-contain bg-black"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 rounded-full bg-[#1f1f27] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                      <img
                        src={focusedParticipant.avatar}
                        alt={focusedParticipant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-white">
                        {focusedParticipant.name} {focusedParticipant.isYou && `(${t.common.you})`}
                      </span>
                      <span className="text-xs text-[#908fa0]">{t.stage.cameraOff}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Top Left Overlay: Tag do Item Focado */}
            <div className="absolute top-4 left-4 bg-[#13131b]/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg z-10">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Pin className="w-3.5 h-3.5 text-[#6366f1]" />
                <span>
                  {isScreenShareFocused
                    ? isMyScreenSharing
                      ? `${t.stage.yourScreen} (${t.stage.spotlight})`
                      : `${screenSharer?.name || "Alex"}'s Screen`
                    : `${focusedParticipant?.name || "Participant"} (${t.stage.spotlight})`}
                </span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider border border-indigo-500/30">
                {t.stage.focused}
              </span>
            </div>

            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
              {!isScreenShareFocused && (
                <button
                  onClick={() => setFocusedId("screen-share")}
                  className="bg-[#13131b]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-[#c7c4d7] hover:text-white hover:bg-[#292932] border border-white/10 transition-colors shadow-lg"
                  title={t.stage.focusScreen}
                >
                  <PinOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{t.stage.focusScreen}</span>
                </button>
              )}
            </div>

            {/* Bottom Right Presenter Tools (hover) */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#13131b]/90 backdrop-blur-md rounded-xl p-1 flex items-center gap-1 border border-white/10 shadow-2xl z-10">
              <button
                onClick={() => setFullscreenStage(!fullscreenStage)}
                className="p-2 rounded-lg hover:bg-[#292932] text-[#c7c4d7] hover:text-white transition-colors"
                title={fullscreenStage ? t.stage.exitFullscreen : t.stage.fullscreen}
              >
                {fullscreenStage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-[#292932] text-[#c7c4d7] hover:text-white transition-colors"
                title={t.stage.popOut}
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. GRADE DE QUADRADOS EMBAIXO (THUMBNAILS CLICÁVEIS) */}
          <div className="h-32 sm:h-36 shrink-0 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
            {/* Thumbnail do Compartilhamento de Tela (se não estiver focado) */}
            {showScreenInThumbnails && (
              <div
                onClick={() => setFocusedId("screen-share")}
                className="w-48 sm:w-56 h-full shrink-0 bg-[#1b1b23] rounded-2xl overflow-hidden relative shadow-md border border-[#292932] hover:border-[#6366f1] hover:scale-[1.02] cursor-pointer transition-all duration-200 group"
                title={t.stage.focusCenter}
              >
                {isMyScreenSharing && screenShareStream ? (
                  <div className="absolute inset-0 bg-black flex items-center justify-center pointer-events-none">
                    <VideoStreamPlayer
                      stream={screenShareStream}
                      muted={true}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#11121d] to-[#151624] p-3 flex flex-col justify-between pointer-events-none">
                    <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-mono">
                      <ScreenShare className="w-3 h-3" />
                      <span>Screen / Code Stream</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono truncate">
                      StreamSyncRoom.tsx
                    </span>
                  </div>
                )}

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="px-2 py-1 rounded-lg bg-[#6366f1] text-white text-[11px] font-bold shadow-lg flex items-center gap-1">
                    <Pin className="w-3 h-3" /> {t.stage.focusCenter}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 bg-[#13131b]/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white font-semibold flex items-center gap-1 border border-white/5">
                  <ScreenShare className="w-3 h-3 text-indigo-400" />
                  <span>{t.stage.screenStream}</span>
                </div>
              </div>
            )}

            {/* Thumbnails de Todos os Participantes Secundários */}
            {otherParticipants.map((p) => {
              const isSpeaking = p.id === activeSpeakerId || p.isSpeaking;

              return (
                <div
                  key={p.id}
                  onClick={() => setFocusedId(p.id)}
                  className={`w-48 sm:w-56 h-full shrink-0 bg-[#1f1f27] rounded-2xl overflow-hidden relative shadow-md border cursor-pointer transition-all duration-200 hover:scale-[1.02] group ${
                    isSpeaking
                      ? "border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)] ring-2 ring-emerald-400/30"
                      : "border-[#292932] hover:border-[#6366f1]"
                  }`}
                  title={`${t.stage.focusCenter}: ${p.name}`}
                >
                  {/* Webcam Local / Vídeo / Avatar */}
                  {p.isYou && localVideoStream && p.isVideoOn ? (
                    <div className="absolute inset-0 w-full h-full bg-black pointer-events-none">
                      <VideoStreamPlayer
                        stream={localVideoStream}
                        muted={true}
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    </div>
                  ) : p.isVideoOn ? (
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                      <img
                        src={p.videoUrl || p.avatar}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-[#1b1b23] flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#292932] flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Overlay hover 'Clique para focar' */}
                  <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                    <span className="px-2 py-1 rounded-lg bg-[#6366f1] text-white text-[11px] font-bold shadow-lg flex items-center gap-1">
                      <Pin className="w-3 h-3" /> {t.stage.focusCenter}
                    </span>
                  </div>

                  {/* Top Right Badges */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    {p.isAway && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-medium">
                        {t.common.away}
                      </span>
                    )}
                  </div>

                  {/* Bottom info banner */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                    <div className="bg-[#13131b]/80 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/5">
                      <span className="text-[11px] font-semibold text-white truncate max-w-[85px]">
                        {p.name} {p.isYou && `(${t.common.you})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Mic Status */}
                      <div
                        className={`w-5 h-5 rounded-full backdrop-blur-md flex items-center justify-center border ${
                          p.isMuted
                            ? "bg-red-500/20 border-red-500/30 text-red-400"
                            : isSpeaking
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "bg-[#13131b]/80 border-white/5 text-[#c7c4d7]"
                        }`}
                      >
                        {p.isMuted ? (
                          <MicOff className="w-2.5 h-2.5" />
                        ) : (
                          <Mic className="w-2.5 h-2.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* GRID VIEW COMPLETO: Todos os quadrados em grade igualitária */
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 min-h-0 overflow-y-auto custom-scrollbar p-1">
          {/* Tile de Tela no Grid */}
          <div
            onClick={() => {
              setFocusedId("screen-share");
            }}
            className="bg-[#1b1b23] rounded-2xl overflow-hidden relative shadow-xl border border-[#292932] hover:border-[#6366f1] hover:scale-[1.01] cursor-pointer flex flex-col justify-center items-center transition-all duration-200 group min-h-[180px]"
            title={t.stage.focusCenter}
          >
            {isMyScreenSharing && screenShareStream ? (
              <div className="absolute inset-0 bg-black flex items-center justify-center pointer-events-none">
                <VideoStreamPlayer
                  stream={screenShareStream}
                  muted={true}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#11121d] to-[#151624] p-4 flex flex-col justify-between pointer-events-none">
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
                  <ScreenShare className="w-4 h-4" />
                  <span>{t.stage.screenStream}</span>
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  StreamSyncRoom.tsx
                </span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
              <span className="px-3 py-1.5 rounded-xl bg-[#6366f1] text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" /> {t.stage.focusCenter}
              </span>
            </div>

            <div className="absolute top-3 left-3 bg-[#13131b]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs text-white font-semibold flex items-center gap-1.5 border border-white/5 z-10">
              <ScreenShare className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.stage.screenStream}</span>
            </div>
          </div>

          {/* Tiles dos Participantes no Grid */}
          {participants.map((p) => {
            const isSpeaking = p.id === activeSpeakerId || p.isSpeaking;

            return (
              <div
                key={p.id}
                onClick={() => {
                  setFocusedId(p.id);
                }}
                className={`bg-[#1f1f27] rounded-2xl overflow-hidden relative shadow-xl border hover:border-[#6366f1] hover:scale-[1.01] cursor-pointer flex flex-col justify-center items-center transition-all duration-200 group min-h-[180px] ${
                  isSpeaking
                    ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.25)]"
                    : "border-[#292932]"
                }`}
                title={`${t.stage.focusCenter}: ${p.name}`}
              >
                {p.isYou && localVideoStream && p.isVideoOn ? (
                  <div className="absolute inset-0 w-full h-full bg-black pointer-events-none">
                    <VideoStreamPlayer
                      stream={localVideoStream}
                      muted={true}
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  </div>
                ) : p.isVideoOn ? (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <img
                      src={p.videoUrl || p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#292932] flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-xl pointer-events-none">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                  <span className="px-3 py-1.5 rounded-xl bg-[#6366f1] text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                    <Pin className="w-3.5 h-3.5" /> {t.stage.focusCenter}
                  </span>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <div className="bg-[#13131b]/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-2 border border-white/5">
                    <span className="text-xs font-semibold text-white">
                      {p.name} {p.isYou && `(${t.common.you})`}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                  <div
                    className={`p-1.5 rounded-full backdrop-blur-md border ${
                      p.isMuted
                        ? "bg-red-500/20 border-red-500/30 text-red-400"
                        : isSpeaking
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-[#13131b]/80 border-white/5 text-[#c7c4d7]"
                    }`}
                  >
                    {p.isMuted ? (
                      <MicOff className="w-3.5 h-3.5" />
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
