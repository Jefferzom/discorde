import { Participant } from "@/types/streamsync";
import { getUserProfile } from "@/lib/userStorage";

export type ChannelType = "text" | "voice" | "stage";

export const VOICE_CHANNEL_IDS = [
  "voice-lounge",
  "gaming-squad",
  "stage-stream",
] as const;

export type VoiceChannelId = (typeof VOICE_CHANNEL_IDS)[number];

type LocalUserState = {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
};

export function isVoiceChannel(channelId: string): channelId is VoiceChannelId {
  return VOICE_CHANNEL_IDS.includes(channelId as VoiceChannelId);
}

export function getChannelParticipants(
  channelId: string,
  localUser: LocalUserState
): Participant[] {
  if (!isVoiceChannel(channelId)) return [];

  const profile = getUserProfile();
  if (!profile) return [];

  return [
    {
      id: "local",
      name: profile.username,
      avatar: profile.avatarUrl,
      isYou: true,
      isSpeaking: false,
      isMuted: !localUser.isMicOn,
      isVideoOn: localUser.isCameraOn,
      isScreenSharing: localUser.isScreenSharing,
      volume: 100,
    },
  ];
}
