"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Hash,
  Volume2,
  Radio,
  Plus,
  Mic,
  MicOff,
  Headphones,
  Settings,
  Sparkles,
  ShieldCheck,
  Folder,
  Code2,
  Bell
} from "lucide-react";
import { Participant } from "../types/streamsync";
import { useI18n } from "@/lib/i18n/context";

interface ChannelSidebarProps {
  serverName: string;
  activeChannelId: string;
  onSelectChannel: (id: string, type: "text" | "voice") => void;
  onOpenCreateChannel: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isDeafened: boolean;
  onToggleDeafen: () => void;
  participants: Participant[];
  isInCall: boolean;
}

export default function ChannelSidebar({
  serverName,
  activeChannelId,
  onSelectChannel,
  onOpenCreateChannel,
  onOpenSettings,
  isMuted,
  onToggleMute,
  isDeafened,
  onToggleDeafen,
  participants,
  isInCall,
}: ChannelSidebarProps) {
  const { t } = useI18n();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <aside className="w-[240px] h-screen fixed left-[72px] top-0 bg-[#1b1b23] flex flex-col z-20 shadow-xl border-r border-[#292932]">
      {/* Server Header */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full h-12 flex items-center justify-between px-4 border-b border-[#292932] shadow-sm hover:bg-[#292932] transition-colors duration-150 text-left group"
        >
          <div className="flex items-center gap-2 truncate">
            <h1 className="font-semibold text-[15px] text-[#e4e1ed] truncate tracking-tight">
              {serverName}
            </h1>
            <ShieldCheck className="w-4 h-4 text-[#6366f1] shrink-0" />
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#c7c4d7] transition-transform duration-200 group-hover:text-white ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute top-13 left-2 right-2 bg-[#13131b] border border-[#34343d] rounded-xl p-1.5 shadow-2xl z-50 text-sm animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onOpenCreateChannel();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-indigo-400 hover:bg-[#6366f1] hover:text-white transition-colors"
            >
              <span>{t.navigation.createChannel}</span>
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setDropdownOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
            >
              <span>{t.navigation.serverSettings}</span>
              <Settings className="w-4 h-4" />
            </button>
            <div className="h-px bg-[#292932] my-1" />
            <button
              onClick={() => setDropdownOpen(false)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
            >
              <span>{t.navigation.notificationSettings}</span>
              <Bell className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1 custom-scrollbar">
        {/* TEXT CHANNELS CATEGORY */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[#908fa0] group">
          <span className="text-[11px] font-bold tracking-wider uppercase">
            {t.navigation.textChannels}
          </span>
          <button
            onClick={onOpenCreateChannel}
            className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
            title={t.navigation.createChannel}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Channel Items */}
        <button
          onClick={() => onSelectChannel("general", "text")}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[14px] transition-colors w-full text-left ${
            activeChannelId === "general"
              ? "bg-[#34343d] text-white font-medium"
              : "text-[#c7c4d7] hover:bg-[#292932] hover:text-[#e4e1ed]"
          }`}
        >
          <Hash className="w-4 h-4 text-[#908fa0] shrink-0" />
          <span className="truncate flex-1">{t.navigation.general}</span>
          <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
        </button>

        <button
          onClick={() => onSelectChannel("announcements", "text")}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[14px] transition-colors w-full text-left ${
            activeChannelId === "announcements"
              ? "bg-[#34343d] text-white font-medium"
              : "text-[#c7c4d7] hover:bg-[#292932] hover:text-[#e4e1ed]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#ffb783] shrink-0" />
          <span className="truncate">{t.navigation.announcements}</span>
        </button>

        <button
          onClick={() => onSelectChannel("dev-chat", "text")}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[14px] transition-colors w-full text-left ${
            activeChannelId === "dev-chat"
              ? "bg-[#34343d] text-white font-medium"
              : "text-[#c7c4d7] hover:bg-[#292932] hover:text-[#e4e1ed]"
          }`}
        >
          <Code2 className="w-4 h-4 text-[#908fa0] shrink-0" />
          <span className="truncate">{t.navigation.devChat}</span>
        </button>

        <button
          onClick={() => onSelectChannel("resources", "text")}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[14px] transition-colors w-full text-left ${
            activeChannelId === "resources"
              ? "bg-[#34343d] text-white font-medium"
              : "text-[#c7c4d7] hover:bg-[#292932] hover:text-[#e4e1ed]"
          }`}
        >
          <Folder className="w-4 h-4 text-[#908fa0] shrink-0" />
          <span className="truncate">{t.navigation.resources}</span>
        </button>

        {/* VOICE CHANNELS CATEGORY */}
        <div className="flex items-center justify-between px-2 pt-4 pb-1 text-[#908fa0] group">
          <span className="text-[11px] font-bold tracking-wider uppercase">
            {t.navigation.voiceChannels}
          </span>
          <button
            onClick={onOpenCreateChannel}
            className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
            title={t.navigation.createChannel}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Voice Lounge */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onSelectChannel("voice-lounge", "voice")}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[14px] transition-colors w-full text-left ${
              activeChannelId === "voice-lounge"
                ? "bg-[#34343d] text-white font-medium"
                : "text-[#c7c4d7] hover:bg-[#292932] hover:text-[#e4e1ed]"
            }`}
          >
            <Volume2 className="w-4 h-4 text-[#adc6ff] shrink-0" />
            <span className="truncate flex-1">{t.navigation.voiceLounge}</span>
            {isInCall && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                {t.common.connected}
              </span>
            )}
          </button>

          {/* Voice Lounge Connected Participants list */}
          <div className="pl-6 pr-1 py-1 flex flex-col gap-1">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-[#292932]/70 group cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    {p.isSpeaking && (
                      <span className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-75" />
                    )}
                  </div>
                  <span
                    className={`text-[12px] truncate ${
                      p.isSpeaking
                        ? "text-emerald-300 font-semibold"
                        : "text-[#c7c4d7]"
                    }`}
                  >
                    {p.name} {p.isYou && `(${t.common.you})`}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
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
            ))}
          </div>
        </div>

        {/* Other Voice Channels */}
        <button
          onClick={() => onSelectChannel("gaming-squad", "voice")}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[14px] transition-colors w-full text-left ${
            activeChannelId === "gaming-squad"
              ? "bg-[#34343d] text-white font-medium"
              : "text-[#c7c4d7] hover:bg-[#292932] hover:text-[#e4e1ed]"
          }`}
        >
          <Volume2 className="w-4 h-4 text-[#908fa0] shrink-0" />
          <span className="truncate">{t.navigation.gamingSquad}</span>
        </button>

        <button
          onClick={() => onSelectChannel("stage-stream", "voice")}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[14px] transition-colors w-full text-left ${
            activeChannelId === "stage-stream"
              ? "bg-[#34343d] text-white font-medium"
              : "text-[#c7c4d7] hover:bg-[#292932] hover:text-[#e4e1ed]"
          }`}
        >
          <Radio className="w-4 h-4 text-[#ffb783] shrink-0" />
          <span className="truncate">{t.navigation.stageKeynote}</span>
        </button>
      </div>

      {/* User Status Bar */}
      <div className="h-14 bg-[#13131b] flex items-center justify-between px-2.5 border-t border-[#292932]">
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#292932] cursor-pointer transition-colors max-w-[125px]"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Alex"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#13131b]" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[13px] font-semibold text-[#e4e1ed] truncate leading-tight">
              Alex
            </span>
            <span className="text-[10px] text-[#908fa0] truncate">
              #1337 • {t.common.online}
            </span>
          </div>
        </div>

        {/* Quick Media Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg transition-colors ${
              isMuted
                ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
            }`}
            title={isMuted ? t.navigation.unmuteMic : t.navigation.muteMic}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleDeafen}
            className={`p-1.5 rounded-lg transition-colors ${
              isDeafened
                ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
            }`}
            title={isDeafened ? t.navigation.undeafen : t.navigation.deafen}
          >
            <Headphones className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
            title={t.navigation.userSettings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
