"use client";

import React, { useState } from "react";
import { Hash, Send, Smile, Paperclip } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useTextChannelChat, type ChatMessage } from "@/hooks/useTextChannelChat";
import MessageContextMenu from "@/components/MessageContextMenu";

interface TextChannelChatProps {
  channelId: string;
  channelName: string;
  serverName?: string;
  currentUser?: { name: string; avatar: string };
  variant?: "full" | "compact";
}

export default function TextChannelChat({
  channelId,
  channelName,
  serverName,
  currentUser,
  variant = "full",
}: TextChannelChatProps) {
  const { t } = useI18n();
  const [contextMenu, setContextMenu] = useState<{
    message: ChatMessage;
    x: number;
    y: number;
  } | null>(null);

  const {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    handleKeyDown,
    messagesEndRef,
    editingMessageId,
    editDraft,
    setEditDraft,
    startEditing,
    cancelEditing,
    confirmEditing,
    deleteMessage,
    canManageMessage,
  } = useTextChannelChat({ channelId, currentUser });

  const isCompact = variant === "compact";

  const openContextMenu = (
    event: React.MouseEvent,
    message: ChatMessage
  ) => {
    if (!canManageMessage(message)) return;
    event.preventDefault();
    setContextMenu({
      message,
      x: Math.min(event.clientX, window.innerWidth - 200),
      y: Math.min(event.clientY, window.innerHeight - 120),
    });
  };

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
          <MessageBubble
            key={message.id}
            message={message}
            compact={isCompact}
            isEditing={editingMessageId === message.id}
            editDraft={editDraft}
            onEditDraftChange={setEditDraft}
            onConfirmEdit={confirmEditing}
            onCancelEdit={cancelEditing}
            onContextMenu={(event) => openContextMenu(event, message)}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

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
            disabled={!currentUser?.name}
            className={`flex-1 bg-transparent text-[#e4e1ed] placeholder:text-[#908fa0] focus:outline-none disabled:opacity-50 ${
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
              disabled={!inputValue.trim() || !currentUser?.name}
              className={`transition-all font-semibold ${
                isCompact
                  ? `p-1 rounded-lg ${inputValue.trim() && currentUser?.name ? "text-[#6366f1] hover:text-[#8083ff]" : "text-[#464554] cursor-not-allowed"}`
                  : `px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 ${
                      inputValue.trim() && currentUser?.name
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

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => startEditing(contextMenu.message)}
          onDelete={() => deleteMessage(contextMenu.message.id)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

function MessageBubble({
  message,
  compact,
  isEditing,
  editDraft,
  onEditDraftChange,
  onConfirmEdit,
  onCancelEdit,
  onContextMenu,
}: {
  message: ChatMessage;
  compact?: boolean;
  isEditing: boolean;
  editDraft: string;
  onEditDraftChange: (value: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
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
      onContextMenu={onContextMenu}
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

      <div className={`flex-1 flex flex-col min-w-0 ${message.isYou ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 flex-wrap ${message.isYou ? "flex-row-reverse" : ""}`}>
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
          {message.isEdited && !message.isDeleted && (
            <span
              className={`text-[#908fa0] italic ${compact ? "text-[10px]" : "text-[11px]"}`}
              title={t.chat.edited}
            >
              {t.chat.edited}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className={`mt-1 w-full max-w-md ${message.isYou ? "text-right" : ""}`}>
            <input
              type="text"
              value={editDraft}
              onChange={(e) => onEditDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onConfirmEdit();
                }
                if (e.key === "Escape") onCancelEdit();
              }}
              autoFocus
              className={`w-full bg-[#13131b] border border-[#6366f1] rounded-lg px-3 py-2 text-[#e4e1ed] focus:outline-none ${
                compact ? "text-xs" : "text-sm"
              }`}
            />
            <div className={`flex gap-2 mt-2 ${message.isYou ? "justify-end" : ""}`}>
              <button
                type="button"
                onClick={onCancelEdit}
                className="text-xs text-[#908fa0] hover:text-white px-2 py-1 rounded-lg hover:bg-[#292932]"
              >
                {t.chat.cancelEdit}
              </button>
              <button
                type="button"
                onClick={onConfirmEdit}
                disabled={!editDraft.trim()}
                className="text-xs text-white bg-[#6366f1] hover:bg-[#8083ff] disabled:opacity-50 px-2 py-1 rounded-lg"
              >
                {t.chat.saveEdit}
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`mt-1 leading-relaxed ${
              compact ? "text-xs" : "text-sm"
            } ${message.isYou ? "text-right" : ""} ${
              message.isDeleted
                ? "italic text-[#908fa0]"
                : "text-[#e4e1ed]"
            }`}
          >
            {message.isDeleted ? t.chat.messageDeleted : message.text}
          </p>
        )}
      </div>
    </div>
  );
}
