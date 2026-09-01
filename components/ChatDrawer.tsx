"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Smile,
  Paperclip,
  Sparkles,
  Gift,
  Hash,
  AtSign,
  Flame,
  ThumbsUp,
  Heart
} from "lucide-react";
import { ChatMessage, Participant } from "../types/streamsync";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  participants: Participant[];
  showMemberList?: boolean;
}

export default function ChatDrawer({
  isOpen,
  onClose,
  channelName,
  messages,
  onSendMessage,
  participants,
  showMemberList,
}: ChatDrawerProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  if (!isOpen && !showMemberList) return null;

  return (
    <aside className="w-80 h-full bg-[#1b1b23] border-l border-[#292932] flex flex-col z-20 shrink-0 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-12 px-4 border-b border-[#292932] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {showMemberList ? (
            <span className="font-semibold text-sm text-[#e4e1ed]">
              Online Members ({participants.length})
            </span>
          ) : (
            <span className="font-semibold text-sm text-[#e4e1ed] flex items-center gap-1">
              <Hash className="w-4 h-4 text-[#908fa0]" /> {channelName} Chat
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showMemberList ? (
        /* Member List View */
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 custom-scrollbar">
          <div>
            <span className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider px-2">
              Online — {participants.length}
            </span>
            <div className="flex flex-col gap-1 mt-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#292932] cursor-pointer transition-colors group"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1b1b23] ${
                        p.isAway ? "bg-amber-400" : "bg-emerald-500"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-[#e4e1ed] truncate group-hover:text-white">
                      {p.name} {p.isYou && "(You)"}
                    </span>
                    <span className="text-[10px] text-[#908fa0] truncate">
                      {p.isScreenSharing
                        ? "Streaming Code"
                        : p.isSpeaking
                        ? "Speaking..."
                        : "Listening"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Messages View */
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 group">
                <img
                  src={m.avatar}
                  alt={m.user}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                />
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                      {m.user}
                    </span>
                    <span className="text-[10px] text-[#908fa0]">
                      {m.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#c7c4d7] mt-0.5 leading-relaxed break-words bg-[#13131b]/40 p-2 rounded-xl rounded-tl-none border border-white/5">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#13131b] border-t border-[#292932]"
          >
            <div className="flex items-center bg-[#1f1f27] border border-[#34343d] rounded-2xl px-3 py-1.5 focus-within:border-[#6366f1] transition-colors">
              <input
                type="text"
                placeholder={`Message #${channelName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-transparent text-xs text-[#e4e1ed] placeholder:text-[#908fa0] focus:outline-none py-1.5"
              />
              <div className="flex items-center gap-1 shrink-0 text-[#908fa0]">
                <button
                  type="button"
                  onClick={() => setInputText((prev) => prev + " 🔥")}
                  className="p-1 hover:text-white transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-1.5 rounded-lg transition-colors ${
                    inputText.trim()
                      ? "bg-[#6366f1] text-white hover:bg-[#8083ff]"
                      : "text-[#464554] cursor-not-allowed"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </aside>
  );
}
