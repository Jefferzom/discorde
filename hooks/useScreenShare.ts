import { useCallback, useEffect, useRef, useState } from "react";
import {
  detectScreenShareMode,
  getDisplayMediaConstraints,
  ScreenShareMode,
} from "@/lib/screenShare";

export function useScreenShare() {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [screenShareMode, setScreenShareMode] = useState<ScreenShareMode>("screen");
  const screenShareStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    screenShareStreamRef.current = screenShareStream;
  }, [screenShareStream]);

  const stopScreenShare = useCallback(() => {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setScreenShareStream(null);
    setIsScreenSharing(false);
  }, []);

  const attachScreenShareStream = useCallback(
    (stream: MediaStream) => {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => stopScreenShare();
      }
      setScreenShareStream(stream);
      setScreenShareMode(detectScreenShareMode(stream));
      setIsScreenSharing(true);
    },
    [stopScreenShare]
  );

  const startScreenShare = useCallback(
    async (mode: ScreenShareMode) => {
      const stream = await navigator.mediaDevices.getDisplayMedia(
        getDisplayMediaConstraints(mode)
      );
      attachScreenShareStream(stream);
    },
    [attachScreenShareStream]
  );

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        await startScreenShare(screenShareMode);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.info("[Discorde] Compartilhamento de tela cancelado:", err);
    }
  }, [isScreenSharing, screenShareMode, startScreenShare, stopScreenShare]);

  const changeScreenShareMode = useCallback(
    async (mode: ScreenShareMode) => {
      if (!isScreenSharing || mode === screenShareMode) return;

      try {
        const oldStream = screenShareStreamRef.current;
        const stream = await navigator.mediaDevices.getDisplayMedia(
          getDisplayMediaConstraints(mode)
        );

        if (oldStream) {
          oldStream.getTracks().forEach((track) => track.stop());
        }

        attachScreenShareStream(stream);
      } catch (err) {
        console.info("[Discorde] Troca de tipo de compartilhamento cancelada:", err);
      }
    },
    [attachScreenShareStream, isScreenSharing, screenShareMode]
  );

  return {
    isScreenSharing,
    screenShareStream,
    screenShareMode,
    toggleScreenShare,
    stopScreenShare,
    changeScreenShareMode,
  };
}
