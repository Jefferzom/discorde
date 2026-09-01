"use client";

import React, { useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ScreenShare,
  StopCircle,
  PhoneOff,
  MoreVertical,
  Smile,
  SlidersHorizontal,
  Shield,
  Radio
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import ScreenShareMenu from "./ScreenShareMenu";
import { ScreenShareMode } from "@/lib/screenShare";

interface FloatingControlsProps {
  isVideoOn: boolean;
  onToggleVideo: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isScreenSharing: boolean;
  screenShareMode?: ScreenShareMode;
  onToggleScreenShare: () => void;
  onChangeScreenShareMode?: (mode: ScreenShareMode) => void;
  onLeaveCall: () => void;
  onSendReaction: (emoji: string) => void;
  onOpenSettings: () => void;
}

export default function FloatingControls({
  isVideoOn,
  onToggleVideo,
  isMuted,
  onToggleMute,
  isScreenSharing,
  screenShareMode = "screen",
  onToggleScreenShare,
  onChangeScreenShareMode,
  onLeaveCall,
  onSendReaction,
  onOpenSettings,
}: FloatingControlsProps) {
  const { t } = useI18n();
  const [showReactions, setShowReactions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const emojiList = ["🔥", "🚀", "❤️", "🎉", "👏", "😂", "✨", "💯"];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#292932]/95 backdrop-blur-xl px-5 py-2.5 rounded-full flex items-center gap-3 shadow-[0_20px_35px_-5px_rgba(0,0,0,0.6)] border border-white/10 z-40 transition-all hover:scale-[1.01]">
      {/* Reaction Picker Popup */}
      {showReactions && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#13131b]/95 backdrop-blur-xl border border-[#34343d] rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95">
          {emojiList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSendReaction(emoji);
                setShowReactions(false);
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#292932] hover:scale-125 transition-all text-xl"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* More Options Menu Popup */}
      {showMoreMenu && (
        <div className="absolute bottom-16 right-16 bg-[#13131b]/95 backdrop-blur-xl border border-[#34343d] rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 w-52 animate-in fade-in zoom-in-95 text-xs text-[#c7c4d7]">
          <button
            onClick={() => {
              setShowMoreMenu(false);
              onOpenSettings();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#292932] hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>{t.controls.audioVideoSettings}</span>
          </button>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#292932] transition-colors cursor-pointer">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{t.controls.krispNoise}</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
              ON
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#292932] transition-colors cursor-pointer">
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ffb783]" />
              <span>{t.controls.streamBitrate}</span>
            </span>
            <span className="text-[10px] text-[#908fa0]">6,400 kbps</span>
          </div>
        </div>
      )}

      {/* Video Cam Button */}
      <button
        onClick={onToggleVideo}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 shadow-md ${
          isVideoOn
            ? "bg-[#1f1f27] text-white hover:bg-[#34343d]"
            : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
        }`}
        title={isVideoOn ? t.controls.turnOffCamera : t.controls.turnOnCamera}
      >
        {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* Mic Button */}
      <button
        onClick={onToggleMute}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 shadow-md ${
          !isMuted
            ? "bg-[#1f1f27] text-white hover:bg-[#34343d]"
            : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
        }`}
        title={isMuted ? t.controls.unmuteMicrophone : t.controls.muteMicrophone}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-[#464554]/60 mx-0.5" />

      {/* Screen Share Button */}
      {isScreenSharing && onChangeScreenShareMode ? (
        <ScreenShareMenu
          currentMode={screenShareMode}
          onChangeMode={onChangeScreenShareMode}
        />
      ) : null}

      <button
        onClick={onToggleScreenShare}
        className={`px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 transition-all duration-150 shadow-lg ${
          isScreenSharing
            ? "bg-[#8083ff] text-[#0d0096] hover:bg-[#c0c1ff] ring-2 ring-indigo-400/40"
            : "bg-[#1f1f27] text-[#e4e1ed] hover:bg-[#34343d]"
        }`}
        title={isScreenSharing ? t.controls.stopSharing : t.controls.shareScreen}
      >
        {isScreenSharing ? (
          <>
            <StopCircle className="w-4 h-4 animate-pulse text-indigo-950" />
            <span>{t.controls.stopSharing}</span>
          </>
        ) : (
          <>
            <ScreenShare className="w-4 h-4 text-indigo-300" />
            <span>{t.controls.shareScreen}</span>
          </>
        )}
      </button>

      {/* Reaction Launcher */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="w-11 h-11 rounded-full bg-[#1f1f27] flex items-center justify-center text-[#e4e1ed] hover:bg-[#34343d] transition-colors shadow-md"
        title={t.controls.sendReaction}
      >
        <Smile className="w-5 h-5 text-amber-300" />
      </button>

      {/* More Options */}
      <button
        onClick={() => setShowMoreMenu(!showMoreMenu)}
        className="w-11 h-11 rounded-full bg-[#1f1f27] flex items-center justify-center text-[#e4e1ed] hover:bg-[#34343d] transition-colors shadow-md"
        title={t.controls.moreOptions}
      >
        <MoreVertical className="w-5 h-5 text-[#c7c4d7]" />
      </button>

      {/* Leave Call (Disconnect) */}
      <button
        onClick={onLeaveCall}
        className="w-11 h-11 rounded-full bg-[#93000a] text-white flex items-center justify-center hover:bg-red-600 transition-all duration-150 shadow-lg shadow-red-900/40 ml-1 group"
        title={t.controls.disconnect}
      >
        <PhoneOff className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
