import { useEffect, useRef } from "react";
import { Participant } from "@/types/streamsync";
import { playNotificationSound } from "@/lib/notificationSounds";

type ParticipantMediaState = {
  isVideoOn: boolean;
  isScreenSharing: boolean;
};

export function useParticipantNotificationSounds(participants: Participant[]) {
  const prevRef = useRef<Map<string, ParticipantMediaState>>(new Map());

  useEffect(() => {
    const prev = prevRef.current;
    const next = new Map<string, ParticipantMediaState>();

    for (const participant of participants) {
      const current: ParticipantMediaState = {
        isVideoOn: participant.isVideoOn,
        isScreenSharing: participant.isScreenSharing ?? false,
      };
      next.set(participant.id, current);

      const previous = prev.get(participant.id);
      if (!previous) continue;

      if (!previous.isVideoOn && current.isVideoOn) {
        playNotificationSound("cameraOn");
      } else if (previous.isVideoOn && !current.isVideoOn) {
        playNotificationSound("cameraOff");
      }

      if (!previous.isScreenSharing && current.isScreenSharing) {
        playNotificationSound("screenShareStart");
      } else if (previous.isScreenSharing && !current.isScreenSharing) {
        playNotificationSound("screenShareStop");
      }
    }

    prevRef.current = next;
  }, [participants]);
}
