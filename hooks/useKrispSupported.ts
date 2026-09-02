"use client";

import { useEffect, useState } from "react";

export function useKrispSupported() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("@livekit/krisp-noise-filter")
      .then(({ isKrispNoiseFilterSupported }) => {
        if (!cancelled) setSupported(isKrispNoiseFilterSupported());
      })
      .catch(() => {
        if (!cancelled) setSupported(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return supported;
}
