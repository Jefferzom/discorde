"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSavedMediaDeviceId } from "@/lib/mediaDeviceStorage";
import { getMediaPreferences } from "@/lib/mediaPreferences";

interface UseLocalMediaPreviewOptions {
  videoOn: boolean;
  muted: boolean;
}

export function useLocalMediaPreview({
  videoOn,
  muted,
}: UseLocalMediaPreviewOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const [micLevel, setMicLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const audioCtxs: AudioContext[] = [];
    let raf = 0;

    async function start() {
      stopStream();
      setReady(false);
      setError(null);
      setMicLevel(0);

      const audioId = getSavedMediaDeviceId("audioinput");
      const prefs = getMediaPreferences();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: prefs.echoCancellation,
            autoGainControl: prefs.autoGainControl,
            noiseSuppression: prefs.noiseSuppression,
            ...(audioId ? { deviceId: { ideal: audioId } } : {}),
          },
          video: videoOn,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream.getAudioTracks().forEach((track) => {
          track.enabled = !mutedRef.current;
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setReady(true);

        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack) return;

        const AudioCtx =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        audioCtxs.push(ctx);
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((sum, n) => sum + n, 0) / data.length;
          setMicLevel(Math.min(100, Math.round((avg / 80) * 100)));
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        if (!cancelled) {
          setError("preview");
          setReady(false);
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      audioCtxs.forEach((ctx) => {
        void ctx.close();
      });
      stopStream();
    };
  }, [videoOn, stopStream]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
    if (muted) setMicLevel(0);
  }, [muted]);

  return { videoRef, micLevel, error, ready, stopStream };
}
