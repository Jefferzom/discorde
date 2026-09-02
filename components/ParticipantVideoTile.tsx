"use client";

import { VideoTrack, isTrackReference } from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReference } from "@livekit/components-core";
import { ExternalLink, LayoutGrid, Columns2 } from "lucide-react";
import { popOutFromTrackRef } from "@/lib/popOutVideo";

interface ParticipantVideoTileProps {
  trackRef: TrackReference;
  name: string;
  isYou?: boolean;
  youLabel?: string;
  sharingLabel?: string;
  popOutLabel: string;
  variant?: "filmstrip" | "split";
  badge?: string;
}

export default function ParticipantVideoTile({
  trackRef,
  name,
  isYou,
  youLabel,
  sharingLabel,
  popOutLabel,
  variant = "filmstrip",
  badge,
}: ParticipantVideoTileProps) {
  const hasVideo = isTrackReference(trackRef) && trackRef.publication?.track;
  const isScreenShare = trackRef.source === Track.Source.ScreenShare;

  const sizeClass =
    variant === "split"
      ? "w-full h-full min-h-0"
      : "w-48 sm:w-56 h-full shrink-0";

  return (
    <div
      className={`${sizeClass} bg-[#1f1f27] rounded-2xl overflow-hidden relative shadow-md border transition-all duration-200 group ${
        isScreenShare
          ? "border-red-500/40 hover:border-red-400"
          : "border-[#292932] hover:border-[#6366f1]"
      }`}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#1b1b23] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#292932] border border-white/10 flex items-center justify-center text-lg font-bold text-[#adc6ff]">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

      <button
        type="button"
        onClick={() => popOutFromTrackRef(trackRef, name)}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#13131b]/90 border border-white/10 text-[#c7c4d7] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title={popOutLabel}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
        <div className="bg-[#13131b]/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5">
          <span className="text-[11px] font-semibold text-white truncate max-w-[120px] block">
            {name}
            {isYou && youLabel && ` (${youLabel})`}
            {badge && ` · ${badge}`}
            {isScreenShare && sharingLabel && ` · ${sharingLabel}`}
          </span>
        </div>
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
    <div className="absolute top-4 right-4 flex items-center gap-1 z-10 bg-[#13131b]/90 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
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
