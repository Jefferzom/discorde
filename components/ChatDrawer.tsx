"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  Users,
  Paperclip,
  Smile,
  Gift,
  Sparkles,
  Shield,
  MessageSquare
} from "lucide-react";
import { ChatMessage, Participant } from "../types/streamsync";
import { useI18n } from "@/lib/i18n/context";

interface ChatDrawerProps {
  isOpen: boolean;
  showMemberList?: boolean;
  onClose: () => void;
  channelName: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  participants: Participant[];
}

export default function ChatDrawer({
  isOpen,
  showMemberList = false,
  onClose,
  channelName,
  messages,
  onSendMessage,
  participants,
}: ChatDrawerProps) {
  const { t } = useI18n();
  const [inputText, setInputText] = useState("");

  if (!isOpen && !showMemberList) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

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
            <>
              <MessageSquare className="w-4 h-4 text-[#6366f1]" />
              <span className="font-bold text-sm text-white">
                #{channelName} {t.chat.channelChat}
              </span>
            </>
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
        /* Member List View */
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
          <div className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider px-2 py-1">
            {t.chat.onlineMembers} — {participants.length}
          </div>

          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#292932] transition-colors cursor-pointer group"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
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
                  {p.isSpeaking ? t.common.speaking : p.isScreenSharing ? t.common.streamingCode : t.common.online}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Chat Messages View */
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            {/* Welcome banner */}
            <div className="p-3.5 rounded-2xl bg-[#13131b]/60 border border-[#292932] text-xs text-[#908fa0]">
              <span className="font-bold text-white block mb-0.5">
                {t.chat.welcomeTitle} #{channelName}!
              </span>
              {t.chat.welcomeDesc}.
            </div>

            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 text-xs leading-relaxed">
                <img
                  src={m.avatar}
                  alt={m.user}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white hover:underline cursor-pointer">
                      {m.user}
                    </span>
                    <span className="text-[10px] text-[#908fa0]">
                      {m.timestamp}
                    </span>
                  </div>
                  <p className="text-[#e4e1ed] mt-1">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[#13131b] border-t border-[#292932]">
            <form
              onSubmit={handleSubmit}
              className="flex items-center bg-[#1f1f27] border border-[#292932] rounded-xl px-3 py-2 focus-within:border-[#6366f1] transition-colors"
            >
              <input
                type="text"
                placeholder={`${t.chat.messagePlaceholder} #${channelName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder:text-[#908fa0] focus:outline-none"
              />
              <div className="flex items-center gap-1.5 text-[#908fa0]">
                <button
                  type="button"
                  onClick={() => setInputText((prev) => prev + " 🔥")}
                  className="hover:text-white transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-1 rounded-lg transition-colors ${
                    inputText.trim()
                      ? "text-[#6366f1] hover:text-[#8083ff]"
                      : "text-[#464554] cursor-not-allowed"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </aside>
  );
}
