import { Participant } from "@/types/streamsync";

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

const BASE_YOU: Omit<Participant, "isMuted" | "isVideoOn" | "isScreenSharing"> = {
  id: "1",
  name: "Alex",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80",
  isYou: true,
  isSpeaking: false,
  volume: 100,
};

const CHANNEL_ROSTER: Record<VoiceChannelId, Omit<Participant, "isYou">[]> = {
  "voice-lounge": [
    {
      id: "2",
      name: "Sarah",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: true,
      isMuted: false,
      isVideoOn: true,
      volume: 85,
      videoUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=300&q=80",
    },
    {
      id: "3",
      name: "Mike",
      avatar:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: false,
      isMuted: true,
      isVideoOn: false,
      volume: 100,
    },
    {
      id: "4",
      name: "Emma",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: false,
      isMuted: false,
      isVideoOn: true,
      volume: 90,
      videoUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=300&q=80",
    },
  ],
  "gaming-squad": [
    {
      id: "5",
      name: "Jake",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: true,
      isMuted: false,
      isVideoOn: true,
      isScreenSharing: true,
      volume: 100,
      videoUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=300&q=80",
    },
    {
      id: "6",
      name: "Luna",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: false,
      isMuted: false,
      isVideoOn: false,
      volume: 80,
    },
  ],
  "stage-stream": [
    {
      id: "7",
      name: "Devon",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&h=160&q=80",
      isSpeaking: true,
      isMuted: false,
      isVideoOn: true,
      isScreenSharing: true,
      volume: 100,
      videoUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=300&q=80",
    },
  ],
};

export function isVoiceChannel(channelId: string): channelId is VoiceChannelId {
  return VOICE_CHANNEL_IDS.includes(channelId as VoiceChannelId);
}

export function getChannelParticipants(
  channelId: string,
  localUser: LocalUserState
): Participant[] {
  const roster = isVoiceChannel(channelId) ? CHANNEL_ROSTER[channelId] : [];

  return [
    {
      ...BASE_YOU,
      isMuted: !localUser.isMicOn,
      isVideoOn: localUser.isCameraOn,
      isScreenSharing: localUser.isScreenSharing,
    },
    ...roster.map((participant) => ({ ...participant })),
  ];
}
