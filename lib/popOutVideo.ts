import type { LocalTrack, RemoteTrack, Track } from "livekit-client";

const POPUP_FEATURES = "width=720,height=480,menubar=no,toolbar=no,location=no,status=no";

export function popOutMediaTrack(mediaTrack: Track, title: string): Window | null {
  if (typeof window === "undefined") return null;

  const popup = window.open("", "_blank", POPUP_FEATURES);
  if (!popup) return null;

  popup.document.title = title;
  popup.document.body.style.cssText =
    "margin:0;background:#0d0d15;display:flex;align-items:center;justify-content:center;overflow:hidden;";
  popup.document.head.innerHTML = `<style>
    html, body { width:100%; height:100%; }
    video { width:100%; height:100%; object-fit:contain; background:#000; }
    .label { position:fixed; top:8px; left:8px; background:rgba(19,19,27,.9); color:#fff;
      font:600 12px system-ui; padding:4px 10px; border-radius:8px; border:1px solid rgba(255,255,255,.1); }
  </style>`;

  const label = popup.document.createElement("div");
  label.className = "label";
  label.textContent = title;
  popup.document.body.appendChild(label);

  const video = popup.document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.muted = mediaTrack.isLocal;
  popup.document.body.appendChild(video);

  mediaTrack.attach(video);

  const cleanup = () => {
    mediaTrack.detach(video);
    video.remove();
  };

  popup.addEventListener("beforeunload", cleanup);
  popup.addEventListener("unload", cleanup);

  return popup;
}

export function popOutFromTrackRef(
  trackRef: { publication?: { track?: Track | null } },
  title: string
): Window | null {
  const track = trackRef.publication?.track;
  if (!track) return null;
  return popOutMediaTrack(track, title);
}
