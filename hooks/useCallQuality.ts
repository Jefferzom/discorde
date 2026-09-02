"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import {
  ConnectionQuality,
  LocalAudioTrack,
  LocalVideoTrack,
  ParticipantEvent,
  Track,
} from "livekit-client";

export interface CallQualityStats {
  quality: ConnectionQuality;
  rttMs: number | null;
  packetLossPct: number | null;
  bitrateKbps: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  source: "camera" | "screen" | null;
}

const EMPTY: CallQualityStats = {
  quality: ConnectionQuality.Unknown,
  rttMs: null,
  packetLossPct: null,
  bitrateKbps: null,
  width: null,
  height: null,
  fps: null,
  source: null,
};

function rttToMs(rtt?: number): number | null {
  if (typeof rtt !== "number" || Number.isNaN(rtt)) return null;
  // WebRTC reports seconds (~0.04); treat values >= 10 as already milliseconds.
  return rtt < 10 ? Math.round(rtt * 1000) : Math.round(rtt);
}

function lossPct(sent?: number, lost?: number): number | null {
  const packetsSent = sent ?? 0;
  const packetsLost = lost ?? 0;
  if (packetsSent + packetsLost <= 0) return null;
  return Math.round((packetsLost / (packetsSent + packetsLost)) * 1000) / 10;
}

export function useCallQuality(): CallQualityStats {
  const { localParticipant } = useLocalParticipant();
  const [stats, setStats] = useState<CallQualityStats>(EMPTY);
  const prevBytesRef = useRef<{ bytes: number; at: number } | null>(null);

  useEffect(() => {
    const syncQuality = () => {
      setStats((prev) => ({
        ...prev,
        quality: localParticipant.connectionQuality,
      }));
    };

    syncQuality();
    localParticipant.on(ParticipantEvent.ConnectionQualityChanged, syncQuality);
    return () => {
      localParticipant.off(ParticipantEvent.ConnectionQualityChanged, syncQuality);
    };
  }, [localParticipant]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const screenPub = localParticipant.getTrackPublication(Track.Source.ScreenShare);
      const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
      const micPub = localParticipant.getTrackPublication(Track.Source.Microphone);
      const videoTrack =
        (screenPub?.videoTrack as LocalVideoTrack | undefined) ??
        (cameraPub?.videoTrack as LocalVideoTrack | undefined);
      const audioTrack = micPub?.audioTrack as LocalAudioTrack | undefined;
      const source: CallQualityStats["source"] = screenPub?.videoTrack
        ? "screen"
        : cameraPub?.videoTrack
          ? "camera"
          : null;

      let rttMs: number | null = null;
      let packetLossPct: number | null = null;
      let bitrateKbps: number | null = null;
      let width: number | null = null;
      let height: number | null = null;
      let fps: number | null = null;

      if (videoTrack) {
        const layers = await videoTrack.getSenderStats();
        const layer = [...layers].sort((a, b) => (b.frameWidth ?? 0) - (a.frameWidth ?? 0))[0];
        if (layer) {
          width = layer.frameWidth || null;
          height = layer.frameHeight || null;
          fps = layer.framesPerSecond ? Math.round(layer.framesPerSecond) : null;
          rttMs = rttToMs(layer.roundTripTime);
          packetLossPct = lossPct(layer.packetsSent, layer.packetsLost);
          if (typeof layer.bytesSent === "number") {
            const prev = prevBytesRef.current;
            if (prev && layer.timestamp > prev.at) {
              const bits = (layer.bytesSent - prev.bytes) * 8;
              const seconds = (layer.timestamp - prev.at) / 1000;
              if (seconds > 0) bitrateKbps = Math.round(bits / seconds / 1000);
            }
            prevBytesRef.current = { bytes: layer.bytesSent, at: layer.timestamp };
          }
        }
      } else {
        prevBytesRef.current = null;
      }

      if ((rttMs == null || packetLossPct == null) && audioTrack) {
        const audio = await audioTrack.getSenderStats();
        if (audio) {
          rttMs = rttMs ?? rttToMs(audio.roundTripTime);
          packetLossPct = packetLossPct ?? lossPct(audio.packetsSent, audio.packetsLost);
        }
      }

      if (cancelled) return;
      setStats({
        quality: localParticipant.connectionQuality,
        rttMs,
        packetLossPct,
        bitrateKbps,
        width,
        height,
        fps,
        source,
      });
    };

    void poll();
    const id = window.setInterval(() => void poll(), 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [localParticipant]);

  return stats;
}
