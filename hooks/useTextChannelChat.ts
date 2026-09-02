import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import {
  loadChannelMessages,
  saveChannelMessages,
  type StoredChatMessage,
} from "@/lib/chatStorage";

export type ChatMessage = StoredChatMessage & { isYou?: boolean };

interface UseTextChannelChatOptions {
  channelId: string;
  currentUser?: { name: string; avatar: string };
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function withOwnership(
  messages: StoredChatMessage[],
  currentUserName?: string
): ChatMessage[] {
  return messages.map((message) => ({
    ...message,
    isYou: currentUserName ? message.senderId === currentUserName : false,
  }));
}

export function useTextChannelChat({
  channelId,
  currentUser,
}: UseTextChannelChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    hydratedRef.current = false;
    const stored = loadChannelMessages(channelId);
    setMessages(withOwnership(stored, currentUser?.name));
    setEditingMessageId(null);
    setEditDraft("");
    hydratedRef.current = true;
  }, [channelId, currentUser?.name]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveChannelMessages(
      channelId,
      messages.map(({ isYou: _isYou, ...message }) => message)
    );
  }, [channelId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, editingMessageId]);

  const handleSendMessage = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || !currentUser?.name) return;

    const now = Date.now();
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      channelId,
      text: trimmed,
      sender: currentUser.name,
      senderId: currentUser.name,
      time: formatTime(),
      createdAt: now,
      avatar: currentUser.avatar,
      isYou: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  }, [channelId, currentUser, inputValue]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const startEditing = useCallback((message: ChatMessage) => {
    if (!message.isYou || message.isDeleted || message.isSystem) return;
    setEditingMessageId(message.id);
    setEditDraft(message.text);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingMessageId(null);
    setEditDraft("");
  }, []);

  const confirmEditing = useCallback(() => {
    const trimmed = editDraft.trim();
    if (!editingMessageId || !trimmed) return;

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== editingMessageId) return message;
        if (message.text === trimmed) return message;
        return {
          ...message,
          text: trimmed,
          isEdited: true,
          updatedAt: Date.now(),
          time: formatTime(),
        };
      })
    );
    cancelEditing();
  }, [editDraft, editingMessageId, cancelEditing]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, isDeleted: true, isEdited: false }
          : message
      )
    );
    if (editingMessageId === messageId) cancelEditing();
  }, [cancelEditing, editingMessageId]);

  const canManageMessage = useCallback(
    (message: ChatMessage) =>
      Boolean(message.isYou && !message.isDeleted && !message.isSystem),
    []
  );

  return {
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
  };
}
