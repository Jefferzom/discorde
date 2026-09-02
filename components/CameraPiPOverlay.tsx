"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VideoTrack } from "@livekit/components-react";
import type { TrackReference } from "@livekit/components-core";
import { ExternalLink, GripVertical, X } from "lucide-react";
import { popOutFromTrackRef } from "@/lib/popOutVideo";

interface CameraPiPOverlayProps {
  trackRef: TrackReference;
  name: string;
  onClose: () => void;
  popOutLabel: string;
  closeLabel: string;
}

export default function CameraPiPOverlay({
  trackRef,
  name,
  onClose,
  popOutLabel,
  closeLabel,
}: CameraPiPOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-pip-action]")) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const parent = containerRef.current?.offsetParent as HTMLElement | null;
      const bounds = parent?.getBoundingClientRect();
      if (!bounds) return;

      const width = containerRef.current?.offsetWidth ?? 200;
      const height = containerRef.current?.offsetHeight ?? 140;

      const x = Math.min(
        Math.max(e.clientX - bounds.left - dragOffset.current.x, 8),
        bounds.width - width - 8
      );
      const y = Math.min(
        Math.max(e.clientY - bounds.top - dragOffset.current.y, 8),
        bounds.height - height - 8
      );

      setPosition({ x, y });
    },
    [dragging]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    setPosition(null);
  }, [trackRef.participant.identity]);

  useEffect(() => {
    if (position !== null || !containerRef.current?.offsetParent) return;
    const parent = containerRef.current.offsetParent as HTMLElement;
    const width = containerRef.current.offsetWidth || 200;
    const height = containerRef.current.offsetHeight || 140;
    setPosition({
      x: parent.clientWidth - width - 16,
      y: parent.clientHeight - height - 16,
    });
  }, [position, trackRef.participant.identity]);

  if (!position) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute z-20 w-44 sm:w-52 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500/50 bg-black cursor-grab active:cursor-grabbing ${
        dragging ? "ring-2 ring-indigo-400/60" : ""
      }`}
      style={{ left: position.x, top: position.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <VideoTrack
        trackRef={trackRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 bg-[#13131b]/90 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 min-w-0">
          <GripVertical className="w-3 h-3 text-[#908fa0] shrink-0" />
          <span className="text-[10px] font-semibold text-white truncate">{name}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            data-pip-action
            onClick={() => popOutFromTrackRef(trackRef, name)}
            className="p-1 rounded-md bg-[#13131b]/90 border border-white/10 text-[#c7c4d7] hover:text-white hover:bg-[#292932] transition-colors"
            title={popOutLabel}
          >
            <ExternalLink className="w-3 h-3" />
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
