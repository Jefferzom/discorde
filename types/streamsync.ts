export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isYou?: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing?: boolean;
  isAway?: boolean;
  videoUrl?: string;
  volume: number;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  timestamp: string;
  text: string;
  isSystem?: boolean;
  reactions?: { emoji: string; count: number }[];
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  unreadCount?: number;
  hasMention?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "stage" | "announcement";
  unread?: boolean;
  activeUsers?: string[];
}
