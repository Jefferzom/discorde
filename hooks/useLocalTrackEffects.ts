"use client";

import { useEffect, useRef } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { LocalAudioTrack, LocalVideoTrack, Track } from "livekit-client";
import type { KrispNoiseFilterProcessor } from "@livekit/krisp-noise-filter";
import type { BackgroundProcessorWrapper } from "@livekit/track-processors";
import { useMediaPreferences } from "@/hooks/useMediaPreferences";
import { getSavedMediaDeviceId } from "@/lib/mediaDeviceStorage";
import type { MediaPreferences } from "@/lib/mediaPreferences";

function audioConstraintsChanged(audioTrack: LocalAudioTrack, prefs: MediaPreferences) {
  const settings = audioTrack.mediaStreamTrack.getSettings();
  const differs = (actual: boolean | undefined, wanted: boolean) =>
    typeof actual === "boolean" && actual !== wanted;

  return (
    differs(settings.echoCancellation, prefs.echoCancellation) ||
    differs(settings.autoGainControl, prefs.autoGainControl) ||
    differs(settings.noiseSuppression, prefs.noiseSuppression)
  );
}

async function applyAudioEffects(
  audioTrack: LocalAudioTrack,
  prefs: MediaPreferences,
  krispRef: { current: KrispNoiseFilterProcessor | null },
  cancelled: () => boolean
) {
  if (audioConstraintsChanged(audioTrack, prefs)) {
    try {
      await audioTrack.restartTrack({
        echoCancellation: prefs.echoCancellation,
        autoGainControl: prefs.autoGainControl,
        noiseSuppression: prefs.noiseSuppression,
        deviceId: getSavedMediaDeviceId("audioinput") ?? undefined,
      });
    } catch {
      // Constraints not supported on this device
    }
  }

  if (cancelled()) return;

  try {
    const { KrispNoiseFilter, isKrispNoiseFilterSupported } = await import(
      "@livekit/krisp-noise-filter"
    );
    if (cancelled()) return;

    const krispOk = prefs.krisp && isKrispNoiseFilterSupported();
    if (krispOk) {
      if (!krispRef.current) {
        krispRef.current = KrispNoiseFilter();
      }
      const current = audioTrack.getProcessor();
      if (current?.name !== "livekit-noise-filter") {
        await audioTrack.setProcessor(krispRef.current);
      }
      await krispRef.current.setEnabled(true);
      return;
    }

    if (krispRef.current?.isEnabled()) {
      await krispRef.current.setEnabled(false);
    }
  } catch (err) {
    console.info("[Discorde] Krisp indisponível:", err);
  }
}

async function applyBlurEffect(
  videoTrack: LocalVideoTrack,
  enabled: boolean,
  processorRef: { current: BackgroundProcessorWrapper | null }
) {
  try {
    const { BackgroundProcessor, supportsBackgroundProcessors } = await import(
      "@livekit/track-processors"
    );
    if (!supportsBackgroundProcessors()) return;

    if (enabled) {
      if (!processorRef.current) {
        processorRef.current = BackgroundProcessor({
          mode: "background-blur",
          blurRadius: 16,
        });
      }
      if (videoTrack.getProcessor() !== processorRef.current) {
        await videoTrack.setProcessor(processorRef.current);
      }
      await processorRef.current.switchTo({
        mode: "background-blur",
        blurRadius: 16,
      });
      return;
    }

    if (processorRef.current && videoTrack.getProcessor()) {
      await processorRef.current.switchTo({ mode: "disabled" });
    }
  } catch (err) {
    console.info("[Discorde] Desfoque de fundo indisponível:", err);
  }
}

export function useLocalTrackEffects() {
  const prefs = useMediaPreferences();
  const { microphoneTrack, cameraTrack } = useLocalParticipant();
  const krispRef = useRef<KrispNoiseFilterProcessor | null>(null);
  const blurRef = useRef<BackgroundProcessorWrapper | null>(null);

  useEffect(() => {
    const audioTrack = microphoneTrack?.track;
    if (!(audioTrack instanceof LocalAudioTrack)) return;

    let cancelled = false;
    void applyAudioEffects(audioTrack, prefs, krispRef, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [
    microphoneTrack,
    prefs.echoCancellation,
    prefs.autoGainControl,
    prefs.noiseSuppression,
    prefs.krisp,
  ]);

  useEffect(() => {
    const videoTrack = cameraTrack?.track;
    if (!(videoTrack instanceof LocalVideoTrack)) return;
    if (cameraTrack?.source !== Track.Source.Camera) return;

    void applyBlurEffect(videoTrack, prefs.backgroundBlur, blurRef);
  }, [cameraTrack, prefs.backgroundBlur]);
}
