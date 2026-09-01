"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Settings,
  Sparkles,
  Users,
  ShieldCheck,
  ChevronRight,
  Headphones,
  CheckCircle2
} from "lucide-react";
import { Participant } from "../types/streamsync";

interface PreJoinLobbyProps {
  channelName: string;
  onJoinCall: () => void;
  participants: Participant[];
  isVideoOn: boolean;
  onToggleVideo: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function PreJoinLobby({
  channelName,
  onJoinCall,
  participants,
  isVideoOn,
  onToggleVideo,
  isMuted,
  onToggleMute,
}: PreJoinLobbyProps) {
  const [micLevel, setMicLevel] = useState(40);
  const [bgBlur, setBgBlur] = useState(true);

  // Simulate audio input activity meter
  useEffect(() => {
    if (isMuted) {
      setMicLevel(0);
      return;
    }
    const interval = setInterval(() => {
      setMicLevel(Math.floor(Math.random() * 60) + 20);
    }, 200);
    return () => clearInterval(interval);
  }, [isMuted]);

  return (
    <div className="flex-1 bg-[#0d0d15] flex items-center justify-center p-6 select-none overflow-y-auto">
      <div className="max-w-3xl w-full bg-[#1b1b23] border border-[#292932] rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row gap-8">
        {/* Left: Video & Camera Preview */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative aspect-video bg-[#13131b] rounded-2xl overflow-hidden border border-[#292932] flex items-center justify-center shadow-inner group">
            {isVideoOn ? (
              <div className="relative w-full h-full">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&h=400&q=80"
                  alt="Camera Preview"
                  className={`w-full h-full object-cover transition-all ${
                    bgBlur ? "filter blur-[2px]" : ""
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-[#1f1f27] border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="Alex"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-[#908fa0]">Camera is turned off</span>
              </div>
            )}

            {/* In-Preview Controls */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#13131b]/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-3 border border-white/10 shadow-lg">
              <button
                onClick={onToggleVideo}
                className={`p-2 rounded-full transition-colors ${
                  isVideoOn
                    ? "bg-[#6366f1] text-white"
                    : "bg-[#292932] text-red-400 hover:text-white"
                }`}
                title="Toggle Camera"
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={onToggleMute}
                className={`p-2 rounded-full transition-colors ${
                  !isMuted
                    ? "bg-[#6366f1] text-white"
                    : "bg-[#292932] text-red-400 hover:text-white"
                }`}
                title="Toggle Mic"
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setBgBlur(!bgBlur)}
                className={`p-2 rounded-full transition-colors ${
                  bgBlur
                    ? "bg-emerald-600 text-white"
                    : "bg-[#292932] text-[#c7c4d7]"
                }`}
                title="Background Blur"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mic Meter Bar */}
          <div className="flex items-center gap-3 bg-[#13131b] px-3.5 py-2.5 rounded-xl border border-[#292932]">
            <Mic className={`w-4 h-4 ${isMuted ? "text-red-400" : "text-emerald-400"}`} />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-[#908fa0]">
                <span>Microphone Level</span>
                <span>{isMuted ? "Muted" : `${micLevel}%`}</span>
              </div>
              <div className="w-full h-1.5 bg-[#292932] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-150 rounded-full"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Channel info & Join Action */}
        <div className="flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Volume2 className="w-4 h-4" />
              <span>Voice Channel Preview</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              #{channelName}
            </h2>

            <p className="text-xs text-[#c7c4d7] leading-relaxed">
              StreamSync High-Definition 1080p60 voice & video channel with spatial audio and Krisp noise cancellation.
            </p>

            {/* Who is already in this room */}
            <div className="mt-2 bg-[#13131b] p-3.5 rounded-2xl border border-[#292932] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-[#908fa0]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Already in call ({participants.length})</span>
                </span>
                <span className="text-emerald-400 text-[11px]">● Live</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 bg-[#1f1f27] px-2.5 py-1 rounded-full border border-white/5 shrink-0"
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-[11px] text-white font-medium">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Join CTA */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onJoinCall}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#6366f1] hover:bg-[#8083ff] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Join #{channelName}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#908fa0]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Opus HD Audio
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
