export type ScreenShareMode = "screen" | "window" | "tab";

export function getDisplayMediaConstraints(mode: ScreenShareMode): DisplayMediaStreamOptions {
  const displaySurface =
    mode === "screen" ? "monitor" : mode === "window" ? "window" : "browser";

  return {
    video: {
      displaySurface,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    } as MediaTrackConstraints,
    audio: true,
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
