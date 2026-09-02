"use client";

import { useCallback, useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  toScreenShareCaptureOptions,
  type ScreenShareMode,
} from "@/lib/screenShare";

export function useLiveKitScreenShare() {
  const room = useRoomContext();
  const { localParticipant, isScreenShareEnabled } = useLocalParticipant();
  const [mode, setMode] = useState<ScreenShareMode>("screen");
  const [busy, setBusy] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startShare = useCallback(
    async (nextMode: ScreenShareMode = mode) => {
      setBusy(true);
      try {
        await localParticipant.setScreenShareEnabled(
          true,
          toScreenShareCaptureOptions(nextMode)
        );
        setMode(nextMode);
        setIsPaused(false);
      } catch (err) {
        console.info("[Discorde] Compartilhamento cancelado:", err);
      } finally {
        setBusy(false);
      }
    },
    [localParticipant, mode]
  );

  const stopShare = useCallback(async () => {
    setBusy(true);
    try {
      await localParticipant.setScreenShareEnabled(false);
      setIsPaused(false);
    } finally {
      setBusy(false);
    }
  }, [localParticipant]);

  const toggleShare = useCallback(async () => {
    if (isScreenShareEnabled) {
      await stopShare();
      return;
    }
    await startShare(mode);
  }, [isScreenShareEnabled, mode, startShare, stopShare]);

  const changeMode = useCallback(
    async (nextMode: ScreenShareMode) => {
      setMode(nextMode);
      if (!isScreenShareEnabled) {
        await startShare(nextMode);
        return;
      }
      setBusy(true);
      try {
        await localParticipant.setScreenShareEnabled(false);
        await localParticipant.setScreenShareEnabled(
          true,
          toScreenShareCaptureOptions(nextMode)
        );
        setIsPaused(false);
      } catch (err) {
        console.info("[Discorde] Troca de tipo cancelada:", err);
      } finally {
        setBusy(false);
      }
    },
    [isScreenShareEnabled, localParticipant, startShare]
  );

  const togglePause = useCallback(async () => {
    const pub = room.localParticipant.getTrackPublication(Track.Source.ScreenShare);
    if (!pub) return;
    if (pub.isUpstreamPaused) {
      await pub.resumeUpstream();
      setIsPaused(false);
    } else {
      await pub.pauseUpstream();
      setIsPaused(true);
    }
  }, [room]);

  return {
    isScreenShareEnabled,
    isPaused,
    mode,
    busy,
    toggleShare,
    stopShare,
    changeMode,
    togglePause,
  };
}
