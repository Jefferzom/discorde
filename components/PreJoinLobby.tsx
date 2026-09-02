"use client";

import React, { useEffect, useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Users,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useLocalMediaPreview } from "@/hooks/useLocalMediaPreview";
import { fetchRoomOccupancy } from "@/lib/roomsApi";
import MediaDeviceSelector from "@/components/MediaDeviceSelector";
import { useMediaPreferences } from "@/hooks/useMediaPreferences";

export interface JoinMediaPrefs {
  audio: boolean;
  video: boolean;
}

interface PreJoinLobbyProps {
  channelName: string;
  roomId: string;
  displayName: string;
  avatarUrl: string;
  onJoin: (prefs: JoinMediaPrefs) => void;
  onBack: () => void;
}

export default function PreJoinLobby({
  channelName,
  roomId,
  displayName,
  avatarUrl,
  onJoin,
  onBack,
}: PreJoinLobbyProps) {
  const { t } = useI18n();
  const mediaPrefs = useMediaPreferences();
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [occupancy, setOccupancy] = useState<number | null>(null);
  const { videoRef, micLevel, error, stopStream } = useLocalMediaPreview({
    videoOn: isVideoOn,
    muted: isMuted,
  });

  useEffect(() => {
    let cancelled = false;
    fetchRoomOccupancy(roomId)
      .then(({ participantCount }) => {
        if (!cancelled) setOccupancy(participantCount);
      })
      .catch(() => {
        if (!cancelled) setOccupancy(0);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const handleJoin = () => {
    stopStream();
    onJoin({ audio: !isMuted, video: isVideoOn });
  };

  return (
    <div className="flex-1 bg-[#0d0d15] flex items-center justify-center p-6 select-none overflow-y-auto min-h-0">
      <div className="max-w-3xl w-full bg-[#1b1b23] border border-[#292932] rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative aspect-video bg-[#13131b] rounded-2xl overflow-hidden border border-[#292932] shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                mediaPrefs.mirrorLocalVideo ? "scale-x-[-1]" : ""
              } ${
                isVideoOn ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />

            {!isVideoOn && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 px-6 py-4 pb-14 text-center">
                <div className="w-14 h-14 rounded-full bg-[#1f1f27] border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-white truncate max-w-full">
                  {displayName}
                </span>
                <span className="text-[11px] text-[#908fa0]">{t.stage.cameraOff}</span>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-3 pt-8 bg-gradient-to-t from-[#13131b]/95 via-[#13131b]/60 to-transparent pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#13131b]/90 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setIsVideoOn((prev) => !prev)}
                  className={`p-2 rounded-full transition-colors ${
                    isVideoOn
                      ? "bg-[#6366f1] text-white"
                      : "bg-[#292932] text-red-400 hover:text-white"
                  }`}
                  title={isVideoOn ? t.controls.turnOffCamera : t.controls.turnOnCamera}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className={`p-2 rounded-full transition-colors ${
                    !isMuted
                      ? "bg-[#6366f1] text-white"
                      : "bg-[#292932] text-red-400 hover:text-white"
                  }`}
                  title={isMuted ? t.controls.unmuteMicrophone : t.controls.muteMicrophone}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-amber-400/90">{t.lobby.previewError}</p>
          )}

          <div className="flex items-center gap-3 bg-[#13131b] px-3.5 py-2.5 rounded-xl border border-[#292932]">
            <Mic className={`w-4 h-4 ${isMuted ? "text-red-400" : "text-emerald-400"}`} />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-[#908fa0]">
                <span>{t.lobby.micLevel}</span>
                <span>{isMuted ? t.navigation.muteMic : `${micLevel}%`}</span>
              </div>
              <div className="w-full h-1.5 bg-[#292932] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75 rounded-full"
                  style={{ width: `${isMuted ? 0 : micLevel}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MediaDeviceSelector kind="audioinput" variant="field" dropUp={false} />
            <MediaDeviceSelector kind="audiooutput" variant="field" dropUp={false} />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Volume2 className="w-4 h-4" />
              <span>{t.lobby.voiceChannelPreview}</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight truncate" title={channelName}>
              {channelName}
            </h2>

            <p className="text-xs text-[#c7c4d7] leading-relaxed">{t.lobby.lobbyDesc}</p>

            <div className="mt-2 bg-[#13131b] p-3.5 rounded-2xl border border-[#292932] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-[#908fa0]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.lobby.alreadyInCall}</span>
                </span>
                <span className="text-emerald-400 text-[11px]">
                  {occupancy == null
                    ? "…"
                    : occupancy === 0
                      ? t.lobby.noParticipants
                      : t.lobby.occupancyCount.replace("{n}", String(occupancy))}
                </span>
              </div>
              <p className="text-[11px] text-[#908fa0]">
                {displayName} · {t.common.you}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleJoin}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#6366f1] hover:bg-[#8083ff] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>
                {t.lobby.joinRoom} {channelName}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                stopStream();
                onBack();
              }}
              className="w-full py-2 text-xs text-[#908fa0] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.lobby.back}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#908fa0]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t.lobby.encrypted}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> {t.lobby.opusAudio}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
