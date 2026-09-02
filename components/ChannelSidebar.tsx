"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Hash,
  Volume2,
  Plus,
  Mic,
  MicOff,
  Headphones,
  Settings,
  Sparkles,
  ShieldCheck,
  Folder,
  Code2,
  Bell,
  PhoneOff,
  Signal,
} from "lucide-react";
import { Participant } from "../types/streamsync";
import { useI18n } from "@/lib/i18n/context";
import { useActiveRooms } from "@/hooks/useActiveRooms";
import VoiceRoomsList from "@/components/VoiceRoomsList";
import MediaDeviceSelector from "@/components/MediaDeviceSelector";
import PresenceStatusPicker, { PresenceDot } from "@/components/PresenceStatusPicker";
import { getRoomNameLocal } from "@/lib/roomStorage";

interface ChannelSidebarProps {
  serverName: string;
  activeChannelId: string;
  connectedChannelId: string | null;
  onSelectChannel: (id: string, type: "text" | "voice") => void;
  onOpenCreateChannel: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isDeafened: boolean;
  onToggleDeafen: () => void;
  participants: Participant[];
  localUser?: { name: string; avatar: string };
  currentRoomId?: string | null;
  onJoinRoom?: (roomId: string) => void;
  onCreateRoom?: () => void;
  creatingRoom?: boolean;
  onDisconnectVoice?: () => void;
}

export default function ChannelSidebar({
  serverName,
  activeChannelId,
  connectedChannelId,
  onSelectChannel,
  onOpenCreateChannel,
  onOpenSettings,
  isMuted,
  onToggleMute,
  isDeafened,
  onToggleDeafen,
  participants,
  localUser,
  currentRoomId,
  onJoinRoom,
  onCreateRoom,
  creatingRoom = false,
  onDisconnectVoice,
}: ChannelSidebarProps) {
  const { t } = useI18n();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { rooms, loading, error, reload } = useActiveRooms();

  const isVoiceConnected = Boolean(currentRoomId);
  const connectedRoom = currentRoomId
    ? rooms.find((room) => room.id === currentRoomId)
    : null;
  const connectedRoomLabel =
    connectedRoom?.name ??
    (currentRoomId ? getRoomNameLocal(currentRoomId) : null) ??
    t.navigation.voiceLounge;

  const bottomOverlayHeight = isVoiceConnected ? "7.75rem" : "3.5rem";

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
      <div
        className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1 custom-scrollbar"
        style={{ paddingBottom: bottomOverlayHeight }}
      >
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
            onClick={onCreateRoom ?? onOpenCreateChannel}
            className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
            title={t.rooms.createNew}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => {
              onSelectChannel("voice-lounge", "voice");
              if (rooms.length > 0 && onJoinRoom) {
                onJoinRoom(rooms[0].id);
              }
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[14px] transition-colors w-full text-left ${
              activeChannelId === "voice-lounge"
                ? "bg-[#34343d] text-white font-medium"
                : "text-[#c7c4d7] hover:bg-[#292932] hover:text-[#e4e1ed]"
            }`}
          >
            <Volume2 className="w-4 h-4 text-[#adc6ff] shrink-0" />
            <span className="truncate flex-1">{t.navigation.voiceLounge}</span>
            {currentRoomId && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                {t.common.connected}
              </span>
            )}
          </button>

          {onJoinRoom && onCreateRoom && (
            <VoiceRoomsList
              rooms={rooms}
              loading={loading}
              error={error}
              currentRoomId={currentRoomId}
              participants={participants}
              creating={creatingRoom}
              onJoinRoom={onJoinRoom}
              onCreateRoom={onCreateRoom}
              onRefresh={reload}
            />
          )}
        </div>
      </div>

      {/* Bottom overlay — extends over server rail for full control width */}
      <div className="absolute bottom-0 -left-[72px] w-[312px] z-40 flex flex-col pointer-events-none">
        <div className="h-6 bg-gradient-to-t from-[#1b1b23] to-transparent pointer-events-none" />

        <div className="pointer-events-auto bg-[#1b1b23] shadow-[0_-8px_24px_rgba(0,0,0,0.45)]">
          {isVoiceConnected && (
            <div className="flex bg-[#23232b] border-t border-[#292932]">
              <div className="w-[72px] shrink-0 bg-[#23232b]" aria-hidden />
              <div className="flex-1 min-w-0 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Signal className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-emerald-400 leading-tight">
                        {t.navigation.voiceConnected}
                      </p>
                      <p className="text-[11px] text-[#c7c4d7] truncate leading-tight">
                        {t.navigation.voiceLounge} / {connectedRoomLabel}
                      </p>
                    </div>
                  </div>

                  {onDisconnectVoice && (
                    <button
                      type="button"
                      onClick={onDisconnectVoice}
                      className="shrink-0 p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-red-400 transition-colors"
                      title={t.controls.disconnect}
                    >
                      <PhoneOff className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Status Bar */}
          <div className="flex h-14 bg-[#13131b] border-t border-[#292932] min-w-0">
            <div className="w-[72px] shrink-0 bg-[#13131b]" aria-hidden />
            <div className="flex flex-1 items-center gap-1 px-2 min-w-0">
            <div
              onClick={onOpenSettings}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#292932] cursor-pointer transition-colors flex-1 min-w-0"
            >
              <div className="relative w-8 h-8 shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={
                      localUser?.avatar ??
                      "https://api.dicebear.com/7.x/bottts/svg?seed=guest"
                    }
                    alt={localUser?.name ?? "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <PresenceDot className="absolute bottom-0 right-0 w-2.5 h-2.5" />
              </div>
              <div className="flex flex-col truncate min-w-0">
                <span className="text-[13px] font-semibold text-[#e4e1ed] truncate leading-tight">
                  {localUser?.name ?? "Guest"}
                </span>
                <PresenceStatusPicker />
              </div>
            </div>

            {/* Quick Media Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              <div className="flex items-center">
                <button
                  onClick={onToggleMute}
                  className={`p-1.5 rounded-l-lg transition-colors ${
                    isMuted
                      ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                      : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
                  }`}
                  title={isMuted ? t.navigation.unmuteMic : t.navigation.muteMic}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <MediaDeviceSelector kind="audioinput" variant="compact" dropUp />
              </div>

              <div className="flex items-center">
                <button
                  onClick={onToggleDeafen}
                  className={`p-1.5 rounded-l-lg transition-colors ${
                    isDeafened
                      ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                      : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
                  }`}
                  title={isDeafened ? t.navigation.undeafen : t.navigation.deafen}
                >
                  <Headphones className="w-4 h-4" />
                </button>
                <MediaDeviceSelector kind="audiooutput" variant="compact" dropUp />
              </div>

              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors shrink-0"
                title={t.navigation.userSettings}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
