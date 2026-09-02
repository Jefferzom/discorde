import type { ScreenShareCaptureOptions, TrackPublishOptions } from "livekit-client";
import { ScreenSharePresets, Track } from "livekit-client";

export type ScreenShareMode = "screen" | "window" | "tab";

/** Preset oficial LiveKit: 1920×1080 @ 30fps, até 5 Mbps */
export const SCREEN_SHARE_HD_PRESET = ScreenSharePresets.h1080fps30;

/** Camada simulcast inferior para assinantes com banda limitada */
const SCREEN_SHARE_SIMULCAST_LAYERS = [ScreenSharePresets.h720fps15];

export function getScreenSharePublishOptions(): TrackPublishOptions {
  return {
    source: Track.Source.ScreenShare,
    simulcast: true,
    /** Prioriza nitidez de texto/UI quando a banda cai (padrão LiveKit para share) */
    degradationPreference: "maintain-resolution",
    screenShareEncoding: SCREEN_SHARE_HD_PRESET.encoding,
    screenShareSimulcastLayers: SCREEN_SHARE_SIMULCAST_LAYERS,
  };
}

/** Opções estáveis para passar ao setScreenShareEnabled */
export const SCREEN_SHARE_PUBLISH_OPTIONS = getScreenSharePublishOptions();

export function getDisplayMediaConstraints(mode: ScreenShareMode): DisplayMediaStreamOptions {
  const displaySurface =
    mode === "screen" ? "monitor" : mode === "window" ? "window" : "browser";
  const { width, height, frameRate } = SCREEN_SHARE_HD_PRESET.resolution;

  return {
    video: {
      displaySurface,
      width: { ideal: width, max: width },
      height: { ideal: height, max: height },
      frameRate: { ideal: frameRate ?? 30, max: 30 },
    } as MediaTrackConstraints,
    audio: true,
  };
}

export function toScreenShareCaptureOptions(
  mode: ScreenShareMode
): ScreenShareCaptureOptions {
  const displaySurface =
    mode === "screen" ? "monitor" : mode === "window" ? "window" : "browser";

  return {
    audio: true,
    video: { displaySurface },
    resolution: SCREEN_SHARE_HD_PRESET.resolution,
    contentHint: "detail",
    selfBrowserSurface: mode === "tab" ? "include" : "exclude",
    preferCurrentTab: mode === "tab",
  };
}

export function detectScreenShareMode(stream: MediaStream): ScreenShareMode {
  const track = stream.getVideoTracks()[0];
  const settings = track?.getSettings?.();
  const surface = settings?.displaySurface as string | undefined;

  if (surface === "monitor") return "screen";
  if (surface === "window") return "window";
  if (surface === "browser") return "tab";
  return "screen";
}
