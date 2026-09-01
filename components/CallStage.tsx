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
  ScreenShare
} from "lucide-react";
import { Participant } from "../types/streamsync";

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
  const [fullscreenStage, setFullscreenStage] = useState(false);
  const [selectedUserForVolume, setSelectedUserForVolume] = useState<string | null>(null);
  const [userVolumes, setUserVolumes] = useState<Record<string, number>>({
    "1": 100,
    "2": 85,
    "3": 100,
    "4": 90,
  });

  const handleVolumeChange = (userId: string, val: number) => {
    setUserVolumes((prev) => ({ ...prev, [userId]: val }));
  };

  return (
    <div className="flex-1 p-4 bg-[#0d0d15] relative overflow-hidden flex flex-col gap-4">
      {/* Floating Reaction Particles */}
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute z-50 pointer-events-none animate-reaction text-4xl select-none"
          style={{
            left: `${r.x}%`,
            bottom: "100px",
          }}
        >
          {r.emoji}
        </div>
      ))}

      {viewMode === "stage" ? (
        /* STAGE VIEW: Main Screen Share + Right Participant Stack */
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          {/* Main Central Screen Share Tile */}
          <div
            className={`flex-1 bg-[#1b1b23] rounded-2xl relative overflow-hidden flex flex-col shadow-2xl border border-[#292932] group ${
              fullscreenStage ? "fixed inset-4 z-50" : ""
            }`}
          >
            {/* Real Screen Share Stream OR Fallback Live Simulation */}
            {isMyScreenSharing && screenShareStream ? (
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
                  <p className="text-slate-500">// 🚀 Browser Native MediaDevices Capture Active</p>
                  <p>
                    <span className="text-[#8083ff]">const</span> stream = <span className="text-[#8083ff]">await</span> navigator.mediaDevices.<span className="text-cyan-300">getUserMedia</span>(&#123; video: <span className="text-emerald-300">true</span> &#125;);
                  </p>
                  <p className="mt-2 text-slate-400">
                    // Conectando stream de vídeo e tela com WebRTC simultaneamente
                  </p>
                  <p>
                    videoRef.current.srcObject = stream;
                  </p>

                  <div className="mt-5 p-4 bg-[#181926]/90 border border-indigo-500/20 rounded-2xl backdrop-blur-md max-w-md">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Transmissão de Tela e Câmera</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                      Use os botões na barra inferior ou o botão abaixo para iniciar o compartilhamento de tela ou ligar sua câmera.
                    </p>
                    {onStartScreenShare && (
                      <button
                        onClick={onStartScreenShare}
                        className="px-4 py-2 rounded-xl bg-[#6366f1] hover:bg-[#8083ff] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                      >
                        <ScreenShare className="w-3.5 h-3.5" />
                        <span>Iniciar Compartilhamento de Tela</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Top Left Overlay: Screen Share Tag */}
            <div className="absolute top-4 left-4 bg-[#13131b]/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg z-10">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#292932] shrink-0 border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Alex"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-white drop-shadow">
                {isMyScreenSharing ? "Your Screen (Live)" : `${screenSharer?.name || "Alex"}'s Screen`}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold uppercase tracking-wider border border-red-500/30 animate-pulse">
                Live 1080p
              </span>
            </div>

            {/* Bottom Right Presenter Tools (hover) */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#13131b]/90 backdrop-blur-md rounded-xl p-1 flex items-center gap-1 border border-white/10 shadow-2xl z-10">
              <button
                onClick={() => setFullscreenStage(!fullscreenStage)}
                className="p-2 rounded-lg hover:bg-[#292932] text-[#c7c4d7] hover:text-white transition-colors"
                title={fullscreenStage ? "Exit Fullscreen" : "Fullscreen Stage"}
              >
                {fullscreenStage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-[#292932] text-[#c7c4d7] hover:text-white transition-colors"
                title="Pop out video"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Participant Stack (Webcams & Statuses) */}
          <div className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar pb-2 lg:pb-0">
            {participants.map((p) => {
              const isSpeaking = p.id === activeSpeakerId || p.isSpeaking;

              return (
                <div
                  key={p.id}
                  className={`w-48 lg:w-full h-32 lg:h-38 shrink-0 bg-[#1f1f27] rounded-2xl overflow-hidden relative shadow-md border transition-all duration-200 group ${
                    isSpeaking
                      ? "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] ring-2 ring-emerald-400/40"
                      : "border-[#292932] hover:border-[#464554]"
                  }`}
                >
                  {/* Real Web Camera for User (You) OR Remote Video Simulation */}
                  {p.isYou && localVideoStream && p.isVideoOn ? (
                    <div className="absolute inset-0 w-full h-full bg-black">
                      <VideoStreamPlayer
                        stream={localVideoStream}
                        muted={true}
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                    </div>
                  ) : p.isVideoOn ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={p.videoUrl || p.avatar}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-[#1b1b23] flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#292932] flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Top Right Badges */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    {p.isScreenSharing && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400 font-bold uppercase tracking-wider border border-red-500/30">
                        Sharing
                      </span>
                    )}
                    {p.isAway && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-medium">
                        Away
                      </span>
                    )}
                  </div>

                  {/* Bottom info banner */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                    <div className="bg-[#13131b]/80 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1.5 border border-white/5">
                      <span className="text-[12px] font-semibold text-white truncate max-w-[90px]">
                        {p.name} {p.isYou && "(You)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!p.isYou && (
                        <button
                          onClick={() =>
                            setSelectedUserForVolume(
                              selectedUserForVolume === p.id ? null : p.id
                            )
                          }
                          className="w-6 h-6 rounded-full bg-[#13131b]/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#c7c4d7] hover:text-white border border-white/5"
                          title="User Volume"
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                      )}

                      {/* Mic Status */}
                      <div
                        className={`w-6 h-6 rounded-full backdrop-blur-md flex items-center justify-center border ${
                          p.isMuted
                            ? "bg-red-500/20 border-red-500/30 text-red-400"
                            : isSpeaking
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "bg-[#13131b]/80 border-white/5 text-[#c7c4d7]"
                        }`}
                      >
                        {p.isMuted ? (
                          <MicOff className="w-3 h-3" />
                        ) : (
                          <Mic className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Volume Slider Popover */}
                  {selectedUserForVolume === p.id && (
                    <div className="absolute bottom-10 right-2 bg-[#13131b] border border-[#34343d] rounded-xl p-2.5 shadow-2xl z-30 flex flex-col gap-1 w-36 animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center text-[10px] text-[#908fa0]">
                        <span>User Volume</span>
                        <span>{userVolumes[p.id] ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={userVolumes[p.id] ?? 100}
                        onChange={(e) =>
                          handleVolumeChange(p.id, Number(e.target.value))
                        }
                        className="w-full accent-[#6366f1] h-1.5 bg-[#292932] rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* GRID VIEW: All participants in balanced grid */
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 min-h-0">
          {participants.map((p) => {
            const isSpeaking = p.id === activeSpeakerId || p.isSpeaking;

            return (
              <div
                key={p.id}
                className={`bg-[#1f1f27] rounded-2xl overflow-hidden relative shadow-xl border flex flex-col justify-center items-center transition-all duration-200 group ${
                  isSpeaking
                    ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.25)]"
                    : "border-[#292932] hover:border-[#464554]"
                }`}
              >
                {p.isYou && localVideoStream && p.isVideoOn ? (
                  <div className="absolute inset-0 w-full h-full bg-black">
                    <VideoStreamPlayer
                      stream={localVideoStream}
                      muted={true}
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                  </div>
                ) : p.isVideoOn ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={p.videoUrl || p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#292932] flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-xl">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <div className="bg-[#13131b]/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-2 border border-white/5">
                    <span className="text-sm font-semibold text-white">
                      {p.name} {p.isYou && "(You)"}
                    </span>
                    {p.isScreenSharing && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/20 text-red-400 font-bold uppercase">
                        Screen
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                  <div
                    className={`p-2 rounded-full backdrop-blur-md border ${
                      p.isMuted
                        ? "bg-red-500/20 border-red-500/30 text-red-400"
                        : isSpeaking
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-[#13131b]/80 border-white/5 text-[#c7c4d7]"
                    }`}
                  >
                    {p.isMuted ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
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
