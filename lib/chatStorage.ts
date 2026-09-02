export const CHANNEL_MESSAGES_STORAGE_KEY = "discorde_channel_messages";

export interface StoredChatMessage {
  id: string;
  channelId: string;
  text: string;
  sender: string;
  senderId: string;
  time: string;
  createdAt: number;
  updatedAt?: number;
  avatar?: string;
  isSystem?: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
}

type ChannelMessageStore = Record<string, StoredChatMessage[]>;

function readStore(): ChannelMessageStore {
  if (typeof window === "undefined") return {};

  const raw = localStorage.getItem(CHANNEL_MESSAGES_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as ChannelMessageStore;
  } catch {
    return {};
  }
}

function writeStore(store: ChannelMessageStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHANNEL_MESSAGES_STORAGE_KEY, JSON.stringify(store));
}

export function loadChannelMessages(channelId: string): StoredChatMessage[] {
  const messages = readStore()[channelId];
  if (!messages?.length) return [];
  return [...messages].sort((a, b) => a.createdAt - b.createdAt);
}

export function saveChannelMessages(
  channelId: string,
  messages: StoredChatMessage[]
): void {
  const store = readStore();
  store[channelId] = messages;
  writeStore(store);
}
