"use client";

import React from "react";
import {
  Volume2,
  Hash,
  Search,
  LayoutGrid,
  Tv,
  MessageSquare,
  Users,
  Pin,
  Sparkles,
  Radio,
  Maximize2,
  Languages
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface TopBarProps {
  channelName: string;
  channelType: "text" | "voice" | "stage";
  viewMode: "stage" | "grid";
  onToggleViewMode: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isMemberListOpen: boolean;
  onToggleMemberList: () => void;
  isInCall: boolean;
  onToggleFullscreen?: () => void;
}

export default function TopBar({
  channelName,
  channelType,
  viewMode,
  onToggleViewMode,
  isChatOpen,
  onToggleChat,
  isMemberListOpen,
  onToggleMemberList,
  isInCall,
  onToggleFullscreen,
}: TopBarProps) {
  const { t, language, setLanguage } = useI18n();

  return (
    <header className="h-12 w-full bg-[#1f1f27] border-b border-[#292932] flex items-center justify-between px-4 z-10 shadow-sm shrink-0">
      {/* Left: Channel Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {channelType === "voice" ? (
            <Volume2 className="w-5 h-5 text-[#adc6ff]" />
          ) : channelType === "stage" ? (
            <Radio className="w-5 h-5 text-[#ffb783]" />
          ) : (
            <Hash className="w-5 h-5 text-[#908fa0]" />
          )}
          <h2 className="font-bold text-[15px] text-[#e4e1ed] tracking-tight">
            {channelName}
          </h2>
        </div>

        {isInCall && channelType === "voice" && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.common.rtcConnected}</span>
          </div>
        )}

        <div className="h-4 w-px bg-[#34343d] mx-1 hidden md:block" />

        <div className="hidden md:flex items-center gap-3 text-[13px] text-[#c7c4d7]">
          <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1">
            <Pin className="w-3.5 h-3.5" /> {t.common.pinnedNotes}
          </span>
          <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb783]" /> {t.common.threads}
          </span>
        </div>
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2">
        {/* Language Switcher Quick Pill */}
        <button
          onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#13131b] border border-[#292932] hover:border-[#6366f1] text-[11px] font-mono text-[#c7c4d7] hover:text-white transition-colors"
          title={language === "pt" ? "Switch to English" : "Mudar para Português"}
        >
          <Languages className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold uppercase">{language}</span>
        </button>

        {/* Stage vs Grid toggle if in voice call */}
        {channelType === "voice" && isInCall && (
          <div className="flex items-center bg-[#13131b] p-0.5 rounded-lg border border-[#34343d]">
            <button
              onClick={onToggleViewMode}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium transition-colors ${
                viewMode === "stage"
                  ? "bg-[#6366f1] text-white shadow-sm"
                  : "text-[#c7c4d7] hover:text-white"
              }`}
              title={t.stage.stageView}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.stage.stageView}</span>
            </button>
            <button
              onClick={onToggleViewMode}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-[#6366f1] text-white shadow-sm"
                  : "text-[#c7c4d7] hover:text-white"
              }`}
              title={t.stage.gridView}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.stage.gridView}</span>
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative hidden lg:block">
          <input
            type="text"
            placeholder={t.common.searchPlaceholder}
            className="bg-[#13131b] text-[13px] text-[#e4e1ed] placeholder:text-[#908fa0] border border-[#292932] rounded-lg py-1 pl-2.5 pr-7 w-36 focus:w-48 focus:border-[#6366f1] focus:outline-none transition-all duration-200"
          />
          <Search className="w-3.5 h-3.5 text-[#908fa0] absolute right-2.5 top-2" />
        </div>

        {/* Buttons */}
        <button
          onClick={onToggleChat}
          className={`p-1.5 rounded-lg transition-colors relative ${
            isChatOpen
              ? "bg-[#6366f1] text-white shadow-sm"
              : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
          }`}
          title={t.chat.channelChat}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
        </button>

        <button
          onClick={onToggleMemberList}
          className={`p-1.5 rounded-lg transition-colors ${
            isMemberListOpen
              ? "bg-[#34343d] text-white"
              : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
          }`}
          title={t.chat.onlineMembers}
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
          title={t.stage.fullscreen}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
