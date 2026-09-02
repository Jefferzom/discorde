"use client";

import { useState } from "react";
import { VideoTrack, isTrackReference, useIsSpeaking } from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReference } from "@livekit/components-core";
import { ExternalLink, LayoutGrid, Columns2, Pause, Volume2 } from "lucide-react";
import { popOutFromTrackRef } from "@/lib/popOutVideo";
import { useMediaPreferences } from "@/hooks/useMediaPreferences";
import { useI18n } from "@/lib/i18n/context";

interface ParticipantVideoTileProps {
  trackRef: TrackReference;
  name: string;
  isYou?: boolean;
  youLabel?: string;
  sharingLabel?: string;
  popOutLabel: string;
  onFocus?: () => void;
  isFocused?: boolean;
  focusLabel?: string;
  variant?: "filmstrip" | "split" | "stage";
  badge?: string;
  volumeLabel?: string;
}

export default function ParticipantVideoTile({
  trackRef,
  name,
  isYou,
  youLabel,
  sharingLabel,
  popOutLabel,
  onFocus,
  isFocused = false,
  focusLabel,
  variant = "filmstrip",
  badge,
  volumeLabel,
}: ParticipantVideoTileProps) {
  const { t } = useI18n();
  const mediaPrefs = useMediaPreferences();
  const hasVideo = isTrackReference(trackRef) && Boolean(trackRef.publication?.track);
  const isScreenShare = trackRef.source === Track.Source.ScreenShare;
  const isSpeaking = useIsSpeaking(trackRef.participant);
  const [volume, setVolume] = useState(100);
  const showVolume = !trackRef.participant.isLocal && !isScreenShare;
  const isLocalCamera =
    Boolean(isYou) && trackRef.source === Track.Source.Camera;
  const mirrorClass =
    isLocalCamera && mediaPrefs.mirrorLocalVideo ? "scale-x-[-1]" : "";
  const isSharePaused =
    isScreenShare &&
    trackRef.participant.isLocal &&
    Boolean(
      (trackRef.publication as { isUpstreamPaused?: boolean } | undefined)
        ?.isUpstreamPaused
    );

  const sizeClass =
    variant === "stage"
      ? "w-full h-full min-h-0"
      : variant === "split"
        ? "w-full h-full min-h-0"
        : "w-48 sm:w-56 h-full shrink-0";

  const handleVolume = (value: number) => {
    setVolume(value);
    const participant = trackRef.participant;
    if (!participant.isLocal && "setVolume" in participant) {
      (participant as { setVolume: (v: number) => void }).setVolume(value / 100);
    }
  };

  return (
    <div
      role={onFocus ? "button" : undefined}
      tabIndex={onFocus ? 0 : undefined}
      onClick={onFocus}
      onKeyDown={(e) => {
        if (onFocus && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onFocus();
        }
      }}
      className={`${sizeClass} bg-[#1f1f27] rounded-2xl overflow-hidden relative shadow-md border transition-all duration-200 group ${
        isSpeaking
          ? "border-emerald-400 ring-2 ring-emerald-400/70 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
          : isFocused
            ? "border-[#6366f1] ring-2 ring-indigo-500/40"
            : isScreenShare
              ? "border-red-500/40 hover:border-red-400 cursor-pointer"
              : "border-[#292932] hover:border-[#6366f1] cursor-pointer"
      }`}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          className={`absolute inset-0 w-full h-full object-cover ${mirrorClass}`}
        />
      ) : (
        <div className="absolute inset-0 bg-[#1b1b23] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#292932] border border-white/10 flex items-center justify-center text-lg font-bold text-[#adc6ff]">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

      {isSharePaused && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/40 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[10px] font-semibold">
            <Pause className="w-3 h-3" />
            {t.call.sharePaused}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          popOutFromTrackRef(trackRef, name);
        }}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#13131b]/90 border border-white/10 text-[#c7c4d7] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title={popOutLabel}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>

      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 z-10">
        <div className="bg-[#13131b]/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5 self-start max-w-full">
          <span className="text-[11px] font-semibold text-white truncate max-w-[120px] block">
            {name}
            {isYou && youLabel && ` (${youLabel})`}
            {badge && ` · ${badge}`}
            {isScreenShare && sharingLabel && ` · ${sharingLabel}`}
            {isFocused && focusLabel && ` · ${focusLabel}`}
          </span>
        </div>
        {showVolume && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#13131b]/90 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Volume2 className="w-3 h-3 text-[#c7c4d7] shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="w-full accent-emerald-400 h-1 bg-[#292932] rounded-lg cursor-pointer"
              title={volumeLabel}
            />
            <span className="text-[9px] text-[#908fa0] w-6 text-right">{volume}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StageLayoutToggle({
  mode,
  onChange,
  splitLabel,
  spotlightLabel,
}: {
  mode: "spotlight" | "split";
  onChange: (mode: "spotlight" | "split") => void;
  splitLabel: string;
  spotlightLabel: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-[#13131b]/90 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
      <button
        type="button"
        onClick={() => onChange("spotlight")}
        className={`p-2 rounded-lg transition-colors ${
          mode === "spotlight"
            ? "bg-[#6366f1] text-white"
            : "text-[#c7c4d7] hover:text-white hover:bg-[#292932]"
        }`}
        title={spotlightLabel}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("split")}
        className={`p-2 rounded-lg transition-colors ${
          mode === "split"
            ? "bg-[#6366f1] text-white"
            : "text-[#c7c4d7] hover:text-white hover:bg-[#292932]"
        }`}
        title={splitLabel}
      >
        <Columns2 className="w-4 h-4" />
      </button>
    </div>
  );
}
