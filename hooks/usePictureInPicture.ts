"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import {
  exitPictureInPicture,
  findVideoElement,
  requestPictureInPicture,
} from "@/lib/popOutVideo";

/**
 * Coloca o <video> renderizado dentro de `containerRef` em Picture-in-Picture.
 * Usa o elemento já em reprodução para preservar o gesto do usuário.
 */
export function usePictureInPicture(
  containerRef: RefObject<HTMLElement | null>,
  onFallback?: () => void
) {
  const [isPiPActive, setIsPiPActive] = useState(false);

  // Ouve no document: o container pode montar depois do primeiro render
  useEffect(() => {
    const belongsToContainer = (target: EventTarget | null) =>
      Boolean(target && containerRef.current?.contains(target as Node));

    const handleEnter = (event: Event) => {
      if (belongsToContainer(event.target)) setIsPiPActive(true);
    };
    const handleLeave = (event: Event) => {
      if (belongsToContainer(event.target)) setIsPiPActive(false);
    };

    document.addEventListener("enterpictureinpicture", handleEnter, true);
    document.addEventListener("leavepictureinpicture", handleLeave, true);

    return () => {
      document.removeEventListener("enterpictureinpicture", handleEnter, true);
      document.removeEventListener("leavepictureinpicture", handleLeave, true);
    };
  }, [containerRef]);

  const togglePiP = useCallback(async () => {
    const video = findVideoElement(containerRef.current);

    if (video && document.pictureInPictureElement === video) {
      await exitPictureInPicture();
      setIsPiPActive(false);
      return;
    }

    if (video && (await requestPictureInPicture(video))) return;

    onFallback?.();
  }, [containerRef, onFallback]);

  return { isPiPActive, togglePiP };
}
