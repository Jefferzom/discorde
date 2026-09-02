"use client";

import { useCallback, useState } from "react";
import { Track, type Participant } from "livekit-client";

export type VolumeSource =
  | Track.Source.Microphone
  | Track.Source.ScreenShareAudio;

interface VolumeCapableParticipant {
  setVolume: (volume: number, source?: VolumeSource) => void;
  getVolume: (source?: VolumeSource) => number | undefined;
}

interface VolumeState {
  key: string;
  volume: number;
  lastAudible: number;
}

function asVolumeCapable(
  participant: Participant
): VolumeCapableParticipant | null {
  if (participant.isLocal) return null;
  const candidate = participant as unknown as Partial<VolumeCapableParticipant>;
  if (typeof candidate.setVolume !== "function") return null;
  return candidate as VolumeCapableParticipant;
}

function readVolumePercent(
  participant: Participant,
  source: VolumeSource
): number {
  const current = asVolumeCapable(participant)?.getVolume(source);
  return typeof current === "number" ? Math.round(current * 100) : 100;
}

function buildState(
  key: string,
  participant: Participant,
  source: VolumeSource
): VolumeState {
  const volume = readVolumePercent(participant, source);
  return { key, volume, lastAudible: volume || 100 };
}

/**
 * Volume por participante (microfone ou áudio do compartilhamento de tela).
 * O ajuste é local: cada espectador controla o que ouve.
 */
export function useParticipantVolume(
  participant: Participant,
  source: VolumeSource = Track.Source.Microphone
) {
  const syncKey = `${participant.identity}:${source}`;
  const [state, setState] = useState<VolumeState>(() =>
    buildState(syncKey, participant, source)
  );

  // Ao trocar de participante/fonte sem desmontar, relê o volume já aplicado
  let current = state;
  if (state.key !== syncKey) {
    current = buildState(syncKey, participant, source);
    setState(current);
  }

  const changeVolume = useCallback(
    (nextVolume: number) => {
      const percent = Math.min(100, Math.max(0, Math.round(nextVolume)));
      setState((prev) => ({
        key: prev.key,
        volume: percent,
        lastAudible: percent > 0 ? percent : prev.lastAudible,
      }));
      asVolumeCapable(participant)?.setVolume(percent / 100, source);
    },
    [participant, source]
  );

  const { volume, lastAudible } = current;

  const toggleMute = useCallback(() => {
    changeVolume(volume === 0 ? lastAudible || 100 : 0);
  }, [changeVolume, volume, lastAudible]);

  return {
    volume,
    isMuted: volume === 0,
    canControl: !participant.isLocal,
    changeVolume,
    toggleMute,
  };
}
