"use client";

import { Volume2, VolumeX } from "lucide-react";
import type { Participant } from "livekit-client";
import { useParticipantVolume, type VolumeSource } from "@/hooks/useParticipantVolume";
import { useI18n } from "@/lib/i18n/context";

interface RemoteVolumeControlProps {
  participant: Participant;
  source: VolumeSource;
  sliderLabel: string;
  variant?: "tile" | "overlay";
}

export default function RemoteVolumeControl({
  participant,
  source,
  sliderLabel,
  variant = "tile",
}: RemoteVolumeControlProps) {
  const { t } = useI18n();
  const { volume, isMuted, canControl, changeVolume, toggleMute } =
    useParticipantVolume(participant, source);

  if (!canControl) return null;

  const containerClass =
    variant === "overlay"
      ? "flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-[#13131b]/90 backdrop-blur-md border border-white/10 shadow-lg"
      : "flex items-center gap-1.5 px-1.5 py-1 rounded-lg bg-[#13131b]/90 border border-white/10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity";

  return (
    <div
      className={containerClass}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={toggleMute}
        className={`p-1 rounded-md transition-colors shrink-0 ${
          isMuted
            ? "text-red-400 hover:text-red-300 hover:bg-red-500/20"
            : "text-[#c7c4d7] hover:text-white hover:bg-[#292932]"
        }`}
        title={isMuted ? t.stage.unmuteAudio : t.stage.muteAudio}
      >
        {isMuted ? (
          <VolumeX className="w-3 h-3" />
        ) : (
          <Volume2 className="w-3 h-3" />
        )}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => changeVolume(Number(e.target.value))}
        className={`w-full h-1 bg-[#292932] rounded-lg cursor-pointer ${
          isMuted ? "accent-red-400" : "accent-emerald-400"
        } ${variant === "overlay" ? "min-w-[80px]" : ""}`}
        title={sliderLabel}
        aria-label={sliderLabel}
      />

      <span className="text-[9px] text-[#908fa0] w-6 text-right tabular-nums">
        {volume}
      </span>
    </div>
  );
}
