"use client";

import React, { useState } from "react";
import {
  X,
  Hash,
  Volume2,
  Radio,
  Lock,
  Sparkles,
  Sliders,
  Check
} from "lucide-react";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (name: string, type: "text" | "voice" | "stage") => void;
}

export default function CreateChannelModal({
  isOpen,
  onClose,
  onCreateChannel,
}: CreateChannelModalProps) {
  const [channelType, setChannelType] = useState<"text" | "voice" | "stage">("voice");
  const [channelName, setChannelName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [bitrate, setBitrate] = useState(64);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    const formatted = channelName.toLowerCase().replace(/\s+/g, "-");
    onCreateChannel(formatted, channelType);
    setChannelName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#1b1b23] border border-[#292932] rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Create Channel
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Channel Type Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider">
              Channel Type
            </label>
            <div className="flex flex-col gap-2">
              <div
                onClick={() => setChannelType("voice")}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  channelType === "voice"
                    ? "bg-[#292932] border-[#6366f1] text-white"
                    : "bg-[#13131b] border-transparent text-[#c7c4d7] hover:bg-[#22222d]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-[#adc6ff]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Voice & Video</span>
                    <span className="text-[10px] text-[#908fa0]">
                      Hang out together with voice, video, and screen share
                    </span>
                  </div>
                </div>
                {channelType === "voice" && (
                  <Check className="w-4 h-4 text-[#6366f1]" />
                )}
              </div>

              <div
                onClick={() => setChannelType("text")}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  channelType === "text"
                    ? "bg-[#292932] border-[#6366f1] text-white"
                    : "bg-[#13131b] border-transparent text-[#c7c4d7] hover:bg-[#22222d]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-[#908fa0]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Text</span>
                    <span className="text-[10px] text-[#908fa0]">
                      Post messages, images, memes, opinions, and puns
                    </span>
                  </div>
                </div>
                {channelType === "text" && (
                  <Check className="w-4 h-4 text-[#6366f1]" />
                )}
              </div>

              <div
                onClick={() => setChannelType("stage")}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  channelType === "stage"
                    ? "bg-[#292932] border-[#6366f1] text-white"
                    : "bg-[#13131b] border-transparent text-[#c7c4d7] hover:bg-[#22222d]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-[#ffb783]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Stage Keynote</span>
                    <span className="text-[10px] text-[#908fa0]">
                      Present to a large audience with designated speakers
                    </span>
                  </div>
                </div>
                {channelType === "stage" && (
                  <Check className="w-4 h-4 text-[#6366f1]" />
                )}
              </div>
            </div>
          </div>

          {/* Channel Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider">
              Channel Name
            </label>
            <div className="flex items-center bg-[#13131b] border border-[#292932] rounded-xl px-3 py-2 focus-within:border-[#6366f1] transition-colors">
              {channelType === "voice" ? (
                <Volume2 className="w-4 h-4 text-[#908fa0] mr-2" />
              ) : channelType === "stage" ? (
                <Radio className="w-4 h-4 text-[#ffb783] mr-2" />
              ) : (
                <Hash className="w-4 h-4 text-[#908fa0] mr-2" />
              )}
              <input
                type="text"
                placeholder="new-channel"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
                className="bg-transparent text-xs text-white placeholder:text-[#908fa0] focus:outline-none flex-1"
              />
            </div>
          </div>

          {/* Private Channel Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#13131b] rounded-2xl border border-[#292932]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#ffb783]" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">
                  Private Channel
                </span>
                <span className="text-[10px] text-[#908fa0]">
                  Only selected members and roles will be able to view
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-10 h-6 rounded-full p-1 transition-colors ${
                isPrivate ? "bg-[#6366f1]" : "bg-[#292932]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isPrivate ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#c7c4d7] hover:text-white hover:bg-[#292932] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!channelName.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#8083ff] text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
