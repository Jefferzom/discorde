"use client";

import { useMemo } from "react";
import { useParticipants } from "@livekit/components-react";
import { generateDicebearAvatar, type UserProfile } from "@/lib/userStorage";
import type { Participant } from "@/types/streamsync";

export function useLiveKitMappedParticipants(
  localProfile: UserProfile
): Participant[] {
  const lkParticipants = useParticipants();

  return useMemo(
    () =>
      lkParticipants.map((participant) => {
        const name = participant.name || participant.identity;
        const isLocal = participant.isLocal;

        return {
          id: participant.identity,
          name,
          avatar: isLocal
            ? localProfile.avatarUrl
            : generateDicebearAvatar(name),
          isYou: isLocal,
          isSpeaking: participant.isSpeaking,
          isMuted: !participant.isMicrophoneEnabled,
          isVideoOn: participant.isCameraEnabled,
          isScreenSharing: participant.isScreenShareEnabled,
          volume: 100,
        };
      }),
    [lkParticipants, localProfile.avatarUrl]
  );
}
