"use client";

import React, { useState } from "react";
import {
  X,
  Volume2,
  Hash,
  Radio,
  Lock,
  Sparkles
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (name: string, type: "text" | "voice") => void;
}

export default function CreateChannelModal({
  isOpen,
  onClose,
  onCreateChannel,
}: CreateChannelModalProps) {
  const { t } = useI18n();
  const [channelType, setChannelType] = useState<"text" | "voice">("voice");
  const [channelName, setChannelName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    onCreateChannel(channelName.trim().toLowerCase().replace(/\s+/g, "-"), channelType);
    setChannelName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#1b1b23] border border-[#292932] rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t.modal.createChannelTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Channel Type Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#c7c4d7] uppercase tracking-wider">
              {t.modal.channelType}
            </label>

            <div className="flex flex-col gap-2">
              {/* Voice Option */}
              <div
                onClick={() => setChannelType("voice")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  channelType === "voice"
                    ? "bg-[#292932] border-[#6366f1] text-white ring-1 ring-[#6366f1]"
                    : "bg-[#13131b] border-[#292932] text-[#c7c4d7] hover:bg-[#22222d]"
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{t.modal.voiceAndVideo}</div>
                  <div className="text-xs text-[#908fa0]">
                    {t.modal.voiceAndVideoDesc}
                  </div>
                </div>
              </div>

              {/* Text Option */}
              <div
                onClick={() => setChannelType("text")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  channelType === "text"
                    ? "bg-[#292932] border-[#6366f1] text-white ring-1 ring-[#6366f1]"
                    : "bg-[#13131b] border-[#292932] text-[#c7c4d7] hover:bg-[#22222d]"
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{t.modal.text}</div>
                  <div className="text-xs text-[#908fa0]">
                    {t.modal.textDesc}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Name Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#c7c4d7] uppercase tracking-wider">
              {t.modal.channelName}
            </label>
            <div className="flex items-center bg-[#13131b] border border-[#292932] rounded-xl px-3 py-2.5 focus-within:border-[#6366f1] transition-colors">
              {channelType === "voice" ? (
                <Volume2 className="w-4 h-4 text-[#908fa0] mr-2" />
              ) : (
                <Hash className="w-4 h-4 text-[#908fa0] mr-2" />
              )}
              <input
                type="text"
                placeholder="new-channel"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#908fa0] focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#13131b] rounded-2xl border border-[#292932]">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-[#908fa0]" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">{t.modal.privateChannel}</span>
                <span className="text-[10px] text-[#908fa0]">
                  {t.modal.privateChannelDesc}
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
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#c7c4d7] hover:text-white transition-colors"
            >
              {t.modal.cancel}
            </button>
            <button
              type="submit"
              disabled={!channelName.trim()}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                channelName.trim()
                  ? "bg-[#6366f1] text-white hover:bg-[#8083ff] shadow-indigo-600/30"
                  : "bg-[#292932] text-[#908fa0] cursor-not-allowed"
              }`}
            >
              {t.modal.confirmCreate}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
