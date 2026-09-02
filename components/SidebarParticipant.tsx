"use client";

import { MicOff, Video } from "lucide-react";
import { Participant } from "@/types/streamsync";
import { useI18n } from "@/lib/i18n/context";

export default function SidebarParticipant({
  participant: p,
}: {
  participant: Participant;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-[#292932]/70 group cursor-pointer transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative w-5 h-5 shrink-0">
          <div className="w-5 h-5 rounded-full overflow-hidden">
            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
          </div>
          {p.isSpeaking && (
            <span className="absolute -inset-0.5 rounded-full border-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          )}
        </div>
        <span
          className={`text-[12px] truncate ${
            p.isSpeaking ? "text-emerald-300 font-semibold" : "text-[#c7c4d7]"
          }`}
        >
          {p.name} {p.isYou && `(${t.common.you})`}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {p.isVideoOn && (
          <span
            className="px-1 py-0.5 text-[9px] bg-indigo-500/20 text-indigo-300 font-bold uppercase rounded border border-indigo-500/30 flex items-center gap-0.5"
            title={t.stage.cameraActive}
          >
            <Video className="w-2.5 h-2.5" />
          </span>
        )}
        {p.isScreenSharing && (
          <span className="px-1 py-0.2 text-[9px] bg-red-500/20 text-red-400 font-bold uppercase rounded border border-red-500/30">
            {t.common.live}
          </span>
        )}
        {p.isMuted ? (
          <MicOff className="w-3 h-3 text-red-400" />
        ) : p.isSpeaking ? (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        ) : null}
      </div>
    </div>
  );
}
