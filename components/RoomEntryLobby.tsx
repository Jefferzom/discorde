"use client";

import { useRouter } from "next/navigation";
import { Radio, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useUserProfile } from "@/hooks/useUserProfile";
import { playNotificationSound } from "@/lib/notificationSounds";

export default function RoomEntryLobby() {
  const router = useRouter();
  const { t } = useI18n();
  const profile = useUserProfile();

  const handleCreateRoom = () => {
    const roomId = crypto.randomUUID();
    playNotificationSound("roomSwitch");
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="flex-1 bg-[#0d0d15] flex items-center justify-center p-6 select-none overflow-y-auto">
      <div className="max-w-md w-full bg-[#1b1b23] border border-[#292932] rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t.lobby.entryTitle}</h1>
            <p className="text-xs text-[#908fa0]">{t.lobby.entryDesc}</p>
          </div>
        </div>

        {profile && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#13131b] border border-[#292932] mb-6">
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              className="w-12 h-12 rounded-xl object-cover border border-white/10"
            />
            <div>
              <p className="text-sm font-semibold text-white">{profile.username}</p>
              <p className="text-[11px] text-[#908fa0]">{t.common.online}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleCreateRoom}
          className="w-full py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" />
          {t.lobby.createNewRoom}
        </button>

        <p className="mt-6 text-[11px] text-center text-[#908fa0] leading-relaxed">
          {t.lobby.encrypted} • {t.lobby.opusAudio}
        </p>
      </div>
    </div>
  );
}
