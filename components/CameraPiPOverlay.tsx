"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { VideoTrack, useIsSpeaking } from "@livekit/components-react";
import type { TrackReference } from "@livekit/components-core";
import { GripVertical, PictureInPicture2, Pin, X } from "lucide-react";
import { popOutFromTrackRef } from "@/lib/popOutVideo";
import { usePictureInPicture } from "@/hooks/usePictureInPicture";
import { useMediaPreferences } from "@/hooks/useMediaPreferences";

interface CameraPiPOverlayProps {
  trackRef: TrackReference;
  name: string;
  onClose: () => void;
  onSpotlight?: () => void;
  popOutLabel: string;
  closeLabel: string;
  spotlightLabel: string;
}

export default function CameraPiPOverlay({
  trackRef,
  name,
  onClose,
  onSpotlight,
  popOutLabel,
  closeLabel,
  spotlightLabel,
}: CameraPiPOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const isSpeaking = useIsSpeaking(trackRef.participant);
  const mediaPrefs = useMediaPreferences();

  const handlePiPFallback = useCallback(() => {
    popOutFromTrackRef(trackRef, name);
  }, [trackRef, name]);

  const { isPiPActive, togglePiP } = usePictureInPicture(
    containerRef,
    handlePiPFallback
  );

  const trackSid = trackRef.publication?.trackSid;

  const placeDefault = useCallback(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const width = containerRef.current?.offsetWidth ?? 208;
    const height = containerRef.current?.offsetHeight ?? 117;

    setPosition({
      x: Math.max(parent.clientWidth - width - 16, 8),
      y: Math.max(parent.clientHeight - height - 16, 8),
    });
  }, []);

  useLayoutEffect(() => {
    setPosition(null);
    placeDefault();
  }, [trackRef.participant.identity, trackSid, placeDefault]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-pip-action]")) return;
    e.preventDefault();
    dragMoved.current = false;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      dragMoved.current = true;
      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      const width = containerRef.current?.offsetWidth ?? 208;
      const height = containerRef.current?.offsetHeight ?? 117;

      const x = Math.min(
        Math.max(e.clientX - parent.getBoundingClientRect().left - dragOffset.current.x, 8),
        parent.clientWidth - width - 8
      );
      const y = Math.min(
        Math.max(e.clientY - parent.getBoundingClientRect().top - dragOffset.current.y, 8),
        parent.clientHeight - height - 8
      );

      setPosition({ x, y });
    },
    [dragging]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      setDragging(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      if (!dragMoved.current) {
        onSpotlight?.();
      }
    },
    [onSpotlight]
  );

  useEffect(() => {
    if (position !== null) return;
    placeDefault();
  }, [position, placeDefault]);

  return (
    <div
      ref={containerRef}
      className={`absolute z-20 w-44 sm:w-52 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 bg-black ${
        isSpeaking
          ? "border-emerald-400 ring-2 ring-emerald-400/70"
          : "border-indigo-500/50"
      } ${
        onSpotlight ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      } ${dragging ? "ring-2 ring-indigo-400/60" : ""}`}
      style={
        position
          ? { left: position.x, top: position.y }
          : { right: 16, bottom: 16 }
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <VideoTrack
        trackRef={trackRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
          trackRef.participant.isLocal && mediaPrefs.mirrorLocalVideo
            ? "scale-x-[-1]"
            : ""
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 bg-[#13131b]/90 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 min-w-0">
          <GripVertical className="w-3 h-3 text-[#908fa0] shrink-0" />
          <span className="text-[10px] font-semibold text-white truncate">{name}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {onSpotlight && (
            <button
              type="button"
              data-pip-action
              data-pip-spotlight
              onClick={onSpotlight}
              className="p-1 rounded-md bg-[#13131b]/90 border border-white/10 text-indigo-300 hover:text-white hover:bg-indigo-500/30 transition-colors"
              title={spotlightLabel}
            >
              <Pin className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            data-pip-action
            onClick={() => void togglePiP()}
            className={`p-1 rounded-md border border-white/10 transition-colors ${
              isPiPActive
                ? "bg-indigo-500/80 text-white"
                : "bg-[#13131b]/90 text-[#c7c4d7] hover:text-white hover:bg-[#292932]"
            }`}
            title={popOutLabel}
          >
            <PictureInPicture2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            data-pip-action
            onClick={onClose}
            className="p-1 rounded-md bg-[#13131b]/90 border border-white/10 text-[#c7c4d7] hover:text-red-400 hover:bg-red-500/20 transition-colors"
            title={closeLabel}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
