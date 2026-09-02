"use client";

import React from "react";
import { X, Users } from "lucide-react";
import { Participant } from "../types/streamsync";
import { useI18n } from "@/lib/i18n/context";
import TextChannelChat from "./TextChannelChat";

interface ChatDrawerProps {
  isOpen: boolean;
  showMemberList?: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
  participants: Participant[];
  currentUser?: { name: string; avatar: string };
}

export default function ChatDrawer({
  isOpen,
  showMemberList = false,
  onClose,
  channelId,
  channelName,
  participants,
  currentUser,
}: ChatDrawerProps) {
  const { t } = useI18n();

  if (!isOpen && !showMemberList) return null;

  return (
    <aside className="w-80 h-full bg-[#1b1b23] border-l border-[#292932] flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-12 border-b border-[#292932] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {showMemberList ? (
            <>
              <Users className="w-4 h-4 text-[#adc6ff]" />
              <span className="font-bold text-sm text-white">{t.chat.onlineMembers}</span>
            </>
          ) : (
            <span className="font-bold text-sm text-white">
              #{channelName} {t.chat.channelChat}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showMemberList ? (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
          <div className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider px-2 py-1">
            {t.chat.onlineMembers} — {participants.length}
          </div>

          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#292932] transition-colors cursor-pointer group"
            >
                <div
                  className={`relative w-8 h-8 rounded-full overflow-hidden shrink-0 ${
                    p.isSpeaking
                      ? "ring-2 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                      : ""
                  }`}
                >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#1b1b23]" />
              </div>
              <div className="flex flex-col truncate flex-1">
                <span className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                  {p.name} {p.isYou && `(${t.common.you})`}
                </span>
                <span className="text-[10px] text-[#908fa0] truncate">
                  {p.isSpeaking
                    ? t.common.speaking
                    : p.isScreenSharing
                    ? t.common.streamingCode
                    : t.common.online}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TextChannelChat
          key={channelId}
          channelId={channelId}
          channelName={channelName}
          currentUser={currentUser}
          variant="compact"
        />
      )}
    </aside>
  );
}
