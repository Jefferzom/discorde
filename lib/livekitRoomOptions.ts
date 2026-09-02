import { ScreenSharePresets, VideoPresets, type RoomOptions } from "livekit-client";
import { getMediaPreferences } from "@/lib/mediaPreferences";
import { getSavedMediaDeviceId } from "@/lib/mediaDeviceStorage";

export function getLiveKitRoomOptions(): RoomOptions {
  const prefs = getMediaPreferences();
  const audioId = getSavedMediaDeviceId("audioinput");

  return {
    adaptiveStream: true,
    dynacast: true,
    audioCaptureDefaults: {
      echoCancellation: prefs.echoCancellation,
      autoGainControl: prefs.autoGainControl,
      noiseSuppression: prefs.noiseSuppression,
      ...(audioId ? { deviceId: audioId } : {}),
    },
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
    },
    publishDefaults: {
      simulcast: true,
      /** Câmera: 720p30 — share usa screenShareEncoding abaixo */
      videoEncoding: {
        maxBitrate: 1_700_000,
        maxFramerate: 30,
      },
      /** Screen share: 1080p @ 30fps (preset oficial LiveKit) */
      screenShareEncoding: ScreenSharePresets.h1080fps30.encoding,
      screenShareSimulcastLayers: [ScreenSharePresets.h720fps15],
    },
  };
}
