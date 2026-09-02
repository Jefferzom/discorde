"use client";

import React from "react";
import { Hash, Send, Smile, Paperclip } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import {
  SimulatedChatMessage,
  useSimulatedTextChat,
} from "@/hooks/useSimulatedTextChat";

interface TextChannelChatProps {
  channelName: string;
  serverName?: string;
  initialMessages?: SimulatedChatMessage[];
  variant?: "full" | "compact";
}

const DEFAULT_MESSAGES: SimulatedChatMessage[] = [
  {
    id: "m1",
    sender: "Sarah",
    time: "18:12",
    text: "Hey everyone! The stream latency on 1080p60 is super smooth 🔥",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "m2",
    sender: "Mike",
    time: "18:14",
    text: "Can you scroll down on the React component? Wanted to see the peer mesh connection.",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&h=160&q=80",
  },
];

export default function TextChannelChat({
  channelName,
  serverName,
  initialMessages,
  variant = "full",
}: TextChannelChatProps) {
  const { t } = useI18n();

  const {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    handleKeyDown,
    messagesEndRef,
  } = useSimulatedTextChat({
    initialMessages,
    simulateReply: false,
  });

  const isCompact = variant === "compact";

  return (
    <div className="flex-1 flex flex-col bg-[#1f1f27] h-full overflow-hidden">
      {variant === "full" && (
        <div className="p-6 border-b border-[#292932] flex items-center gap-4 bg-[#1b1b23]/50 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#6366f1]">
            <Hash className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {t.chat.welcomeTitle} #{channelName}!
            </h3>
            <p className="text-xs text-[#908fa0]">
              {t.chat.welcomeDesc}
              {serverName ? ` ${serverName}.` : "."}
            </p>
          </div>
        </div>
      )}

      {/* Lista de mensagens */}
      <div
        className={`flex-1 overflow-y-auto flex flex-col gap-3 custom-scrollbar ${
          isCompact ? "p-4" : "p-6 gap-4"
        }`}
      >
        {variant === "compact" && (
          <div className="p-3 rounded-2xl bg-[#13131b]/60 border border-[#292932] text-xs text-[#908fa0] shrink-0">
            <span className="font-bold text-white block mb-0.5">
              {t.chat.welcomeTitle} #{channelName}!
            </span>
            {t.chat.welcomeDesc}.
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} compact={isCompact} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`bg-[#1b1b23] border-t border-[#292932] shrink-0 ${isCompact ? "p-3" : "p-4"}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className={`flex items-center bg-[#13131b] border border-[#292932] focus-within:border-[#6366f1] transition-colors ${
            isCompact ? "rounded-xl px-3 py-2" : "rounded-2xl px-4 py-2.5"
          }`}
        >
          {!isCompact && (
            <button
              type="button"
              className="p-1.5 rounded-full text-[#908fa0] hover:text-white hover:bg-[#292932] transition-colors mr-2"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          )}

          <input
            type="text"
            placeholder={`${t.chat.messagePlaceholder} #${channelName}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent text-[#e4e1ed] placeholder:text-[#908fa0] focus:outline-none ${
              isCompact ? "text-xs" : "text-sm"
            }`}
          />

          <div className="flex items-center gap-2 text-[#908fa0]">
            <button
              type="button"
              onClick={() => setInputValue((prev) => prev + " 🔥")}
              className="hover:text-white transition-colors"
            >
              <Smile className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={`transition-all font-semibold ${
                isCompact
                  ? `p-1 rounded-lg ${inputValue.trim() ? "text-[#6366f1] hover:text-[#8083ff]" : "text-[#464554] cursor-not-allowed"}`
                  : `px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 ${
                      inputValue.trim()
                        ? "bg-[#6366f1] text-white hover:bg-[#8083ff]"
                        : "text-[#464554] cursor-not-allowed"
                    }`
              }`}
            >
              {isCompact ? (
                <Send className="w-3.5 h-3.5" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.chat.send}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  compact,
}: {
  message: SimulatedChatMessage;
  compact?: boolean;
}) {
  const { t } = useI18n();

  if (message.isSystem) {
    return (
      <div className="flex justify-center">
        <span className="px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-[11px] text-indigo-300 font-medium">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 group transition-colors rounded-xl ${
        message.isYou
          ? "flex-row-reverse text-right bg-[#6366f1]/5 border border-[#6366f1]/15 hover:bg-[#6366f1]/10"
          : "hover:bg-[#13131b]/30"
      } ${compact ? "p-2 text-xs" : "p-2 gap-4"}`}
    >
      {message.avatar && !message.isYou && (
        <img
          src={message.avatar}
          alt={message.sender}
          className={`rounded-full object-cover shrink-0 border border-white/10 ${
            compact ? "w-8 h-8" : "w-10 h-10"
          }`}
        />
      )}

      <div className={`flex-1 flex flex-col ${message.isYou ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 ${message.isYou ? "flex-row-reverse" : ""}`}>
          <span
            className={`font-bold hover:underline cursor-pointer ${
              message.isYou ? "text-[#adc6ff]" : "text-white"
            } ${compact ? "text-xs" : "text-sm"}`}
          >
            {message.sender}
            {message.isYou && ` (${t.common.you})`}
          </span>
          <span className={`text-[#908fa0] ${compact ? "text-[10px]" : "text-[11px]"}`}>
            {message.time}
          </span>
        </div>
        <p
          className={`text-[#e4e1ed] mt-1 leading-relaxed ${
            compact ? "text-xs" : "text-sm"
          } ${message.isYou ? "text-right" : ""}`}
        >
          {message.text}
        </p>
      </div>
    </div>
  );
}
