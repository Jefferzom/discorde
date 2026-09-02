import type { Room } from "livekit-client";

export type LeaveWarning = "sharing" | "alone" | "sharing-alone";

export function getLeaveWarning(room: Room): LeaveWarning | null {
  const sharing = room.localParticipant.isScreenShareEnabled;
  const alone = room.remoteParticipants.size === 0;

  if (sharing && alone) return "sharing-alone";
  if (sharing) return "sharing";
  if (alone) return "alone";
  return null;
}
