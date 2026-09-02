import { isVoiceChannel } from "@/lib/channelData";
import type { translations } from "@/lib/i18n/translations";

type TranslationRoot = (typeof translations)["pt"];

const CHANNEL_LABEL_KEYS: Record<string, keyof TranslationRoot["navigation"]> = {
  general: "general",
  announcements: "announcements",
  "dev-chat": "devChat",
  resources: "resources",
  "voice-lounge": "voiceLounge",
  "gaming-squad": "gamingSquad",
  "stage-stream": "stageKeynote",
};

export function getChannelDisplayName(
  channelId: string,
  t: TranslationRoot
): string {
  const key = CHANNEL_LABEL_KEYS[channelId];
  if (key) return t.navigation[key];
  return channelId;
}

export function getChannelTypeFromId(channelId: string): "text" | "voice" | "stage" {
  if (channelId === "stage-stream") return "stage";
  if (isVoiceChannel(channelId)) return "voice";
  return "text";
}
