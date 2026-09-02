"use client";

import { useState } from "react";
import { ConnectionQuality } from "livekit-client";
import { Activity, Signal } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useCallQuality, type CallQualityStats } from "@/hooks/useCallQuality";

function qualityTone(quality: ConnectionQuality) {
  switch (quality) {
    case ConnectionQuality.Excellent:
      return {
        pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        dot: "bg-emerald-400",
      };
    case ConnectionQuality.Good:
      return {
        pill: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        dot: "bg-amber-400",
      };
    case ConnectionQuality.Poor:
    case ConnectionQuality.Lost:
      return {
        pill: "bg-red-500/15 text-red-300 border-red-500/30",
        dot: "bg-red-400",
      };
    default:
      return {
        pill: "bg-[#292932] text-[#c7c4d7] border-[#34343d]",
        dot: "bg-[#908fa0]",
      };
  }
}

function qualityLabel(
  quality: ConnectionQuality,
  labels: { excellent: string; good: string; poor: string; lost: string; unknown: string }
) {
  switch (quality) {
    case ConnectionQuality.Excellent:
      return labels.excellent;
    case ConnectionQuality.Good:
      return labels.good;
    case ConnectionQuality.Poor:
      return labels.poor;
    case ConnectionQuality.Lost:
      return labels.lost;
    default:
      return labels.unknown;
  }
}

export default function CallQualityBadge() {
  const { t } = useI18n();
  const stats = useCallQuality();
  const [open, setOpen] = useState(false);
  const tone = qualityTone(stats.quality);
  const label = qualityLabel(stats.quality, {
    excellent: t.call.qualityExcellent,
    good: t.call.qualityGood,
    poor: t.call.qualityPoor,
    lost: t.call.qualityLost,
    unknown: t.call.qualityUnknown,
  });

  const isBad =
    stats.quality === ConnectionQuality.Poor ||
    stats.quality === ConnectionQuality.Lost;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${tone.pill}`}
        title={isBad ? t.call.networkPoor : t.call.videoStats}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
        <Signal className="w-3 h-3" />
        <span className="hidden sm:inline">{label}</span>
        {stats.rttMs != null && <span className="font-mono opacity-80">{stats.rttMs}ms</span>}
      </button>

      {isBad && (
        <span className="hidden lg:inline ml-1 text-[11px] text-red-400 font-medium">
          {t.call.networkPoor}
        </span>
      )}

      {open && <StatsPanel stats={stats} onClose={() => setOpen(false)} />}
    </div>
  );
}

function StatsPanel({
  stats,
  onClose,
}: {
  stats: CallQualityStats;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const resolution =
    stats.width && stats.height ? `${stats.width}×${stats.height}` : "—";

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[70] cursor-default"
        aria-label={t.modal.cancel}
        onClick={onClose}
      />
      <div className="absolute top-full right-0 mt-2 z-[71] w-64 bg-[#13131b] border border-[#34343d] rounded-xl p-3 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          {t.call.videoStats}
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <dt className="text-[#908fa0]">{t.call.statPing}</dt>
          <dd className="text-right font-mono text-[#e4e1ed]">
            {stats.rttMs != null ? `${stats.rttMs} ms` : "—"}
          </dd>
          <dt className="text-[#908fa0]">{t.call.statLoss}</dt>
          <dd className="text-right font-mono text-[#e4e1ed]">
            {stats.packetLossPct != null ? `${stats.packetLossPct}%` : "—"}
          </dd>
          <dt className="text-[#908fa0]">{t.call.statBitrate}</dt>
          <dd className="text-right font-mono text-[#e4e1ed]">
            {stats.bitrateKbps != null ? `${stats.bitrateKbps} kbps` : "—"}
          </dd>
          <dt className="text-[#908fa0]">{t.call.statResolution}</dt>
          <dd className="text-right font-mono text-[#e4e1ed]">{resolution}</dd>
          <dt className="text-[#908fa0]">{t.call.statFps}</dt>
          <dd className="text-right font-mono text-[#e4e1ed]">
            {stats.fps != null ? `${stats.fps} fps` : "—"}
          </dd>
          <dt className="text-[#908fa0]">{t.call.statSource}</dt>
          <dd className="text-right text-[#e4e1ed]">
            {stats.source === "screen"
              ? t.stage.screenStream
              : stats.source === "camera"
                ? t.stage.cameraActive
                : "—"}
          </dd>
        </dl>
      </div>
    </>
  );
}
