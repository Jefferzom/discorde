"use client";

import { useCallQuality } from "@/hooks/useCallQuality";

export default function CallStatsHud() {
  const stats = useCallQuality();
  const resolution =
    stats.width && stats.height ? `${stats.width}×${stats.height}` : null;
  const hasAny =
    resolution ||
    stats.fps != null ||
    stats.bitrateKbps != null ||
    stats.rttMs != null;

  if (!hasAny) return null;

  return (
    <div className="absolute bottom-3 right-3 z-20 pointer-events-none font-mono text-[10px] leading-snug text-white/85 bg-black/55 backdrop-blur-sm rounded-md px-2 py-1.5 border border-white/10">
      {resolution && (
        <div>
          {resolution}
          {stats.fps != null ? ` @ ${stats.fps}` : ""}
        </div>
      )}
      {stats.bitrateKbps != null && <div>{stats.bitrateKbps} kbps</div>}
      {(stats.rttMs != null || stats.packetLossPct != null) && (
        <div>
          {stats.rttMs != null ? `${stats.rttMs}ms` : "—"}
          {stats.packetLossPct != null ? ` · ${stats.packetLossPct}%` : ""}
        </div>
      )}
    </div>
  );
}
