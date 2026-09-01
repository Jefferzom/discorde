import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";

export interface SimulatedChatMessage {
  id: string;
  text: string;
  sender: string;
  time: string;
  isYou?: boolean;
  isSystem?: boolean;
  avatar?: string;
}

interface UseSimulatedTextChatOptions {
  currentUser?: { name: string; avatar: string };
  initialMessages?: SimulatedChatMessage[];
  simulateReply?: boolean;
  simulateReplyText?: string;
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function useSimulatedTextChat({
  currentUser = {
    name: "Alex",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80",
  },
  initialMessages = [],
  simulateReply = true,
  simulateReplyText = "Sistema: Mensagem recebida!",
}: UseSimulatedTextChatOptions = {}) {
  const [messages, setMessages] = useState<SimulatedChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newMessage: SimulatedChatMessage = {
      id: crypto.randomUUID(),
      text: trimmed,
      sender: currentUser.name,
      time: formatTime(),
      isYou: true,
      avatar: currentUser.avatar,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    if (simulateReply) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: simulateReplyText,
            sender: "Sistema",
            time: formatTime(),
            isSystem: true,
          },
        ]);
      }, 1000);
    }
  }, [inputValue, currentUser, simulateReply, simulateReplyText]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    handleKeyDown,
    messagesEndRef,
  };
}
